import { chatWithAIModel } from './aiService.js';

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

export async function analyzeProjectIdea(idea: string, model: string = 'together'): Promise<ResearchResult> {
  const researchPrompt = `You are an expert software architect and technology consultant. Analyze the following project idea and provide comprehensive research:

PROJECT IDEA:
${idea}

Provide a detailed analysis in the following JSON format:
{
  "overview": "A comprehensive 2-3 sentence overview of the project",
  "keyFeatures": ["feature1", "feature2", ...] (5-8 key features),
  "techStack": ["tech1", "tech2", ...] (recommended technologies),
  "architecture": "Detailed architecture description with layers and components",
  "bestPractices": ["practice1", "practice2", ...] (5-7 best practices),
  "challenges": ["challenge1", "challenge2", ...] (3-5 potential challenges),
  "recommendations": ["rec1", "rec2", ...] (3-5 AI recommendations),
  "estimatedComplexity": "Simple" | "Medium" | "Complex",
  "estimatedTime": "estimated development time (e.g., '2-3 weeks')"
}

Be specific, practical, and focus on modern best practices. Ensure all arrays have meaningful, detailed items.`;

  try {
    const response = await chatWithAIModel({
      message: researchPrompt,
      model: model as any,
      chatHistory: [],
      projectContext: {}
    });

    // Parse the AI response
    let parsedResult: any;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to a structured response
      parsedResult = {
        overview: response.content.substring(0, 300),
        keyFeatures: ['Feature extraction from AI response'],
        techStack: ['React', 'Node.js', 'MongoDB'],
        architecture: 'Standard three-tier architecture',
        bestPractices: ['Follow SOLID principles', 'Write tests', 'Use version control'],
        challenges: ['Scalability', 'Security', 'Performance'],
        recommendations: ['Start with MVP', 'Iterate based on feedback'],
        estimatedComplexity: 'Medium' as const,
        estimatedTime: '4-6 weeks'
      };
    }

    // Generate DevMindX prompt
    const devmindxPrompt = generateDevMindXPrompt(idea, parsedResult);

    return {
      ...parsedResult,
      devmindxPrompt
    };
  } catch (error) {
    console.error('Research analysis error:', error);
    throw new Error('Failed to analyze project idea');
  }
}

function generateDevMindXPrompt(idea: string, analysis: any): string {
  return `Create a ${analysis.estimatedComplexity.toLowerCase()} complexity project: ${idea}

TECHNICAL REQUIREMENTS:
- Tech Stack: ${analysis.techStack.join(', ')}
- Architecture: ${analysis.architecture}

KEY FEATURES TO IMPLEMENT:
${analysis.keyFeatures.map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

BEST PRACTICES TO FOLLOW:
${analysis.bestPractices.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

IMPLEMENTATION GUIDELINES:
- Follow modern development standards
- Include proper error handling
- Add comprehensive comments
- Ensure code is production-ready
- Implement responsive design
- Add security measures

Please generate a complete, working project with all necessary files, configurations, and documentation.`;
}
