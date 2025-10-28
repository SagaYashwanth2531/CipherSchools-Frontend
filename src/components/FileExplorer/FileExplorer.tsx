import React, { useState } from 'react';
import { useProjectContext } from '../../contexts/ProjectContext';
import type { FileNode } from '../../types/project';
import { FileUtils } from '../../utils/fileUtils';
import styles from './FileExplorer.module.css';

interface FileExplorerProps {
  className?: string;
}

interface FileItemProps {
  file: FileNode;
  level: number;
}

function FileItem({ file, level }: FileItemProps) {
  const { currentProject, activeFile, createFile, createFolder, deleteFile, renameFile, theme, openFile } = useProjectContext();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const isActive = activeFile?.id === file.id;
  const isFolder = file.type === 'folder';
  const hasChildren = isFolder && file.children && file.children.length > 0;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      openFile(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleRename = () => {
    setIsRenaming(true);
    setNewName(file.name);
    setShowContextMenu(false);
  };

  const handleRenameSubmit = () => {
    if (newName.trim() && newName !== file.name) {
      try {
        // Validate file name
        const validation = FileUtils.validateFileName(newName.trim());
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }
        
        // Check for duplicate names in the same directory
        const parent = file.parentId ? 
          FileUtils.findFileById(currentProject?.files || [], file.parentId) : 
          null;
        const siblings = parent?.children || currentProject?.files || [];
        const duplicateExists = siblings.some(sibling => 
          sibling.id !== file.id && sibling.name === newName.trim()
        );
        
        if (duplicateExists) {
          alert('A file or folder with this name already exists');
          return;
        }
        
        renameFile(file.id, newName.trim());
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to rename file');
      }
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewName(file.name);
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      handleRenameCancel();
    }
  };

  const handleDoubleClick = () => {
    if (file.type === 'file') {
      handleRename();
    }
  };

  const handleNewFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      try {
        createFile(fileName, '', file.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to create file');
      }
    }
    setShowContextMenu(false);
  };

  const handleNewFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      try {
        createFolder(folderName, file.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to create folder');
      }
    }
    setShowContextMenu(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      deleteFile(file.id);
    }
    setShowContextMenu(false);
  };


  return (
    <>
      <div
        className={`${styles.fileItem} ${isActive ? styles.active : ''} ${styles[theme]}`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className={styles.fileIcon}>
          {isFolder ? (isExpanded ? '📂' : '📁') : FileUtils.getFileIcon(file.name)}
        </div>
        
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className={styles.renameInput}
            autoFocus
          />
        ) : (
          <span className={styles.fileName}>{file.name}</span>
        )}
        
        {isFolder && hasChildren && (
          <button
            className={styles.expandButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
      </div>

      {isFolder && isExpanded && file.children && (
        <div className={styles.children}>
          {file.children.map((child) => (
            <FileItem key={child.id} file={child} level={level + 1} />
          ))}
        </div>
      )}

      {showContextMenu && (
        <div
          className={styles.contextMenu}
          style={{
            position: 'fixed',
            left: contextMenuPosition.x,
            top: contextMenuPosition.y,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.contextMenuContent}>
            {isFolder ? (
              <>
                <button onClick={handleNewFile} className={styles.contextMenuItem}>
                  📄 New File
                </button>
                <button onClick={handleNewFolder} className={styles.contextMenuItem}>
                  📁 New Folder
                </button>
                <div className={styles.contextMenuDivider} />
                <button onClick={handleRename} className={styles.contextMenuItem}>
                  ✏️ Rename
                </button>
                <button onClick={handleDelete} className={styles.contextMenuItem}>
                  🗑️ Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={handleRename} className={styles.contextMenuItem}>
                  ✏️ Rename
                </button>
                <button onClick={handleDelete} className={styles.contextMenuItem}>
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function FileExplorer({ className }: FileExplorerProps) {
  const { currentProject, theme, createFile, createFolder } = useProjectContext();
  const [showRootContextMenu, setShowRootContextMenu] = useState(false);
  const [rootContextMenuPosition, setRootContextMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const handleRootContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setRootContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowRootContextMenu(true);
  };

  const handleNewFileAtRoot = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      try {
        createFile(fileName, '');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to create file');
      }
    }
    setShowRootContextMenu(false);
  };

  const handleNewFolderAtRoot = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      try {
        createFolder(folderName);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to create folder');
      }
    }
    setShowRootContextMenu(false);
  };

  const filterFiles = (files: FileNode[], query: string): FileNode[] => {
    if (!query.trim()) return files;
    
    const filtered: FileNode[] = [];
    const lowerQuery = query.toLowerCase();
    
    const searchInFile = (file: FileNode) => {
      const matchesName = file.name.toLowerCase().includes(lowerQuery);
      const matchesContent = file.content?.toLowerCase().includes(lowerQuery) || false;
      
      if (matchesName || matchesContent) {
        filtered.push(file);
      }
      
      if (file.children) {
        file.children.forEach(searchInFile);
      }
    };
    
    files.forEach(searchInFile);
    return filtered;
  };

  const filteredFiles = searchQuery ? filterFiles(currentProject?.files || [], searchQuery) : (currentProject?.files || []);


  if (!currentProject) {
    return (
      <div className={`${styles.fileExplorer} ${styles[theme]} ${className || ''}`}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📁</div>
          <p className={styles.emptyText}>No project loaded</p>
          <p className={styles.emptySubtext}>Create or load a project to start coding</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.fileExplorer} ${styles[theme]} ${className || ''}`}
      onContextMenu={handleRootContextMenu}
    >
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h3 className={styles.title}>Explorer</h3>
          <div className={styles.headerActions}>
            <button title="New File" className={styles.actionButton} onClick={handleNewFileAtRoot}>＋</button>
            <button title="New Folder" className={styles.actionButton} onClick={handleNewFolderAtRoot}>📁</button>
          </div>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search files..."
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
      </div>
      
      <div className={styles.content}>
        {currentProject.files.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <p className={styles.emptyText}>No files yet</p>
            <p className={styles.emptySubtext}>Right-click to create files and folders</p>
          </div>
        ) : (
          <div className={styles.fileTree}>
            {filteredFiles.map((file) => (
              <FileItem key={file.id} file={file} level={0} />
            ))}
          </div>
        )}
      </div>

      {showRootContextMenu && (
        <div
          className={styles.contextMenu}
          style={{
            position: 'fixed',
            left: rootContextMenuPosition.x,
            top: rootContextMenuPosition.y,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.contextMenuContent}>
            <button onClick={handleNewFileAtRoot} className={styles.contextMenuItem}>
              📄 New File
            </button>
            <button onClick={handleNewFolderAtRoot} className={styles.contextMenuItem}>
              📁 New Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
