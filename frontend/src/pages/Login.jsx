import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await login(form.email, form.password); toast.success("Welcome back!"); }
    catch (err) { toast.error(err.message || "Login failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">{"₹"}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dépense</h1>
          <p className="text-gray-400 text-sm mt-1">Track expenses effortlessly</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            placeholder="Email" />
          <input type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            placeholder="Password" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold active:bg-primary-700 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-xs text-gray-400">
            No account?{" "}
            <Link to="/register" className="text-primary-600 font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
