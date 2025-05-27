import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { calculateMortgagePayment, calculateAffordability, calculateDTI } from '@/lib/economicUtils';
import { 
  User, 
  TrendingUp, 
  Shield, 
  Home, 
  DollarSign, 
  Percent, 
  AlertTriangle,
  Info,
  Clock
} from 'lucide-react';

interface MarketState {
  medianPrice: number;
  priceGrowth: number;
  inventory: number;
  bubbleRisk: number;
  supplyLevel: number;
  demandLevel: number;
  priceToIncomeRatio: number;
  mortgageRate: number;
  unemploymentRate: number;
  housingStarts: number;
  foreclosureRate: number;
  timeStep: number;
}

interface RolePanelProps {
  role: string;
  marketState: MarketState | null;
}

function HomebuyerPanel({ marketState }: { marketState: MarketState | null }) {
  const { makePlayerAction } = useWebSocket();
  const [income, setIncome] = useState(75000);
  const [downPayment, setDownPayment] = useState([10]);
  const [targetPrice, setTargetPrice] = useState(300000);

  if (!marketState) return <div>Loading...</div>;

  const affordability = calculateAffordability(income, marketState.mortgageRate, downPayment[0]);
  const monthlyPayment = calculateMortgagePayment(targetPrice, marketState.mortgageRate, downPayment[0]);
  const dtiRatio = calculateDTI(monthlyPayment, income);

  const handlePurchaseDecision = () => {
    makePlayerAction('purchase', {
      price: targetPrice,
      income,
      downPayment: downPayment[0],
      mortgageRate: marketState.mortgageRate,
    });
  };

  const handleWaitDecision = () => {
    makePlayerAction('wait', {
      reason: 'market_uncertainty',
      currentPrice: marketState.medianPrice,
    });
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Homebuyer Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Income Input */}
          <div className="space-y-2">
            <Label htmlFor="income">Annual Income</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="income"
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="pl-10"
                placeholder="75000"
              />
            </div>
          </div>

          {/* Down Payment Slider */}
          <div className="space-y-3">
            <Label>Down Payment: {downPayment[0]}%</Label>
            <Slider
              value={downPayment}
              onValueChange={setDownPayment}
              max={30}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Purchase Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="targetPrice"
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="pl-10"
                placeholder="300000"
              />
            </div>
          </div>

          {/* Affordability Analysis */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Affordability Analysis</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Max Purchase Price:</span>
                  <span className="font-semibold text-gray-900">
                    ${affordability.maxPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="font-semibold text-gray-900">
                    ${monthlyPayment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">DTI Ratio:</span>
                  <Badge variant={dtiRatio > 43 ? "destructive" : dtiRatio > 36 ? "secondary" : "default"}>
                    {dtiRatio.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Down Payment Amount:</span>
                  <span className="font-semibold text-gray-900">
                    ${(targetPrice * downPayment[0] / 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Decision Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handlePurchaseDecision}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={dtiRatio > 43}
            >
              <Home className="w-4 h-4 mr-2" />
              Make Purchase Decision
            </Button>
            <Button 
              onClick={handleWaitDecision}
              variant="outline"
              className="w-full"
            >
              <Clock className="w-4 h-4 mr-2" />
              Wait for Better Conditions
            </Button>
          </div>

          {/* Risk Warning */}
          {(dtiRatio > 36 || marketState.bubbleRisk > 60) && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Risk Warning</div>
                    <div className="text-xs text-yellow-700 mt-1">
                      {dtiRatio > 36 && "High debt-to-income ratio increases financial risk. "}
                      {marketState.bubbleRisk > 60 && "Current market conditions show elevated bubble risk."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Market Context */}
      <MarketIndicatorsCard marketState={marketState} />
    </div>
  );
}

function InvestorPanel({ marketState }: { marketState: MarketState | null }) {
  const { makePlayerAction } = useWebSocket();
  const [propertyCount, setPropertyCount] = useState([5]);
  const [leverageRatio, setLeverageRatio] = useState([80]);
  const [investmentStrategy, setInvestmentStrategy] = useState('buy_hold');

  if (!marketState) return <div>Loading...</div>;

  const totalInvestment = propertyCount[0] * marketState.medianPrice;
  const equityRequired = totalInvestment * (100 - leverageRatio[0]) / 100;
  const expectedReturn = marketState.priceGrowth * propertyCount[0] * 0.8; // 80% capture rate

  const handleInvestmentAction = () => {
    makePlayerAction('buy_properties', {
      quantity: propertyCount[0],
      leverage: leverageRatio[0],
      strategy: investmentStrategy,
      totalValue: totalInvestment,
    });
  };

  const handleSecuritizeAction = () => {
    makePlayerAction('securitize', {
      propertyCount: propertyCount[0],
      bundleSize: Math.min(propertyCount[0], 100),
      riskRating: 'AAA', // Simplified for educational purposes
    });
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Investor Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property Count */}
          <div className="space-y-3">
            <Label>Properties to Purchase: {propertyCount[0]}</Label>
            <Slider
              value={propertyCount}
              onValueChange={setPropertyCount}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>50</span>
            </div>
          </div>

          {/* Leverage Ratio */}
          <div className="space-y-3">
            <Label>Leverage Ratio: {leverageRatio[0]}%</Label>
            <Slider
              value={leverageRatio}
              onValueChange={setLeverageRatio}
              max={95}
              min={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Investment Analysis */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Investment Analysis</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Investment:</span>
                  <span className="font-semibold text-gray-900">
                    ${totalInvestment.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Equity Required:</span>
                  <span className="font-semibold text-gray-900">
                    ${equityRequired.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected Annual Return:</span>
                  <Badge variant={expectedReturn > 15 ? "default" : expectedReturn > 8 ? "secondary" : "destructive"}>
                    {expectedReturn.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Level:</span>
                  <Badge variant={leverageRatio[0] > 85 ? "destructive" : leverageRatio[0] > 70 ? "secondary" : "default"}>
                    {leverageRatio[0] > 85 ? "High" : leverageRatio[0] > 70 ? "Medium" : "Low"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={handleInvestmentAction}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Execute Investment Strategy
            </Button>
            <Button 
              onClick={handleSecuritizeAction}
              variant="outline"
              className="w-full"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Securitize Mortgages
            </Button>
          </div>

          {/* Market Risk Warning */}
          {(leverageRatio[0] > 85 || marketState.bubbleRisk > 70) && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">High Risk Investment</div>
                    <div className="text-xs text-red-700 mt-1">
                      {leverageRatio[0] > 85 && "High leverage increases downside risk. "}
                      {marketState.bubbleRisk > 70 && "Market bubble conditions suggest caution."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Market Context */}
      <MarketIndicatorsCard marketState={marketState} />
    </div>
  );
}

function RegulatorPanel({ marketState }: { marketState: MarketState | null }) {
  const { makePlayerAction } = useWebSocket();
  
  if (!marketState) return <div>Loading...</div>;

  const handleEmergencyAction = (actionType: string) => {
    makePlayerAction(actionType, {
      reason: 'market_stability',
      marketState: marketState,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Regulator Dashboard</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Market Health Overview */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Market Health Assessment</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {marketState.bubbleRisk.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-600">Bubble Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {marketState.priceToIncomeRatio.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">P/I Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {marketState.foreclosureRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-600">Foreclosure Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {marketState.inventory.toFixed(1)}mo
                  </div>
                  <div className="text-xs text-gray-600">Inventory</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Emergency Actions</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={() => handleEmergencyAction('emergency_rate_cut')}
                variant="outline"
                size="sm"
                disabled={marketState.mortgageRate < 1}
              >
                Emergency Rate Cut (-0.5%)
              </Button>
              <Button 
                onClick={() => handleEmergencyAction('tighten_lending')}
                variant="outline"
                size="sm"
              >
                Tighten Lending Standards
              </Button>
              <Button 
                onClick={() => handleEmergencyAction('bank_supervision')}
                variant="outline"
                size="sm"
              >
                Increase Bank Supervision
              </Button>
            </div>
          </div>

          {/* Policy Impact Preview */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-900 mb-3">Current Policy Stance</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monetary Policy:</span>
                  <Badge variant={marketState.mortgageRate > 6 ? "destructive" : marketState.mortgageRate > 4 ? "secondary" : "default"}>
                    {marketState.mortgageRate > 6 ? "Restrictive" : marketState.mortgageRate > 4 ? "Neutral" : "Accommodative"}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Market Intervention:</span>
                  <Badge variant="secondary">
                    {marketState.bubbleRisk > 60 ? "Needed" : "Monitoring"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Alerts */}
          {marketState.bubbleRisk > 70 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">Market Alert</div>
                    <div className="text-xs text-red-700 mt-1">
                      Bubble risk indicators suggest immediate policy intervention may be required.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Historical Context */}
      <HistoricalContextCard marketState={marketState} />
    </div>
  );
}

function MarketIndicatorsCard({ marketState }: { marketState: MarketState }) {
  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Key Economic Indicators</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Federal Funds Rate</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {marketState.mortgageRate.toFixed(2)}%
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Unemployment Rate</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {marketState.unemploymentRate.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Housing Starts</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {(marketState.housingStarts / 1000000).toFixed(1)}M
            </Badge>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Foreclosure Rate</span>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={marketState.foreclosureRate > 2 ? "destructive" : "outline"}
              className="text-xs"
            >
              {marketState.foreclosureRate.toFixed(2)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoricalContextCard({ marketState }: { marketState: MarketState }) {
  const getCurrentPeriod = () => {
    const year = 2005 + Math.floor(marketState.timeStep / 4);
    const quarter = (marketState.timeStep % 4) + 1;
    return { year, quarter };
  };

  const { year, quarter } = getCurrentPeriod();

  const getHistoricalContext = () => {
    if (year <= 2005) return "Pre-crisis period: Easy credit conditions";
    if (year <= 2006) return "Bubble formation: Rapid price appreciation";
    if (year <= 2007) return "Peak and early warning signs";
    if (year <= 2008) return "Crisis unfolds: Market collapse begins";
    return "Recovery period: Policy interventions active";
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Historical Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-yellow-800">
                {year} Q{quarter}
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                {getHistoricalContext()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Key Metrics vs 2008 Crisis:</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Bubble Risk:</span>
              <span className={marketState.bubbleRisk > 70 ? "text-red-600 font-medium" : "text-gray-900"}>
                {marketState.bubbleRisk.toFixed(0)}% vs 85% (2007 peak)
              </span>
            </div>
            <div className="flex justify-between">
              <span>P/I Ratio:</span>
              <span className={marketState.priceToIncomeRatio > 5 ? "text-red-600 font-medium" : "text-gray-900"}>
                {marketState.priceToIncomeRatio.toFixed(1)} vs 5.8 (2006 peak)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RolePanel({ role, marketState }: RolePanelProps) {
  if (!marketState) {
    return (
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  switch (role) {
    case 'homebuyer':
      return <HomebuyerPanel marketState={marketState} />;
    case 'investor':
      return <InvestorPanel marketState={marketState} />;
    case 'regulator':
      return <RegulatorPanel marketState={marketState} />;
    default:
      return <HomebuyerPanel marketState={marketState} />;
  }
}
