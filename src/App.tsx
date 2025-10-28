import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { ProjectProvider, useProjectContext } from './contexts/ProjectContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Header } from './components/Header/Header';
import { FileExplorer } from './components/FileExplorer/FileExplorer';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { LivePreview } from './components/LivePreview/LivePreview';
import { ToastContainer } from './components/Toast/ToastContainer';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import styles from './App.module.css';
import { AuthPage } from './components/AuthPage';

function Dashboard() {
  const { projects, createProject, deleteProject, loadProject, refreshProjects, theme } = useProjectContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
      setNewProjectName('');
      setNewProjectDescription('');
      setIsCreating(false);
    } catch (err: any) {
      const base = (await import('./utils/api')).api.defaults.baseURL;
      const message = err?.response?.data?.message || err?.message || `Failed to create project (API: ${base})`;
      setCreateError(message);
      if (err?.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // On first load after login, make sure we fetch projects list
  useEffect(() => {
    if (projects.length === 0) {
      refreshProjects && refreshProjects();
    }
  }, [projects.length, refreshProjects]);

  return (
    <div className={`${styles.dashboard} ${styles[theme]}`}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Welcome to CipherStudio</h1>
        <p className={styles.dashboardSubtitle}>
          A powerful React IDE built with modern web technologies
        </p>
        <div style={{ marginTop: '8px', position: 'absolute', right: 24, top: 24 }}>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>Signed in as {user.username}</span>
              <a href="/login" onClick={(e) => { e.preventDefault(); logout(); }} style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Logout</a>
            </>
          ) : (
            <a href="/login" onClick={(e) => { e.preventDefault(); window.location.href = '/login'; }} style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
              Login / Register
            </a>
          )}
        </div>
      </div>

      <div className={styles.dashboardContent}>
        <div className={styles.projectsSection}>
            <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Projects</h2>
            <div className={styles.headerActions}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                {searchQuery && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => setSearchQuery('')}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                className={styles.createButton}
                onClick={() => setIsCreating(true)}
              >
                <span className={styles.createIcon}>+</span>
                New Project
              </button>
            </div>
          </div>

          {isCreating && (
            <div className={styles.createProjectForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter project name..."
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Enter project description..."
                  rows={3}
                />
              </div>
              {createError && (
                <div style={{ color: 'tomato', marginTop: 8 }}>
                  {createError}
                </div>
              )}
              <div className={styles.formActions}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                    setNewProjectDescription('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className={styles.submitButton}
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim() || creating}
                >
                  {creating ? 'Creating…' : 'Create Project'}
                </button>
              </div>
            </div>
          )}

          <div className={styles.projectsGrid}>
            {filteredProjects.length === 0 && searchQuery ? (
              <div className={styles.emptyProjects}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>No projects found</h3>
                <p className={styles.emptyText}>
                  No projects match "{searchQuery}"
                </p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className={styles.emptyProjects}>
                <div className={styles.emptyIcon}>📁</div>
                <h3 className={styles.emptyTitle}>No Projects Yet</h3>
                <p className={styles.emptyText}>
                  Create your first project to start coding with CipherStudio
                </p>
              </div>
            ) : (
              filteredProjects.map((project, index) => (
                <div 
                  key={project.id} 
                  className={styles.projectCard}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={async () => {
                    await loadProject(project.id);
                    navigate(`/ide?projectId=${encodeURIComponent(project.id)}`);
                  }}
                >
                  <div className={styles.projectIcon}>📁</div>
                  <div className={styles.projectInfo}>
                    <h3 className={styles.projectName}>{project.name}</h3>
                    {project.description && (
                      <p className={styles.projectDescription}>{project.description}</p>
                    )}
                    <div className={styles.projectMeta}>
                      <span className={styles.projectDate}>
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <span className={styles.projectFiles}>
                        {project.files.length} files
                      </span>
                    </div>
                  </div>
                  <div className={styles.projectActions}>
                    <button
                      type="button"
                      className={styles.openButton}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await loadProject(project.id);
                        navigate(`/ide?projectId=${encodeURIComponent(project.id)}`);
                      }}
                    >
                      Start
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!confirm(`Are you sure you want to delete "${project.name}"?`)) return;
                        try {
                          await deleteProject(project.id);
                          if (refreshProjects) {
                            await refreshProjects();
                          }
                        } catch (err: any) {
                          const msg = err?.response?.data?.message || err?.message || 'Failed to delete project';
                          alert(msg);
                          // As a fallback, request a fresh list to resync UI
                          if (refreshProjects) {
                            await refreshProjects();
                          }
                        }
                      }}
                      title="Delete project"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard} style={{ animationDelay: '0.1s' }}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>Real-time Editing</h3>
              <p className={styles.featureDescription}>
                Edit your React code with syntax highlighting and auto-completion
              </p>
            </div>
            <div className={styles.featureCard} style={{ animationDelay: '0.2s' }}>
              <div className={styles.featureIcon}>🖥️</div>
              <h3 className={styles.featureTitle}>Live Preview</h3>
              <p className={styles.featureDescription}>
                See your changes instantly with live preview and hot reload
              </p>
            </div>
            <div className={styles.featureCard} style={{ animationDelay: '0.3s' }}>
              <div className={styles.featureIcon}>📁</div>
              <h3 className={styles.featureTitle}>File Management</h3>
              <p className={styles.featureDescription}>
                Create, edit, and organize files and folders with ease
              </p>
            </div>
            <div className={styles.featureCard} style={{ animationDelay: '0.4s' }}>
              <div className={styles.featureIcon}>💾</div>
              <h3 className={styles.featureTitle}>Project Saving</h3>
              <p className={styles.featureDescription}>
                Save your projects locally and continue working anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IDE() {
  const [searchParams] = useSearchParams();
  const { currentProject, theme, saveProject, loadProject } = useProjectContext();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // If opened directly or after hard reload, load project by id from URL
  useEffect(() => {
    const pid = searchParams.get('projectId');
    if (!currentProject && pid) {
      loadProject(pid);
    }
  }, [currentProject, loadProject, searchParams]);

  const handleNewProject = () => {
    window.location.href = '/';
  };

  const handleSaveProject = () => {
    saveProject();
  };

  const handleBackToDashboard = () => {
    window.location.href = '/';
  };

  if (!currentProject) {
    return (
      <div className={`${styles.ide} ${styles[theme]}`}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>No Project Loaded</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            Please create or select a project from the dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.ide} ${styles[theme]}`}>
      <Header onNewProject={handleNewProject} onSaveProject={handleSaveProject} onBackToDashboard={handleBackToDashboard} />
      
      <div className={styles.ideContent}>
        <div className={styles.mainContent}>
          <div className={styles.leftPanel}>
            <FileExplorer />
          </div>
          
          <div className={styles.centerPanel}>
            <CodeEditor />
          </div>
          
          <div className={styles.rightPanel}>
            <LivePreview />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className={styles.app}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ide" element={<IDE />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastContainer />
            </div>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;