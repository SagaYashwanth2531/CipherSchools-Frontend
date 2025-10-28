import { useToast } from '../../contexts/ToastContext';
import { Toast } from './Toast';
import styles from './Toast.module.css';

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
