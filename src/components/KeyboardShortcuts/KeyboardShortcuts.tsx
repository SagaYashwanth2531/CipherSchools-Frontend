import { useEffect } from 'react';
import styles from './KeyboardShortcuts.module.css';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: 'Ctrl/Cmd + S', description: 'Save project' },
    { keys: 'Ctrl/Cmd + N', description: 'New file' },
    { keys: 'Ctrl/Cmd + Shift + N', description: 'New folder' },
    { keys: 'Ctrl/Cmd + W', description: 'Close current file' },
    { keys: 'Ctrl/Cmd + Shift + W', description: 'Close all files' },
    { keys: 'Ctrl/Cmd + Tab', description: 'Switch between open files' },
    { keys: 'Ctrl/Cmd + Shift + Tab', description: 'Switch between open files (reverse)' },
    { keys: 'Ctrl/Cmd + B', description: 'Toggle sidebar' },
    { keys: 'Ctrl/Cmd + P', description: 'Quick file search' },
    { keys: 'Ctrl/Cmd + /', description: 'Toggle theme' },
    { keys: 'F2', description: 'Rename file/folder' },
    { keys: 'Delete', description: 'Delete file/folder' },
    { keys: 'Escape', description: 'Close modals/menus' },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.shortcutsList}>
            {shortcuts.map((shortcut, index) => (
              <div key={index} className={styles.shortcutItem}>
                <div className={styles.keys}>
                  {shortcut.keys.split(' + ').map((key, i) => (
                    <span key={i} className={styles.key}>
                      {key}
                    </span>
                  ))}
                </div>
                <div className={styles.description}>
                  {shortcut.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
