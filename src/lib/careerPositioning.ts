/**
 * Career Node Positioning System - Force-Directed Layout
 * 
 * This module uses a physics-based force-directed algorithm to position career nodes
 * on a 2D compass. It prevents overlaps through repulsion forces while maintaining
 * semantic quadrant positioning based on career advancement and match percentage.
 */

export interface CareerPath {
  id: string;
  title: string;
  level: string;
  match: number;
  pathType: 'technical' | 'leadership' | 'exploratory';
  skills?: { current: number; required: number };
}

export interface PositionResult {
  x: number;
  y: number;
  quadrant: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  angle: number;
  radius: number;
}

export interface PositioningConfig {
  centerX: number;
  centerY: number;
  currentPL: number;
}

// ============================================================================
// VECTOR AND PHYSICS UTILITIES
// ============================================================================

class Vector2D {
  constructor(public x: number, public y: number) {}

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2D(0, 0);
    return new Vector2D(this.x / mag, this.y / mag);
  }

  distance(v: Vector2D): number {
    return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2);
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
}

interface NodePhysics {
  career: CareerPath;
  position: Vector2D;
  velocity: Vector2D;
  force: Vector2D;
  idealPosition: Vector2D;
  quadrant: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';
  mass: number;
  fixed: boolean;
}

interface QuadrantBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  idealCenterX: number;
  idealCenterY: number;
}

// Constants for physics simulation
const CANVAS_SIZE = 1000;
const CENTER = CANVAS_SIZE / 2;
const NODE_RADIUS = 60;
const MIN_NODE_DISTANCE = NODE_RADIUS * 2.5; // Minimum separation between nodes
const MAX_ITERATIONS = 50;
const CONVERGENCE_THRESHOLD = 0.5;
const DAMPING = 0.8;

// Force strength constants
const ATTRACTION_STRENGTH = 0.1;
const REPULSION_STRENGTH = 800;
const BOUNDARY_STRENGTH = 0.3;
const CLUSTERING_STRENGTH = 0.05;

// ============================================================================
// QUADRANT SYSTEM
// ============================================================================

/**
 * Quadrant Strategy:
 * 
 * +Y (Top): Career Advancement (Lower PL = higher position)
 * -Y (Bottom): Scope Expansion / Specialization
 * +X (Right): High Match / Direct Path
 * -X (Left): Moderate Match / Alternative Path
 * 
 * Quadrant Meanings:
 * +X+Y (Top-Right):    High match + Career advancement (BEST paths)
 * -X+Y (Top-Left):     Moderate match + Career advancement (GROWTH paths)
 * +X-Y (Bottom-Right): High match + Same/Lower level (LATERAL paths)
 * -X-Y (Bottom-Left):  Low match + Exploratory (PIVOT paths)
 */

function determineQuadrant(
  plDiff: number,
  matchPercentage: number,
  pathType: string
): 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' {
  const isAdvancement = plDiff > 0;
  const isHighMatch = matchPercentage >= 70;
  
  if (isAdvancement) {
    return isHighMatch ? 'topRight' : 'topLeft';
  } else {
    return isHighMatch ? 'bottomRight' : 'bottomLeft';
  }
}

function getQuadrantBounds(quadrant: string): QuadrantBounds {
  const padding = 100;
  const bounds: Record<string, QuadrantBounds> = {
    topRight: {
      minX: CENTER + padding,
      maxX: CANVAS_SIZE - padding,
      minY: padding,
      maxY: CENTER - padding,
      idealCenterX: CENTER + 200,
      idealCenterY: CENTER - 200,
    },
    topLeft: {
      minX: padding,
      maxX: CENTER - padding,
      minY: padding,
      maxY: CENTER - padding,
      idealCenterX: CENTER - 200,
      idealCenterY: CENTER - 200,
    },
    bottomRight: {
      minX: CENTER + padding,
      maxX: CANVAS_SIZE - padding,
      minY: CENTER + padding,
      maxY: CANVAS_SIZE - padding,
      idealCenterX: CENTER + 200,
      idealCenterY: CENTER + 200,
    },
    bottomLeft: {
      minX: padding,
      maxX: CENTER - padding,
      minY: CENTER + padding,
      maxY: CANVAS_SIZE - padding,
      idealCenterX: CENTER - 200,
      idealCenterY: CENTER + 200,
    },
  };
  return bounds[quadrant];
}

// ============================================================================
// IDEAL POSITION CALCULATION
// ============================================================================

function calculateIdealPosition(
  career: CareerPath,
  currentPL: number,
  quadrant: 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'
): Vector2D {
  const bounds = getQuadrantBounds(quadrant);
  const pl = parseInt(career.level.replace('PL', ''));
  const plDiff = Math.abs(currentPL - pl);
  const matchNormalized = career.match / 100;

  // Calculate radius based on PL difference (further out = more career change)
  const baseRadius = 150;
  const maxRadius = 350;
  const radius = baseRadius + (plDiff * 40);
  const clampedRadius = Math.min(radius, maxRadius);

  // Calculate angle within quadrant based on match percentage
  let baseAngle = 0;
  switch (quadrant) {
    case 'topRight':
      // 0° to 90° - higher match pushes toward 45°
      baseAngle = 15 + matchNormalized * 60;
      break;
    case 'topLeft':
      // 90° to 180° - higher match pushes toward 135°
      baseAngle = 105 + matchNormalized * 60;
      break;
    case 'bottomLeft':
      // 180° to 270° - higher match pushes toward 225°
      baseAngle = 195 + matchNormalized * 60;
      break;
    case 'bottomRight':
      // 270° to 360° - higher match pushes toward 315°
      baseAngle = 285 + matchNormalized * 60;
      break;
  }

  // Convert polar to Cartesian
  const angleRad = (baseAngle * Math.PI) / 180;
  const x = CENTER + clampedRadius * Math.cos(angleRad);
  const y = CENTER + clampedRadius * Math.sin(angleRad);

  // Clamp to quadrant bounds
  const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, x));
  const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, y));

  return new Vector2D(clampedX, clampedY);
}

// ============================================================================
// FORCE CALCULATIONS
// ============================================================================

/**
 * Calculate attraction force pulling node toward its ideal position
 */
function calculateAttractionForce(node: NodePhysics): Vector2D {
  const diff = node.idealPosition.subtract(node.position);
  const distance = diff.magnitude();
  
  if (distance < 1) return new Vector2D(0, 0);
  
  const strength = distance * ATTRACTION_STRENGTH;
  return diff.normalize().multiply(strength);
}

/**
 * Calculate repulsion force between two nodes to prevent overlap
 */
function calculateRepulsionForce(node1: NodePhysics, node2: NodePhysics): Vector2D {
  const diff = node1.position.subtract(node2.position);
  const distance = diff.magnitude();
  
  if (distance === 0) {
    // Nodes at exact same position - push apart randomly
    return new Vector2D(Math.random() - 0.5, Math.random() - 0.5).multiply(10);
  }
  
  if (distance > MIN_NODE_DISTANCE * 2) {
    return new Vector2D(0, 0); // Too far to affect
  }
  
  // Strong repulsion when nodes are too close
  const overlap = MIN_NODE_DISTANCE - distance;
  if (overlap > 0) {
    const strength = (overlap / MIN_NODE_DISTANCE) * REPULSION_STRENGTH;
    return diff.normalize().multiply(strength);
  }
  
  // Soft repulsion to maintain spacing
  const strength = REPULSION_STRENGTH / (distance * distance);
  return diff.normalize().multiply(strength);
}

/**
 * Calculate boundary force to keep node within quadrant
 */
function calculateBoundaryForce(node: NodePhysics): Vector2D {
  const bounds = getQuadrantBounds(node.quadrant);
  let forceX = 0;
  let forceY = 0;

  // Push away from boundaries
  const margin = NODE_RADIUS;
  
  if (node.position.x < bounds.minX + margin) {
    forceX = (bounds.minX + margin - node.position.x) * BOUNDARY_STRENGTH;
  } else if (node.position.x > bounds.maxX - margin) {
    forceX = (bounds.maxX - margin - node.position.x) * BOUNDARY_STRENGTH;
  }

  if (node.position.y < bounds.minY + margin) {
    forceY = (bounds.minY + margin - node.position.y) * BOUNDARY_STRENGTH;
  } else if (node.position.y > bounds.maxY - margin) {
    forceY = (bounds.maxY - margin - node.position.y) * BOUNDARY_STRENGTH;
  }

  return new Vector2D(forceX, forceY);
}

/**
 * Calculate clustering force to group similar career families
 */
function calculateClusteringForce(node: NodePhysics, allNodes: NodePhysics[]): Vector2D {
  const careerFamily = node.career.title.split(' ').slice(-1)[0]; // Last word (e.g., "Engineer")
  let clusterForce = new Vector2D(0, 0);
  let count = 0;

  for (const other of allNodes) {
    if (other.career.id === node.career.id) continue;
    if (other.quadrant !== node.quadrant) continue;
    
    const otherFamily = other.career.title.split(' ').slice(-1)[0];
    if (careerFamily === otherFamily) {
      const diff = other.position.subtract(node.position);
      const distance = diff.magnitude();
      
      if (distance > 0 && distance < MIN_NODE_DISTANCE * 3) {
        clusterForce = clusterForce.add(diff.normalize().multiply(CLUSTERING_STRENGTH * 10));
        count++;
      }
    }
  }

  return count > 0 ? clusterForce.multiply(1 / count) : new Vector2D(0, 0);
}

// ============================================================================
// COLLISION DETECTION AND RESOLUTION
// ============================================================================

interface SpatialGrid {
  cellSize: number;
  grid: Map<string, NodePhysics[]>;
}

function createSpatialGrid(nodes: NodePhysics[], cellSize: number): SpatialGrid {
  const grid = new Map<string, NodePhysics[]>();
  
  for (const node of nodes) {
    const cellX = Math.floor(node.position.x / cellSize);
    const cellY = Math.floor(node.position.y / cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(node);
  }
  
  return { cellSize, grid };
}

function getNearbyNodes(node: NodePhysics, spatialGrid: SpatialGrid): NodePhysics[] {
  const nearby: NodePhysics[] = [];
  const cellX = Math.floor(node.position.x / spatialGrid.cellSize);
  const cellY = Math.floor(node.position.y / spatialGrid.cellSize);
  
  // Check 3x3 grid around node
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const key = `${cellX + dx},${cellY + dy}`;
      const cellNodes = spatialGrid.grid.get(key);
      if (cellNodes) {
        nearby.push(...cellNodes);
      }
    }
  }
  
  return nearby.filter(n => n.career.id !== node.career.id);
}

function resolveCollisions(nodes: NodePhysics[]): void {
  const maxPasses = 10;
  
  for (let pass = 0; pass < maxPasses; pass++) {
    let hadCollision = false;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = nodes[i].position.distance(nodes[j].position);
        
        if (distance < MIN_NODE_DISTANCE) {
          hadCollision = true;
          
          // Push nodes apart
          const diff = nodes[i].position.subtract(nodes[j].position);
          const overlap = MIN_NODE_DISTANCE - distance;
          const pushDistance = overlap / 2 + 1;
          
          if (diff.magnitude() === 0) {
            // Random push if exactly overlapping
            const randomAngle = Math.random() * Math.PI * 2;
            const push = new Vector2D(
              Math.cos(randomAngle) * pushDistance,
              Math.sin(randomAngle) * pushDistance
            );
            nodes[i].position = nodes[i].position.add(push);
            nodes[j].position = nodes[j].position.subtract(push);
          } else {
            const pushVector = diff.normalize().multiply(pushDistance);
            nodes[i].position = nodes[i].position.add(pushVector);
            nodes[j].position = nodes[j].position.subtract(pushVector);
          }
          
          // Clamp to quadrant bounds
          const bounds1 = getQuadrantBounds(nodes[i].quadrant);
          const bounds2 = getQuadrantBounds(nodes[j].quadrant);
          
          nodes[i].position.x = Math.max(bounds1.minX, Math.min(bounds1.maxX, nodes[i].position.x));
          nodes[i].position.y = Math.max(bounds1.minY, Math.min(bounds1.maxY, nodes[i].position.y));
          nodes[j].position.x = Math.max(bounds2.minX, Math.min(bounds2.maxX, nodes[j].position.x));
          nodes[j].position.y = Math.max(bounds2.minY, Math.min(bounds2.maxY, nodes[j].position.y));
        }
      }
    }
    
    if (!hadCollision) break;
  }
}

// ============================================================================
// FORCE-DIRECTED LAYOUT SIMULATION
// ============================================================================

/**
 * Run physics simulation to position nodes with force-directed layout
 */
function runForceSimulation(nodes: NodePhysics[]): void {
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    // Reset forces for this iteration
    for (const node of nodes) {
      node.force = new Vector2D(0, 0);
    }

    // Calculate all forces
    const spatialGrid = createSpatialGrid(nodes, MIN_NODE_DISTANCE * 2);

    for (const node of nodes) {
      // Attraction to ideal position
      const attractionForce = calculateAttractionForce(node);
      node.force = node.force.add(attractionForce);

      // Repulsion from nearby nodes
      const nearbyNodes = getNearbyNodes(node, spatialGrid);
      for (const other of nearbyNodes) {
        const repulsionForce = calculateRepulsionForce(node, other);
        node.force = node.force.add(repulsionForce);
      }

      // Boundary constraints
      const boundaryForce = calculateBoundaryForce(node);
      node.force = node.force.add(boundaryForce);

      // Clustering with similar careers
      const clusteringForce = calculateClusteringForce(node, nodes);
      node.force = node.force.add(clusteringForce);
    }

    // Apply forces to update positions
    let totalEnergy = 0;
    for (const node of nodes) {
      if (node.fixed) continue;

      // Update velocity with damping
      node.velocity = node.velocity.multiply(DAMPING).add(node.force.multiply(1 / node.mass));

      // Update position
      node.position = node.position.add(node.velocity);

      // Clamp to quadrant bounds
      const bounds = getQuadrantBounds(node.quadrant);
      node.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, node.position.x));
      node.position.y = Math.max(bounds.minY, Math.min(bounds.maxY, node.position.y));

      // Track energy for convergence check
      totalEnergy += node.velocity.magnitude();
    }

    // Check for convergence
    if (totalEnergy < CONVERGENCE_THRESHOLD) {
      break;
    }
  }

  // Final collision resolution pass
  resolveCollisions(nodes);
}

/**
 * Convert absolute canvas coordinates (1000x1000) to percentage-based coordinates
 */
function convertToPercentageCoordinates(
  absX: number,
  absY: number,
  config: PositioningConfig
): { x: number; y: number } {
  // Canvas is 1000x1000, center at 500,500
  // Config provides center in percentage (typically 50, 52)
  const percentX = (absX / CANVAS_SIZE) * 100;
  const percentY = (absY / CANVAS_SIZE) * 100;
  
  return { x: percentX, y: percentY };
}

/**
 * Calculate angle and radius for PositionResult (for compatibility)
 */
function calculatePolarCoordinates(x: number, y: number): { angle: number; radius: number } {
  const dx = x - CENTER;
  const dy = y - CENTER;
  const radius = Math.sqrt(dx * dx + dy * dy);
  let angle = (Math.atan2(-dy, dx) * 180) / Math.PI; // Negative dy for screen coordinates
  if (angle < 0) angle += 360;
  
  return { angle, radius: (radius / CANVAS_SIZE) * 100 };
}

// ============================================================================
// MAIN PUBLIC API
// ============================================================================

/**
 * Main function: Calculate position for a career node using force-directed layout
 */
export function calculateCareerNodePosition(
  career: CareerPath,
  config: PositioningConfig,
  careerIndex: number = 0
): PositionResult {
  const pl = parseInt(career.level.replace('PL', ''));
  const plDiff = config.currentPL - pl;
  
  // Determine quadrant based on career characteristics
  const quadrant = determineQuadrant(plDiff, career.match, career.pathType);
  
  // Calculate ideal position in absolute coordinates
  const idealPos = calculateIdealPosition(career, config.currentPL, quadrant);
  
  // For single node positioning, return ideal position
  // (Full force simulation runs in calculateAllCareerPositions)
  const percentCoords = convertToPercentageCoordinates(idealPos.x, idealPos.y, config);
  const polar = calculatePolarCoordinates(idealPos.x, idealPos.y);
  
  return {
    x: percentCoords.x,
    y: percentCoords.y,
    quadrant,
    angle: polar.angle,
    radius: polar.radius
  };
}

/**
 * Calculate positions for all career paths using force-directed layout
 * This is the primary function that should be used for positioning multiple nodes
 */
export function calculateAllCareerPositions(
  careers: CareerPath[],
  config: PositioningConfig
): Record<string, { x: number; y: number }> {
  if (careers.length === 0) {
    return {};
  }

  // Initialize physics nodes
  const nodes: NodePhysics[] = careers.map((career) => {
    const pl = parseInt(career.level.replace('PL', ''));
    const plDiff = config.currentPL - pl;
    const quadrant = determineQuadrant(plDiff, career.match, career.pathType);
    const idealPos = calculateIdealPosition(career, config.currentPL, quadrant);
    
    return {
      career,
      position: idealPos.clone(),
      velocity: new Vector2D(0, 0),
      force: new Vector2D(0, 0),
      idealPosition: idealPos,
      quadrant,
      mass: 1.0,
      fixed: false,
    };
  });

  // Run force-directed simulation
  runForceSimulation(nodes);

  // Convert to percentage coordinates and return
  const positions: Record<string, { x: number; y: number }> = {};
  
  for (const node of nodes) {
    const percentCoords = convertToPercentageCoordinates(
      node.position.x,
      node.position.y,
      config
    );
    positions[node.career.id] = percentCoords;
  }

  return positions;
}

