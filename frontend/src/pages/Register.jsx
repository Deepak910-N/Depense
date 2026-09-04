import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 8) { toast.error("Min 8 characters"); return; }
    setLoading(true);
    try { await register(form.email, form.name, form.password); toast.success("Account created!"); }
    catch (err) { toast.error(err.message || "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">{"\u20B9"}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            placeholder="Your name" />
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            placeholder="Email" />
          <input type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            placeholder="Password (min 8 chars)" />
          <input type="password" required value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            placeholder="Confirm password" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold active:bg-primary-700 disabled:opacity-50">
            {loading ? "Creating..." : "Create Account"}
          </button>
          <p className="text-center text-xs text-gray-400">
            Have an account?{" "}
            <Link to="/login" className="text-primary-600 font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
