import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  TrendingUp, 
  Shield,
  Home,
  DollarSign,
  BarChart3,
  Lightbulb,
  CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  role?: string;
  icon: React.ReactNode;
  highlights?: string[];
  actionText?: string;
  nextAction?: () => void;
}

interface TutorialSystemProps {
  onClose: () => void;
  currentRole: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Housing Market Simulator',
    content: 'You\'re about to experience the 2008 housing crisis through interactive simulation. This educational platform lets you make real economic decisions and see their consequences.',
    icon: <BookOpen className="w-6 h-6" />,
    highlights: ['Interactive learning', 'Real economic data', 'Historical comparison'],
    actionText: 'Begin Learning Journey'
  },
  {
    id: 'roles',
    title: 'Choose Your Market Role',
    content: 'Select between three distinct perspectives: Homebuyer (making purchase decisions), Investor (seeking profits), or Regulator (maintaining stability). Each role has unique tools and responsibilities.',
    icon: <User className="w-6 h-6" />,
    highlights: ['Homebuyer', 'Investor', 'Regulator'],
    actionText: 'Explore Roles'
  },
  {
    id: 'homebuyer',
    title: 'Homebuyer: Making Smart Decisions',
    content: 'As a homebuyer, you\'ll evaluate affordability, calculate debt-to-income ratios, and decide when to buy or wait. Consider your income, down payment, and current market conditions.',
    role: 'homebuyer',
    icon: <Home className="w-6 h-6" />,
    highlights: ['Affordability calculator', 'DTI ratio analysis', 'Market timing'],
    actionText: 'Try Homebuying Tools'
  },
  {
    id: 'investor',
    title: 'Investor: Building Wealth Through Real Estate',
    content: 'Investors use leverage, analyze returns, and bundle mortgages into securities. Your decisions affect market liquidity and can contribute to bubble formation.',
    role: 'investor',
    icon: <TrendingUp className="w-6 h-6" />,
    highlights: ['Leverage strategies', 'Return analysis', 'Securitization'],
    actionText: 'Explore Investment Tools'
  },
  {
    id: 'regulator',
    title: 'Regulator: Maintaining Market Stability',
    content: 'Set interest rates, adjust lending standards, and implement capital requirements. Your policies affect the entire economy and can prevent or mitigate financial crises.',
    role: 'regulator',
    icon: <Shield className="w-6 h-6" />,
    highlights: ['Interest rate policy', 'Lending standards', 'Bank supervision'],
    actionText: 'Access Policy Controls'
  },
  {
    id: 'visualization',
    title: 'Understanding Market Dynamics',
    content: 'The 3D visualization shows supply and demand in real-time. Watch how your decisions affect housing inventory, prices, and bubble risk. Charts display economic indicators and trends.',
    icon: <BarChart3 className="w-6 h-6" />,
    highlights: ['3D market view', 'Real-time charts', 'Bubble risk meter'],
    actionText: 'Explore Visualizations'
  },
  {
    id: 'historical',
    title: 'Learning from History',
    content: 'Compare your decisions with actual Federal Reserve actions during 2005-2009. See how different choices might have changed the outcome of the housing crisis.',
    icon: <Lightbulb className="w-6 h-6" />,
    highlights: ['Historical comparison', '2008 crisis timeline', 'Fed decisions'],
    actionText: 'View Historical Data'
  },
  {
    id: 'collaborative',
    title: 'Collaborative Learning',
    content: 'Join classroom sessions where multiple students can make decisions simultaneously. Teachers can track progress and export data for analysis and discussion.',
    icon: <User className="w-6 h-6" />,
    highlights: ['Multi-player sessions', 'Teacher dashboard', 'Exportable data'],
    actionText: 'Start Collaborating'
  },
  {
    id: 'ready',
    title: 'Ready to Begin!',
    content: 'You now understand the basics. Start making decisions, watch the market respond, and learn through experience. Remember: every choice has consequences in economic systems.',
    icon: <CheckCircle className="w-6 h-6" />,
    highlights: ['Make decisions', 'Observe consequences', 'Learn by doing'],
    actionText: 'Start Simulation'
  }
];

export default function TutorialSystem({ onClose, currentRole }: TutorialSystemProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(step.id)));
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const isRoleSpecificStep = step.role && step.role !== currentRole;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{step.title}</CardTitle>
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Main Content */}
          <div className="space-y-4">
            <div className="text-gray-700 leading-relaxed">
              {step.content}
            </div>

            {/* Role-specific notice */}
            {isRoleSpecificStep && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-yellow-800">
                        Role-Specific Content
                      </div>
                      <div className="text-sm text-yellow-700 mt-1">
                        This tutorial step is for the {step.role} role. Switch roles to see this content in action.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Highlights */}
            {step.highlights && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Key Features:</div>
                <div className="flex flex-wrap gap-2">
                  {step.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Elements Based on Step */}
            {step.id === 'roles' && (
              <div className="grid grid-cols-3 gap-3">
                <Card className={`cursor-pointer transition-all ${currentRole === 'homebuyer' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4 text-center">
                    <Home className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">Homebuyer</div>
                    <div className="text-xs text-gray-500">Make purchase decisions</div>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${currentRole === 'investor' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">Investor</div>
                    <div className="text-xs text-gray-500">Build wealth strategies</div>
                  </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-all ${currentRole === 'regulator' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
                  <CardContent className="p-4 text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">Regulator</div>
                    <div className="text-xs text-gray-500">Set market policies</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step.id === 'visualization' && (
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium text-blue-900 mb-1">
                      Interactive 3D Market View
                    </div>
                    <div className="text-xs text-blue-700">
                      Real-time supply, demand, and risk visualization
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Step Navigation Dots */}
          <div className="flex justify-center space-x-1">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-primary' 
                    : completedSteps.has(tutorialSteps[index].id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} of {tutorialSteps.length}
            </div>

            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Start Simulation
                </>
              ) : (
                <>
                  {step.actionText || 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Tutorial Option */}
          <div className="text-center pt-2">
            <Button variant="link" size="sm" onClick={onClose} className="text-gray-500">
              Skip tutorial and start exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
