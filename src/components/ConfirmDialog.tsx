import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'warning',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          ring: 'ring-red-200',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          ring: 'ring-yellow-200',
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          ring: 'ring-blue-200',
        };
      default:
        return {
          icon: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          ring: 'ring-yellow-200',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-beige">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${colors.icon}`} />
            </div>
            <h2 className="text-lg font-semibold text-nature-dark-green">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-cool-gray hover:text-nature-dark-green p-1 hover:bg-soft-beige/50 rounded transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-cool-gray leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 border-t border-border-beige">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border-beige text-cool-gray hover:bg-soft-beige/30 rounded-lg font-medium transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${colors.button} text-white rounded-lg font-medium transition-colors duration-200 ${colors.ring} focus:ring-2 focus:ring-offset-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};