import { useEffect, useCallback } from 'react';
import { useProjectContext } from '../contexts/ProjectContext';

export function useKeyboardShortcuts() {
  const {
    currentProject,
    activeFile,
    openFiles,
    autosaveEnabled,
    manualSave,
    toggleAutosave,
    toggleTheme,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    closeFile,
    closeAllFiles,
    openFile
  } = useProjectContext();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    // Prevent default browser shortcuts when we handle them
    if (isCtrlOrCmd || isAlt) {
      switch (event.key.toLowerCase()) {
        case 's':
          if (isCtrlOrCmd && !isShift) {
            event.preventDefault();
            if (autosaveEnabled) {
              manualSave();
            } else {
              manualSave();
            }
            return;
          }
          break;
        case 'n':
          if (isCtrlOrCmd && !isShift) {
            event.preventDefault();
            const fileName = prompt('Enter file name:');
            if (fileName) {
              try {
                createFile(fileName, '');
              } catch (error) {
                alert(error instanceof Error ? error.message : 'Failed to create file');
              }
            }
            return;
          }
          break;
        case 'b':
          if (isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // TODO: Toggle sidebar
            return;
          }
          break;
        case '/':
          if (isCtrlOrCmd && !isShift) {
            event.preventDefault();
            toggleTheme();
            return;
          }
          break;
        case 'p':
          if (isCtrlOrCmd && !isShift) {
            event.preventDefault();
            // TODO: Open file search
            return;
          }
          break;
      }
    }

    // Handle F2 for rename
    if (event.key === 'F2') {
      event.preventDefault();
      if (activeFile) {
        const newName = prompt('Enter new name:', activeFile.name);
        if (newName && newName !== activeFile.name) {
          try {
            renameFile(activeFile.id, newName);
          } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to rename file');
          }
        }
      }
      return;
    }

    // Handle Delete key
    if (event.key === 'Delete' && !isCtrlOrCmd && !isShift && !isAlt) {
      if (activeFile) {
        event.preventDefault();
        if (confirm(`Are you sure you want to delete "${activeFile.name}"?`)) {
          deleteFile(activeFile.id);
        }
      }
      return;
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      // Close any open modals or context menus
      // This will be handled by individual components
      return;
    }

    // Handle Ctrl+Shift+N for new folder
    if (isCtrlOrCmd && isShift && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      const folderName = prompt('Enter folder name:');
      if (folderName) {
        try {
          createFolder(folderName);
        } catch (error) {
          alert(error instanceof Error ? error.message : 'Failed to create folder');
        }
      }
      return;
    }

    // Handle Ctrl+W to close current file
    if (isCtrlOrCmd && event.key.toLowerCase() === 'w') {
      event.preventDefault();
      if (activeFile) {
        closeFile(activeFile.id);
      }
      return;
    }

    // Handle Ctrl+Shift+W to close all files
    if (isCtrlOrCmd && isShift && event.key.toLowerCase() === 'w') {
      event.preventDefault();
      closeAllFiles();
      return;
    }

    // Handle Ctrl+Tab to switch between open files
    if (isCtrlOrCmd && event.key === 'Tab') {
      event.preventDefault();
      if (openFiles.length > 1) {
        const currentIndex = openFiles.findIndex(f => f.id === activeFile?.id);
        const nextIndex = isShift ? 
          (currentIndex - 1 + openFiles.length) % openFiles.length :
          (currentIndex + 1) % openFiles.length;
        openFile(openFiles[nextIndex]);
      }
      return;
    }
  }, [
    currentProject,
    activeFile,
    openFiles,
    autosaveEnabled,
    manualSave,
    toggleAutosave,
    toggleTheme,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    closeFile,
    closeAllFiles,
    openFile
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Return any helper functions if needed
  };
}
