"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function WorldDialog({
  title,
  children,
  onClose,
  busy = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-3xl border-2 border-[#4b1d3f]/20 bg-[#fcf8f2] p-5 text-stone-800 shadow-xl backdrop:bg-black/60 dark:border-[#382b47] dark:bg-[#1a1321] dark:text-stone-100 sm:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-[#4b1d3f]/15 pb-4 dark:border-[#382b47]">
        <h3 className="font-serif text-xl font-bold">{title}</h3>
        <button
          type="button"
          aria-label="Fechar"
          disabled={busy}
          onClick={onClose}
          className="rounded-lg p-1 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
