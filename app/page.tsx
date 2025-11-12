import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          tinicoach MVP
        </h1>
        <p className="text-center text-lg mb-8">
          Teen Life Coaching App - Solution-Focused
        </p>
              <div className="text-center space-x-4">
                <Link
                  href="/docs"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-sans"
                >
                  Fejlesztői Dokumentáció
                </Link>
                <Link
                  href="/specs"
                  className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-sans"
                >
                  Product Dokumentáció
                </Link>
              </div>
      </div>
    </main>
  );
}

