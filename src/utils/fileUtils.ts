import type { FileNode } from '../types/project';

export class FileUtils {
  static generateId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createFile(name: string, content: string = '', parentId?: string): FileNode {
    const id = this.generateId();
    const path = parentId ? `/${parentId}/${name}` : `/${name}`;
    
    return {
      id,
      name,
      type: 'file',
      content,
      parentId,
      path
    };
  }

  static createFolder(name: string, parentId?: string): FileNode {
    const id = this.generateId();
    const path = parentId ? `/${parentId}/${name}` : `/${name}`;
    
    return {
      id,
      name,
      type: 'folder',
      children: [],
      parentId,
      path
    };
  }

  static findFileById(files: FileNode[], fileId: string): FileNode | null {
    for (const file of files) {
      if (file.id === fileId) {
        return file;
      }
      if (file.children) {
        const found = this.findFileById(file.children, fileId);
        if (found) return found;
      }
    }
    return null;
  }

  static findFileByPath(files: FileNode[], path: string): FileNode | null {
    for (const file of files) {
      if (file.path === path) {
        return file;
      }
      if (file.children) {
        const found = this.findFileByPath(file.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  static addFileToParent(files: FileNode[], parentId: string | undefined, newFile: FileNode): FileNode[] {
    if (!parentId) {
      return [...files, newFile];
    }

    return files.map(file => {
      if (file.id === parentId) {
        return {
          ...file,
          children: [...(file.children || []), newFile]
        };
      }
      if (file.children) {
        return {
          ...file,
          children: this.addFileToParent(file.children, parentId, newFile)
        };
      }
      return file;
    });
  }

  static removeFileById(files: FileNode[], fileId: string): FileNode[] {
    return files.filter(file => {
      if (file.id === fileId) {
        return false;
      }
      if (file.children) {
        file.children = this.removeFileById(file.children, fileId);
      }
      return true;
    });
  }

  static updateFileById(files: FileNode[], fileId: string, updates: Partial<FileNode>): FileNode[] {
    return files.map(file => {
      if (file.id === fileId) {
        return { ...file, ...updates };
      }
      if (file.children) {
        return {
          ...file,
          children: this.updateFileById(file.children, fileId, updates)
        };
      }
      return file;
    });
  }

  static updateFileContent(files: FileNode[], fileId: string, content: string): FileNode[] {
    return this.updateFileById(files, fileId, { content });
  }

  static renameFile(files: FileNode[], fileId: string, newName: string): FileNode[] {
    return this.updateFileById(files, fileId, { name: newName });
  }

  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  static getFileIcon(fileName: string): string {
    const extension = this.getFileExtension(fileName);
    
    const iconMap: { [key: string]: string } = {
      'js': '📄',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'css': '🎨',
      'scss': '🎨',
      'sass': '🎨',
      'html': '🌐',
      'htm': '🌐',
      'json': '📋',
      'md': '📝',
      'txt': '📄',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'gif': '🖼️',
      'svg': '🖼️',
      'ico': '🖼️',
      'webp': '🖼️',
      'pdf': '📕',
      'doc': '📄',
      'docx': '📄',
      'xls': '📊',
      'xlsx': '📊',
      'ppt': '📽️',
      'pptx': '📽️',
      'zip': '🗜️',
      'rar': '🗜️',
      'tar': '🗜️',
      'gz': '🗜️',
      'mp4': '🎬',
      'avi': '🎬',
      'mov': '🎬',
      'mp3': '🎵',
      'wav': '🎵',
      'flac': '🎵',
      'py': '🐍',
      'java': '☕',
      'cpp': '⚙️',
      'c': '⚙️',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'swift': '🦉',
      'kt': '🤖',
      'dart': '🎯',
      'vue': '💚',
      'svelte': '🧡',
      'astro': '🚀'
    };

    return iconMap[extension] || '📄';
  }

  static isCodeFile(fileName: string): boolean {
    const extension = this.getFileExtension(fileName);
    return ['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json'].includes(extension);
  }

  static flattenFiles(files: FileNode[]): FileNode[] {
    const result: FileNode[] = [];
    
    const flatten = (fileList: FileNode[]) => {
      for (const file of fileList) {
        result.push(file);
        if (file.children) {
          flatten(file.children);
        }
      }
    };
    
    flatten(files);
    return result;
  }

  static getParentPath(file: FileNode): string {
    const pathParts = file.path.split('/');
    pathParts.pop(); // Remove the file name
    return pathParts.join('/') || '/';
  }

  static validateFileName(name: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: 'File name cannot be empty' };
    }
    
    if (name.includes('/') || name.includes('\\')) {
      return { isValid: false, error: 'File name cannot contain slashes' };
    }
    
    if (name.includes('..')) {
      return { isValid: false, error: 'File name cannot contain ".."' };
    }
    
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(name)) {
      return { isValid: false, error: 'File name contains invalid characters' };
    }
    
    return { isValid: true };
  }

  static getSandpackFiles(files: FileNode[]): { [key: string]: string } {
    const sandpackFiles: { [key: string]: string } = {};
    
    const processFiles = (fileList: FileNode[]) => {
      for (const file of fileList) {
        if (file.type === 'file' && file.content) {
          sandpackFiles[file.path] = file.content;
        }
        if (file.children) {
          processFiles(file.children);
        }
      }
    };
    
    processFiles(files);
    return sandpackFiles;
  }
}
