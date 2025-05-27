import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ErrorBoundary } from 'react-error-boundary';

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

interface HousingMeshProps {
  marketState: MarketState | null;
}

function HousingMesh({ marketState }: HousingMeshProps) {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current && marketState) {
      // Rotate the visualization slowly
      meshRef.current.rotation.y += 0.005;
      
      // Animate based on market volatility
      const volatility = Math.abs(marketState.priceGrowth) / 20;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * volatility * 0.1;
    }
  });

  if (!marketState) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 1, 0.1]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      </group>
    );
  }

  // Calculate visualization parameters based on market state with safety checks
  const priceHeight = Math.max(0.5, Math.min(5, marketState.medianPrice / 200000)); // Clamp height
  const supplyDensity = Math.min(20, Math.max(1, Math.floor(marketState.supplyLevel / 10))); // Safety bounds
  const demandIntensity = Math.max(0, Math.min(1, marketState.demandLevel / 100)); // Normalize demand
  const bubbleSize = Math.max(0.5, Math.min(3, 1 + (marketState.bubbleRisk / 100) * 2)); // Clamp bubble size

  // Generate grid of houses representing supply
  const houses = [];
  const gridSize = Math.ceil(Math.sqrt(supplyDensity));
  for (let i = 0; i < supplyDensity; i++) {
    const x = (i % gridSize - gridSize / 2) * 2;
    const z = (Math.floor(i / gridSize) - gridSize / 2) * 2;
    
    houses.push(
      <group key={i} position={[x, 0, z]}>
        {/* House base */}
        <mesh position={[0, priceHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, priceHeight, 0.8]} />
          <meshStandardMaterial
            color={marketState.priceGrowth > 0 ? '#10B981' : '#EF4444'}
            opacity={0.8}
            transparent
          />
        </mesh>
        
        {/* House roof - Fixed geometry args */}
        <mesh position={[0, priceHeight + 0.3, 0]} castShadow>
          <coneGeometry args={[0.6, 0.6, 8]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={meshRef}>
      {/* Housing supply visualization */}
      {houses}

      {/* Demand visualization - floating spheres */}
      {Array.from({ length: Math.min(50, Math.floor(demandIntensity * 20)) }, (_, i) => (
        <mesh
          key={`demand-${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            2 + Math.random() * 3,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial 
            color="#2563EB" 
            emissive="#1E40AF"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Bubble risk visualization */}
      {marketState.bubbleRisk > 30 && (
        <mesh position={[0, 5, 0]}>
          <sphereGeometry args={[bubbleSize, 16, 12]} />
          <meshStandardMaterial
            color="#EF4444"
            transparent
            opacity={0.3}
            emissive="#DC2626"
            emissiveIntensity={marketState.bubbleRisk / 500}
          />
        </mesh>
      )}

      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#F3F4F6" />
      </mesh>
    </group>
  );
}

interface ThreeJSVisualizationProps {
  marketState: MarketState | null;
}

function ErrorFallback({error}: {error: Error}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center p-4">
        <div className="text-red-500 mb-2">3D Visualization Error</div>
        <div className="text-sm text-gray-600">
          {error.message || "Failed to render 3D visualization"}
        </div>
      </div>
    </div>
  );
}

export default function ThreeJSVisualization({ marketState }: ThreeJSVisualizationProps) {
  return (
    <div className="w-full h-full relative">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas
          camera={{ position: [10, 8, 10], fov: 50 }}
          className="rounded-lg"
          gl={{ antialias: true, alpha: false }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />

            {/* Market visualization */}
            <HousingMesh marketState={marketState} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>

      {/* Overlay information */}
      {marketState && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 text-xs">
          <div className="font-medium text-gray-900 mb-2">Market Status</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">P/I Ratio:</span>
              <span className="font-semibold text-gray-900">
                {marketState.priceToIncomeRatio.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mortgage Rate:</span>
              <span className="font-semibold text-gray-900">
                {marketState.mortgageRate.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Housing Starts:</span>
              <span className="font-semibold text-gray-900">
                {(marketState.housingStarts / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bubble risk meter */}
      {marketState && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="text-xs font-medium text-gray-900 mb-2 text-center">Bubble Risk</div>
          <div className="relative w-16 h-16 mx-auto">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-300"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={marketState.bubbleRisk > 70 ? "text-red-500" : marketState.bubbleRisk > 40 ? "text-yellow-500" : "text-green-500"}
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${marketState.bubbleRisk}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-900">
                {Math.round(marketState.bubbleRisk)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
