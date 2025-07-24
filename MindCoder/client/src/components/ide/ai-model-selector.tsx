import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AIModel {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

interface AIModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  className?: string;
}

export function AIModelSelector({ selectedModel, onModelChange, className }: AIModelSelectorProps) {
  const { data: models = [], isLoading } = useQuery<AIModel[]>({
    queryKey: ["/api/ai/models"],
  });

  const getModelIcon = (modelId: string) => {
    switch (modelId) {
      case 'gemini':
        return <Sparkles className="w-4 h-4" />;
      case 'openai':
        return <Brain className="w-4 h-4" />;
      case 'anthropic':
        return <Zap className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const availableModels = models.filter(model => model.available);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 bg-gray-300 animate-pulse rounded" />
        <div className="w-20 h-4 bg-gray-300 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {getModelIcon(selectedModel)}
        <span className="text-sm font-medium">AI Model:</span>
      </div>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select AI model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center space-x-2">
                {getModelIcon(model.id)}
                <span>{model.name}</span>
                {model.id === 'gemini' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AIModelCard({ model, isSelected, onSelect }: {
  model: AIModel;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const getModelIcon = (modelId: string) => {
    switch (modelId) {
      case 'gemini':
        return <Sparkles className="w-6 h-6 text-blue-500" />;
      case 'openai':
        return <Brain className="w-6 h-6 text-green-500" />;
      case 'anthropic':
        return <Zap className="w-6 h-6 text-purple-500" />;
      default:
        return <Brain className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      } ${!model.available ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={model.available ? onSelect : undefined}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getModelIcon(model.id)}
            <CardTitle className="text-lg">{model.name}</CardTitle>
          </div>
          {model.available ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Available
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-500">
              Not Configured
            </Badge>
          )}
        </div>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      {isSelected && (
        <CardContent className="pt-0">
          <div className="text-sm text-blue-600 font-medium">
            ✓ Currently selected
          </div>
        </CardContent>
      )}
    </Card>
  );
}