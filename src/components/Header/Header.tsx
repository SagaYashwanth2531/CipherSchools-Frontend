import { useProjectContext } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { KeyboardShortcuts } from '../KeyboardShortcuts/KeyboardShortcuts';
import { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onNewProject: () => void;
  onSaveProject: () => void;
  onBackToDashboard?: () => void;
}

export function Header({ onNewProject, onSaveProject, onBackToDashboard }: HeaderProps) {
  const { 
    currentProject, 
    theme, 
    toggleTheme, 
    isLoading, 
    autosaveEnabled, 
    toggleAutosave, 
    saveStatus, 
    lastSaved,
    manualSave,
    exportProject,
    importProject
  } = useProjectContext();
  const { user, logout } = useAuth();
  
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <header className={`${styles.header} ${styles[theme]}`}>
      <div className={styles.leftSection}>
        {onBackToDashboard && (
          <button 
            className={styles.backButton}
            onClick={onBackToDashboard}
            title="Back to Dashboard"
          >
            ← Back
          </button>
        )}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>CipherStudio</span>
        </div>
        
        {currentProject && (
          <div className={styles.projectInfo}>
            <span className={styles.projectName}>{currentProject.name}</span>
            <div className={styles.projectStatus}>
              <span className={`${styles.statusIndicator} ${styles[saveStatus]}`}>
                {saveStatus === 'saving' && '💾'}
                {saveStatus === 'saved' && '✅'}
                {saveStatus === 'unsaved' && '⚠️'}
              </span>
              <span className={styles.statusText}>
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved'}
                {saveStatus === 'unsaved' && 'Unsaved changes'}
              </span>
              {lastSaved && saveStatus === 'saved' && (
                <span className={styles.lastSaved}>
                  {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.centerSection}>
        <nav className={styles.nav}>
          <button 
            className={styles.navButton}
            onClick={onNewProject}
            disabled={isLoading}
          >
            <span className={styles.navIcon}>📁</span>
            New Project
          </button>
          
          <button 
            className={styles.navButton}
            onClick={onSaveProject}
            disabled={isLoading || !currentProject}
          >
            <span className={styles.navIcon}>💾</span>
            Save
          </button>
          
          <button 
            className={`${styles.navButton} ${autosaveEnabled ? styles.active : ''}`}
            onClick={toggleAutosave}
            title={autosaveEnabled ? 'Disable autosave' : 'Enable autosave'}
          >
            <span className={styles.navIcon}>
              {autosaveEnabled ? '🔄' : '⏸️'}
            </span>
            {autosaveEnabled ? 'Auto-save ON' : 'Auto-save OFF'}
          </button>
          
          {!autosaveEnabled && saveStatus === 'unsaved' && (
            <button 
              className={`${styles.navButton} ${styles.saveButton}`}
              onClick={manualSave}
            >
              <span className={styles.navIcon}>💾</span>
              Save Now
            </button>
          )}
          
          <button 
            className={styles.navButton}
            onClick={exportProject}
            disabled={!currentProject}
            title="Export project"
          >
            <span className={styles.navIcon}>📤</span>
            Export
          </button>
          
          <label className={styles.navButton} title="Import project">
            <span className={styles.navIcon}>📥</span>
            Import
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  importProject(file);
                }
                e.target.value = ''; // Reset input
              }}
              style={{ display: 'none' }}
            />
          </label>
        </nav>
      </div>

      <div className={styles.rightSection}>
        {!user ? (
          <div className={styles.authActions}>
            <button 
              className={styles.navButton}
              onClick={() => { window.location.href = '/login'; }}
              title="Login or Register"
            >
              Login / Register
            </button>
          </div>
        ) : (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.username}</span>
            <div className={styles.userAvatar}>👤</div>
            <button 
              className={styles.navButton}
              onClick={logout}
              title="Logout"
              style={{ marginLeft: 8 }}
            >
              Logout
            </button>
          </div>
        )}
        <button 
          className={styles.shortcutsButton}
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts"
        >
          ?
        </button>
        
        <button 
          className={styles.themeToggle}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      
      <KeyboardShortcuts 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />
    </header>
  );
}
