import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, HelpCircle, LogOut } from 'lucide-react';
import ThreeJSVisualization from '@/components/ThreeJSVisualization';
import EconomicCharts from '@/components/EconomicCharts';
import RolePanel from '@/components/RolePanel';
import PolicyControls from '@/components/PolicyControls';
import TutorialSystem from '@/components/TutorialSystem';
import NotificationSystem from '@/components/NotificationSystem';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    isConnected, 
    marketState, 
    policyState, 
    sessionId, 
    role, 
    notifications,
    joinSession,
    switchRole,
    removeNotification
  } = useWebSocket();
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [simulationPeriod, setSimulationPeriod] = useState('2005-2009 Housing Crisis');

  useEffect(() => {
    // Auto-join or create session when component mounts
    if (isConnected && !sessionId) {
      const sessionName = `${user?.firstName || 'Student'}'s Session - ${new Date().toLocaleDateString()}`;
      joinSession(sessionName);
    }
  }, [isConnected, sessionId, user, joinSession]);

  const handleRoleSwitch = (newRole: string) => {
    switchRole(newRole);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName[0] || '') + (lastName[0] || '');
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return user.firstName || user.email || 'Student';
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Connecting to Simulation</h2>
            <p className="text-sm text-gray-600">
              Establishing real-time connection to the housing market simulator...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Housing Market Simulator</h1>
            </div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Simulating:</span>
              <span className="font-medium text-gray-900">{simulationPeriod}</span>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={role === 'homebuyer' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleRoleSwitch('homebuyer')}
                className={role === 'homebuyer' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                Homebuyer
              </Button>
              <Button
                variant={role === 'investor' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleRoleSwitch('investor')}
                className={role === 'investor' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                Investor
              </Button>
              <Button
                variant={role === 'regulator' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleRoleSwitch('regulator')}
                className={role === 'regulator' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                Regulator
              </Button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTutorial(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt="Profile" />
                  <AvatarFallback className="text-xs">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-900">{getDisplayName()}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen bg-bg-light pt-0">
        {/* Main Dashboard */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
            
            {/* Left Column - 3D Visualization and Charts */}
            <div className="lg:col-span-2 space-y-4">
              {/* 3D Visualization */}
              <Card className="shadow-sm border border-gray-200 h-96">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">3D Housing Market Visualization</CardTitle>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span className="text-gray-600">Supply</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-gray-600">Demand</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-danger rounded-full"></div>
                        <span className="text-gray-600">Bubble Risk</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-80 p-4">
                  <ThreeJSVisualization marketState={marketState} />
                </CardContent>
              </Card>

              {/* Economic Charts */}
              <EconomicCharts marketState={marketState} policyState={policyState} />
            </div>

            {/* Right Column - Role Panel */}
            <div className="space-y-4">
              <RolePanel role={role} marketState={marketState} />
            </div>
          </div>
        </main>

        {/* Policy Controls Sidebar (Regulator only) */}
        {role === 'regulator' && (
          <PolicyControls policyState={policyState} />
        )}
      </div>

      {/* Tutorial System */}
      {showTutorial && (
        <TutorialSystem 
          onClose={() => setShowTutorial(false)}
          currentRole={role}
        />
      )}

      {/* Notification System */}
      <NotificationSystem 
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}
