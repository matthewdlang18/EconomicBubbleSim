import { MarketEvent, InsertMarketEvent } from "@shared/schema";

export interface MarketState {
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

export interface PolicyState {
  fedRate: number;
  maxLTV: number;
  capitalRequirements: number;
  stressTesting: boolean;
  regulatoryStrength: number;
}

export interface PlayerAction {
  userId: string;
  role: 'homebuyer' | 'investor' | 'regulator';
  actionType: string;
  parameters: Record<string, any>;
}

export class EconomicEngine {
  private marketState: MarketState;
  private policyState: PolicyState;
  private historicalData: Array<{ time: number; events: string[] }>;

  constructor() {
    this.marketState = this.getInitialMarketState();
    this.policyState = this.getInitialPolicyState();
    this.historicalData = this.load2008CrisisData();
  }

  private getInitialMarketState(): MarketState {
    return {
      medianPrice: 220000, // Starting in 2005
      priceGrowth: 8.5,
      inventory: 4.2,
      bubbleRisk: 35,
      supplyLevel: 100,
      demandLevel: 120,
      priceToIncomeRatio: 3.8,
      mortgageRate: 5.87,
      unemploymentRate: 5.1,
      housingStarts: 2068000,
      foreclosureRate: 0.58,
      timeStep: 0, // Represents quarters since 2005 Q1
    };
  }

  private getInitialPolicyState(): PolicyState {
    return {
      fedRate: 2.25,
      maxLTV: 95,
      capitalRequirements: 8,
      stressTesting: false,
      regulatoryStrength: 50,
    };
  }

  private load2008CrisisData(): Array<{ time: number; events: string[] }> {
    return [
      { time: 0, events: ['Low interest rates', 'Loose lending standards'] },
      { time: 4, events: ['Fed starts raising rates', 'Subprime lending peaks'] },
      { time: 8, events: ['Housing prices peak', 'Early signs of stress'] },
      { time: 10, events: ['Subprime crisis begins', 'Bear Stearns hedge funds collapse'] },
      { time: 12, events: ['Lehman Brothers fails', 'Global financial crisis'] },
      { time: 14, events: ['TARP bailouts', 'Fed cuts rates to zero'] },
      { time: 16, events: ['Housing market bottoms', 'Recovery begins'] },
    ];
  }

  public processPlayerAction(action: PlayerAction): { marketEvents: InsertMarketEvent[]; newState: MarketState } {
    const events: InsertMarketEvent[] = [];
    
    switch (action.role) {
      case 'homebuyer':
        this.processHomebuyerAction(action, events);
        break;
      case 'investor':
        this.processInvestorAction(action, events);
        break;
      case 'regulator':
        this.processRegulatorAction(action, events);
        break;
    }

    // Update market state based on current conditions
    this.updateMarketDynamics();

    return {
      marketEvents: events.map(event => ({
        ...event,
        sessionId: 0, // Will be set by caller
      })),
      newState: { ...this.marketState },
    };
  }

  private processHomebuyerAction(action: PlayerAction, events: InsertMarketEvent[]): void {
    switch (action.actionType) {
      case 'purchase':
        const purchasePrice = action.parameters.price;
        const income = action.parameters.income;
        const downPayment = action.parameters.downPayment;
        
        // Calculate market impact
        this.marketState.demandLevel += 1;
        
        // Record decision impact
        events.push({
          eventType: 'homebuyer_purchase',
          eventData: {
            price: purchasePrice,
            income,
            downPayment,
            priceToIncomeRatio: purchasePrice / income,
          },
          triggeredBy: action.userId,
          impact: {
            demandIncrease: 1,
            marketSignal: purchasePrice > this.marketState.medianPrice ? 'bullish' : 'bearish',
          },
        });
        break;
        
      case 'wait':
        // Reduces demand pressure
        this.marketState.demandLevel -= 0.5;
        
        events.push({
          eventType: 'homebuyer_wait',
          eventData: { reason: action.parameters.reason },
          triggeredBy: action.userId,
          impact: { demandDecrease: 0.5 },
        });
        break;
    }
  }

  private processInvestorAction(action: PlayerAction, events: InsertMarketEvent[]): void {
    switch (action.actionType) {
      case 'buy_properties':
        const quantity = action.parameters.quantity;
        const leverage = action.parameters.leverage;
        
        // Significant demand impact from investor activity
        this.marketState.demandLevel += quantity * 2;
        this.marketState.bubbleRisk += quantity * leverage * 0.1;
        
        events.push({
          eventType: 'investor_purchase',
          eventData: { quantity, leverage },
          triggeredBy: action.userId,
          impact: {
            demandIncrease: quantity * 2,
            bubbleRiskIncrease: quantity * leverage * 0.1,
          },
        });
        break;
        
      case 'securitize':
        // Creates artificial demand through financial engineering
        this.marketState.bubbleRisk += 5;
        
        events.push({
          eventType: 'mortgage_securitization',
          eventData: action.parameters,
          triggeredBy: action.userId,
          impact: { bubbleRiskIncrease: 5, marketLiquidity: 'increased' },
        });
        break;
    }
  }

  private processRegulatorAction(action: PlayerAction, events: InsertMarketEvent[]): void {
    switch (action.actionType) {
      case 'set_fed_rate':
        const newRate = action.parameters.rate;
        const oldRate = this.policyState.fedRate;
        this.policyState.fedRate = newRate;
        
        // Calculate market impact
        const rateChange = newRate - oldRate;
        this.marketState.mortgageRate += rateChange * 1.2; // Mortgage rates follow fed rate
        this.marketState.demandLevel -= rateChange * 10; // Higher rates reduce demand
        
        events.push({
          eventType: 'fed_rate_change',
          eventData: { oldRate, newRate, change: rateChange },
          triggeredBy: action.userId,
          impact: {
            mortgageRateChange: rateChange * 1.2,
            demandChange: -rateChange * 10,
            coolingEffect: rateChange > 0 ? 'moderate' : 'stimulative',
          },
        });
        break;
        
      case 'set_ltv_limit':
        this.policyState.maxLTV = action.parameters.maxLTV;
        
        // Tighter lending standards reduce bubble risk
        const ltvImpact = (95 - action.parameters.maxLTV) * 0.5;
        this.marketState.bubbleRisk -= ltvImpact;
        this.marketState.demandLevel -= ltvImpact * 0.3;
        
        events.push({
          eventType: 'ltv_regulation',
          eventData: { maxLTV: action.parameters.maxLTV },
          triggeredBy: action.userId,
          impact: {
            bubbleRiskReduction: ltvImpact,
            demandReduction: ltvImpact * 0.3,
          },
        });
        break;
        
      case 'require_stress_testing':
        this.policyState.stressTesting = action.parameters.enabled;
        
        if (action.parameters.enabled) {
          this.marketState.bubbleRisk -= 10;
          
          events.push({
            eventType: 'stress_testing_mandate',
            eventData: { enabled: true },
            triggeredBy: action.userId,
            impact: { bubbleRiskReduction: 10, bankStability: 'improved' },
          });
        }
        break;
    }
  }

  private updateMarketDynamics(): void {
    // Time progression affects market
    this.marketState.timeStep += 0.25; // Each action represents a quarter
    
    // Supply/demand balance affects prices
    const supplyDemandRatio = this.marketState.supplyLevel / this.marketState.demandLevel;
    const priceChangeFromSD = (1 / supplyDemandRatio - 1) * 20;
    
    // Interest rates affect demand
    const rateDemandEffect = (8 - this.marketState.mortgageRate) * 2;
    
    // Update price growth
    this.marketState.priceGrowth = Math.max(-20, Math.min(30, 
      this.marketState.priceGrowth * 0.9 + priceChangeFromSD * 0.3 + rateDemandEffect * 0.1
    ));
    
    // Update median price
    this.marketState.medianPrice *= (1 + this.marketState.priceGrowth / 400); // Quarterly growth
    
    // Update price-to-income ratio
    const medianIncome = 52000; // Assume median income grows at 3% annually
    this.marketState.priceToIncomeRatio = this.marketState.medianPrice / medianIncome;
    
    // Bubble risk calculation based on multiple factors
    this.marketState.bubbleRisk = Math.max(0, Math.min(100,
      this.marketState.priceToIncomeRatio * 15 + // Historical P/I ratios above 5 are concerning
      this.marketState.priceGrowth * 2 + // Rapid price growth increases risk
      (this.marketState.mortgageRate < 4 ? 10 : 0) + // Low rates increase risk
      (this.policyState.maxLTV > 90 ? 15 : 0) + // High LTV increases risk
      (!this.policyState.stressTesting ? 10 : 0) // Lack of stress testing increases risk
    ));
    
    // Inventory affected by supply/demand balance
    this.marketState.inventory = Math.max(0.5, Math.min(12, 
      this.marketState.inventory + (this.marketState.supplyLevel - this.marketState.demandLevel) * 0.01
    ));
    
    // Housing starts respond to price growth with lag
    this.marketState.housingStarts = Math.max(500000, Math.min(3000000,
      this.marketState.housingStarts + this.marketState.priceGrowth * 10000
    ));
    
    // Foreclosure rate increases with bubble risk and high prices
    this.marketState.foreclosureRate = Math.max(0.1, Math.min(5,
      0.5 + this.marketState.bubbleRisk * 0.03 + 
      Math.max(0, this.marketState.priceToIncomeRatio - 4) * 0.5
    ));
    
    // Supply naturally adjusts to housing starts
    this.marketState.supplyLevel = 100 + (this.marketState.housingStarts - 1800000) / 10000;
    
    // Demand adjusts to economic conditions
    this.marketState.demandLevel = Math.max(50, 
      120 - this.marketState.mortgageRate * 5 - this.marketState.unemploymentRate * 3
    );
  }

  public getMarketState(): MarketState {
    return { ...this.marketState };
  }

  public getPolicyState(): PolicyState {
    return { ...this.policyState };
  }

  public getHistoricalComparison(): { currentRisk: number; historicalEvent: string } {
    const currentTime = this.marketState.timeStep;
    const historicalEvent = this.historicalData.find(h => 
      Math.abs(h.time - currentTime) < 2
    );
    
    return {
      currentRisk: this.marketState.bubbleRisk,
      historicalEvent: historicalEvent ? historicalEvent.events.join(', ') : 'Normal market conditions',
    };
  }

  public resetToHistoricalPeriod(quarter: number): void {
    // Reset market to specific historical quarter for educational comparison
    this.marketState.timeStep = quarter;
    
    // Adjust other parameters based on historical data
    if (quarter <= 4) {
      // 2005-2006: Bubble building
      this.marketState.bubbleRisk = 20 + quarter * 5;
      this.marketState.priceGrowth = 12 + quarter * 2;
    } else if (quarter <= 10) {
      // 2006-2008: Peak and early crisis
      this.marketState.bubbleRisk = 45 + (quarter - 4) * 8;
      this.marketState.priceGrowth = Math.max(-10, 24 - (quarter - 4) * 6);
    } else {
      // 2008+: Crisis and recovery
      this.marketState.bubbleRisk = Math.max(10, 85 - (quarter - 10) * 5);
      this.marketState.priceGrowth = Math.max(-25, -15 + (quarter - 10) * 2);
    }
  }
}
