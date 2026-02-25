import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  danger = true,
  isLoading = false,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            danger ? "bg-red-50" : "bg-yellow-50"
          }`}
        >
          <AlertTriangle
            size={20}
            className={danger ? "text-red-500" : "text-yellow-500"}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="btn-secondary text-sm"
          disabled={isLoading}
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`text-sm ${danger ? "btn-danger" : "btn-primary"}`}
        >
          {isLoading ? "جارٍ التنفيذ..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
