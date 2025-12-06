import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Code, Loader2, Rocket } from 'lucide-react';
import { Link } from 'wouter';

export default function GeneratorWhite() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('react');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!projectName.trim() || !description.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both project name and description',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({
          name: projectName,
          description,
          framework,
          withPreview: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project');
      }

      const project = await response.json();

      toast({
        title: 'Success!',
        description: 'Project generated successfully',
      });

      // Load the project and navigate to IDE
      navigate(`/ide?projectId=${project.id}`);
    } catch (error) {
      console.error('Error generating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/ide">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Project Generator</h1>
              <p className="text-sm text-gray-600">Describe your project and let AI build it</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Generate New Project
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-gray-900">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <Label htmlFor="framework" className="text-gray-900">Framework</Label>
              <Select value={framework} onValueChange={setFramework}>
                <SelectTrigger className="bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="svelte">Svelte</SelectItem>
                  <SelectItem value="vanilla">Vanilla JS</SelectItem>
                  <SelectItem value="html">HTML/CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900">Project Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you want to build... Be as detailed as possible for better results."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="bg-white border-gray-300"
              />
              <p className="text-sm text-gray-500">
                Example: "A todo app with drag and drop, dark mode, and local storage"
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Project...
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  Generate Project
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Examples */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Projects</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setProjectName('Snake Game');
                    setDescription('A classic snake game with score tracking and game over screen');
                    setFramework('html');
                  }}>
              <h4 className="font-semibold text-gray-900 mb-2">Snake Game</h4>
              <p className="text-sm text-gray-600">Classic game with HTML5 Canvas</p>
            </Card>
            <Card className="border border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setProjectName('Todo App');
                    setDescription('A todo list app with add, delete, and mark as complete features');
                    setFramework('react');
                  }}>
              <h4 className="font-semibold text-gray-900 mb-2">Todo App</h4>
              <p className="text-sm text-gray-600">Task management with React</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
