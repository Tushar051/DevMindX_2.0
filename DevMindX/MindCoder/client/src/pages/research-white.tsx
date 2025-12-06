import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, Loader2, Copy, Check, Lightbulb, Code, Shield, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Textarea } from '@/components/ui/textarea';

interface ResearchResult {
  overview: string;
  keyFeatures: string[];
  techStack: string[];
  architecture: string;
  bestPractices: string[];
  challenges: string[];
  recommendations: string[];
  devmindxPrompt: string;
  estimatedComplexity: 'Simple' | 'Medium' | 'Complex';
  estimatedTime: string;
}

export default function ResearchWhite() {
  const { toast } = useToast();
  const [idea, setIdea] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResearch = async () => {
    if (!idea.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your project idea',
        variant: 'destructive'
      });
      return;
    }

    setIsResearching(true);
    try {
      const response = await fetch('/api/research/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ idea })
      });

      if (!response.ok) throw new Error('Research failed');

      const data = await response.json();
      setResearchResult(data);
      toast({
        title: 'Research Complete!',
        description: 'Your project analysis is ready'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to research project',
        variant: 'destructive'
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleCopyPrompt = () => {
    if (researchResult?.devmindxPrompt) {
      navigator.clipboard.writeText(researchResult.devmindxPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Prompt copied to clipboard'
      });
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
              <h1 className="text-2xl font-bold text-gray-900">Research Engine</h1>
              <p className="text-sm text-gray-600">AI-powered project research and planning</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!researchResult ? (
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">What do you want to build?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your project idea... (e.g., 'A social media platform for developers')"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={6}
                className="bg-white border-gray-300"
              />
              <Button
                onClick={handleResearch}
                disabled={isResearching}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isResearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Research Project
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Project Overview</CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-700">
                      {researchResult.estimatedComplexity}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      {researchResult.estimatedTime}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{researchResult.overview}</p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {researchResult.keyFeatures.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Code className="h-5 w-5 text-blue-600" />
                  Recommended Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {researchResult.techStack.map((tech, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Architecture */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Architecture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{researchResult.architecture}</p>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Shield className="h-5 w-5 text-green-600" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {researchResult.bestPractices.map((practice, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-600 mt-1">✓</span>
                      {practice}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card className="border border-gray-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Potential Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {researchResult.challenges.map((challenge, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-orange-600 mt-1">!</span>
                      {challenge}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* DevMindX Prompt */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900">Ready to Build?</CardTitle>
                  <Button
                    onClick={handleCopyPrompt}
                    variant="outline"
                    size="sm"
                    className="border-blue-300"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Use this optimized prompt in the Project Generator:
                </p>
                <pre className="bg-white p-4 rounded border border-blue-200 text-sm text-gray-900 whitespace-pre-wrap">
                  {researchResult.devmindxPrompt}
                </pre>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => setResearchResult(null)}
                variant="outline"
                className="flex-1 border-gray-300"
              >
                Research Another Idea
              </Button>
              <Link href="/generator">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Generator
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
