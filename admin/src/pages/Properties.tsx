import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { propertiesAPI, citiesAPI } from "../services/api";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import type { Property, City, Column } from "../types";
import { useDebounce } from "../hooks/useDebounce";

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-50 text-green-700",
  rented: "bg-blue-50 text-blue-700",
  sold: "bg-gray-100 text-gray-600",
  inactive: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  available: "متاح",
  rented: "مؤجّر",
  sold: "مباع",
  inactive: "غير نشط",
};

const LISTING_COLORS: Record<string, string> = {
  rent: "bg-cyan-50 text-cyan-700",
  sale: "bg-blue-50 text-blue-700",
  buy: "bg-green-50 text-green-700",
};

const LISTING_LABELS: Record<string, string> = {
  rent: "إيجار",
  sale: "بيع",
  buy: "شراء",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "شقة",
  villa: "فيلا",
  chalet: "شاليه",
  studio: "استوديو",
  office: "مكتب",
  land: "أرض",
  warehouse: "مستودع",
};

const APPROVAL_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

const APPROVAL_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
};

const APPROVAL_TABS = [
  { value: "", label: "الكل" },
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "مقبولة" },
  { value: "rejected", label: "مرفوضة" },
];

interface PropertyForm {
  title: string;
  titleAr: string;
  description: string;
  listingType: "rent" | "sale" | "buy";
  propertyType: string;
  price: string;
  currency: string;
  area: string;
  rooms: string;
  bathrooms: string;
  city: string;
  district: string;
  address: string;
  contactPhone: string;
}

const defaultForm: PropertyForm = {
  title: "",
  titleAr: "",
  description: "",
  listingType: "sale",
  propertyType: "apartment",
  price: "",
  currency: "SAR",
  area: "",
  rooms: "0",
  bathrooms: "0",
  city: "",
  district: "",
  address: "",
  contactPhone: "",
};

export default function Properties() {
  const [data, setData] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [listingFilter, setListingFilter] = useState("");
  const [approvalTab, setApprovalTab] = useState("");
  const [deleting, setDeleting] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Approval actions
  const [approvingProp, setApprovingProp] = useState<Property | null>(null);
  const [isApprovingProp, setIsApprovingProp] = useState(false);
  const [rejectingProp, setRejectingProp] = useState<Property | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejectingProp, setIsRejectingProp] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<PropertyForm>(defaultForm);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [cities, setCities] = useState<City[]>([]);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    citiesAPI
      .getAll()
      .then((res) => setCities(res.data.data))
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (listingFilter) params.listingType = listingFilter;
      if (approvalTab) params.approvalStatus = approvalTab;
      const res = await propertiesAPI.getAll(params);
      setData(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, listingFilter, approvalTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, listingFilter, approvalTab]);

  const toggleFeatured = async (property: Property) => {
    try {
      await propertiesAPI.update(property._id, {
        isFeatured: !property.isFeatured,
      });
      setData((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, isFeatured: !p.isFeatured } : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (property: Property) => {
    const newStatus =
      property.status === "available" ? "inactive" : "available";
    try {
      await propertiesAPI.update(property._id, { status: newStatus });
      setData((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, status: newStatus } : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVerified = async (property: Property) => {
    try {
      await propertiesAPI.update(property._id, {
        isVerified: !property.isVerified,
      });
      setData((prev) =>
        prev.map((p) =>
          p._id === property._id ? { ...p, isVerified: !p.isVerified } : p,
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
      await propertiesAPI.delete(deleting._id);
      setData((prev) => prev.filter((p) => p._id !== deleting._id));
      setTotal((t) => t - 1);
    } catch (err) {
      console.error(err);
    }
    setIsDeleting(false);
    setDeleting(null);
  };

  const handleApproveProperty = async () => {
    if (!approvingProp) return;
    setIsApprovingProp(true);
    try {
      const res = await propertiesAPI.approve(approvingProp._id);
      setData((prev) =>
        prev.map((p) => (p._id === approvingProp._id ? res.data.data : p)),
      );
    } catch (err) {
      console.error(err);
    }
    setIsApprovingProp(false);
    setApprovingProp(null);
  };

  const handleRejectProperty = async () => {
    if (!rejectingProp) return;
    setIsRejectingProp(true);
    try {
      const res = await propertiesAPI.reject(
        rejectingProp._id,
        rejectReason || undefined,
      );
      setData((prev) =>
        prev.map((p) => (p._id === rejectingProp._id ? res.data.data : p)),
      );
    } catch (err) {
      console.error(err);
    }
    setIsRejectingProp(false);
    setRejectingProp(null);
    setRejectReason("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setIsCreating(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        area: Number(form.area),
        rooms: Number(form.rooms),
        bathrooms: Number(form.bathrooms),
      };
      const res = await propertiesAPI.create(payload);
      setData((prev) => [res.data.data, ...prev]);
      setTotal((t) => t + 1);
      setShowCreate(false);
      setForm(defaultForm);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setCreateError(msg || "حدث خطأ، حاول مجدداً");
    }
    setIsCreating(false);
  };

  const columns: Column<Property>[] = [
    {
      key: "title",
      header: "العقار",
      render: (row) => (
        <div className="flex items-start gap-3 max-w-xs">
          {row.coverImage || (row.images && row.images[0]) ? (
            <img
              src={(row.coverImage || row.images[0]) as string}
              alt=""
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {row.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {typeof row.city === "object" ? row.city.name : row.city}
              {row.district ? ` · ${row.district}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "listingType",
      header: "النوع",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`badge ${LISTING_COLORS[row.listingType] || "bg-gray-100 text-gray-600"}`}
          >
            {LISTING_LABELS[row.listingType] || row.listingType}
          </span>
          <span className="text-xs text-gray-400">
            {PROPERTY_TYPE_LABELS[row.propertyType] || row.propertyType}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      header: "السعر",
      render: (row) => (
        <span className="font-semibold tabular-nums text-sm">
          {row.currency} {Number(row.price).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`badge ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"}`}
          >
            {STATUS_LABELS[row.status] || row.status}
          </span>
          <span
            className={`badge ${APPROVAL_COLORS[row.approvalStatus] || "bg-gray-100 text-gray-600"}`}
          >
            {APPROVAL_LABELS[row.approvalStatus] || row.approvalStatus}
          </span>
        </div>
      ),
    },
    {
      key: "stats",
      header: "المشاهدات / المفضلات",
      render: (row) => (
        <span className="text-xs text-gray-500 tabular-nums">
          {row.viewsCount} / {row.favoritesCount}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "التاريخ",
      render: (row) => (
        <span className="text-xs text-gray-400">
          {new Date(row.createdAt).toLocaleDateString("ar-SA")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "إجراءات",
      render: (row) => (
        <div className="flex items-center gap-1 flex-wrap">
          {row.approvalStatus === "pending" && (
            <>
              <button
                title="قبول"
                onClick={() => setApprovingProp(row)}
                className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                title="رفض"
                onClick={() => {
                  setRejectingProp(row);
                  setRejectReason("");
                }}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
              >
                <ThumbsDown size={14} />
              </button>
            </>
          )}
          <button
            title={row.isFeatured ? "إلغاء التمييز" : "تمييز"}
            onClick={() => toggleFeatured(row)}
            className={`p-1.5 rounded-lg transition-colors ${row.isFeatured ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" : "text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"}`}
          >
            <Star size={14} fill={row.isFeatured ? "currentColor" : "none"} />
          </button>
          <button
            title={row.isVerified ? "إلغاء التحقّق" : "تحقّق"}
            onClick={() => toggleVerified(row)}
            className={`p-1.5 rounded-lg transition-colors ${row.isVerified ? "text-green-500 bg-green-50 hover:bg-green-100" : "text-gray-300 hover:text-green-500 hover:bg-green-50"}`}
          >
            {row.isVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
          </button>
          <button
            title={row.status === "available" ? "تعطيل" : "تفعيل"}
            onClick={() => toggleStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${row.status === "available" ? "text-primary-600 bg-primary-50 hover:bg-primary-100" : "text-gray-300 hover:text-primary-500 hover:bg-primary-50"}`}
          >
            {row.status === "available" ? (
              <ToggleRight size={14} />
            ) : (
              <ToggleLeft size={14} />
            )}
          </button>
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
      {/* Approval tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {APPROVAL_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setApprovalTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              approvalTab === t.value
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="بحث بالعنوان أو الحي…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pr-9 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-40 text-sm"
        >
          <option value="">جميع الحالات</option>
          <option value="available">متاح</option>
          <option value="rented">مؤجّر</option>
          <option value="sold">مباع</option>
          <option value="inactive">غير نشط</option>
        </select>
        <select
          value={listingFilter}
          onChange={(e) => setListingFilter(e.target.value)}
          className="input w-40 text-sm"
        >
          <option value="">جميع الأنواع</option>
          <option value="rent">للإيجار</option>
          <option value="sale">للبيع</option>
          <option value="buy">شراء</option>
        </select>
        <span className="text-sm text-gray-500 font-medium">{total} عقار</span>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreateError("");
            setForm(defaultForm);
          }}
          className="mr-auto flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          إضافة عقار
        </button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="لم يتم العثور على عقارات"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="حذف العقار"
        message={`هل أنت متأكد من حذف "‏${deleting?.title}‏"? لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف العقار"
        isLoading={isDeleting}
      />

      {/* Approve property confirm */}
      <ConfirmDialog
        isOpen={!!approvingProp}
        onClose={() => setApprovingProp(null)}
        onConfirm={handleApproveProperty}
        title="قبول العقار"
        message={`هل تريد قبول عقار "${approvingProp?.title}"؟`}
        confirmLabel="قبول"
        isLoading={isApprovingProp}
      />

      {/* Reject property modal */}
      <Modal
        isOpen={!!rejectingProp}
        onClose={() => {
          setRejectingProp(null);
          setRejectReason("");
        }}
        title="رفض العقار"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            رفض العقار{" "}
            <span className="font-semibold">"{rejectingProp?.title}"</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              سبب الرفض (اختياري)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="أدخل سبب الرفض..."
              className="input resize-none text-sm"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setRejectingProp(null);
                setRejectReason("");
              }}
              className="btn-secondary text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={handleRejectProperty}
              disabled={isRejectingProp}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isRejectingProp ? "جارٍ الرفض…" : "رفض العقار"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create property modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="إضافة عقار جديد"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العنوان (إنجليزي) *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input text-sm"
                placeholder="Property title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العنوان (عربي)
              </label>
              <input
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                className="input text-sm"
                placeholder="عنوان العقار"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الوصف *
              </label>
              <textarea
                required
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="input resize-none text-sm"
                placeholder="وصف العقار..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                نوع الإعلان *
              </label>
              <select
                value={form.listingType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    listingType: e.target.value as "rent" | "sale" | "buy",
                  })
                }
                className="input text-sm"
              >
                <option value="sale">للبيع</option>
                <option value="rent">للإيجار</option>
                <option value="buy">شراء</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                نوع العقار *
              </label>
              <select
                value={form.propertyType}
                onChange={(e) =>
                  setForm({ ...form, propertyType: e.target.value })
                }
                className="input text-sm"
              >
                <option value="apartment">شقة</option>
                <option value="villa">فيلا</option>
                <option value="chalet">شاليه</option>
                <option value="studio">استوديو</option>
                <option value="office">مكتب</option>
                <option value="land">أرض</option>
                <option value="warehouse">مستودع</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                السعر *
              </label>
              <input
                required
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العملة
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="input text-sm"
              >
                {["SAR", "AED", "KWD", "BHD", "QAR", "OMR", "EGP", "USD"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                المساحة (م²) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="input text-sm"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                المدينة *
              </label>
              <select
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input text-sm"
              >
                <option value="">اختر المدينة</option>
                {cities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nameAr} ({c.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الغرف
              </label>
              <input
                type="number"
                min="0"
                value={form.rooms}
                onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الحمامات
              </label>
              <input
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(e) =>
                  setForm({ ...form, bathrooms: e.target.value })
                }
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الحي
              </label>
              <input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="input text-sm"
                placeholder="اسم الحي"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                هاتف التواصل *
              </label>
              <input
                required
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
                className="input text-sm"
                placeholder="+966..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العنوان التفصيلي
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input text-sm"
                placeholder="شارع، حي..."
              />
            </div>
          </div>
          {createError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">
              {createError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="btn-secondary text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isCreating ? "جارٍ الإضافة…" : "إضافة العقار"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
