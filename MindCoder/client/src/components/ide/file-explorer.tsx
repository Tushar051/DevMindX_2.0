import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, Plus, FolderPlus, RotateCcw } from "lucide-react";

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  expanded?: boolean;
}

interface FileExplorerProps {
  projectName: string;
  files: { [path: string]: string };
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  onFileCreate: (path: string) => void;
  onFolderCreate: (path: string) => void;
}

export function FileExplorer({ 
  projectName, 
  files, 
  activeFile, 
  onFileSelect, 
  onFileCreate,
  onFolderCreate 
}: FileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  useEffect(() => {
    const tree = buildFileTree(files);
    setFileTree(tree);
  }, [files]);

  const buildFileTree = (files: { [path: string]: string }): FileNode[] => {
    const tree: FileNode[] = [];
    const pathMap: { [path: string]: FileNode } = {};

    // Sort paths to ensure folders come before their contents
    const sortedPaths = Object.keys(files).sort();

    for (const filePath of sortedPaths) {
      const parts = filePath.split('/');
      let currentPath = '';
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap[currentPath]) {
          const node: FileNode = {
            name: part,
            type: i === parts.length - 1 ? 'file' : 'folder',
            path: currentPath,
            children: i === parts.length - 1 ? undefined : [],
            expanded: false
          };
          
          pathMap[currentPath] = node;
          
          if (parentPath && pathMap[parentPath]) {
            pathMap[parentPath].children!.push(node);
          } else if (!parentPath) {
            tree.push(node);
          }
        }
      }
    }

    return tree;
  };

  const toggleFolder = (path: string) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path && node.type === 'folder') {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    
    setFileTree(updateTree(fileTree));
  };

  const getFileIcon = (fileName: string, isOpen: boolean = false) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (isOpen) return <FolderOpen className="w-4 h-4 text-blue-400" />;
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return <File className="w-4 h-4 text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <File className="w-4 h-4 text-blue-400" />;
      case 'css':
        return <File className="w-4 h-4 text-blue-400" />;
      case 'html':
        return <File className="w-4 h-4 text-orange-400" />;
      case 'json':
        return <File className="w-4 h-4 text-green-400" />;
      case 'md':
        return <File className="w-4 h-4 text-white" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderNode = (node: FileNode, depth: number = 0): React.ReactNode => {
    const isActive = activeFile === node.path;
    const paddingLeft = depth * 16 + 16;

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className={`file-tree-item ${isActive ? 'active' : ''}`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {node.expanded ? (
              <ChevronDown className="w-3 h-3 mr-2 ide-text-secondary" />
            ) : (
              <ChevronRight className="w-3 h-3 mr-2 ide-text-secondary" />
            )}
            {node.expanded ? (
              <FolderOpen className="w-4 h-4 text-blue-400 mr-2" />
            ) : (
              <Folder className="w-4 h-4 text-blue-400 mr-2" />
            )}
            <span>{node.name}</span>
          </div>
          {node.expanded && node.children && (
            <div>
              {node.children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`file-tree-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => onFileSelect(node.path)}
      >
        {getFileIcon(node.name)}
        <span className="ml-2">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="ide-sidebar border-r ide-border flex">
      {/* Sidebar Tabs */}
      <div className="w-12 ide-panel border-r ide-border flex flex-col py-2">
        <button className="h-12 flex items-center justify-center text-accent-blue ide-bg">
          <Folder className="w-5 h-5" />
        </button>
        <button className="h-12 flex items-center justify-center ide-text-secondary hover:text-white transition-colors">
          <i className="fas fa-search text-lg"></i>
        </button>
        <button className="h-12 flex items-center justify-center ide-text-secondary hover:text-white transition-colors">
          <i className="fas fa-git-alt text-lg"></i>
        </button>
      </div>

      {/* File Explorer */}
      <div className="flex-1 flex flex-col">
        <div className="h-8 flex items-center justify-between px-3 border-b ide-border">
          <span className="text-xs font-medium uppercase tracking-wide ide-text-secondary">Explorer</span>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-border-color"
              onClick={() => onFileCreate('')}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-border-color"
              onClick={() => onFolderCreate('')}
            >
              <FolderPlus className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-6 h-6 p-0 hover:bg-border-color"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Project Name */}
        <div className="px-3 py-2 border-b ide-border">
          <div className="flex items-center text-sm">
            <ChevronDown className="w-3 h-3 mr-2" />
            <FolderOpen className="w-4 h-4 text-blue-400 mr-2" />
            <span>{projectName}</span>
          </div>
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {fileTree.length > 0 ? (
            <div className="py-1">
              {fileTree.map(node => renderNode(node))}
            </div>
          ) : (
            <div className="p-4 text-center ide-text-secondary">
              <p>No files found</p>
              <p className="text-xs mt-1">Create a new file to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
