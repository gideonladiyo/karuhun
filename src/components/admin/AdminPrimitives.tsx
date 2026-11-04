import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/* ============================================================================
 * FORM PRIMITIVES (Field, Input, Select, Textarea)
 * ========================================================================== */

export interface FieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  action,
  children,
  className,
}) => (
  <div className={cn('space-y-1.5', className)}>
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs font-medium text-zinc-300 block">{label}</label>
      {action}
    </div>
    {children}
    {error ? (
      <p className="text-xs text-red-400">{error}</p>
    ) : hint ? (
      <p className="text-xs text-zinc-500">{hint}</p>
    ) : null}
  </div>
);

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-3.5 py-2.5 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-zinc-400 transition-colors cursor-pointer disabled:opacity-50',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl p-3.5 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors',
      className
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/* ============================================================================
 * BADGES (Badge, StatusBadge, RoleBadge)
 * ========================================================================== */

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger';

const badgeToneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-[#18181b] text-zinc-300 border-[#27272a]',
  success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70',
  warning: 'bg-amber-950/70 text-amber-300 border-amber-800/70',
  danger: 'bg-red-950/70 text-red-300 border-red-800/70',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  className,
  children,
  ...props
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium',
      badgeToneClasses[tone],
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export const StatusBadge: React.FC<{ isPublished?: boolean; isDeleted?: boolean }> = ({
  isPublished = true,
  isDeleted = false,
}) => {
  if (isDeleted) {
    return <Badge tone="danger">Di Trash</Badge>;
  }
  return isPublished ? (
    <Badge tone="success">Published</Badge>
  ) : (
    <Badge tone="warning">Draft</Badge>
  );
};

export const RoleBadge: React.FC<{ role: 'admin' | 'superadmin' }> = ({ role }) =>
  role === 'superadmin' ? (
    <Badge tone="warning">Superadmin</Badge>
  ) : (
    <Badge tone="neutral">Admin</Badge>
  );

/* ============================================================================
 * TOAST NOTIFICATION
 * ========================================================================== */

export interface ToastMessage {
  id: number;
  tone: 'success' | 'error';
  text: string;
}

export const ToastBanner: React.FC<{
  toast: ToastMessage | null;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.tone === 'error';

  return (
    <div
      role="status"
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs sm:text-sm',
        isError
          ? 'bg-red-950/80 border-red-800 text-red-200'
          : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isError ? (
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="truncate">{toast.text}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-zinc-400 hover:text-white p-1 rounded-lg cursor-pointer shrink-0"
        aria-label="Tutup notifikasi"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/* ============================================================================
 * MODAL & CONFIRM DIALOG
 * ========================================================================== */

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  maxHeightClass?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  footer,
  maxWidthClass = 'max-w-lg',
  maxHeightClass = 'max-h-[85vh]',
  children,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          'minimal-card w-full flex flex-col overflow-hidden shadow-2xl',
          maxHeightClass,
          maxWidthClass
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#27272a] px-6 py-4 shrink-0 bg-[#121215]">
          <div className="space-y-1 min-w-0">
            <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate">
              {title}
            </h3>
            {subtitle && <div className="text-xs text-zinc-400">{subtitle}</div>}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto overscroll-contain flex-1 min-h-0">
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="border-t border-[#27272a] px-6 py-3.5 shrink-0 bg-[#121215]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'default';
  requireText?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  tone = 'default',
  requireText,
  loading = false,
}) => {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  const canConfirm = !requireText || typed.trim() === requireText;

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidthClass="max-w-md">
      <div className="space-y-4">
        <div className="text-sm text-zinc-300 leading-relaxed">{description}</div>

        {requireText && (
          <Field
            label={
              <span>
                Ketik <code className="text-white font-mono px-1.5 py-0.5 rounded bg-[#18181b]">{requireText}</code> untuk melanjutkan
              </span>
            }
          >
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireText}
              autoFocus
            />
          </Field>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#27272a]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'destructive' : 'default'}
            disabled={!canConfirm || loading}
            onClick={onConfirm}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
