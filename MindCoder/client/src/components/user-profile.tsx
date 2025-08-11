import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User, Code, Settings } from "lucide-react";

export function UserProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  // Generate initials for avatar fallback
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'; // Default to 'U' for User if name is not available
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        className="flex items-center space-x-2 px-2 py-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
          <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:inline">{user.username}</span>
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-72 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} />
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user.username}</CardTitle>
                <CardDescription className="text-xs truncate">{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm">Account ID: {user.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Active Session
                </Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch space-y-2 pt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => navigate('/ide')}
            >
              <Code className="h-4 w-4 mr-2" />
              Go to IDE
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start"
              onClick={() => { navigate('/account'); setIsOpen(false); }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}