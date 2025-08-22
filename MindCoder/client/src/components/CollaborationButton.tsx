import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Copy, X, Circle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { collaborationApi } from '@/lib/api';
import CollaborationPanel from './CollaborationPanel';

export default function CollaborationButton() {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [collaborationUrl, setCollaborationUrl] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [pendingInvite, setPendingInvite] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  // Check for invite code in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    
    if (inviteCode && !isCollaborating) {
      // Store invite code in localStorage for persistence
      localStorage.setItem('pendingCollaborationInvite', inviteCode);
      setPendingInvite(inviteCode);
      checkInviteCode(inviteCode);
      
      // Clean up URL parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('invite');
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      // Check localStorage for pending invite
      const storedInvite = localStorage.getItem('pendingCollaborationInvite');
      if (storedInvite && !isCollaborating) {
        setPendingInvite(storedInvite);
        checkInviteCode(storedInvite);
      }
    }
  }, [isCollaborating]);

  const checkInviteCode = async (code: string) => {
    try {
      const response = await collaborationApi.getSessionByInvite(code);
      if (response.success) {
        setSessionInfo(response.session);
        setInviteCode(code);
        
        // Automatically open join dialog if coming from collaboration link
        if (pendingInvite) {
          setShowJoinDialog(true);
          toast({
            title: 'Invitation Found',
            description: `You've been invited to join "${response.session.sessionName}". Please join the session to start collaborating!`,
          });
        }
      }
    } catch (error) {
      console.error('Error checking invite code:', error);
      toast({
        title: 'Error',
        description: 'Invalid or expired invite code',
        variant: 'destructive',
      });
    }
  };

  const createSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a session name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await collaborationApi.createSession(
        'current-project',
        sessionName
      );

      if (response.success) {
        setCollaborationUrl(response.collaborationUrl);
        setCurrentSession(response.invite);
        setInviteCode(response.inviteCode);
        setIsCollaborating(true);
        setIsHost(true);
        setShowCreateDialog(false);
        setParticipants([{
          userId: user?.id,
          username: user?.username,
          isOnline: true,
          color: '#FF6B6B'
        }]);
        toast({
          title: 'Session Created',
          description: 'Collaboration session is now active',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create collaboration session',
        variant: 'destructive',
      });
    }
  };

  const joinSession = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an invite code',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await collaborationApi.joinSession(inviteCode);
      
      if (response.success) {
        setCurrentSession(response.session);
        setIsCollaborating(true);
        setIsHost(false);
        setShowJoinDialog(false);
        setParticipants(response.session.participants || []);
        
        // Clear pending invite from localStorage
        localStorage.removeItem('pendingCollaborationInvite');
        setPendingInvite(null);
        
        toast({
          title: 'Joined Session',
          description: `Joined ${response.session.sessionName}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join collaboration session',
        variant: 'destructive',
      });
    }
  };

  const endSession = async () => {
    try {
      setIsCollaborating(false);
      setIsHost(false);
      setCollaborationUrl('');
      setCurrentSession(null);
      setParticipants([]);
      setSessionInfo(null);
      setInviteCode('');
      
      // Clear any pending invites
      localStorage.removeItem('pendingCollaborationInvite');
      setPendingInvite(null);
      
      toast({
        title: 'Session Ended',
        description: 'Collaboration session has been ended',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  };

  const copyCollaborationUrl = () => {
    if (collaborationUrl) {
      navigator.clipboard.writeText(collaborationUrl);
      toast({
        title: 'URL Copied',
        description: 'Collaboration URL copied to clipboard',
      });
    }
  };

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast({
        title: 'Invite Code Copied',
        description: 'Invite code copied to clipboard',
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setShowCreateDialog(true)}
          className={`flex items-center space-x-2 ${
            isCollaborating 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={isCollaborating}
        >
          <Users className="w-4 h-4" />
          <span>{isCollaborating ? 'Collaborating' : 'Live Collaboration'}</span>
          {isCollaborating && <Circle className="w-2 h-2 animate-pulse" />}
        </Button>

        {!isCollaborating && (
          <Button
            variant="outline"
            onClick={() => setShowJoinDialog(true)}
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Join</span>
          </Button>
        )}

        {isCollaborating && isHost && (
          <Button
            variant="outline"
            onClick={endSession}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
            <span>End</span>
          </Button>
        )}

                 {isCollaborating && collaborationUrl && (
           <Button
             variant="outline"
             onClick={copyCollaborationUrl}
             className="flex items-center space-x-2"
           >
             <Copy className="w-4 h-4" />
             <span>Copy Link</span>
           </Button>
         )}

         {isCollaborating && inviteCode && (
           <Button
             variant="outline"
             onClick={copyInviteCode}
             className="flex items-center space-x-2"
           >
             <Copy className="w-4 h-4" />
             <span>Copy Code</span>
           </Button>
                  )}
       </div>

       {/* Collaboration Panel */}
       <CollaborationPanel
         isCollaborating={isCollaborating}
         session={currentSession}
         participants={participants}
         onEndSession={endSession}
       />

       {/* Create Session Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Live Collaboration Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Session Name</label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name"
                className="mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={createSession} className="flex-1">
                Create Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

             {/* Join Session Dialog */}
       <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Join Live Collaboration Session</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             {sessionInfo && (
               <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                 <div className="flex items-center space-x-2 mb-2">
                   <AlertCircle className="w-4 h-4 text-blue-600" />
                   <span className="text-sm font-medium text-blue-800">Session Information</span>
                 </div>
                 <div className="text-sm text-blue-700">
                   <p><strong>Session:</strong> {sessionInfo.sessionName}</p>
                   <p><strong>Host:</strong> {sessionInfo.hostUsername}</p>
                   <p><strong>Participants:</strong> {sessionInfo.participants}/{sessionInfo.maxParticipants}</p>
                 </div>
               </div>
             )}
             <div>
               <label className="text-sm font-medium">Invite Code</label>
               <Input
                 value={inviteCode}
                 onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                 placeholder="Enter invite code"
                 className="mt-1"
               />
             </div>
             <div className="flex space-x-2">
               <Button onClick={joinSession} className="flex-1">
                 Join Session
               </Button>
               <Button
                 variant="outline"
                 onClick={() => {
                   setShowJoinDialog(false);
                   setSessionInfo(null);
                   setInviteCode('');
                 }}
                 className="flex-1"
               >
                 Cancel
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
    </>
  );
}
