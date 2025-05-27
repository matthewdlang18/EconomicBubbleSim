import * as THREE from 'three';

/**
 * Utility functions for Three.js housing market visualization
 */

export interface HouseGeometry {
  base: THREE.BoxGeometry;
  roof: THREE.ConeGeometry;
}

export interface MarketVisualizationConfig {
  gridSize: number;
  houseSpacing: number;
  maxHeight: number;
  colors: {
    supply: string;
    demand: string;
    bubble: string;
    ground: string;
    positive: string;
    negative: string;
  };
}

export interface AnimationState {
  rotation: number;
  bobbing: number;
  time: number;
}

/**
 * Default configuration for market visualization
 */
export const defaultConfig: MarketVisualizationConfig = {
  gridSize: 20,
  houseSpacing: 2,
  maxHeight: 5,
  colors: {
    supply: '#10B981',
    demand: '#2563EB',
    bubble: '#EF4444',
    ground: '#F3F4F6',
    positive: '#059669',
    negative: '#DC2626'
  }
};

/**
 * Create house geometry for market visualization
 */
export function createHouseGeometry(scale: number = 1): HouseGeometry {
  const baseSize = 0.8 * scale;
  const baseHeight = 1.0 * scale;
  const roofSize = 0.6 * scale;
  const roofHeight = 0.6 * scale;

  return {
    base: new THREE.BoxGeometry(baseSize, baseHeight, baseSize),
    roof: new THREE.ConeGeometry(roofSize, roofHeight, 4)
  };
}

/**
 * Create materials for different market conditions
 */
export function createHouseMaterials(config: MarketVisualizationConfig = defaultConfig) {
  return {
    positive: new THREE.MeshStandardMaterial({
      color: config.colors.positive,
      opacity: 0.8,
      transparent: true
    }),
    negative: new THREE.MeshStandardMaterial({
      color: config.colors.negative,
      opacity: 0.8,
      transparent: true
    }),
    neutral: new THREE.MeshStandardMaterial({
      color: '#6B7280',
      opacity: 0.8,
      transparent: true
    }),
    roof: new THREE.MeshStandardMaterial({
      color: '#8B7355'
    })
  };
}

/**
 * Calculate house positions in a grid layout
 */
export function calculateHousePositions(
  count: number,
  spacing: number = 2,
  centerGrid: boolean = true
): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const gridSize = Math.ceil(Math.sqrt(count));
  
  const startOffset = centerGrid ? -(gridSize - 1) * spacing / 2 : 0;
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    
    const x = startOffset + col * spacing;
    const z = startOffset + row * spacing;
    const y = 0;
    
    positions.push(new THREE.Vector3(x, y, z));
  }
  
  return positions;
}

/**
 * Create a house mesh with base and roof
 */
export function createHouseMesh(
  geometry: HouseGeometry,
  materials: any,
  height: number = 1,
  isPositive: boolean = true
): THREE.Group {
  const houseGroup = new THREE.Group();
  
  // Scale height based on market conditions
  const scaledHeight = Math.max(0.5, height);
  
  // House base
  const base = new THREE.Mesh(
    geometry.base,
    isPositive ? materials.positive : materials.negative
  );
  base.position.y = scaledHeight / 2;
  base.scale.y = scaledHeight;
  base.castShadow = true;
  base.receiveShadow = true;
  houseGroup.add(base);
  
  // House roof
  const roof = new THREE.Mesh(geometry.roof, materials.roof);
  roof.position.y = scaledHeight + 0.3;
  roof.castShadow = true;
  houseGroup.add(roof);
  
  return houseGroup;
}

/**
 * Create demand visualization particles
 */
export function createDemandParticles(
  intensity: number,
  bounds: { min: THREE.Vector3; max: THREE.Vector3 },
  config: MarketVisualizationConfig = defaultConfig
): THREE.Group {
  const particleGroup = new THREE.Group();
  const particleCount = Math.floor(intensity * 50);
  
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshStandardMaterial({
    color: config.colors.demand,
    emissive: new THREE.Color('#1E40AF'),
    emissiveIntensity: 0.2
  });
  
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(geometry, material);
    
    particle.position.set(
      THREE.MathUtils.randFloat(bounds.min.x, bounds.max.x),
      THREE.MathUtils.randFloat(2, 5),
      THREE.MathUtils.randFloat(bounds.min.z, bounds.max.z)
    );
    
    // Add random movement data
    particle.userData = {
      velocity: new THREE.Vector3(
        THREE.MathUtils.randFloat(-0.02, 0.02),
        THREE.MathUtils.randFloat(-0.01, 0.01),
        THREE.MathUtils.randFloat(-0.02, 0.02)
      ),
      originalPosition: particle.position.clone()
    };
    
    particleGroup.add(particle);
  }
  
  return particleGroup;
}

/**
 * Create bubble risk visualization
 */
export function createBubbleVisualization(
  riskLevel: number,
  config: MarketVisualizationConfig = defaultConfig
): THREE.Mesh | null {
  if (riskLevel < 30) return null;
  
  const bubbleSize = 1 + (riskLevel / 100) * 2;
  const geometry = new THREE.SphereGeometry(bubbleSize, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: config.colors.bubble,
    transparent: true,
    opacity: 0.3,
    emissive: new THREE.Color('#DC2626'),
    emissiveIntensity: riskLevel / 500
  });
  
  const bubble = new THREE.Mesh(geometry, material);
  bubble.position.set(0, 5, 0);
  
  return bubble;
}

/**
 * Create ground plane
 */
export function createGroundPlane(
  size: number = 30,
  config: MarketVisualizationConfig = defaultConfig
): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({
    color: config.colors.ground
  });
  
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  
  return ground;
}

/**
 * Animate demand particles
 */
export function animateDemandParticles(particleGroup: THREE.Group, deltaTime: number): void {
  particleGroup.children.forEach((particle) => {
    if (particle instanceof THREE.Mesh && particle.userData.velocity) {
      const velocity = particle.userData.velocity as THREE.Vector3;
      const originalPosition = particle.userData.originalPosition as THREE.Vector3;
      
      particle.position.add(velocity);
      
      // Bounce off boundaries
      if (particle.position.x > 10 || particle.position.x < -10) {
        velocity.x *= -1;
      }
      if (particle.position.z > 10 || particle.position.z < -10) {
        velocity.z *= -1;
      }
      if (particle.position.y > 6 || particle.position.y < 1) {
        velocity.y *= -1;
      }
      
      // Add slight gravitational pull toward original position
      const pullForce = originalPosition.clone().sub(particle.position).multiplyScalar(0.001);
      particle.position.add(pullForce);
    }
  });
}

/**
 * Update house colors based on market conditions
 */
export function updateHouseColors(
  houseGroup: THREE.Group,
  priceGrowth: number,
  materials: any
): void {
  houseGroup.children.forEach((house) => {
    if (house instanceof THREE.Group) {
      const base = house.children.find(child => 
        child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry
      ) as THREE.Mesh;
      
      if (base) {
        base.material = priceGrowth > 0 ? materials.positive : materials.negative;
      }
    }
  });
}

/**
 * Create market indicator text
 */
export function createMarketText(
  text: string,
  position: THREE.Vector3,
  color: string = '#1F2937',
  size: number = 0.4
): THREE.Mesh {
  // Note: In a real implementation, you'd use TextGeometry or a text rendering library
  // For now, this is a placeholder that would need proper text rendering
  const geometry = new THREE.PlaneGeometry(2, 0.5);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8
  });
  
  const textMesh = new THREE.Mesh(geometry, material);
  textMesh.position.copy(position);
  textMesh.lookAt(0, position.y, 0);
  
  return textMesh;
}

/**
 * Setup lighting for the scene
 */
export function setupLighting(scene: THREE.Scene): void {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  // Directional light (sun)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);
  
  // Point light for ambient illumination
  const pointLight = new THREE.PointLight(0xffffff, 0.5);
  pointLight.position.set(-10, 10, -10);
  scene.add(pointLight);
}

/**
 * Calculate camera position based on market state
 */
export function calculateOptimalCameraPosition(
  marketState: any,
  basePosition: THREE.Vector3 = new THREE.Vector3(10, 8, 10)
): THREE.Vector3 {
  const dynamicOffset = {
    x: Math.sin(marketState?.timeStep || 0) * 2,
    y: Math.max(5, basePosition.y + (marketState?.bubbleRisk || 0) / 20),
    z: Math.cos(marketState?.timeStep || 0) * 2
  };
  
  return new THREE.Vector3(
    basePosition.x + dynamicOffset.x,
    dynamicOffset.y,
    basePosition.z + dynamicOffset.z
  );
}

/**
 * Dispose of Three.js resources properly
 */
export function disposeResources(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
}
