import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AIModelSelector } from "./ai-model-selector";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectModal({ open, onOpenChange }: NewProjectModalProps) {
  const [selectedModel, setSelectedModel] = useState("gemini");
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    framework: "react"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/projects/generate", {
        ...data,
        model: selectedModel
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Generated!",
        description: "Your AI-powered project has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onOpenChange(false);
      setProjectData({ name: "", description: "", framework: "react" });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!projectData.name || !projectData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide both project name and description.",
        variant: "destructive",
      });
      return;
    }
    generateProjectMutation.mutate(projectData);
  };

  const frameworks = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
    { value: "angular", label: "Angular" },
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "nextjs", label: "Next.js" },
    { value: "express", label: "Express.js" },
  ];

  const examples = [
    "Create a hospital management system with patient records and appointments",
    "Build an e-commerce platform with shopping cart and payment integration",
    "Develop a social media app with posts, comments, and real-time messaging",
    "Create a task management dashboard with team collaboration features",
    "Build a learning management system with courses and quizzes"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5 text-blue-500" />
            <span>Generate New Project with AI</span>
          </DialogTitle>
          <DialogDescription>
            Describe your project idea and let AI generate the complete codebase for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Model Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>AI Model Selection</span>
              </CardTitle>
              <CardDescription>
                Choose the AI model to generate your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIModelSelector 
                selectedModel={selectedModel} 
                onModelChange={setSelectedModel}
                className="w-full justify-start"
              />
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="my-awesome-app"
                    value={projectData.name}
                    onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="framework">Framework</Label>
                  <Select value={projectData.framework} onValueChange={(value) => setProjectData(prev => ({ ...prev, framework: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework.value} value={framework.value}>
                          {framework.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you want to build..."
                  value={projectData.description}
                  onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Example Prompts:</Label>
                <div className="grid gap-2">
                  {examples.slice(0, 3).map((example, index) => (
                    <button
                      key={index}
                      className="text-left text-sm text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 p-2 rounded transition-colors"
                      onClick={() => setProjectData(prev => ({ ...prev, description: example }))}
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={generateProjectMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generateProjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}