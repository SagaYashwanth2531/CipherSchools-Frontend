import { useProjectContext } from '../../contexts/ProjectContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { projects, currentProject, loadProject, theme } = useProjectContext();

  return (
    <aside className={`${styles.sidebar} ${styles[theme]} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>Projects</h3>
        <button 
          className={styles.toggleButton}
          onClick={onToggle}
          title={isOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      <div className={styles.sidebarContent}>
        {projects.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <p className={styles.emptyText}>No projects yet</p>
            <p className={styles.emptySubtext}>Create your first project to get started</p>
          </div>
        ) : (
          <div className={styles.projectList}>
            {projects.map((project) => (
              <div
                key={project.id}
                className={`${styles.projectItem} ${
                  currentProject?.id === project.id ? styles.active : ''
                }`}
                onClick={() => loadProject(project.id)}
              >
                <div className={styles.projectIcon}>📁</div>
                <div className={styles.projectDetails}>
                  <div className={styles.projectName}>{project.name}</div>
                  <div className={styles.projectMeta}>
                    <span className={styles.projectDate}>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                    <span className={styles.projectFiles}>
                      {project.files.length} files
                    </span>
                  </div>
                </div>
                {currentProject?.id === project.id && (
                  <div className={styles.activeIndicator}>●</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Projects:</span>
            <span className={styles.statValue}>{projects.length}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active:</span>
            <span className={styles.statValue}>
              {currentProject ? currentProject.name : 'None'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
