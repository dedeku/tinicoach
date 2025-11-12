"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Egyelőre nem tároljuk sehol, csak jelzés
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-2xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          tinicoach MVP
        </h1>
        <p className="text-center text-lg mb-8">
          Teen Life Coaching App - Solution-Focused
        </p>
        <div className="text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Coming Soon
          </p>
          <p className="text-gray-500 mb-8">
            Add meg az email címed és majd szólunk!
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-sans whitespace-nowrap"
            >
              Értesítés
            </button>
          </form>
          {submitted && (
            <p className="mt-4 text-green-600 font-sans">
              Köszönjük! Hamarosan értesítünk.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

