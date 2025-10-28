import { useMemo } from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { FileUtils } from '../../utils/fileUtils';
import styles from './LivePreview.module.css';

interface LivePreviewProps {
  className?: string;
}

export function LivePreview({ className }: LivePreviewProps) {
  const { currentProject, theme } = useProjectContext();

  const sandpackFiles = useMemo(() => {
    if (!currentProject) return {};
    const files = FileUtils.getSandpackFiles(currentProject.files);

    // Ensure Sandpack has a standard CRA-like entrypoint if only Vite-like files exist
    const hasIndexJs = Object.keys(files).includes('/src/index.js');
    const hasMainJsx = Object.keys(files).includes('/src/main.jsx');
    const hasAppJs = Object.keys(files).includes('/src/App.js');
    const hasAppJsx = Object.keys(files).includes('/src/App.jsx');

    if (!hasIndexJs && hasMainJsx) {
      files['/src/index.js'] = files['/src/main.jsx'];
    }
    if (!hasAppJs && hasAppJsx) {
      files['/src/App.js'] = files['/src/App.jsx'];
    }
    // Guarantee an HTML root
    if (!Object.keys(files).includes('/public/index.html')) {
      files['/public/index.html'] = '<!doctype html>\n<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body><div id="root"></div></body></html>';
    }
    return files;
  }, [currentProject]);

  const sandpackDependencies = useMemo(() => {
    return {
      'react': '^18.2.0',
      'react-dom': '^18.2.0'
    };
  }, []);

  if (!currentProject) {
    return (
      <div className={`${styles.livePreview} ${styles[theme]} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🖥️</div>
          <h3 className={styles.emptyTitle}>No Project Loaded</h3>
          <p className={styles.emptyText}>
            Create a new project or load an existing one to see the preview
          </p>
        </div>
      </div>
    );
  }

  if (Object.keys(sandpackFiles).length === 0) {
    return (
      <div className={`${styles.livePreview} ${styles[theme]} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3 className={styles.emptyTitle}>No Files to Preview</h3>
          <p className={styles.emptyText}>
            Create some files in the file explorer to see the live preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.livePreview} ${styles[theme]} ${className || ''}`}>
      <div className={styles.previewContent}>
        <Sandpack
          template="react"
          files={sandpackFiles}
          options={{
            layout: 'preview',
            showNavigator: false,
            showRefreshButton: false,
            showTabs: false,
            showEditor: false,
            showLineNumbers: false,
            showOpenInCodeSandbox: false,
            editorHeight: '100%',
            autorun: true,
            recompileMode: 'delayed',
            recompileDelay: 300
          }}
          customSetup={{
            dependencies: sandpackDependencies
          }}
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
}
