import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { FileNode, ProjectContextType } from '../types/project';
import { useProjects } from '../hooks/useLocalStorage';
import { FileUtils } from '../utils/fileUtils';
import { useToast } from './ToastContext';
import { backend } from '../utils/api';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const {
    projects,
    currentProject,
    isLoading,
    error,
    createProject: createProjectHook,
    loadProject: loadProjectHook,
    saveProject: saveProjectHook,
    deleteProject: deleteProjectHook,
    setCurrentProject,
    refreshProjects
  } = useProjects();
  
  const { showToast } = useToast();

  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const createProject = useCallback(async (name: string, description?: string) => {
    return await createProjectHook(name, description);
  }, [createProjectHook]);

  const loadProject = useCallback((projectId: string) => {
    loadProjectHook(projectId);
    setActiveFile(null); // Reset active file when loading new project
  }, [loadProjectHook]);

  const saveProject = useCallback(async () => {
    setSaveStatus('saving');
    await saveProjectHook();
    setSaveStatus('saved');
    setLastSaved(new Date());
  }, [saveProjectHook]);

  const deleteProject = useCallback(async (projectId: string) => {
    await deleteProjectHook(projectId);
    if (currentProject?.id === projectId) {
      setActiveFile(null);
    }
  }, [deleteProjectHook, currentProject]);

  const createFile = useCallback(async (name: string, content: string = '', parentId?: string) => {
    if (!currentProject) return;

    try {
      const validation = FileUtils.validateFileName(name);
      if (!validation.isValid) {
        showToast({ type: 'error', title: 'Invalid file name', message: validation.error });
        return;
      }

      await backend.createFile(currentProject.id, { parentId: parentId || null, name, type: 'file', content });
      await loadProject(currentProject.id);

      showToast({ type: 'success', title: 'File created', message: `Created ${name}` });
    } catch (error) {
      showToast({ type: 'error', title: 'Failed to create file', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [currentProject, loadProject, showToast]);

  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!currentProject) return;
    const validation = FileUtils.validateFileName(name);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    await backend.createFile(currentProject.id, { parentId: parentId || null, name, type: 'folder' });
    await loadProject(currentProject.id);
  }, [currentProject, loadProject]);

  const deleteFile = useCallback(async (fileId: string) => {
    if (!currentProject) return;
    await backend.deleteFile(fileId);
    await loadProject(currentProject.id);
    if (activeFile?.id === fileId) setActiveFile(null);
  }, [currentProject, loadProject, activeFile]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    if (!currentProject) return;
    const validation = FileUtils.validateFileName(newName);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    await backend.updateFile(fileId, { name: newName });
    await loadProject(currentProject.id);
  }, [currentProject, loadProject]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    if (!currentProject) return;

    const updatedFiles = FileUtils.updateFileContent(currentProject.files, fileId, content);
    
    const updatedProject = {
      ...currentProject,
      files: updatedFiles,
      updatedAt: new Date()
    };

    setCurrentProject(updatedProject);
    setSaveStatus('unsaved');
    
    // Update active file content if it's the same file
    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content });
    }

    // Auto-save if enabled
    if (autosaveEnabled) {
      setTimeout(() => {
        saveProject();
      }, 1000); // Debounce autosave
    }
  }, [currentProject, setCurrentProject, activeFile, autosaveEnabled, saveProject]);

  const findFileById = useCallback((fileId: string): FileNode | null => {
    if (!currentProject) return null;
    return FileUtils.findFileById(currentProject.files, fileId);
  }, [currentProject]);

  const findFileByPath = useCallback((path: string): FileNode | null => {
    if (!currentProject) return null;
    return FileUtils.findFileByPath(currentProject.files, path);
  }, [currentProject]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const toggleAutosave = useCallback(() => {
    setAutosaveEnabled(prev => !prev);
  }, []);

  const manualSave = useCallback(() => {
    if (saveStatus === 'unsaved') {
      saveProject();
    }
  }, [saveStatus, saveProject]);

  const exportProject = useCallback(() => {
    if (!currentProject) return;
    
    try {
      const projectData = {
        ...currentProject,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject.name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast({
        type: 'success',
        title: 'Project exported',
        message: `${currentProject.name} has been exported successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Export failed',
        message: error instanceof Error ? error.message : 'Failed to export project'
      });
    }
  }, [currentProject, showToast]);

  const importProject = useCallback((file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const projectData = JSON.parse(e.target?.result as string);
          
          // Validate project data
          if (!projectData.name || !projectData.files) {
            throw new Error('Invalid project file format');
          }
          
          // Create new project with imported data
          const importedProject = {
            ...projectData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Add to projects list
          setCurrentProject(importedProject);
          
          showToast({
            type: 'success',
            title: 'Project imported',
            message: `${importedProject.name} has been imported successfully`
          });
        } catch (error) {
          showToast({
            type: 'error',
            title: 'Import failed',
            message: error instanceof Error ? error.message : 'Invalid project file'
          });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Import failed',
        message: error instanceof Error ? error.message : 'Failed to read file'
      });
    }
  }, [setCurrentProject, showToast]);

  const openFile = useCallback((file: FileNode) => {
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles(prev => [...prev, file]);
    }
    setActiveFile(file);
  }, [openFiles]);

  const closeFile = useCallback((fileId: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== fileId));
    if (activeFile?.id === fileId) {
      const remainingFiles = openFiles.filter(f => f.id !== fileId);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null);
    }
  }, [openFiles, activeFile]);

  const closeAllFiles = useCallback(() => {
    setOpenFiles([]);
    setActiveFile(null);
  }, []);

  const closeOtherFiles = useCallback((fileId: string) => {
    const fileToKeep = openFiles.find(f => f.id === fileId);
    if (fileToKeep) {
      setOpenFiles([fileToKeep]);
      setActiveFile(fileToKeep);
    }
  }, [openFiles]);

  const contextValue: ProjectContextType = {
    currentProject,
    projects,
    activeFile,
    openFiles,
    isLoading,
    error,
    theme,
    autosaveEnabled,
    saveStatus,
    lastSaved,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    updateFileContent,
    setActiveFile,
    openFile,
    closeFile,
    closeAllFiles,
    closeOtherFiles,
    toggleTheme,
    toggleAutosave,
    manualSave,
    exportProject,
    importProject,
    findFileById,
    findFileByPath,
    refreshProjects
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
