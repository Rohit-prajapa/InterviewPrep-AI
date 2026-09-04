import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    experience: "fresher",
    targetRole: "",
    skills: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await register({
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      if (response.success) {
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">InterviewPrep AI</h1>
          <p className="mt-2 text-slate-400">
            Create your account and start preparing
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-semibold">Create Account</h2>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              minLength={6}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none"
            >
              <option value="student">Student</option>
              <option value="developer">Developer</option>
              <option value="software-engineer">Software Engineer</option>
              <option value="frontend-developer">Frontend Developer</option>
              <option value="backend-developer">Backend Developer</option>
              <option value="full-stack-developer">Full Stack Developer</option>
              <option value="data-scientist">Data Scientist</option>
              <option value="devops-engineer">DevOps Engineer</option>
              <option value="ai-engineer">AI Engineer</option>
            </select>

            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none"
            >
              <option value="fresher">Fresher</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>

            <input
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              placeholder="Target Role (e.g. Full Stack Developer)"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Skills (Java, React, MongoDB, DSA)"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}