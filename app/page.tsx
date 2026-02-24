import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-indigo-700 mb-4">Float Business</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create your online store in minutes. Accept payments with Paystack.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
