import { create } from "zustand";
import { adminAPI } from "../services/api";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialise synchronously so ProtectedRoute never sees a false null on first render
  let initialToken: string | null = null;
  let initialUser: AdminUser | null = null;
  try {
    const t = localStorage.getItem("admin_token");
    const u = localStorage.getItem("admin_user");
    if (t && u) {
      initialToken = t;
      initialUser = JSON.parse(u);
    }
  } catch {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }

  return {
    user: initialUser,
    token: initialToken,
    isLoading: false,
    error: null,

    initializeFromStorage: () => {
      // kept for backwards compat but no-op now (init happens at store creation)
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const res = await adminAPI.login(email, password);
        const { token, user } = res.data.data;
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", JSON.stringify(user));
        set({ token, user, isLoading: false });
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Login failed";
        set({ isLoading: false, error: msg });
        throw new Error(msg);
      }
    },

    logout: () => {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      set({ user: null, token: null });
    },
  };
});
