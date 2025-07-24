import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wand2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { projectsApi } from "@/lib/api";

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: any) => void;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  tags: string[];
}

const FRAMEWORKS = [
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Next.js',
  'Express.js',
  'Python Flask',
  'Django',
  'Spring Boot',
  'Laravel'
];

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    description: 'Complete online store with cart, checkout, and payment integration',
    framework: 'React',
    tags: ['React', 'Stripe', 'Shopping Cart']
  },
  {
    id: 'social-media',
    name: 'Social Media App',
    description: 'Social platform with posts, likes, comments, and user profiles',
    framework: 'MERN',
    tags: ['MERN', 'JWT', 'Socket.io']
  },
  {
    id: 'dashboard',
    name: 'Dashboard Analytics',
    description: 'Data visualization dashboard with charts and real-time updates',
    framework: 'React',
    tags: ['React', 'D3.js', 'Charts']
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'Content management system with markdown support and SEO',
    framework: 'Next.js',
    tags: ['Next.js', 'Markdown', 'SEO']
  },
  {
    id: 'todo-app',
    name: 'Task Management',
    description: 'Productivity app with task organization and team collaboration',
    framework: 'Vue.js',
    tags: ['Vue.js', 'Vuex', 'Collaboration']
  },
  {
    id: 'chat-app',
    name: 'Real-time Chat',
    description: 'Messaging application with real-time communication',
    framework: 'Node.js',
    tags: ['Node.js', 'Socket.io', 'Real-time']
  }
];

export function ProjectModal({ open, onOpenChange, onProjectCreated }: ProjectModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    framework: '',
    description: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name.toLowerCase().replace(/\s+/g, '-'),
      framework: template.framework,
      description: template.description
    });
  };

  const handleGenerateProject = async () => {
    if (!formData.name || !formData.framework || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before generating the project.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const project = await projectsApi.generate({
        name: formData.name,
        framework: formData.framework,
        description: formData.description
      });

      onProjectCreated(project);
      onOpenChange(false);
      
      toast({
        title: "Project Generated!",
        description: `Successfully created ${project.name} with ${Object.keys(project.files).length} files.`,
      });

      // Reset form
      setFormData({ name: '', framework: '', description: '' });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManual = async () => {
    if (!formData.name || !formData.framework) {
      toast({
        title: "Missing Information",
        description: "Please provide at least a project name and framework.",
        variant: "destructive",
      });
      return;
    }

    try {
      const project = await projectsApi.create({
        name: formData.name,
        framework: formData.framework,
        description: formData.description
      });

      onProjectCreated(project);
      onOpenChange(false);
      
      toast({
        title: "Project Created!",
        description: `Successfully created ${project.name}.`,
      });

      // Reset form
      setFormData({ name: '', framework: '', description: '' });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-2/3 flex flex-col ide-panel border-border-color">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white mb-2">Generate New Project</DialogTitle>
          <p className="ide-text-secondary">Describe your project and let AI generate the complete codebase</p>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Input Form */}
          <div className="w-1/2 p-6 border-r ide-border">
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name" className="text-sm font-medium mb-2 block">Project Name</Label>
                <Input
                  id="project-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="ide-bg border-border-color focus:ring-accent-blue"
                  placeholder="my-awesome-app"
                />
              </div>
              
              <div>
                <Label htmlFor="framework" className="text-sm font-medium mb-2 block">Framework</Label>
                <Select value={formData.framework} onValueChange={(value) => handleInputChange('framework', value)}>
                  <SelectTrigger className="ide-bg border-border-color focus:ring-accent-blue">
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent className="ide-panel border-border-color">
                    {FRAMEWORKS.map(framework => (
                      <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium mb-2 block">Project Description</Label>
                <Textarea
                  id="description"
                  rows={8}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="ide-bg border-border-color focus:ring-accent-blue resize-none"
                  placeholder="Describe your project in detail. What features should it have? What should it look like? Be as specific as possible..."
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleGenerateProject}
                  disabled={isGenerating}
                  className="flex-1 bg-accent-blue hover:bg-blue-600 text-white font-medium"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCreateManual}
                  variant="outline"
                  className="px-4 border-border-color ide-text-secondary hover:text-white"
                >
                  Create Empty
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="px-4 border-border-color ide-text-secondary hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Templates */}
          <div className="w-1/2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium ide-text-secondary uppercase tracking-wide">Popular Templates</h3>
              {selectedTemplate && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setFormData({ name: '', framework: '', description: '' });
                  }}
                  className="ide-text-secondary hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
              {PROJECT_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`border ide-border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id 
                      ? 'border-accent-blue bg-accent-blue bg-opacity-10' 
                      : 'hover:bg-border-color'
                  }`}
                >
                  <h4 className="font-medium text-white mb-2">{template.name}</h4>
                  <p className="text-sm ide-text-secondary mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-accent-blue text-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
