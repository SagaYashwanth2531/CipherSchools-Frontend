# CipherStudio - React IDE

A powerful, modern React-based IDE built with Vite, TypeScript, and Sandpack. CipherStudio provides a complete development environment with real-time code editing, live preview, and project management capabilities.

## 🚀 Features

### Core Functionality
- **Real-time Code Editing**: Powered by Sandpack with syntax highlighting and auto-completion
- **Live Preview**: Instant preview of React applications with hot reload
- **File Management**: Create, edit, delete, and organize files and folders
- **Project Management**: Save and load projects locally with localStorage
- **Dark/Light Theme**: Toggle between dark and light themes

### User Interface
- **VS Code-inspired Design**: Clean, professional interface similar to VS Code
- **Three-Panel Layout**: File Explorer | Code Editor | Live Preview
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI Components**: Built with CSS Modules and modern design principles

### Technical Features
- **React 18**: Latest React features and optimizations
- **TypeScript**: Full type safety and better development experience
- **Vite**: Fast development server and build tool
- **Sandpack**: Code execution and editing capabilities
- **React Router**: Client-side routing for navigation
- **CSS Modules**: Scoped styling with theme support

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS Modules, Custom CSS Variables
- **Code Editor**: Sandpack (@codesandbox/sandpack-react)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Storage**: localStorage for project persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── FileExplorer/     # File tree navigation
│   ├── CodeEditor/       # Sandpack-based editor
│   ├── LivePreview/      # Live preview panel
│   ├── Header/          # Top navigation bar
│   └── Sidebar/         # Project sidebar
├── contexts/
│   └── ProjectContext.tsx # Global state management
├── hooks/
│   ├── useLocalStorage.ts # localStorage utilities
│   └── useProjects.ts    # Project management hooks
├── types/
│   └── project.ts        # TypeScript interfaces
├── utils/
│   └── fileUtils.ts      # File operation utilities
└── App.tsx              # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CipherSChoolsFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📖 Usage

### Creating a New Project
1. Click "New Project" on the dashboard
2. Enter project name and optional description
3. Click "Create Project" to start coding

### Working with Files
1. **Create Files**: Right-click in the file explorer and select "New File"
2. **Create Folders**: Right-click in the file explorer and select "New Folder"
3. **Edit Files**: Click on any file to open it in the code editor
4. **Rename/Delete**: Right-click on files/folders for context menu options

### Code Editing
- **Syntax Highlighting**: Automatic syntax highlighting for JS, JSX, CSS, HTML, JSON
- **Auto-save**: Changes are automatically saved to localStorage
- **Live Preview**: See changes instantly in the preview panel
- **Error Handling**: Built-in error detection and display

### Project Management
- **Save Projects**: Projects are automatically saved to localStorage
- **Load Projects**: Click on any project in the sidebar to load it
- **Project Dashboard**: View all projects and create new ones

## 🎨 Themes

CipherStudio supports both dark and light themes:
- **Dark Theme**: Default theme with dark backgrounds and light text
- **Light Theme**: Clean light theme with dark text and light backgrounds
- **Theme Toggle**: Click the theme toggle button in the header

## 🔧 Configuration

### Default Project Template
New projects are created with a default React template including:
- `src/App.js` - Main React component
- `src/App.css` - Component styles
- `src/index.js` - Application entry point
- `src/index.css` - Global styles
- `public/index.html` - HTML template
- `package.json` - Project dependencies

### Supported File Types
- JavaScript (.js)
- JSX (.jsx)
- TypeScript (.ts)
- TSX (.tsx)
- CSS (.css)
- HTML (.html)
- JSON (.json)
- Markdown (.md)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
The built files in the `dist` folder can be deployed to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Sandpack](https://sandpack.codesandbox.io/) for code execution capabilities
- [React](https://reactjs.org/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool
- [VS Code](https://code.visualstudio.com/) for design inspiration

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.

---

**CipherStudio** - Built with ❤️ for developers who want a powerful, modern React IDE.