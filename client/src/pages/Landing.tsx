import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, Users, Brain, BookOpen, BarChart3 } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Housing Market Simulator</h1>
                <p className="text-sm text-gray-600">Educational Economics Platform</p>
              </div>
            </div>
            <Button onClick={handleLogin} size="lg" className="bg-primary hover:bg-primary/90">
              Sign In to Start Learning
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Experience the
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> 2008 Housing Crisis </span>
            Through Interactive Simulation
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Step into the shoes of homebuyers, investors, and regulators to understand the complex dynamics 
            that led to one of the most significant economic events in modern history.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">Three Distinct Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Play as a homebuyer making purchase decisions, an investor seeking profits, 
                  or a regulator setting policies to maintain market stability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Real-Time Economics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Watch supply and demand curves shift in real-time based on your decisions. 
                  See immediate cause-and-effect relationships in the housing market.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Learn by Doing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Compare your decisions with actual Federal Reserve actions. 
                  Understand the complexity of economic policy through hands-on experience.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Educational Features
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for modern classrooms with comprehensive analytics and real-time collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">3D Market Visualization</h4>
                <p className="text-gray-600">Interactive Three.js visualizations show market dynamics in real-time with WebGPU acceleration.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Historical Context</h4>
                <p className="text-gray-600">Compare current simulation state with actual 2008 crisis timeline and Federal Reserve actions.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Classroom Analytics</h4>
                <p className="text-gray-600">Teachers get comprehensive dashboards showing student decisions and learning progress.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Policy Controls</h4>
                <p className="text-gray-600">Regulators can adjust interest rates, lending standards, and capital requirements in real-time.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">AI Tutorial System</h4>
                <p className="text-gray-600">Guided walkthroughs adapt to student knowledge level and provide contextual explanations.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile Responsive</h4>
                <p className="text-gray-600">Optimized for tablets and mobile devices with touch-friendly controls for classroom use.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Experience Economic History?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already learning through simulation-based economics education.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Your Simulation Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Built for educational purposes • Simulating the 2008 Housing Crisis • 
            <span className="font-semibold"> Interactive Economics Learning Platform</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
