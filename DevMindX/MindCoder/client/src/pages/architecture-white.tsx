import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Network, ArrowLeft, Loader2, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface DiagramData {
  systemArchitecture: string;
  classDiagram: string;
  erDiagram: string;
  sequenceDiagram: string;
  restApiBlueprint: string;
  dataFlowDiagram: string;
  description: string;
}

export default function ArchitectureWhite() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [projectInput, setProjectInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [architectureData, setArchitectureData] = useState<DiagramData | null>(null);
  const [activeTab, setActiveTab] = useState<'system' | 'class' | 'er' | 'sequence' | 'api' | 'dataflow'>('system');

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleGenerate = async () => {
    if (!projectInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please describe your project',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/architecture/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ 
          description: projectInput,
          useDemo: projectInput.toLowerCase().includes('snake game')
        })
      });

      if (!response.ok) throw new Error('Failed to generate architecture');

      const data = await response.json();
      setArchitectureData(data);
      toast({
        title: 'Success!',
        description: 'Architecture diagrams generated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate diagrams',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'system', label: 'System Architecture' },
    { id: 'class', label: 'Class Diagram' },
    { id: 'er', label: 'ER Diagram' },
    { id: 'sequence', label: 'Sequence Diagram' },
    { id: 'api', label: 'API Blueprint' },
    { id: 'dataflow', label: 'Data Flow' }
  ];

  const getDiagramContent = () => {
    if (!architectureData) return '';
    switch (activeTab) {
      case 'system': return architectureData.systemArchitecture;
      case 'class': return architectureData.classDiagram;
      case 'er': return architectureData.erDiagram;
      case 'sequence': return architectureData.sequenceDiagram;
      case 'api': return architectureData.restApiBlueprint;
      case 'dataflow': return architectureData.dataFlowDiagram;
      default: return '';
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
              <h1 className="text-2xl font-bold text-gray-900">Architecture Generator</h1>
              <p className="text-sm text-gray-600">Generate system architecture diagrams</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!architectureData ? (
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Describe Your System</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your project architecture... (e.g., 'A microservices e-commerce platform with user authentication, product catalog, and payment processing')"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                rows={10}
                className="bg-white border-gray-300"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Diagrams...
                  </>
                ) : (
                  <>
                    <Network className="h-4 w-4 mr-2" />
                    Generate Architecture
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Description */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="pt-6">
                <p className="text-gray-700">{architectureData.description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Diagram Content */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const content = getDiagramContent();
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${activeTab}-diagram.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="border-gray-300"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto text-sm">
                  <code className="text-gray-900">{getDiagramContent()}</code>
                </pre>
              </CardContent>
            </Card>

            {/* Generate New Button */}
            <Button
              onClick={() => setArchitectureData(null)}
              variant="outline"
              className="w-full border-gray-300"
            >
              Generate New Architecture
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
