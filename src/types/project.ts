export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  parentId?: string;
  path: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  files: FileNode[];
  createdAt: Date;
  updatedAt: Date;
  template?: string;
}

export interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  activeFile: FileNode | null;
  openFiles: FileNode[];
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  autosaveEnabled: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  lastSaved: Date | null;
  
  // Project actions
  createProject: (name: string, description?: string) => Promise<Project> | void;
  loadProject: (projectId: string) => Promise<void> | void;
  saveProject: () => Promise<void> | void;
  deleteProject: (projectId: string) => Promise<void> | void;
  refreshProjects?: () => Promise<void>;
  
  // File actions
  createFile: (name: string, content?: string, parentId?: string) => void;
  createFolder: (name: string, parentId?: string) => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  setActiveFile: (file: FileNode | null) => void;
  
  // Tab management
  openFile: (file: FileNode) => void;
  closeFile: (fileId: string) => void;
  closeAllFiles: () => void;
  closeOtherFiles: (fileId: string) => void;
  
  // Theme actions
  toggleTheme: () => void;
  
  // Autosave actions
  toggleAutosave: () => void;
  manualSave: () => void;
  
  // Export/Import actions
  exportProject: () => void;
  importProject: (file: File) => void;
  
  // Utility actions
  findFileById: (fileId: string) => FileNode | null;
  findFileByPath: (path: string) => FileNode | null;
}

export interface SandpackFile {
  [key: string]: string;
}

export interface DefaultTemplate {
  name: string;
  files: SandpackFile;
  dependencies?: { [key: string]: string };
}

export const DEFAULT_TEMPLATE: DefaultTemplate = {
  name: 'react',
  files: {
    '/src/App.js': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to CipherStudio</h1>
        <p>Start coding your React application!</p>
        <div className="demo-content">
          <h2>Features:</h2>
          <ul>
            <li>✅ Real-time code editing</li>
            <li>✅ Live preview</li>
            <li>✅ File management</li>
            <li>✅ Project saving</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;`,
    '/src/App.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.App {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.App-header {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.App-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.App-header p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.demo-content {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
}

.demo-content h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.demo-content ul {
  list-style: none;
  text-align: left;
}

.demo-content li {
  padding: 0.5rem 0;
  font-size: 1.1rem;
}

.demo-content li::before {
  content: '';
  margin-right: 0.5rem;
}`,
    '/src/index.js': `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
    '/src/index.css': `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}`,
    '/public/index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="CipherStudio - React IDE" />
    <title>CipherStudio</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`,
    '/package.json': `{
  "name": "cipherstudio-project",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}`
  },
  dependencies: {
    'react': '^18.2.0',
    'react-dom': '^18.2.0'
  }
};
