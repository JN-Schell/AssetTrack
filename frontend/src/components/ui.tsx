import type { ReactNode } from 'react';
import { labelize } from '../format';

const TONES: Record<string, string> = {
  ASSIGNED: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-100',
  IN_STOCK: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100',
  UNDER_MAINTENANCE: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  PENDING_DISPOSAL: 'bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-100',
  DECOMMISSIONED: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  ACTIVE: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-100',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  RETURNED: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  REJECTED: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100',
  SCHEDULED: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100',
  IN_PROGRESS: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  COMPLETED: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-100',
  CANCELLED: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  OPTIMAL: 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-100',
  OVER_UTILIZED: 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-100',
  UNDER_UTILIZED: 'bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100',
  NO_LICENSES: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
};

export function StatusBadge({ value }: { value: string }) {
  const tone = TONES[value] ?? 'bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {labelize(value)}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-stone-600 dark:text-stone-400">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900 ${className}`}>
      {children}
    </section>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100" role="alert">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn-ghost mt-2" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">{children}</p>;
}

export function LoadingNote({ label = 'Loading…' }: { label?: string }) {
  return <p className="px-4 py-8 text-center text-sm text-stone-500 dark:text-stone-400">{label}</p>;
}

export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-stone-950/50" aria-label="Close dialog" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-700 dark:bg-stone-900 sm:rounded-2xl ${wide ? 'sm:max-w-4xl' : 'sm:max-w-lg'}`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="btn-ghost" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
