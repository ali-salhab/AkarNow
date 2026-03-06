import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { propertiesAPI } from "../services/api";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
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
  office: "مكتب",
  land: "أرض",
  shop: "محل تجاري",
  warehouse: "مستودع",
  building: "مبنى",
  other: "أخرى",
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
  const [deleting, setDeleting] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 15 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (listingFilter) params.listingType = listingFilter;
      const res = await propertiesAPI.getAll(params);
      setData(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, listingFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, listingFilter]);

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
          <span className="text-xs text-gray-400 capitalize">
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
        <span
          className={`badge ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-600"} capitalize`}
        >
          {STATUS_LABELS[row.status] || row.status}
        </span>
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
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "إجراءات",
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* Featured toggle */}
          <button
            title={row.isFeatured ? "إلغاء التمييز" : "تمييز"}
            onClick={() => toggleFeatured(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isFeatured
                ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                : "text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"
            }`}
          >
            <Star size={15} fill={row.isFeatured ? "currentColor" : "none"} />
          </button>
          {/* Verified toggle */}
          <button
            title={row.isVerified ? "إلغاء التحقّق" : "تحقّق"}
            onClick={() => toggleVerified(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.isVerified
                ? "text-green-500 bg-green-50 hover:bg-green-100"
                : "text-gray-300 hover:text-green-500 hover:bg-green-50"
            }`}
          >
            {row.isVerified ? <CheckCircle size={15} /> : <XCircle size={15} />}
          </button>
          {/* Active toggle */}
          <button
            title={row.status === "available" ? "تعطيل" : "تفعيل"}
            onClick={() => toggleStatus(row)}
            className={`p-1.5 rounded-lg transition-colors ${
              row.status === "available"
                ? "text-primary-600 bg-primary-50 hover:bg-primary-100"
                : "text-gray-300 hover:text-primary-500 hover:bg-primary-50"
            }`}
          >
            {row.status === "available" ? (
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

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="حذف العقار"
        message={`هل أنت متأكد من حذف "‏${deleting?.title}‏"? لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف العقار"
        isLoading={isDeleting}
      />
    </div>
  );
}
