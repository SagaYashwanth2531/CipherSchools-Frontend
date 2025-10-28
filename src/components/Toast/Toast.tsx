import { useEffect } from 'react';
import type { Toast as ToastType } from '../../contexts/ToastContext';
import { useToast } from '../../contexts/ToastContext';
import styles from './Toast.module.css';

interface ToastProps {
  toast: ToastType;
}

function Toast({ toast }: ToastProps) {
  const { hideToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      hideToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, hideToast]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.content}>
        <div className={styles.title}>{toast.title}</div>
        {toast.message && (
          <div className={styles.message}>{toast.message}</div>
        )}
      </div>
      <button
        className={styles.closeButton}
        onClick={() => hideToast(toast.id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

export { Toast };
