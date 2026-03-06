import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Modal from "../components/Modal";

const features = [
  {
    icon: Building2,
    title: "إدارة العقارات",
    desc: "استعراض وإدارة جميع العقارات المدرجة في المنصة",
  },
  {
    icon: Users,
    title: "إدارة المستخدمين",
    desc: "متابعة حسابات المستخدمين والتحقق من هوياتهم",
  },
  {
    icon: ShieldCheck,
    title: "التوثيق والموافقات",
    desc: "مراجعة طلبات التوثيق والموافقة عليها بكل سهولة",
  },
  {
    icon: BarChart3,
    title: "إحصائيات فورية",
    desc: "لوحة بيانات شاملة بأرقام وتقارير محدّثة لحظياً",
  },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { login, isLoading, token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "حدث خطأ غير متوقع، حاول مجدداً";
      setErrorMessage(msg);
      setShowErrorModal(true);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 flex items-center justify-center p-4 overflow-hidden relative"
    >
      {/* Error modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="خطأ في تسجيل الدخول"
        maxWidth="max-w-sm"
      >
        <div className="flex items-start gap-3 text-red-600">
          <AlertCircle className="mt-0.5 shrink-0" size={20} />
          <p className="text-sm leading-relaxed">{errorMessage}</p>
        </div>
      </Modal>

      {/* Decorative blobs — translateY only, no scale = no pulse */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl animate-floatBubble" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl animate-floatBubble delay-300" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 w-[280px] h-[280px] rounded-full bg-primary-500/10 blur-2xl animate-floatBubble delay-600" />

      {/* Main grid */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
        {/* ── Left column: branding & features ── */}
        <div className="hidden lg:flex flex-col gap-8 text-white animate-fadeInDown">
          {/* Logo + brand */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center shadow-lg overflow-hidden">
              <img
                src="/icon.png"
                alt="Akar Now"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">عقارنو </h1>
              <p className="text-white/55 text-sm mt-0.5">
                منصة العقارات الذكية
              </p>
            </div>
          </div>

          {/* Headline */}
          <div>
            <h2 className="text-4xl font-extrabold leading-snug">
              لوحة تحكم
              <br />
              <span className="text-accent">المشرفين</span>
            </h2>
            <p className="mt-3 text-white/65 text-base leading-relaxed max-w-sm">
              أدِر منصتك العقارية باحترافية من خلال واجهة إدارة متكاملة تمنحك
              تحكماً كاملاً بكل جوانب المنصة.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`flex items-start gap-3 animate-fadeInUp delay-${(i + 1) * 100}`}
              >
                <div className="mt-0.5 w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{title}</p>
                  <p className="text-white/50 text-xs leading-relaxed mt-0.5">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column: glass login card slides in from left ── */}
        <div className="animate-slideInLeft">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden">
                <img
                  src="/icon.png"
                  alt="Akar Now"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              </div>
              <div className="text-white">
                <p className="font-bold text-lg leading-none">أقار ناو</p>
                <p className="text-white/55 text-xs mt-0.5">لوحة التحكم</p>
              </div>
            </div>

            {/* Card header */}
            <div className="mb-7">
              <h3 className="text-2xl font-bold text-white">مرحباً بك</h3>
              <p className="text-white/55 text-sm mt-1">
                سجّل دخولك للوصول إلى لوحة التحكم
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@akarnow.com"
                    required
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200"
                    style={{ direction: "ltr" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pr-10 pl-10 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent/85 active:bg-accent/75 text-white font-bold text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-black/20 mt-1"
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    جارٍ التحقق...
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-white/30 text-xs">
              هذه اللوحة مخصصة للمشرفين المعتمدين فقط
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
