import { useState } from 'react';
import type { Project, FileNode } from '../types/project';
import { backend, type BackendFile, type BackendProject } from '../utils/api';
import { FileUtils } from '../utils/fileUtils';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapBackendToProject = (bp: BackendProject, files: BackendFile[]): Project => {
    return {
      id: bp._id,
      name: bp.name,
      description: bp.description,
      files: mapBackendFilesToTree(files),
      createdAt: new Date(),
      updatedAt: new Date(),
      template: 'react'
    };
  };

  const mapBackendFilesToTree = (files: BackendFile[]): FileNode[] => {
    const idToNode = new Map<string, FileNode>();
    const roots: FileNode[] = [];
    for (const f of files) {
      idToNode.set(f._id, {
        id: f._id,
        name: f.name,
        type: f.type,
        content: f.type === 'file' ? (f.content || '') : undefined,
        children: f.type === 'folder' ? [] : undefined,
        parentId: f.parentId || undefined,
        path: `/${f.path}`
      });
    }
    for (const f of files) {
      const node = idToNode.get(f._id)!;
      if (f.parentId && idToNode.has(f.parentId)) {
        const parent = idToNode.get(f.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  };

  const refreshProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await backend.listProjects();
      setProjects(list.map(p => ({ id: p._id, name: p.name, description: p.description, files: [], createdAt: new Date(), updatedAt: new Date(), template: 'react' })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async (name: string, description?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const bp = await backend.createProject(name, description);
      const files = await backend.listFiles(bp._id);
      const proj = mapBackendToProject(bp, files);
      // Pull fresh list from backend to ensure dashboard shows new project
      const list = await backend.listProjects();
      setProjects(list.map(p => ({ id: p._id, name: p.name, description: p.description, files: [], createdAt: new Date(), updatedAt: new Date(), template: 'react' })));
      setCurrentProject(proj);
      return proj;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const bp = await backend.getProject(projectId);
      const files = await backend.listFiles(projectId);
      const proj = mapBackendToProject(bp, files);
      setCurrentProject(proj);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async () => {
    if (!currentProject) return;
    setIsLoading(true);
    setError(null);
    try {
      // Persist changed files: send content updates for files with ids that look like MongoIDs
      const flat = FileUtils.flattenFiles(currentProject.files);
      await Promise.all(flat.map(async f => {
        if (f.type === 'file' && f.id.match(/^[a-f\d]{24}$/i)) {
          await backend.updateFile(f.id, { content: f.content || '' });
        }
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await backend.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) setCurrentProject(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    currentProject,
    isLoading,
    error,
    createProject,
    loadProject,
    saveProject,
    deleteProject,
    setCurrentProject,
    refreshProjects
  };
}
