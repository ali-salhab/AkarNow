import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Modal from "../components/Modal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { login, isLoading, token } = useAuthStore();
  const navigate = useNavigate();

  // Redirect as soon as the store has a token (handles React 18 batching)
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as Error).message || "فشل تسجيل الدخول";
      setError(msg);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="خطأ في تسجيل الدخول"
        maxWidth="max-w-sm"
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle size={30} className="text-red-500" />
          </div>
          <p
            className="text-gray-700 text-center font-medium text-sm"
            dir="rtl"
          >
            {error}
          </p>
          <button
            onClick={() => setShowErrorModal(false)}
            className="btn-primary w-full py-2.5 text-sm"
          >
            حسناً
          </button>
        </div>
      </Modal>
      {/* Decorative animated bubbles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none animate-floatBubble" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none animate-floatBubble delay-500" />
      <div className="absolute top-1/3 left-10 w-32 h-32 bg-white/5 rounded-full pointer-events-none animate-floatBubble delay-300" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8 animate-fadeInDown">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-4 hover:scale-105 transition-transform duration-300 overflow-hidden">
            <img
              src="/icon.png"
              alt="AqarNow"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-wide">
            Akar Now
          </h1>
          <p className="text-primary-200 text-sm mt-2 font-semibold tracking-wider">
            لوحة تحكم المشرف
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 animate-fadeInUp">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-right">
            تسجيل الدخول للمتابعة
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="animate-slideInRight delay-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aqarnow.com"
                  required
                  dir="ltr"
                  className="input pr-10 text-left"
                  style={{ direction: "ltr" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="animate-slideInRight delay-200">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input pr-10 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base mt-2 animate-fadeInUp delay-300 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    />
                  </svg>
                  جارٍ تسجيل الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
