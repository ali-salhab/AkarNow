import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Trash2,
  ShieldCheck,
  UserX,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import { usersAPI } from "../services/api";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import type { User, Column } from "../types";
import { useDebounce } from "../hooks/useDebounce";

const ROLE_OPTIONS = ["user", "agent"];
const ROLE_LABELS: Record<string, string> = {
  user: "مستخدم",
  agent: "وسيط",
  admin: "مشرف",
};
const ROLE_COLORS: Record<string, string> = {
  user: "bg-gray-100 text-gray-600",
  agent: "bg-blue-50 text-blue-700",
  admin: "bg-purple-50 text-purple-700",
};

export default function Users() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleting, setDeleting] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;
      const res = await usersAPI.getAll(params);
      setData(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditActive(user.isActive);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const res = await usersAPI.update(editingUser._id, {
        role: editRole as User["role"],
        isActive: editActive,
      });
      setData((prev) =>
        prev.map((u) => (u._id === editingUser._id ? res.data.data : u)),
      );
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const quickToggleActive = async (user: User) => {
    try {
      await usersAPI.update(user._id, { isActive: !user.isActive });
      setData((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await usersAPI.delete(deleting._id);
      setData((prev) => prev.filter((u) => u._id !== deleting._id));
      setTotal((t) => t - 1);
    } catch (err) {
      console.error(err);
    }
    setIsDeleting(false);
    setDeleting(null);
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "المستخدم",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
            {row.name?.[0] || row.phone?.[3] || "?"}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {row.name || "—"}
            </p>
            <p className="text-xs text-gray-400">{row.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "البريد الإلكتروني",
      render: (row) => (
        <span className="text-sm text-gray-600">{row.email || "—"}</span>
      ),
    },
    {
      key: "role",
      header: "الدور",
      render: (row) => (
        <span
          className={`badge ${ROLE_COLORS[row.role] || "bg-gray-100 text-gray-600"} capitalize`}
        >
          {ROLE_LABELS[row.role] || row.role}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "الحالة",
      render: (row) => (
        <span
          className={`badge ${
            row.isActive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {row.isActive ? "نشط" : "موقوف"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الانضمام",
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "إجراءات",
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* Edit role / status */}
          <button
            title="تعديل المستخدم"
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <ShieldCheck size={15} />
          </button>
          {/* Suspend / Activate */}
          <button
            title={row.isActive ? "تعليق المستخدم" : "تفعيل المستخدم"}
            onClick={() => quickToggleActive(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isActive
                ? "text-gray-300 hover:text-orange-500 hover:bg-orange-50"
                : "text-green-500 bg-green-50 hover:bg-green-100"
            }`}
          >
            {row.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
          </button>
          {/* Delete */}
          <button
            onClick={() => setDeleting(row)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="بحث بالاسم أو الهاتف أو البريد…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pr-9 text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-40 text-sm appearance-none pl-8"
          >
            <option value="">جميع الأدوار</option>
            <option value="user">مستخدم</option>
            <option value="agent">وسيط</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
        <span className="text-sm text-gray-500 font-medium">
          {total} مستخدم
        </span>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="لم يتم العثور على مستخدمين"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`تعديل مستخدم — ${editingUser?.name || editingUser?.phone}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              الدور
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="input text-sm"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r} className="capitalize">
                  {ROLE_LABELS[r] || r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              حالة الحساب
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setEditActive(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  editActive
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                نشط
              </button>
              <button
                onClick={() => setEditActive(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  !editActive
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                موقوف
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditingUser(null)}
              className="btn-secondary text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="btn-primary text-sm"
            >
              {isSaving ? "جارٍ الحفظ…" : "حفظ التغييرات"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="حذف مستخدم"
        message={`حذف المستخدم "‏${deleting?.name || deleting?.phone}‏"? سيتم حذف جميع عقاراته ومفضلاته. لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف المستخدم"
        isLoading={isDeleting}
      />
    </div>
  );
}
