import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { citiesAPI } from "../services/api";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import type { City, Column } from "../types";

const FLAG_MAP: Record<string, string> = {
  SA: "🇸🇦",
  AE: "🇦🇪",
  KW: "🇰🇼",
  QA: "🇶🇦",
  BH: "🇧🇭",
  OM: "🇴🇲",
  EG: "🇪🇬",
  JO: "🇯🇴",
  LB: "🇱🇧",
  IQ: "🇮🇶",
};

const emptyForm = { name: "", nameAr: "", countryCode: "" };

export default function Cities() {
  const [data, setData] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<City | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await citiesAPI.getAll();
      setData(res.data.data as City[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingCity(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (city: City) => {
    setEditingCity(city);
    setForm({
      name: city.name,
      nameAr: city.nameAr,
      countryCode: city.countryCode,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.nameAr.trim() || !form.countryCode.trim()) {
      setFormError("All fields are required");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      if (editingCity) {
        const res = await citiesAPI.update(editingCity._id, form);
        setData((prev) =>
          prev.map((c) => (c._id === editingCity._id ? res.data.data : c)),
        );
      } else {
        const res = await citiesAPI.create(form);
        setData((prev) => [res.data.data, ...prev]);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      setFormError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to save city",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (city: City) => {
    try {
      const res = await citiesAPI.update(city._id, {
        isActive: !city.isActive,
      });
      setData((prev) =>
        prev.map((c) => (c._id === city._id ? res.data.data : c)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await citiesAPI.delete(deleting._id);
      setData((prev) => prev.filter((c) => c._id !== deleting._id));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      alert(msg || "Cannot delete city");
    }
    setIsDeleting(false);
    setDeleting(null);
  };

  const columns: Column<City>[] = [
    {
      key: "name",
      header: "المدينة",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">
            {FLAG_MAP[row.countryCode] || "🏙️"}
          </span>
          <div>
            <p className="font-semibold text-sm text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-400 font-arabic mt-0.5">
              {row.nameAr}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "countryCode",
      header: "الدولة",
      render: (row) => (
        <span className="badge bg-gray-100 text-gray-600 font-mono">
          {row.countryCode}
        </span>
      ),
    },
    {
      key: "liveCount",
      header: "العقارات",
      render: (row) => (
        <span className="font-semibold tabular-nums text-sm text-gray-700">
          {row.liveCount ?? row.propertiesCount ?? 0}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "الحالة",
      render: (row) => (
        <span
          className={`badge ${row.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
        >
          {row.isActive ? "نشط" : "غير نشط"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الإضافة",
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
          {/* Edit */}
          <button
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          {/* Toggle active */}
          <button
            onClick={() => toggleActive(row)}
            title={row.isActive ? "Deactivate" : "Activate"}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isActive
                ? "text-primary-600 bg-primary-50 hover:bg-primary-100"
                : "text-gray-300 hover:text-primary-500 hover:bg-primary-50"
            }`}
          >
            {row.isActive ? (
              <ToggleRight size={15} />
            ) : (
              <ToggleLeft size={15} />
            )}
          </button>
          {/* Delete */}
          <button
            onClick={() => setDeleting(row)}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-medium">{data.length} مدينة</p>
        <button
          onClick={openCreate}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          إضافة مدينة
        </button>
      </div>

      <DataTable
        data={data as unknown as Record<string, unknown>[]}
        columns={columns as Column<Record<string, unknown>>[]}
        isLoading={isLoading}
        emptyMessage="لم يتم العثور على مدن"
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingCity ? `تعديل — ${editingCity.name}` : "إضافة مدينة جديدة"
        }
      >
        <div className="space-y-4">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              {formError}
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              اسم المدينة (إنجليزي)
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثال: Riyadh"
              dir="ltr"
              className="input text-sm text-left"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              اسم المدينة (عربي) — الاسم بالعربية
            </label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) =>
                setForm((f) => ({ ...f, nameAr: e.target.value }))
              }
              placeholder="مثال: الرياض"
              dir="rtl"
              className="input text-sm text-right"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              رمز الدولة
            </label>
            <select
              value={form.countryCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, countryCode: e.target.value }))
              }
              className="input text-sm"
            >
              <option value="">اختر الدولة…</option>
              {Object.entries(FLAG_MAP).map(([code, flag]) => (
                <option key={code} value={code}>
                  {flag} {code}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-secondary text-sm"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary text-sm"
            >
              {isSubmitting
                ? "جارٍ الحفظ…"
                : editingCity
                  ? "حفظ التغييرات"
                  : "إضافة المدينة"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="حذف المدينة"
        message={`حذف "‏${deleting?.name}‏"? سيفشل الحذف إذا كانت المدينة تحتوي على عقارات.`}
        confirmLabel="حذف المدينة"
        isLoading={isDeleting}
      />
    </div>
  );
}
