import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { propertiesAPI } from "../services/api";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import type { Property, Column } from "../types";
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

// Resolve image path → full URL (handles both absolute URLs and /uploads/… paths)
const API_ORIGIN = ((import.meta.env.VITE_API_URL as string) || "").replace(
  /\/api\/?$/,
  "",
);

function resolveImg(src: string): string {
  if (!src) return src;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  return `${API_ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
}

// ── Inline image slider used in the property table rows ──────────────────────
function ImageSlider({
  images,
  cover,
}: {
  images?: string[];
  cover?: string | null;
}) {
  const all = [
    ...(cover ? [cover] : []),
    ...(images || []).filter((img) => img !== cover),
  ]
    .filter(Boolean)
    .map(resolveImg) as string[];

  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (all.length === 0)
    return (
      <div className="w-24 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );

  const [overlayPos, setOverlayPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i - 1 + all.length) % all.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx((i) => (i + 1) % all.length);
  };

  const handleEnter = () => {
    if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      const SCALE = 2.8;
      const W = r.width * SCALE;
      const H = r.height * SCALE;
      setOverlayPos({
        top: r.top + r.height / 2 - H / 2,
        left: r.left + r.width / 2 - W / 2,
        width: W,
        height: H,
      });
    }
    setHovered(true);
  };

  // Slider strip shared renderer
  const strip = (w: number, h: number) => (
    <div
      className="flex h-full transition-transform duration-300 ease-in-out"
      style={{
        width: `${all.length * 100}%`,
        transform: `translateX(-${(idx / all.length) * 100}%)`,
      }}
    >
      {all.map((src, i) => (
        <div
          key={i}
          className="h-full flex-shrink-0"
          style={{ width: `${100 / all.length}%` }}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Small thumbnail in table — nav arrows here since overlay is pointer-events-none */}
      <div
        ref={containerRef}
        className="relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 cursor-pointer group"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setHovered(false)}
        dir="ltr"
      >
        {strip(96, 64)}
        {all.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={next}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
            >
              <ChevronRight size={12} />
            </button>
          </>
        )}
      </div>

      {/* Fixed-position enlarged overlay — rendered in portal to escape any stacking context */}
      {hovered && createPortal(
        <div
          className="fixed pointer-events-none"
          style={{
            top: overlayPos.top,
            left: overlayPos.left,
            width: overlayPos.width,
            height: overlayPos.height,
            zIndex: 99999,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          }}
          dir="ltr"
        >
          {strip(overlayPos.width, overlayPos.height)}
          {/* Dot indicators */}
          {all.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
              {all.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i === idx ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
          {/* Image counter badge */}
          {all.length > 1 && (
            <span className="absolute top-2 right-2 bg-black/60 text-white text-[11px] px-1.5 py-0.5 rounded-md">
              {idx + 1}/{all.length}
            </span>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

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
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Edit
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [editForm, setEditForm] = useState<PropertyForm>(defaultForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editKeptImages, setEditKeptImages] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 400);

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
      const fd = new FormData();
      // Append text fields
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      // Convert numeric strings to numbers
      fd.set("price", String(Number(form.price)));
      fd.set("area", String(Number(form.area)));
      fd.set("rooms", String(Number(form.rooms)));
      fd.set("bathrooms", String(Number(form.bathrooms)));
      // If English title is empty, use Arabic title
      if (!form.title) fd.set("title", form.titleAr || "بدون عنوان");
      // Append image files
      imageFiles.forEach((file) => fd.append("images", file));

      const res = await propertiesAPI.create(fd);
      setData((prev) => [res.data.data, ...prev]);
      setTotal((t) => t + 1);
      setShowCreate(false);
      setForm(defaultForm);
      setImageFiles([]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setCreateError(msg || "حدث خطأ، حاول مجدداً");
    }
    setIsCreating(false);
  };

  const openEdit = (prop: Property) => {
    setEditingProp(prop);
    setEditError("");
    setEditImageFiles([]);
    setEditKeptImages((prop.images as string[]) || []);
    setEditForm({
      title: prop.title || "",
      titleAr: (prop as unknown as { titleAr?: string }).titleAr || "",
      description: prop.description || "",
      listingType: prop.listingType as "rent" | "sale" | "buy",
      propertyType: prop.propertyType || "apartment",
      price: String(prop.price || ""),
      currency: prop.currency || "SAR",
      area: String(prop.area || ""),
      rooms: String(prop.rooms ?? 0),
      bathrooms: String(prop.bathrooms ?? 0),
      city:
        typeof prop.city === "object"
          ? (prop.city as { name: string }).name
          : prop.city || "",
      district: prop.district || "",
      address: prop.address || "",
      contactPhone: prop.contactPhone || "",
    });
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProp) return;
    setEditError("");
    setIsEditing(true);
    try {
      // Always use FormData so we can send kept images + new files together
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, String(v)));
      fd.set("price", String(Number(editForm.price)));
      fd.set("area", String(Number(editForm.area)));
      fd.set("rooms", String(Number(editForm.rooms)));
      fd.set("bathrooms", String(Number(editForm.bathrooms)));
      if (!fd.get("title")) fd.set("title", editForm.titleAr || "بدون عنوان");
      // Send the list of existing image URLs to keep
      fd.append("keepImages", JSON.stringify(editKeptImages));
      // Append any new image files
      editImageFiles.forEach((file) => fd.append("images", file));
      const result = await propertiesAPI.update(editingProp._id, fd);
      setData((prev) =>
        prev.map((p) => (p._id === editingProp._id ? result.data.data : p)),
      );
      setEditingProp(null);
      setEditKeptImages([]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setEditError(msg || "حدث خطأ، حاول مجدداً");
    }
    setIsEditing(false);
  };

  const columns: Column<Property>[] = [
    {
      key: "title",
      header: "العقار",
      render: (row) => (
        <div className="flex items-start gap-3 min-w-[200px]">
          <ImageSlider
            images={row.images as string[] | undefined}
            cover={row.coverImage as string | undefined}
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">
              {row.title || (row as unknown as { titleAr?: string }).titleAr}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {typeof row.city === "object"
                ? (row.city as { name: string }).name
                : row.city}
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
        <div className="flex items-center gap-1.5 flex-wrap">
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
            title="تعديل العقار"
            onClick={() => openEdit(row)}
            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
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
          {/* Enlarged toggle (تفعيل / تعطيل) */}
          <button
            title={row.status === "available" ? "تعطيل العقار" : "تفعيل العقار"}
            onClick={() => toggleStatus(row)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              row.status === "available"
                ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {row.status === "available" ? (
              <ToggleRight size={18} />
            ) : (
              <ToggleLeft size={18} />
            )}
            <span>{row.status === "available" ? "نشط" : "معطّل"}</span>
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
            setImageFiles([]);
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
        onClose={() => {
          setShowCreate(false);
          setImageFiles([]);
        }}
        title="إضافة عقار جديد"
        maxWidth="max-w-2xl"
        scrollable
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العنوان (إنجليزي) —{" "}
                <span className="text-gray-400">اختياري</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input text-sm"
                placeholder="Property title (optional)"
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
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input text-sm"
                placeholder="مثال: الرياض"
              />
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
            {/* Image Upload */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                صور العقار (حتى 10 صور)
              </label>
              {/* Upload drop area */}
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      const selected = Array.from(e.target.files).slice(0, 10);
                      setImageFiles((prev) =>
                        [...prev, ...selected].slice(0, 10),
                      );
                    }
                  }}
                />
                <svg
                  className="w-6 h-6 text-gray-300 mb-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-gray-400">
                  {imageFiles.length === 0
                    ? "انقر لاختيار صور"
                    : `إضافة المزيد (${imageFiles.length} مختارة)`}
                </span>
              </label>
              {/* Horizontal thumbnail scroll */}
              {imageFiles.length > 0 && (
                <div
                  className="mt-2 flex gap-2 overflow-x-auto pt-2 pb-1"
                  dir="ltr"
                >
                  {imageFiles.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={i} className="relative flex-shrink-0">
                        <img
                          src={url}
                          alt=""
                          className="w-20 h-16 rounded-lg object-cover border border-gray-200"
                          onLoad={() => URL.revokeObjectURL(url)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImageFiles((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] leading-none hover:bg-red-600"
                        >
                          ×
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-primary-600/80 text-white rounded px-1">
                            غلاف
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {imageFiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setImageFiles([])}
                  className="mt-1 text-xs text-red-500 hover:underline"
                >
                  حذف جميع الصور
                </button>
              )}
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

      {/* ── Edit Property Modal ── */}
      <Modal
        isOpen={!!editingProp}
        onClose={() => {
          setEditingProp(null);
          setEditImageFiles([]);
          setEditKeptImages([]);
        }}
        title="تعديل العقار"
        maxWidth="max-w-2xl"
        scrollable
      >
        <form onSubmit={handleEditSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العنوان (إنجليزي) —{" "}
                <span className="text-gray-400">اختياري</span>
              </label>
              <input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="input text-sm"
                placeholder="Property title (optional)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العنوان (عربي)
              </label>
              <input
                value={editForm.titleAr}
                onChange={(e) =>
                  setEditForm({ ...editForm, titleAr: e.target.value })
                }
                className="input text-sm"
                placeholder="عنوان العقار"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الوصف
              </label>
              <textarea
                rows={2}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="input resize-none text-sm"
                placeholder="وصف العقار..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                نوع الإعلان
              </label>
              <select
                value={editForm.listingType}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
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
                نوع العقار
              </label>
              <select
                value={editForm.propertyType}
                onChange={(e) =>
                  setEditForm({ ...editForm, propertyType: e.target.value })
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
                السعر
              </label>
              <input
                type="number"
                min="0"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm({ ...editForm, price: e.target.value })
                }
                className="input text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                العملة
              </label>
              <select
                value={editForm.currency}
                onChange={(e) =>
                  setEditForm({ ...editForm, currency: e.target.value })
                }
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
                المساحة (م²)
              </label>
              <input
                type="number"
                min="1"
                value={editForm.area}
                onChange={(e) =>
                  setEditForm({ ...editForm, area: e.target.value })
                }
                className="input text-sm"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                المدينة
              </label>
              <input
                value={editForm.city}
                onChange={(e) =>
                  setEditForm({ ...editForm, city: e.target.value })
                }
                className="input text-sm"
                placeholder="مثال: الرياض"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الغرف
              </label>
              <input
                type="number"
                min="0"
                value={editForm.rooms}
                onChange={(e) =>
                  setEditForm({ ...editForm, rooms: e.target.value })
                }
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
                value={editForm.bathrooms}
                onChange={(e) =>
                  setEditForm({ ...editForm, bathrooms: e.target.value })
                }
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                الحي
              </label>
              <input
                value={editForm.district}
                onChange={(e) =>
                  setEditForm({ ...editForm, district: e.target.value })
                }
                className="input text-sm"
                placeholder="اسم الحي"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                هاتف التواصل
              </label>
              <input
                value={editForm.contactPhone}
                onChange={(e) =>
                  setEditForm({ ...editForm, contactPhone: e.target.value })
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
                value={editForm.address}
                onChange={(e) =>
                  setEditForm({ ...editForm, address: e.target.value })
                }
                className="input text-sm"
                placeholder="شارع، حي..."
              />
            </div>

            {/* Image management — view all, delete individual, add new */}
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-gray-600 mb-1">
                إدارة الصور
                <span className="text-gray-400 mr-1">— احذف أو أضف صوراً</span>
              </p>

              {/* Existing kept images — each with individual × */}
              {editKeptImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 mb-2" dir="ltr">
                  {editKeptImages.map((img, i) => (
                    <div key={img + i} className="relative flex-shrink-0">
                      <img
                        src={resolveImg(img)}
                        alt=""
                        className="w-20 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setEditKeptImages((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] leading-none hover:bg-red-600"
                      >
                        ×
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-primary-600/80 text-white rounded px-1">
                          غلاف
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Warning when all images would be removed */}
              {editKeptImages.length === 0 && editImageFiles.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-2">
                  لا توجد صور — سيتم حفظ العقار بدون صور
                </p>
              )}

              {/* New files preview — blue border distinguishes them from existing */}
              {editImageFiles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-2 pb-1 mb-2" dir="ltr">
                  {editImageFiles.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={i} className="relative flex-shrink-0">
                        <img
                          src={url}
                          alt=""
                          className="w-20 h-16 rounded-lg object-cover border border-blue-300"
                          onLoad={() => URL.revokeObjectURL(url)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditImageFiles((prev) =>
                              prev.filter((_, j) => j !== i),
                            )
                          }
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] leading-none hover:bg-red-600"
                        >
                          ×
                        </button>
                        <span className="absolute top-0.5 left-0.5 text-[9px] bg-green-600/80 text-white rounded px-1">
                          جديد
                        </span>
                        {i === 0 && editKeptImages.length === 0 && (
                          <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-blue-600/80 text-white rounded px-1">
                            غلاف
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload zone — adds to existing, does not replace */}
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      const selected = Array.from(e.target.files);
                      setEditImageFiles((prev) =>
                        [...prev, ...selected].slice(0, 10),
                      );
                    }
                  }}
                />
                <svg
                  className="w-6 h-6 text-gray-300 mb-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-gray-400">انقر لإضافة صور جديدة</span>
              </label>
            </div>
          </div>

          {editError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg p-2">
              {editError}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setEditingProp(null);
                setEditImageFiles([]);
                setEditKeptImages([]);
              }}
              className="btn-secondary text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isEditing}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isEditing ? "جارٍ الحفظ…" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
