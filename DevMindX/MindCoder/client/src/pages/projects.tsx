import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Folder, Code, ArrowRight, Search, Plus, Trash2, Download, FolderOpen } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  framework?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchProjects();
  }, [isAuthenticated, navigate]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/load`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: `${data.project.name} loaded in IDE!`,
      });

      // Navigate to Cursor IDE with the loaded project
      navigate(`/cursor-ide?projectId=${projectId}&t=${Date.now()}`);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: 'Error',
        description: 'Failed to load project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(projectId);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(project => project.id !== projectId));
      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExportProject = async (projectId: string, projectName: string) => {
    try {
      toast({
        title: 'Exporting...',
        description: 'Preparing your project for download...',
      });

      const response = await fetch(`/api/projects/${projectId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export project');
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: '✅ Export Complete',
        description: `${projectName} has been downloaded to your computer!`,
      });
    } catch (error) {
      console.error('Error exporting project:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.framework && project.framework.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFrameworkColor = (framework?: string) => {
    if (!framework) return 'bg-gray-600';
    
    const frameworkColors: Record<string, string> = {
      'react': 'bg-blue-600',
      'vue': 'bg-green-600',
      'angular': 'bg-red-600',
      'node': 'bg-green-700',
      'express': 'bg-gray-600',
      'next': 'bg-gray-900',
      'django': 'bg-green-800',
      'flask': 'bg-blue-800',
      'rails': 'bg-red-700',
      'spring': 'bg-green-600',
      'mern': 'bg-blue-700',
      'mean': 'bg-green-600'
    };
    
    return frameworkColors[framework.toLowerCase()] || 'bg-purple-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Projects</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
            <Button onClick={() => navigate('/cursor-ide')} className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-sm sm:text-base touch-target">
              <Code className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Open IDE</span>
              <span className="sm:hidden">IDE</span>
            </Button>
            <Button onClick={() => navigate('/generator')} className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none text-sm sm:text-base touch-target">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Generate Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
        
        {/* Search - Responsive */}
        <div className="mb-4 sm:mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects..."
            className="pl-10 bg-gray-800 border-gray-700 text-white h-10 sm:h-11 text-sm sm:text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-lg border border-gray-700">
            <Folder className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No matching projects found' : 'No projects yet'}
            </h2>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Create your first project to get started'}
            </p>
            <Button onClick={() => navigate('/cursor-ide')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Open IDE
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-180px)] sm:h-[calc(100vh-220px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="bg-gray-800/70 border-gray-700 hover:bg-gray-800/90 transition-all">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-white text-base sm:text-lg truncate">{project.name}</CardTitle>
                      {project.framework && (
                        <Badge className={`${getFrameworkColor(project.framework)} text-white text-xs flex-shrink-0`}>
                          {project.framework}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-gray-400 text-xs sm:text-sm">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                    <p className="text-gray-300 line-clamp-2 sm:line-clamp-3 text-sm">{project.description}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 p-4 sm:p-6 pt-0 sm:pt-0">
                    {/* Mobile: Stack buttons vertically */}
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-gray-600 hover:bg-gray-700 text-red-400 hover:text-red-300 touch-target-sm"
                        onClick={() => handleDeleteProject(project.id)}
                        disabled={isDeleting === project.id}
                      >
                        {isDeleting === project.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-gray-600 hover:bg-gray-700 text-green-400 hover:text-green-300 touch-target-sm flex-1 sm:flex-none"
                        onClick={() => handleExportProject(project.id, project.name)}
                      >
                        <Download className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-gray-600 hover:bg-gray-700 text-purple-400 hover:text-purple-300 touch-target-sm flex-1 sm:flex-none"
                        onClick={() => {
                          window.location.href = `${window.location.origin}/#/generator?projectId=${project.id}`;
                        }}
                      >
                        <Code className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button 
                        onClick={() => handleLoadProject(project.id)}
                        className="bg-blue-600 hover:bg-blue-700 touch-target-sm flex-1 sm:flex-none"
                        size="sm"
                      >
                        <FolderOpen className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">IDE</span>
                        <span className="sm:hidden">Open</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}