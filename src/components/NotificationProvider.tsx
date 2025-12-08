'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type NotifyOptions = {
  title?: string;
  message: string;
  durationMs?: number;
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type ToastConfig = {
  id: string;
  title?: string;
  message: string;
};

type ConfirmState = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

type NotificationContextValue = {
  notify: (options: NotifyOptions) => Promise<void>;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmResolver, setConfirmResolver] = useState<
    ((value: boolean) => void) | null
  >(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, durationMs = 3500 }: NotifyOptions): Promise<void> => {
      const id =
        typeof window !== 'undefined' && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : Math.random().toString(36).slice(2);

      setToasts((prev) => [...prev, { id, title, message }]);

      if (typeof window !== 'undefined') {
        window.setTimeout(() => removeToast(id), durationMs);
      }

      return Promise.resolve();
    },
    [removeToast]
  );

  const confirm = useCallback(
    ({
      title = 'Are you sure?',
      message,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
    }: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setConfirmState({ title, message, confirmText, cancelText });
        setConfirmResolver(() => resolve);
      }),
    []
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && confirmState) {
        confirmResolver?.(false);
        setConfirmState(null);
        setConfirmResolver(null);
      }
    };

    if (confirmState) {
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [confirmState, confirmResolver]);

  const handleConfirm = (value: boolean) => {
    confirmResolver?.(value);
    setConfirmState(null);
    setConfirmResolver(null);
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="w-80 rounded-2xl border border-sand-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm"
          >
            {toast.title && (
              <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            )}
            <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmState && (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 px-4">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={() => handleConfirm(false)}
          />
          <div className="relative z-[1051] w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {confirmState.title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {confirmState.title}
              </h2>
            )}
            <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">
              {confirmState.message}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {confirmState.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {confirmState.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
