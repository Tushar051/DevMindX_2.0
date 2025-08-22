import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, Copy, CheckCircle, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { collaborationApi } from '@/lib/api';

interface CollaborationLandingProps {
  inviteCode: string;
  onJoinSession: () => void;
}

export default function CollaborationLanding({ inviteCode, onJoinSession }: CollaborationLandingProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSessionInfo();
  }, [inviteCode]);

  const fetchSessionInfo = async () => {
    try {
      const response = await collaborationApi.getSessionByInvite(inviteCode);
      if (response.success) {
        setSessionInfo(response.session);
      }
    } catch (error) {
      console.error('Error fetching session info:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast({
      title: 'Invite Code Copied',
      description: 'Invite code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSession = () => {
    // Store invite code and redirect to IDE
    localStorage.setItem('pendingCollaborationInvite', inviteCode);
    onJoinSession();
  };

  const handleLogin = () => {
    // Store invite code and redirect to login
    localStorage.setItem('pendingCollaborationInvite', inviteCode);
    window.location.href = '/login';
  };

  const handleSignup = () => {
    // Store invite code and redirect to signup
    localStorage.setItem('pendingCollaborationInvite', inviteCode);
    window.location.href = '/signup';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration session...</p>
        </div>
      </div>
    );
  }

  if (!sessionInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Session Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The collaboration session you're looking for doesn't exist or has expired.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to IDE
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Join Collaboration Session
          </CardTitle>
          <p className="text-gray-600 mt-2">
            You've been invited to join a live collaboration session
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Session Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Session Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Session Name:</span>
                <span className="font-medium">{sessionInfo.sessionName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Host:</span>
                <span className="font-medium">{sessionInfo.hostUsername}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participants:</span>
                <span className="font-medium">
                  {sessionInfo.participants}/{sessionInfo.maxParticipants}
                </span>
              </div>
            </div>
          </div>

          {/* Invite Code */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Invite Code</p>
                <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {inviteCode}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteCode}
                className="ml-4"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Join Button or Auth Buttons */}
          {isAuthenticated ? (
            <Button
              onClick={handleJoinSession}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Join Session
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="text-center text-sm text-gray-600 mb-4">
                <p>You need to be logged in to join this collaboration session.</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleLogin}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={handleSignup}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">What you can do:</p>
            <div className="flex justify-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>Real-time collaboration</span>
              </div>
              <div className="flex items-center">
                <span>💬</span>
                <span>Live chat</span>
              </div>
              <div className="flex items-center">
                <span>📝</span>
                <span>File editing</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
