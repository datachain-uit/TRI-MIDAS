"use client";

export default function Home() {
  const callApi = async () => {
    const res = await fetch("http://localhost:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: 6 }),
    });

    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Student Learning Outcome Prediction</h1>
      <button onClick={callApi}>Call Backend Predict API</button>
    </main>
  );
}
