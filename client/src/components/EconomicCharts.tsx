import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface PolicyState {
  fedRate: number;
  maxLTV: number;
  capitalRequirements: number;
  stressTesting: boolean;
  regulatoryStrength: number;
}

interface EconomicChartsProps {
  marketState: MarketState | null;
  policyState: PolicyState | null;
}

function SupplyDemandChart({ marketState }: { marketState: MarketState | null }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!marketState || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 300 - margin.left - margin.right;
    const height = 120 - margin.bottom - margin.top;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear().domain([0, 200]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 1000000]).range([height, 0]);

    // Supply curve data (upward sloping)
    const supplyData = d3.range(50, 200, 10).map(quantity => ({
      quantity,
      price: 200000 + quantity * 2000 + Math.random() * 50000
    }));

    // Demand curve data (downward sloping)
    const demandData = d3.range(50, 200, 10).map(quantity => ({
      quantity: 250 - quantity,
      price: 200000 + quantity * 2000 + Math.random() * 50000
    }));

    // Create line generators
    const line = d3.line<{quantity: number, price: number}>()
      .x(d => xScale(d.quantity))
      .y(d => yScale(d.price))
      .curve(d3.curveMonotoneX);

    // Add supply curve
    g.append("path")
      .datum(supplyData)
      .attr("fill", "none")
      .attr("stroke", "#10B981")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add demand curve
    g.append("path")
      .datum(demandData)
      .attr("fill", "none")
      .attr("stroke", "#2563EB")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add current market point
    const currentSupply = marketState.supplyLevel;
    const currentDemand = marketState.demandLevel;
    const equilibriumX = (currentSupply + currentDemand) / 2;
    
    g.append("circle")
      .attr("cx", xScale(equilibriumX))
      .attr("cy", yScale(marketState.medianPrice))
      .attr("r", 4)
      .attr("fill", "#EF4444")
      .attr("stroke", "#DC2626")
      .attr("stroke-width", 2);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".0s")));

    // Add labels
    g.append("text")
      .attr("x", width - 10)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#10B981")
      .text("Supply");

    g.append("text")
      .attr("x", width - 10)
      .attr("y", height - 10)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "#2563EB")
      .text("Demand");

  }, [marketState]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="120"
      className="overflow-visible"
    />
  );
}

function PriceIncomeChart({ marketState }: { marketState: MarketState | null }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!marketState || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 300 - margin.left - margin.right;
    const height = 120 - margin.bottom - margin.top;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Historical P/I ratio data (simulated)
    const historicalData = [
      { time: 0, ratio: 3.2, year: 2005 },
      { time: 1, ratio: 3.6, year: 2005 },
      { time: 2, ratio: 4.1, year: 2006 },
      { time: 3, ratio: 4.7, year: 2006 },
      { time: 4, ratio: 5.2, year: 2007 },
      { time: 5, ratio: 5.8, year: 2007 },
      { time: 6, ratio: 5.9, year: 2008 },
      { time: 7, ratio: 5.4, year: 2008 },
      { time: 8, ratio: 4.8, year: 2009 },
      { time: 9, ratio: 4.2, year: 2009 },
      { time: marketState.timeStep, ratio: marketState.priceToIncomeRatio, year: 2005 + Math.floor(marketState.timeStep / 4) }
    ];

    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(historicalData, d => d.time) as [number, number])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([2, 7])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<typeof historicalData[0]>()
      .x(d => xScale(d.time))
      .y(d => yScale(d.ratio))
      .curve(d3.curveMonotoneX);

    // Add danger zone (P/I ratio > 5)
    g.append("rect")
      .attr("x", 0)
      .attr("y", yScale(7))
      .attr("width", width)
      .attr("height", yScale(5) - yScale(7))
      .attr("fill", "#FEF2F2")
      .attr("opacity", 0.7);

    // Add historical line
    g.append("path")
      .datum(historicalData.slice(0, -1))
      .attr("fill", "none")
      .attr("stroke", "#6B7280")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3")
      .attr("d", line);

    // Add current point
    const currentPoint = historicalData[historicalData.length - 1];
    g.append("circle")
      .attr("cx", xScale(currentPoint.time))
      .attr("cy", yScale(currentPoint.ratio))
      .attr("r", 4)
      .attr("fill", currentPoint.ratio > 5 ? "#EF4444" : currentPoint.ratio > 4 ? "#F59E0B" : "#10B981")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 2);

    // Add danger line at P/I = 5
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(5))
      .attr("y2", yScale(5))
      .attr("stroke", "#EF4444")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${2005 + Math.floor(Number(d) / 4)}`));

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4));

    // Add current value label
    g.append("text")
      .attr("x", xScale(currentPoint.time))
      .attr("y", yScale(currentPoint.ratio) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", currentPoint.ratio > 5 ? "#EF4444" : "#1F2937")
      .text(currentPoint.ratio.toFixed(1));

  }, [marketState]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="120"
      className="overflow-visible"
    />
  );
}

function BubbleRiskMeter({ marketState }: { marketState: MarketState | null }) {
  if (!marketState) return null;

  const riskLevel = marketState.bubbleRisk;
  const riskColor = riskLevel > 70 ? "text-red-500" : riskLevel > 40 ? "text-yellow-500" : "text-green-500";
  const riskLabel = riskLevel > 70 ? "High Risk" : riskLevel > 40 ? "Moderate Risk" : "Low Risk";

  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={riskColor}
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${riskLevel}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-gray-900">
              {Math.round(riskLevel)}%
            </span>
          </div>
        </div>
        <div className={`text-xs font-medium ${riskColor}`}>
          {riskLabel}
        </div>
      </div>
    </div>
  );
}

export default function EconomicCharts({ marketState, policyState }: EconomicChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Supply & Demand</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <SupplyDemandChart marketState={marketState} />
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Price-to-Income Ratio</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <PriceIncomeChart marketState={marketState} />
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Bubble Risk Meter</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <BubbleRiskMeter marketState={marketState} />
        </CardContent>
      </Card>
    </div>
  );
}
