import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Folder, FolderOpen, Search, X, Loader2, FileCode,
  Calendar, ChevronRight, Upload, Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  description: string;
  framework?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

interface ProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (projectData: { 
    project: Project; 
    files: ProjectFile[];
    fullContent: string;
  }) => void;
  title?: string;
  description?: string;
}

export default function ProjectSelector({
  isOpen,
  onClose,
  onProjectSelect,
  title = "Load Project",
  description = "Select a project from your generated projects"
}: ProjectSelectorProps) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (project: Project) => {
    try {
      setIsLoadingProject(true);
      setSelectedProject(project);

      // Fetch project files
      const response = await fetch(`/api/projects/${project.id}/files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load project files');

      const data = await response.json();
      
      // Combine all file contents into a single string for AI analysis
      const fullContent = data.files.map((file: ProjectFile) => 
        `// File: ${file.path}\n${file.content}`
      ).join('\n\n---\n\n');

      onProjectSelect({
        project,
        files: data.files,
        fullContent
      });

      toast({
        title: 'Project Loaded!',
        description: `${project.name} has been loaded successfully`,
      });

      onClose();
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project files',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProject(false);
      setSelectedProject(null);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.framework && project.framework.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFrameworkColor = (framework?: string) => {
    if (!framework) return 'bg-gray-600';
    const colors: Record<string, string> = {
      'react': 'bg-blue-600',
      'vue': 'bg-green-600',
      'angular': 'bg-red-600',
      'node': 'bg-green-700',
      'express': 'bg-gray-600',
      'next': 'bg-gray-900',
      'mern': 'bg-blue-700',
    };
    return colors[framework.toLowerCase()] || 'bg-purple-600';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-gray-800/95 border-purple-500/30 backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">{title}</CardTitle>
                    <p className="text-gray-400 text-sm mt-1">{description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Projects List */}
              <ScrollArea className="h-[400px] pr-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Folder className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-white font-semibold mb-2">
                      {searchQuery ? 'No matching projects' : 'No projects yet'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {searchQuery 
                        ? 'Try a different search term'
                        : 'Generate a project first to use this feature'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedProject?.id === project.id
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                        }`}
                        onClick={() => handleLoadProject(project)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-gray-800 rounded-lg flex-shrink-0">
                              {isLoadingProject && selectedProject?.id === project.id ? (
                                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                              ) : (
                                <FolderOpen className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-semibold truncate">
                                  {project.name}
                                </h4>
                                {project.framework && (
                                  <Badge className={`${getFrameworkColor(project.framework)} text-white text-xs`}>
                                    {project.framework}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm line-clamp-2">
                                {project.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
                </p>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
