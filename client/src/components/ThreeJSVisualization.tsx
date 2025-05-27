import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';

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
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

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
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#6B7280"
          anchorX="center"
          anchorY="middle"
        >
          Loading Market Data...
        </Text>
      </group>
    );
  }

  // Calculate visualization parameters based on market state
  const priceHeight = Math.max(0.5, marketState.medianPrice / 200000); // Scale house height by price
  const supplyDensity = Math.floor(marketState.supplyLevel / 10); // Number of supply houses
  const demandIntensity = marketState.demandLevel / 100; // Demand visualization intensity
  const bubbleSize = 1 + (marketState.bubbleRisk / 100) * 2; // Bubble size based on risk

  // Generate grid of houses representing supply
  const houses = [];
  const gridSize = Math.ceil(Math.sqrt(supplyDensity));
  for (let i = 0; i < supplyDensity; i++) {
    const x = (i % gridSize - gridSize / 2) * 2;
    const z = (Math.floor(i / gridSize) - gridSize / 2) * 2;
    
    houses.push(
      <group key={i} position={[x, 0, z]}>
        {/* House base */}
        <Box
          position={[0, priceHeight / 2, 0]}
          args={[0.8, priceHeight, 0.8]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={marketState.priceGrowth > 0 ? '#10B981' : '#EF4444'}
            opacity={0.8}
            transparent
          />
        </Box>
        
        {/* House roof */}
        <mesh position={[0, priceHeight + 0.3, 0]} castShadow>
          <coneGeometry args={[0.6, 0.6, 4]} />
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
      {Array.from({ length: Math.floor(demandIntensity * 20) }, (_, i) => (
        <mesh
          key={`demand-${i}`}
          position={[
            (Math.random() - 0.5) * 20,
            2 + Math.random() * 3,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
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
          <sphereGeometry args={[bubbleSize, 32, 32]} />
          <meshStandardMaterial
            color="#EF4444"
            transparent
            opacity={0.3}
            emissive="#DC2626"
            emissiveIntensity={marketState.bubbleRisk / 500}
          />
        </mesh>
      )}

      {/* Market indicators text */}
      <group position={[-8, 3, 0]}>
        <Text
          fontSize={0.4}
          color="#1F2937"
          anchorX="left"
          position={[0, 2, 0]}
        >
          Median Price: ${Math.round(marketState.medianPrice).toLocaleString()}
        </Text>
        <Text
          fontSize={0.4}
          color={marketState.priceGrowth > 0 ? "#10B981" : "#EF4444"}
          anchorX="left"
          position={[0, 1.5, 0]}
        >
          Price Growth: {marketState.priceGrowth.toFixed(1)}%
        </Text>
        <Text
          fontSize={0.4}
          color="#F59E0B"
          anchorX="left"
          position={[0, 1, 0]}
        >
          Inventory: {marketState.inventory.toFixed(1)} months
        </Text>
        <Text
          fontSize={0.4}
          color="#EF4444"
          anchorX="left"
          position={[0, 0.5, 0]}
        >
          Bubble Risk: {Math.round(marketState.bubbleRisk)}%
        </Text>
      </group>

      {/* Ground plane */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#F3F4F6" />
      </mesh>
    </group>
  );
}

interface ThreeJSVisualizationProps {
  marketState: MarketState | null;
}

export default function ThreeJSVisualization({ marketState }: ThreeJSVisualizationProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [10, 8, 10], fov: 50 }}
        shadows
        className="rounded-lg"
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2}
        />

        {/* Market visualization */}
        <HousingMesh marketState={marketState} />
      </Canvas>

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
