import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Settings, 
  TrendingDown, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';

interface PolicyState {
  fedRate: number;
  maxLTV: number;
  capitalRequirements: number;
  stressTesting: boolean;
  regulatoryStrength: number;
}

interface PolicyControlsProps {
  policyState: PolicyState | null;
}

export default function PolicyControls({ policyState }: PolicyControlsProps) {
  const { makePlayerAction } = useWebSocket();
  
  // Local state for policy adjustments
  const [localFedRate, setLocalFedRate] = useState([2.25]);
  const [localMaxLTV, setLocalMaxLTV] = useState([95]);
  const [localCapitalReq, setLocalCapitalReq] = useState([8]);
  const [localStressTesting, setLocalStressTesting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when policy state changes
  useEffect(() => {
    if (policyState) {
      setLocalFedRate([policyState.fedRate]);
      setLocalMaxLTV([policyState.maxLTV]);
      setLocalCapitalReq([policyState.capitalRequirements]);
      setLocalStressTesting(policyState.stressTesting);
      setHasChanges(false);
    }
  }, [policyState]);

  // Track changes
  useEffect(() => {
    if (!policyState) return;
    
    const changed = 
      Math.abs(localFedRate[0] - policyState.fedRate) > 0.01 ||
      Math.abs(localMaxLTV[0] - policyState.maxLTV) > 0 ||
      Math.abs(localCapitalReq[0] - policyState.capitalRequirements) > 0 ||
      localStressTesting !== policyState.stressTesting;
    
    setHasChanges(changed);
  }, [localFedRate, localMaxLTV, localCapitalReq, localStressTesting, policyState]);

  const handleApplyChanges = () => {
    if (!hasChanges) return;

    // Apply Fed Rate change
    if (Math.abs(localFedRate[0] - (policyState?.fedRate || 0)) > 0.01) {
      makePlayerAction('set_fed_rate', {
        rate: localFedRate[0],
        previousRate: policyState?.fedRate || 0,
      });
    }

    // Apply LTV change
    if (Math.abs(localMaxLTV[0] - (policyState?.maxLTV || 0)) > 0) {
      makePlayerAction('set_ltv_limit', {
        maxLTV: localMaxLTV[0],
        previousLTV: policyState?.maxLTV || 0,
      });
    }

    // Apply capital requirements change
    if (Math.abs(localCapitalReq[0] - (policyState?.capitalRequirements || 0)) > 0) {
      makePlayerAction('set_capital_requirements', {
        requirement: localCapitalReq[0],
        previousRequirement: policyState?.capitalRequirements || 0,
      });
    }

    // Apply stress testing change
    if (localStressTesting !== (policyState?.stressTesting || false)) {
      makePlayerAction('require_stress_testing', {
        enabled: localStressTesting,
        previousState: policyState?.stressTesting || false,
      });
    }
  };

  const getFedRateImpact = () => {
    if (!policyState) return "Unknown";
    const change = localFedRate[0] - policyState.fedRate;
    if (Math.abs(change) < 0.1) return "No change";
    if (change > 0) return "Cooling effect";
    return "Stimulative effect";
  };

  const getLTVImpact = () => {
    if (!policyState) return "Unknown";
    const change = localMaxLTV[0] - policyState.maxLTV;
    if (change === 0) return "No change";
    if (change > 0) return "Increased credit access";
    return "Reduced credit risk";
  };

  const getCapitalImpact = () => {
    if (!policyState) return "Unknown";
    const change = localCapitalReq[0] - policyState.capitalRequirements;
    if (change === 0) return "No change";
    if (change > 0) return "Increased bank stability";
    return "Reduced lending capacity";
  };

  if (!policyState) {
    return (
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Policy Controls</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Adjust regulatory parameters</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Federal Funds Rate Control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Federal Funds Rate
          </Label>
          <div className="space-y-2">
            <Slider
              value={localFedRate}
              onValueChange={setLocalFedRate}
              max={10}
              min={0}
              step={0.25}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="font-medium text-gray-900">
                {localFedRate[0].toFixed(2)}%
              </span>
              <span>10%</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Impact: <span className="font-medium">{getFedRateImpact()}</span>
          </div>
        </div>

        <Separator />

        {/* LTV Ratio Control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Max Loan-to-Value Ratio
          </Label>
          <div className="space-y-2">
            <Slider
              value={localMaxLTV}
              onValueChange={setLocalMaxLTV}
              max={100}
              min={70}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>70%</span>
              <span className="font-medium text-gray-900">
                {localMaxLTV[0]}%
              </span>
              <span>100%</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Impact: <span className="font-medium">{getLTVImpact()}</span>
          </div>
        </div>

        <Separator />

        {/* Capital Requirements */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">
            Bank Capital Requirements
          </Label>
          <div className="space-y-2">
            <Slider
              value={localCapitalReq}
              onValueChange={setLocalCapitalReq}
              max={15}
              min={6}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>6%</span>
              <span className="font-medium text-gray-900">
                {localCapitalReq[0].toFixed(1)}%
              </span>
              <span>15%</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Impact: <span className="font-medium">{getCapitalImpact()}</span>
          </div>
        </div>

        <Separator />

        {/* Stress Testing Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">
              Mandatory Stress Testing
            </Label>
            <Switch
              checked={localStressTesting}
              onCheckedChange={setLocalStressTesting}
            />
          </div>
          <div className="text-xs text-gray-600">
            {localStressTesting 
              ? "Banks required to pass stress tests" 
              : "No mandatory stress testing"}
          </div>
        </div>

        <Separator />

        {/* Apply Changes Button */}
        <Button 
          onClick={handleApplyChanges}
          disabled={!hasChanges}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Zap className="w-4 h-4 mr-2" />
          Apply Policy Changes
        </Button>

        {/* Policy Impact Preview */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Projected Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Credit Availability:</span>
              <Badge 
                variant={localMaxLTV[0] > 90 ? "secondary" : "outline"}
                className="text-xs"
              >
                {localMaxLTV[0] > 90 ? "High" : localMaxLTV[0] > 80 ? "Moderate" : "Restricted"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Market Cooling:</span>
              <Badge 
                variant={localFedRate[0] > 5 ? "destructive" : "outline"}
                className="text-xs"
              >
                {localFedRate[0] > 5 ? "Strong" : localFedRate[0] > 3 ? "Moderate" : "Minimal"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Bank Stability:</span>
              <Badge 
                variant={localCapitalReq[0] > 10 || localStressTesting ? "default" : "secondary"}
                className="text-xs"
              >
                {localCapitalReq[0] > 10 || localStressTesting ? "Enhanced" : "Standard"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Policy Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-1">
              <Info className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm text-blue-900">
                Policy Guidance
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-blue-800 space-y-2">
            {localFedRate[0] < 2 && (
              <div>• Consider rate increases to prevent asset bubbles</div>
            )}
            {localMaxLTV[0] > 90 && (
              <div>• High LTV ratios increase systemic risk</div>
            )}
            {localCapitalReq[0] < 8 && (
              <div>• Capital requirements below Basel III standards</div>
            )}
            {!localStressTesting && (
              <div>• Stress testing helps identify vulnerable institutions</div>
            )}
            {localFedRate[0] < 2 && localMaxLTV[0] > 90 && (
              <div>• Current combination may fuel excessive risk-taking</div>
            )}
          </CardContent>
        </Card>

        {/* Historical Context */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <CardTitle className="text-sm text-yellow-900">
                Historical Note
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-yellow-800">
            <div className="space-y-1">
              <div>• 2005-2006: Fed raised rates from 1% to 5.25%</div>
              <div>• Too little, too late to prevent bubble</div>
              <div>• Regulatory oversight was insufficient</div>
              <div>• Consider both timing and magnitude of interventions</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
