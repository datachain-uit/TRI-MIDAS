"use client";

import Image from "next/image";
import {
  Snowflake,
  Github,
  CandyCane,
  Facebook,
  Twitter,
  Instagram,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { MEMBERS_DATA, OVERVIEW_DATA } from "../../../../data/research-info";
import { Footer } from "@/components/Footer";

const SnowEffect = dynamic(() => import("@/components/snow-effect"), {
  ssr: false,
});

export default function AboutUsPage() {
  const router = useRouter();

  return (
    <div className=" w-full font-sans overflow-x-hidden bg-[image:var(--background-gradient)] dark ">
      <SnowEffect />
      {/* --- HERO --- */}
      <section className=" relative text-white py-40  flex flex-col items-center justify-center text-center">
        <Image
          src="https://res.cloudinary.com/dpqv7ag5w/image/upload/v1765888145/image_1770_vdqjbu.png"
          alt="Hero background"
          fill
          priority
          className="object-cover object-bottom scale-105 origin-bottom "
        />
        {/* Decorative Snowflakes */}
        <Snowflake className="absolute top-10 left-10 w-8 h-8 opacity-50 animate-pulse" />
        <Snowflake className="absolute bottom-10 right-20 w-12 h-12 opacity-40 animate-bounce" />
        <Snowflake className="absolute top-20 right-1/4 w-6 h-6 opacity-60 " />

        <div className="z-10 max-w-4xl grid grid-row-3 gap-2">
          <div className="flex items-center text-sm justify-center gap-2 mb-6 opacity-90">
            <Snowflake className="w-5 h-5" />

            <span
              className="uppercase tracking-widest text-indigo-400  font-extrabold
"
            >
              Season&apos;s Greetings from Our Team
            </span>
            <Snowflake className="w-5 h-5" />
          </div>

          <h1 className="torn-paper  text-teal-300 text-4xl md:text-6xl font-bold mb-6 font-serif leading-tight">
            Predicting Academic <br /> Success with AI
            <svg width="0" height="0">
              <filter id="torn">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.8"
                  numOctaves="2"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="3"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </svg>
          </h1>

          <p className=" max-w-2xl text-semibold mx-auto text-[#2A2B2C] mb-8 leading-relaxed">
            Empowering educators and students with cutting-edge machine learning
            technologies to analyze and predict academic outcomes using real
            datasets.
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={() => {
            router.push("/dashboard/overview");
          }}
          className="rounded-full  p-6 px-10 hover:text-primary z-10 bg-[image:var(--background-gradient)] hover:scale-105 "
        >
          <p className=" bg-[linear-gradient(to_right,#6366f1,#2dd4bf)] bg-clip-text text-transparent">
            Ours Reseach
          </p>
        </Button>
      </section>
      {/* ---  DARK INTRO --- */}
      <section className="relative overflow-hidden min-h-screen text-white py-24 px-6 md:px-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative">
        <Image
          src="https://res.cloudinary.com/dpqv7ag5w/image/upload/v1765893126/Mask_group_bzkusm.png"
          alt="Hero background"
          fill
          priority
          className="absolute scale-200 scale-x-[-1]  bottom-0 z-1 pointer-events-none object-contain object-left-bottom "
        />
        <div className="space-y-6 z-10">
          <div className="flex items-center gap-2 text-[#CDAA7D]">
            <span className="border border-[#CDAA7D] px-6 py-2 rounded text-xs">
              Our Mission
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl  pt-6 font-serif font-bold text-[#CDAA7D]">
            Predicting Academic <br /> Success with AI
          </h2>
          <p className="text-gray-400  leading-relaxed">
            We aim to leverage data-driven and artificial intelligence
            techniques to early predict students’ academic performance. By
            analyzing learning behaviors, academic records, and related factors,
            our system helps identify students who may face academic
            difficulties at an early stage. This enables educators and
            institutions to provide timely interventions, personalized support,
            and informed decision-making, ultimately improving learning outcomes
            and student success.
          </p>
        </div>

        {/* Abstract 3D Snowflake Graphic */}
        <div className="relative flex justify-center items-center opacity-30 md:opacity-100 z-0">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-start animate-spin-slow">
            <Snowflake className="w-40 h-40 text-[#222]" />
          </div>
        </div>
      </section>
      {/* ---  DATASET --- */}
      <section className="bg-[#FAF8EF] py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-[#6D8B74] uppercase tracking-widest mb-10">
          Dataset Used
        </h2>

        <div className="max-w-[70vw] mx-auto bg-white rounded-lg shadow-xl overflow-hidden ">
          <div className="bg-black text-white p-3 flex items-center justify-between text-xs">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span>MOOC/Dataset.csv</span>
          </div>
          <div className="p-0">
            <div className=" relative  w-full h-[65vh] con bg-gray-100 flex items-center justify-center text-gray-400">
              <Image
                fill
                priority
                src="https://res.cloudinary.com/dpqv7ag5w/image/upload/v1766056719/image_1775_1_wixlwr.png"
                alt="dataset info image"
                className="object-cover object-contain  origin-bottom "
              />
            </div>
          </div>
        </div>
        <p className="max-w-[60vw] text-semibold  text-[#2A2B2C]  leading-relaxed mt-12 mx-auto">
          Our research is grounded in the massive MOOCCubeX dataset, comprising
          granular interaction logs from millions of users across thousands of
          courses. We extract fine-grained behavioral features—including video
          watching patterns (pause, rewind, speed), assignment submission
          timestamps, and discussion forum sentiment—to train robust models
          capable of generalizing across diverse learning environments
        </p>
      </section>
      {/* --- CONTENT GRID --- */}
      <section className="bg-[#0F1110] h-[80vh] px-6 md:px-20 relative flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {OVERVIEW_DATA.map((card) => (
            <div
              key={card.id}
              className="
                   shadow-xxl shadow-black/30 p-8 rounded-md 
                   hover:bg-white/10 transition duration-300"
            >
              <h3 className="text-white font-serif text-xl mb-4">
                {card.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      {/* ---  MEMBERS --- */}
      <section className="py-16   px-6 h-[90vh] md:px-12 relative overflow-hidden">
        {/* Decorations */}
        <Image
          src="https://res.cloudinary.com/dpqv7ag5w/image/upload/v1765888145/image_1770_vdqjbu.png"
          alt="Hero background"
          fill
          priority
          className="object-cover object-bottom scale-105 origin-bottom "
        />
        <div className="absolute top-4 left-4 text-[#A02826]">
          <Snowflake className="w-24 h-24" />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <Snowflake className="text-[#FFD700] w-6 h-6" />
          </div>

          <div className="flex gap-24">
            <h2 className="text-3xl font-serif text-[#efc69] z-10 font-bold">
              Members
            </h2>
            <div className="m-auto w-[60vw] grid grid-cols-1 md:grid-cols-2  gap-y-10">
              {MEMBERS_DATA.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 relative group"
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden shadow-lg">
                    <Image
                      src={`https://res.cloudinary.com/dpqv7ag5w/image/upload/v1766052281/Footer_37_ijf3v4.png`}
                      alt="avatar"
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Info */}
                  <div className="text-white">
                    <p className="font-bold text-lg leading-tight">
                      {member.name}
                    </p>
                    <p className="text-sm text-white/80 font-mono mt-0.5">
                      {member.studentId}
                    </p>

                    <p className="text-xs text-[#FFD700] font-mono tracking-wide uppercase opacity-90">
                      {member.classId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Cây thông trang trí (vẽ bằng CSS hoặc SVG) */}
          <div className="absolute bottom-0 right-0 opacity-30">
            <CandyCane className="mt-10 w-24 h-24" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
