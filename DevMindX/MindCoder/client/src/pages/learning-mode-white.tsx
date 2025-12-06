import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { BookOpen, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface LearningData {
  explanations: Array<{
    file: string;
    lines: Array<{
      lineNumber: number;
      code: string;
      explanation: string;
    }>;
  }>;
  summary: string;
  quiz: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  vivaQuestions: string[];
}

export default function LearningModeWhite() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [projectInput, setProjectInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [activeTab, setActiveTab] = useState<'explanations' | 'summary' | 'quiz' | 'viva'>('explanations');
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const handleGenerate = async () => {
    if (!projectInput.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please paste your project code',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/learning/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ code: projectInput, useDemo: projectInput.includes('Snake Game') })
      });

      if (!response.ok) throw new Error('Failed to generate learning content');

      const data = await response.json();
      setLearningData(data);
      setQuizAnswers(new Array(data.quiz?.length || 0).fill(-1));
      toast({
        title: 'Success!',
        description: 'Learning content generated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate learning content',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
    const correct = quizAnswers.filter((answer, index) => 
      answer === learningData?.quiz[index].correctAnswer
    ).length;
    toast({
      title: 'Quiz Complete!',
      description: `You got ${correct} out of ${learningData?.quiz.length} correct`
    });
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
              <h1 className="text-2xl font-bold text-gray-900">Learning Mode</h1>
              <p className="text-sm text-gray-600">Understand your code with AI explanations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!learningData ? (
          <Card className="border border-gray-200 bg-white">
            <CardHeader>
              <CardTitle className="text-gray-900">Analyze Your Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your code here..."
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                rows={15}
                className="bg-white border-gray-300 font-mono"
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Analyze Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
              {['explanations', 'summary', 'quiz', 'viva'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 font-medium capitalize ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'explanations' && (
              <div className="space-y-4">
                {learningData.explanations.map((section, idx) => (
                  <Card key={idx} className="border border-gray-200 bg-white">
                    <CardHeader>
                      <CardTitle className="text-gray-900">{section.file}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {section.lines.map((line, lineIdx) => (
                        <div key={lineIdx} className="border-l-4 border-blue-600 pl-4">
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded mb-2">
                            <span className="text-gray-500 mr-2">{line.lineNumber}:</span>
                            {line.code}
                          </div>
                          <p className="text-gray-700">{line.explanation}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'summary' && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="pt-6">
                  <div className="prose max-w-none text-gray-700">
                    {learningData.summary}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {learningData.quiz.map((q, idx) => (
                  <Card key={idx} className="border border-gray-200 bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg text-gray-900">
                        Question {idx + 1}: {q.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[idx] = optIdx;
                            setQuizAnswers(newAnswers);
                          }}
                          disabled={showQuizResults}
                          className={`w-full text-left p-3 rounded border ${
                            showQuizResults
                              ? optIdx === q.correctAnswer
                                ? 'border-green-500 bg-green-50'
                                : quizAnswers[idx] === optIdx
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                              : quizAnswers[idx] === optIdx
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{option}</span>
                            {showQuizResults && optIdx === q.correctAnswer && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                            {showQuizResults && quizAnswers[idx] === optIdx && optIdx !== q.correctAnswer && (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
                {!showQuizResults && (
                  <Button
                    onClick={handleQuizSubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Submit Quiz
                  </Button>
                )}
              </div>
            )}

            {activeTab === 'viva' && (
              <Card className="border border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">Interview Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 list-decimal list-inside">
                    {learningData.vivaQuestions.map((q, idx) => (
                      <li key={idx} className="text-gray-700">{q}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
