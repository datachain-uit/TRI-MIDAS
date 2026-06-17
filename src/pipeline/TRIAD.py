# Databricks notebook source
"""Automatic course-quality labeling pipeline (Gold layer).

This script derives a three-level course-quality label (``excellent`` /
``good`` / ``average``) for every (``course_id``, ``chapter``) pair across the
four temporal phases of the MOOC dataset. The label is obtained from three
learning-engagement vectors:

    * COELO  -- Completion / Engagement Learning Outcome
    * AFELO  -- Activity-Frequency Engagement Learning Outcome
    * ACELO  -- Assessment / Completion Engagement Learning Outcome

The three averaged components form a vector that is compared (Euclidean
distance) against the ideal point ``[1, 1, 1]``; the distance is then bucketed
into quality labels.

The pipeline runs on Apache Spark (Delta Lake). It is written to be runnable
both inside Databricks (where a ``spark`` session is pre-created) and as a
stand-alone PySpark job (the session is created in :func:`main`).

All input/output locations and tunable thresholds are collected in the
``CONFIG`` section below so the pipeline can be reproduced on a different
storage layout without editing the logic.
"""

from functools import reduce

from pyspark.sql import SparkSession, Window
from pyspark.sql import functions as F
from pyspark.sql.functions import avg, col, lit, sqrt, when
from pyspark.sql.functions import max as _max
from pyspark.sql.functions import min as _min

# =============================================================================
# CONFIG
# =============================================================================

# Number of temporal phases the dataset is split into.
PHASES = [1, 2, 3, 4]

# Delta locations of the per-phase Gold feature tables. ``{phase}`` is
# substituted with each value in ``PHASES``.
PROBLEM_PATH = "/mnt/gold/feature_problem/p{phase}"
VIDEO_PATH = "/mnt/gold/feature_video/p{phase}"
COMMENT_PATH = "/mnt/gold/feature_comment/p{phase}"

# Reference tables.
COURSE_PATH = "/mnt/silver/course"
COURSE_STRUCT_PATH = "/mnt/raw/csv/course_ScoreStruct.csv"

# Output location for the labelled tables (one Delta table per phase).
OUTPUT_PATH = "/mnt/gold/course_label/p{phase}"

# Keys used to align the problem / video / comment feature tables.
JOIN_KEYS = ["course_id", "user_id", "chapter"]
GROUP_KEYS = ["course_id", "chapter"]

# COELO feature columns, grouped by the modality they belong to. ``CHECK_*``
# values encode which modalities a chapter contains:
#   check == 0 -> video only        (fill video columns with 0)
#   check == 1 -> assignment only   (fill problem columns with 0)
#   check == 2 -> video + assignment (fill all numeric columns with 0)
VIDEO_COLS = ["total_watch_duration_scaled", "video_watch_ratio"]
PROBLEM_COLS = ["attempts_sum_scaled", "problem_id_ratio"]

# Euclidean-distance thresholds used to bucket the engagement vector into a
# quality label (distance to the ideal point [1, 1, 1]; smaller is better).
#   distance <= EXCELLENT_MAX          -> "excellent"
#   EXCELLENT_MAX < distance <= GOOD_MAX -> "good"
#   GOOD_MAX < distance <= 1.0         -> "average"
EXCELLENT_MAX = 0.2
GOOD_MAX = 0.4


# =============================================================================
# DATA LOADING
# =============================================================================

def load_phase_features(spark, phase):
    """Load and join the problem/video/comment feature tables for one phase.

    The video table is outer-joined onto the problem table (a chapter may
    contain only one modality), and comments are left-joined on top.
    """
    problem = spark.read.format("delta").load(PROBLEM_PATH.format(phase=phase))
    video = spark.read.format("delta").load(VIDEO_PATH.format(phase=phase))
    comment = spark.read.format("delta").load(COMMENT_PATH.format(phase=phase))

    return (
        problem
        .join(video, on=JOIN_KEYS, how="outer")
        .join(comment, on=JOIN_KEYS, how="left")
    )


def build_course_check(spark):
    """Flag, per (course_id, chapter), which learning modalities are present.

    ``resource_id`` prefixes identify the modality: ``V_`` for video and
    ``Ex`` for exercises/assignments. The resulting ``check`` column encodes:
    0 = video only, 1 = assignment only, 2 = both.
    """
    course = (
        spark.read.format("delta").load(COURSE_PATH)
        .withColumnRenamed("id", "course_id")
    )

    return (
        course
        .withColumn("prefix", F.substring("resource_id", 1, 2))
        .groupBy("course_id", "chapter")
        .agg(F.collect_set("prefix").alias("prefix_set"))
        .withColumn(
            "check",
            F.when(
                F.array_contains("prefix_set", "V_")
                & ~F.array_contains("prefix_set", "Ex"),
                0,
            )
            .when(
                ~F.array_contains("prefix_set", "V_")
                & F.array_contains("prefix_set", "Ex"),
                1,
            )
            .when(
                F.array_contains("prefix_set", "V_")
                & F.array_contains("prefix_set", "Ex"),
                2,
            )
            .otherwise(None),
        )
    )


def load_course_struct(spark):
    """Load the per-course scoring structure (activities, points, proportions)."""
    return (
        spark.read.format("csv").option("header", "true").load(COURSE_STRUCT_PATH)
        .withColumnRenamed("id", "course_id")
        .select("course_id", "activities", "point", "proportion")
    )


def build_course_for_label(course_struct, course_check):
    """Join the modality flags onto the list of labelled courses."""
    return (
        course_struct.select(col("course_id"))
        .join(course_check, on="course_id", how="outer")
    )


# =============================================================================
# ENGAGEMENT VECTOR COMPONENTS
# =============================================================================

def calculate_COELO(data, course_for_label,
                    cols_check_0=None, cols_check_1=None):
    """Compute the COELO (completion/engagement) component per row.

    Null engagement values are imputed with 0 according to the chapter's
    ``check`` modality flag, then COELO is the mean of the available
    (non-null) video and problem engagement ratios.
    """
    cols_check_0 = cols_check_0 or VIDEO_COLS
    cols_check_1 = cols_check_1 or PROBLEM_COLS

    ts = data.select("course_id", "user_id", "chapter", "total_watch_duration_scaled")
    rv = data.select("course_id", "user_id", "chapter", "video_watch_ratio")
    inf = data.select("course_id", "user_id", "chapter", "attempts_sum_scaled")
    av = data.select("course_id", "user_id", "chapter", "problem_id_ratio")

    df = (
        ts
        .join(rv, on=JOIN_KEYS, how="inner")
        .join(inf, on=JOIN_KEYS, how="inner")
        .join(av, on=JOIN_KEYS, how="inner")
        .join(course_for_label, on=GROUP_KEYS)
    )

    # Step 1 -- fill nulls according to the modality flag.
    numeric_cols = [
        f.name for f in df.schema.fields
        if f.dataType.simpleString() in ("int", "double", "float", "long")
    ]

    # check == 2 -> fill 0 for every numeric column.
    for c in numeric_cols:
        df = df.withColumn(
            c, when((col("check") == 2) & col(c).isNull(), 0).otherwise(col(c))
        )

    # check == 0 -> fill 0 for the video columns.
    for c in cols_check_0:
        if c in df.columns:
            df = df.withColumn(
                c, when((col("check") == 0) & col(c).isNull(), 0).otherwise(col(c))
            )

    # check == 1 -> fill 0 for the problem columns.
    for c in cols_check_1:
        if c in df.columns:
            df = df.withColumn(
                c, when((col("check") == 1) & col(c).isNull(), 0).otherwise(col(c))
            )

    # Step 2 -- COELO = mean over the available (non-null) engagement columns.
    all_cols = list(set(cols_check_0 + cols_check_1))
    sum_expr = reduce(
        lambda a, b: a + b,
        [when(col(c).isNotNull(), col(c)).otherwise(lit(0)) for c in all_cols],
    )
    count_expr = reduce(
        lambda a, b: a + b,
        [when(col(c).isNotNull(), lit(1)).otherwise(lit(0)) for c in all_cols],
    )

    return df.withColumn("COELO", sum_expr / count_expr).dropDuplicates()


def calculate_AFELO(data, course_for_label):
    """Compute the AFELO (activity-frequency engagement) component per row.

    AEF is the fraction of the chapter's available activity types that the
    learner engaged with; AFELO is the mean of the scaled watch count and AEF.
    """
    fv = data.select("course_id", "user_id", "chapter", "total_watch_count_scaled")
    aef = data.select("course_id", "user_id", "chapter", "problem_count", "count_comment")
    df = (
        fv
        .join(aef, on=JOIN_KEYS, how="inner")
        .join(course_for_label, on=GROUP_KEYS)
    )

    # Step 1 -- activity-engagement fraction (AEF) by modality.
    df = df.withColumn(
        "AEF",
        when(
            col("check") == 0,
            (col("total_watch_count_scaled").isNotNull().cast("int")
             + col("count_comment").isNotNull().cast("int")) / 2,
        )
        .when(
            col("check") == 1,
            (col("problem_count").isNotNull().cast("int")
             + col("count_comment").isNotNull().cast("int")) / 2,
        )
        .when(
            col("check") == 2,
            (col("total_watch_count_scaled").isNotNull().cast("int")
             + col("problem_count").isNotNull().cast("int")
             + col("count_comment").isNotNull().cast("int")) / 3,
        )
        .otherwise(0),
    )

    # Step 2 -- fill nulls.
    df = df.withColumn(
        "total_watch_count_scaled",
        when(
            col("check").isin(0, 2) & col("total_watch_count_scaled").isNull(), 0
        ).otherwise(col("total_watch_count_scaled")),
    )
    df = df.withColumn(
        "count_comment",
        when(col("count_comment").isNull(), 0).otherwise(col("count_comment")),
    )

    # Step 3 -- AFELO_mean = mean over the available components.
    cols = ["total_watch_count_scaled", "AEF"]
    sum_expr = reduce(
        lambda a, b: a + b,
        [when(col(c).isNotNull(), col(c)).otherwise(lit(0)) for c in cols],
    )
    count_expr = reduce(
        lambda a, b: a + b,
        [when(col(c).isNotNull(), lit(1)).otherwise(lit(0)) for c in cols],
    )

    df = df.withColumn(
        "AFELO_mean",
        when(count_expr == 0, lit(None)).otherwise(sum_expr / count_expr),
    )
    return df.dropDuplicates()


def build_course_acelo(course_struct):
    """Build the per-course assessment-proportion table used by ACELO.

    Splits the scoring structure into Video and Assignment proportions and
    joins them back into a single row per course.
    """
    course_acelo = course_struct.select("course_id", "proportion", "activities")
    video = course_acelo.filter(col("activities") == "Video")
    assignment = (
        course_acelo.filter(col("activities") == "Assignment")
        .withColumnRenamed("proportion", "proportion_assignment")
    )
    return assignment.join(video, on=["course_id"], how="outer").fillna("0")


def calculate_ACELO(data, course_for_label, course_acelo):
    """Compute the ACELO (assessment/completion) component per row.

    Combines the video-watch and assignment-score ratios weighted by their
    course proportions, then min-max scales the result within each
    (course_id, chapter) group.
    """
    fs = (
        data.select("course_id", "user_id", "chapter", "video_watch_ratio", "score_ratio")
        .join(course_for_label, on=GROUP_KEYS)
        .join(course_acelo, on=["course_id"], how="inner")
        .dropDuplicates()
    )

    # Weighted total ratio by modality.
    fs = fs.withColumn(
        "total_ratio",
        when(
            col("check") == 0,
            when(col("video_watch_ratio").isNull(), lit(0))
            .otherwise(col("video_watch_ratio") * col("proportion") / 100),
        )
        .when(
            col("check") == 1,
            col("score_ratio") * col("proportion_assignment") / 100,
        )
        .when(
            col("check") == 2,
            when(col("video_watch_ratio").isNull(), lit(0))
            .otherwise(col("video_watch_ratio") * col("proportion") / 100)
            + col("score_ratio") * col("proportion_assignment") / 100,
        )
        .otherwise(lit(0)),
    )

    # Min-max scale within each (course_id, chapter) group; constant groups -> 1.0.
    w = Window.partitionBy("course_id", "chapter")
    fs = fs.withColumn("min_val", _min(col("total_ratio")).over(w))
    fs = fs.withColumn("max_val", _max(col("total_ratio")).over(w))
    fs = fs.withColumn(
        "total_ratio_scaled",
        when(col("min_val") == col("max_val"), lit(1.0))
        .otherwise(
            (col("total_ratio") - col("min_val")) / (col("max_val") - col("min_val"))
        ),
    )

    return fs.drop("min_val", "max_val").dropDuplicates()


# =============================================================================
# VECTOR ASSEMBLY AND LABELING
# =============================================================================

def vector_final(coelo, afelo, acelo):
    """Average the three components per chapter and measure distance to [1,1,1].

    The Euclidean distance is normalised by the number of available (non-null)
    components so chapters missing a modality remain comparable.
    """
    coelo = coelo.select("course_id", "chapter", "COELO")
    afelo = afelo.select("course_id", "chapter", "AFELO_mean")
    acelo = acelo.select("course_id", "chapter", "total_ratio_scaled")

    vector = (
        acelo
        .join(afelo, on=GROUP_KEYS, how="inner")
        .join(coelo, on=GROUP_KEYS, how="inner")
    )

    vector_avg = vector.groupBy("course_id", "chapter").agg(
        avg("total_ratio_scaled").alias("total_ratio_scaled_avg"),
        avg("AFELO_mean").alias("AFELO_mean_avg"),
        avg("COELO").alias("COELO_scaled_avg"),
    )

    distance_expr = (
        sqrt(
            when(col("total_ratio_scaled_avg").isNotNull(),
                 (col("total_ratio_scaled_avg") - 1) ** 2).otherwise(0)
            + when(col("AFELO_mean_avg").isNotNull(),
                   (col("AFELO_mean_avg") - 1) ** 2).otherwise(0)
            + when(col("COELO_scaled_avg").isNotNull(),
                   (col("COELO_scaled_avg") - 1) ** 2).otherwise(0)
        )
        / (
            when(col("total_ratio_scaled_avg").isNotNull(), 1).otherwise(0)
            + when(col("AFELO_mean_avg").isNotNull(), 1).otherwise(0)
            + when(col("COELO_scaled_avg").isNotNull(), 1).otherwise(0)
        )
    )

    return vector_avg.withColumn("euclidean_distance", distance_expr)


def add_label(df, distance_col="euclid_to_111"):
    """Bucket the distance-to-ideal into the three quality labels."""
    return df.withColumn(
        "label",
        F.when(F.col(distance_col) <= EXCELLENT_MAX, "excellent")
        .when(
            (F.col(distance_col) > EXCELLENT_MAX) & (F.col(distance_col) <= GOOD_MAX),
            "good",
        )
        .when(
            (F.col(distance_col) > GOOD_MAX) & (F.col(distance_col) <= 1.0),
            "average",
        )
        .otherwise(None),
    )


def label_phase(merged, course_for_label, course_struct, course_acelo):
    """Run the full component -> vector -> label pipeline for one phase."""
    coelo = calculate_COELO(merged, course_for_label)
    afelo = calculate_AFELO(merged, course_for_label)
    acelo = calculate_ACELO(merged, course_for_label, course_acelo)

    vector = vector_final(coelo, afelo, acelo)
    distances = (
        vector
        .select("course_id", "chapter", "euclidean_distance")
        .withColumnRenamed("euclidean_distance", "euclid_to_111")
    )
    return add_label(distances)


# =============================================================================
# ENTRY POINT
# =============================================================================

def main(spark):
    """Build and persist the labelled course-quality table for every phase."""
    course_check = build_course_check(spark)
    course_struct = load_course_struct(spark)
    course_for_label = build_course_for_label(course_struct, course_check)
    course_acelo = build_course_acelo(course_struct)

    for phase in PHASES:
        merged = load_phase_features(spark, phase)
        labelled = label_phase(merged, course_for_label, course_struct, course_acelo)
        (
            labelled.write
            .format("delta")
            .mode("overwrite")
            .save(OUTPUT_PATH.format(phase=phase))
        )


if __name__ == "__main__":
    # In Databricks ``spark`` already exists; getOrCreate() is a no-op there.
    spark = SparkSession.builder.getOrCreate()
    main(spark)
