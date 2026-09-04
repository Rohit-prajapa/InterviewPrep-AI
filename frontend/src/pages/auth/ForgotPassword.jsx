import { Link, useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">InterviewPrep AI</h1>
          <p className="mt-2 text-slate-400">
            Reset your account password
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-2xl font-semibold">Forgot Password?</h2>

          {submitted ? (
            <p className="mt-6 rounded-lg bg-green-500/10 p-4 text-green-400">
              If an account exists with this email, reset instructions
              will be sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700"
              >
                Send Reset Instructions
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}