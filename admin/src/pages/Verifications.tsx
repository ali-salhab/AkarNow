import { useCallback, useEffect, useState } from "react";
import { CheckCircle, XCircle, Building2, MapPin, Phone } from "lucide-react";
import { verificationsAPI } from "../services/api";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import type { User, Column } from "../types";

const TABS = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "verified", label: "موثّقون" },
  { value: "rejected", label: "مرفوضون" },
];

export default function Verifications() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Approve confirm
  const [approving, setApproving] = useState<User | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // View details
  const [viewing, setViewing] = useState<User | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await verificationsAPI.getAll({
        status: tab,
        page,
        limit: 15,
      });
      setData(res.data.data);
      setTotalPages(res.data.pagination.pages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const handleApprove = async () => {
    if (!approving) return;
    setIsApproving(true);
    try {
      await verificationsAPI.approve(approving._id);
      setData((prev) => prev.filter((u) => u._id !== approving._id));
      setTotal((t) => t - 1);
    } catch (err) {
      console.error(err);
    }
    setIsApproving(false);
    setApproving(null);
  };

  const handleReject = async () => {
    if (!rejectingUser) return;
    setIsRejecting(true);
    try {
      await verificationsAPI.reject(
        rejectingUser._id,
        rejectReason || undefined,
      );
      setData((prev) => prev.filter((u) => u._id !== rejectingUser._id));
      setTotal((t) => t - 1);
    } catch (err) {
      console.error(err);
    }
    setIsRejecting(false);
    setRejectingUser(null);
    setRejectReason("");
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "المستخدم",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
            {(row.name || row.phone).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">
              {row.name || "—"}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Phone size={11} />
              {row.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "office",
      header: "المكتب",
      render: (row) =>
        row.hasOffice ? (
          <div className="text-sm">
            <p className="font-medium text-gray-800 flex items-center gap-1">
              <Building2 size={13} className="text-primary-600" />
              {row.officeName || "—"}
            </p>
            {row.officeLocation && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin size={11} />
                {row.officeLocation}
              </p>
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400">لا يوجد مكتب</span>
        ),
    },
    {
      key: "residenceCity",
      header: "المدينة",
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.residenceCity || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "تاريخ الطلب",
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewing(row)}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            عرض
          </button>
          {row.verificationStatus === "pending" && (
            <>
              <button
                onClick={() => setApproving(row)}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
              >
                <CheckCircle size={13} />
                قبول
              </button>
              <button
                onClick={() => {
                  setRejectingUser(row);
                  setRejectReason("");
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
              >
                <XCircle size={13} />
                رفض
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.value
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="mr-2 text-sm text-gray-400 flex items-center px-1">
          {total} طلب
        </span>
      </div>

      <DataTable
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="لا توجد طلبات توثيق في هذه الفئة"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={total}
      />

      {/* Approve confirm */}
      <ConfirmDialog
        isOpen={!!approving}
        onClose={() => setApproving(null)}
        onConfirm={handleApprove}
        title="قبول طلب التوثيق"
        message={`هل تريد قبول طلب التوثيق للمستخدم "${approving?.name || approving?.phone}"؟ سيتم ترقيته إلى وكيل عقاري.`}
        confirmLabel="قبول"
        isLoading={isApproving}
      />

      {/* Reject modal */}
      <Modal
        isOpen={!!rejectingUser}
        onClose={() => {
          setRejectingUser(null);
          setRejectReason("");
        }}
        title="رفض طلب التوثيق"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            رفض طلب التوثيق للمستخدم{" "}
            <span className="font-semibold">
              {rejectingUser?.name || rejectingUser?.phone}
            </span>
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
                setRejectingUser(null);
                setRejectReason("");
              }}
              className="btn-secondary text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {isRejecting ? "جارٍ الرفض…" : "رفض الطلب"}
            </button>
          </div>
        </div>
      </Modal>

      {/* View details modal */}
      <Modal
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
        title="تفاصيل طلب التوثيق"
      >
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">الاسم</p>
                <p className="font-medium">{viewing.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">الهاتف</p>
                <p className="font-medium">{viewing.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">
                  البريد الإلكتروني
                </p>
                <p className="font-medium">{viewing.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">مدينة الإقامة</p>
                <p className="font-medium">{viewing.residenceCity || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">يمتلك مكتب؟</p>
                <p className="font-medium">
                  {viewing.hasOffice ? "نعم" : "لا"}
                </p>
              </div>
              {viewing.hasOffice && (
                <>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">اسم المكتب</p>
                    <p className="font-medium">{viewing.officeName || "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">موقع المكتب</p>
                    <p className="font-medium">
                      {viewing.officeLocation || "—"}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">الدور</p>
                <p className="font-medium">{viewing.role}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">حالة التوثيق</p>
                <p className="font-medium">{viewing.verificationStatus}</p>
              </div>
            </div>
            {viewing.verificationRejectionReason && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-500 font-medium mb-0.5">
                  سبب الرفض السابق
                </p>
                <p className="text-sm text-red-700">
                  {viewing.verificationRejectionReason}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setViewing(null)}
                className="btn-secondary text-sm"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
