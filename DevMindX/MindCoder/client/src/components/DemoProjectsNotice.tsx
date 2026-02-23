import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Folder } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DemoProjectsNotice() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-300 mb-2">
            🚧 AI Generation Currently in Progress
          </h4>
          <p className="text-xs text-gray-300 mb-2">
            Custom project generation is being set up. Meanwhile, you can try our demo projects!
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-2.5 mb-3">
            <p className="text-xs text-blue-300 font-medium mb-1">
              💡 How to generate demo projects:
            </p>
            <p className="text-xs text-gray-300">
              Type one of these keywords in the "Describe Your Project" field above:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <code className="text-xs bg-gray-800/50 text-green-400 px-2 py-0.5 rounded">demo snake</code>
              <code className="text-xs bg-gray-800/50 text-green-400 px-2 py-0.5 rounded">demo todo</code>
              <code className="text-xs bg-gray-800/50 text-green-400 px-2 py-0.5 rounded">demo weather</code>
              <code className="text-xs bg-gray-800/50 text-green-400 px-2 py-0.5 rounded">demo ecommerce</code>
              <code className="text-xs bg-gray-800/50 text-green-400 px-2 py-0.5 rounded">demo social</code>
            </div>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Available demo projects:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Badge variant="outline" className="justify-center py-1.5 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
              🐍 Snake Game
            </Badge>
            <Badge variant="outline" className="justify-center py-1.5 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
              ✅ Todo App
            </Badge>
            <Badge variant="outline" className="justify-center py-1.5 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
              🌤️ Weather Dashboard
            </Badge>
            <Badge variant="outline" className="justify-center py-1.5 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10">
              🛒 E-commerce
            </Badge>
            <Badge variant="outline" className="justify-center py-1.5 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10 col-span-2">
              💬 Social App
            </Badge>
          </div>
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            size="sm"
            className="w-full mt-3 border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            <Folder className="w-4 h-4 mr-2" />
            Or Browse All Demo Projects
          </Button>
        </div>
      </div>
    </div>
  );
}
