import { useMemo, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { FileUtils } from '../../utils/fileUtils';
import styles from './CodeEditor.module.css';

interface CodeEditorProps {
  className?: string;
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: { [key: string]: string } = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql'
  };
  
  return languageMap[extension || ''] || 'javascript';
}

export function CodeEditor({ className }: CodeEditorProps) {
  const { currentProject, activeFile, openFiles, theme, closeFile, setActiveFile, updateFileContent } = useProjectContext();
  const [fileContent, setFileContent] = useState('');
  const [showConsole, setShowConsole] = useState(false);
  
  useEffect(() => {
    if (activeFile?.content !== undefined) {
      setFileContent(activeFile.content);
    }
  }, [activeFile]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setFileContent(value);
      updateFileContent(activeFile.id, value);
    }
  };

  const currentLanguage = useMemo(() => {
    if (!activeFile) return 'javascript';
    return getLanguageFromFileName(activeFile.name);
  }, [activeFile]);

  if (!currentProject) {
    return (
      <div className={`${styles.codeEditor} ${styles[theme]} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💻</div>
          <h3 className={styles.emptyTitle}>No Project Loaded</h3>
          <p className={styles.emptyText}>
            Create a new project or load an existing one to start coding
          </p>
        </div>
      </div>
    );
  }

  if (openFiles.length === 0) {
    return (
      <div className={`${styles.codeEditor} ${styles[theme]} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📄</div>
          <h3 className={styles.emptyTitle}>No Files Open</h3>
          <p className={styles.emptyText}>
            Click on a file in the explorer to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.codeEditor} ${styles[theme]} ${className || ''}`}>
      <div className={styles.editorHeader}>
        <div className={styles.tabs}>
          {openFiles.map((file) => {
            const isActive = activeFile?.id === file.id;
            
            return (
              <div
                key={file.id}
                className={`${styles.tab} ${isActive ? styles.active : ''}`}
                onClick={() => setActiveFile(file)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  // TODO: Add context menu for tabs
                }}
              >
                <span className={styles.tabIcon}>
                  {FileUtils.getFileIcon(file.name)}
                </span>
                <span className={styles.tabName}>{file.name}</span>
                <button
                  className={styles.closeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  title="Close file"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.editorContent}>
        {activeFile ? (
          <Editor
            height="100%"
            language={currentLanguage}
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            value={fileContent}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnCommitCharacter: true,
              acceptSuggestionOnEnter: 'on',
              snippetSuggestions: 'top',
              parameterHints: {
                enabled: true,
                cycle: true
              },
              quickSuggestions: true,
              suggestSelection: 'first',
              autoIndent: 'full',
              guides: {
                bracketPairs: true,
                indentation: true,
                highlightActiveIndentation: true
              },
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                useShadows: false,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              }
            }}
          />
        ) : (
          <div className={styles.emptyEditor}>
            <div className={styles.emptyIcon}>📝</div>
            <p className={styles.emptyText}>Select a file to edit</p>
          </div>
        )}
      </div>

      <div className={`${styles.console} ${showConsole ? styles.visible : ''}`}>
        <div className={styles.consoleHeader}>
          <button 
            className={styles.consoleToggle}
            onClick={() => setShowConsole(!showConsole)}
          >
            Console {showConsole ? '▼' : '▲'}
          </button>
          <button 
            className={styles.consoleClear}
            onClick={() => {
              // TODO: Implement console clear
            }}
          >
            Clear
          </button>
        </div>
        <div className={styles.consoleContent}>
          <p className={styles.consoleMessage}>
            Console output will appear here...
          </p>
        </div>
      </div>
    </div>
  );
}
