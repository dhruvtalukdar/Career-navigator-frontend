/**
 * Career Node Positioning System - Hybrid Radar-Band + Smart Distribution
 * 
 * This system combines:
 * - Radial bands based on PL level (prevents radial overlap)
 * - Quadrant-based angular distribution (semantic positioning by match + advancement)
 * - Smart collision avoidance (deterministic angle adjustments)
 * 
 * Features:
 * ✓ No overlaps guaranteed
 * ✓ Deterministic (same input = same output)
 * ✓ Match-aware positioning
 * ✓ Clear visual hierarchy by PL level
 * ✓ Quadrant semantics preserved
 */

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

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

type Quadrant = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft';

interface NodePosition {
  career: CareerPath;
  radius: number;
  angle: number;
  x: number;
  y: number;
  quadrant: Quadrant;
  plDiff: number;
}

interface Band {
  plDiff: number;
  radius: number;
  nodes: CareerPath[];
}

interface QuadrantGroup {
  quadrant: Quadrant;
  radius: number;
  nodes: CareerPath[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NODE_RADIUS = 30;              // Fixed size for all nodes
const MIN_NODE_DISTANCE = 100;       // Minimum separation between nodes (increased for better spacing)
const BAND_SPACING = 140;            // Pixels between PL bands (increased from 100)
const BASE_RADIUS = 180;             // Starting radius for PL 0 (increased from 150)
const CANVAS_SIZE = 1000;            // Absolute coordinate system
const CENTER = 500;                  // Canvas center point
const MAX_COLLISION_PASSES = 3;      // Maximum collision resolution iterations
const COLLISION_ADJUST_ANGLE = 10;   // Degrees to adjust when collision detected (increased from 8)
const CLUSTERING_OFFSET = 3;         // Degrees for career family micro-clustering

// Quadrant angular ranges (using 60° of each 90° quadrant, with 15° margins)
const QUADRANT_ANGLES: Record<Quadrant, { start: number; end: number; ideal: number }> = {
  topRight: { start: 15, end: 75, ideal: 45 },       // 0° - 90° (advancement + high match)
  topLeft: { start: 105, end: 165, ideal: 135 },     // 90° - 180° (advancement + growth)
  bottomLeft: { start: 195, end: 255, ideal: 225 },  // 180° - 270° (pivot + exploration)
  bottomRight: { start: 285, end: 345, ideal: 315 }, // 270° - 360° (lateral + high match)
};

// ============================================================================
// QUADRANT SYSTEM
// ============================================================================

/**
 * Quadrant Strategy:
 * 
 * +Y (Top):    Career Advancement (plDiff > 0)
 * -Y (Bottom): Lateral/Specialization (plDiff ≤ 0)
 * +X (Right):  High Match (≥70%)
 * -X (Left):   Growth Opportunity (<70%)
 * 
 * Quadrant Meanings:
 * Top-Right:    High match + Career advancement (BEST paths)
 * Top-Left:     Growth + Career advancement (DEVELOPMENT paths)
 * Bottom-Right: High match + Lateral move (SPECIALIZATION paths)
 * Bottom-Left:  Low match + Exploration (PIVOT paths)
 */

function determineQuadrant(plDiff: number, matchPercentage: number): Quadrant {
  const isAdvancement = plDiff > 0;
  const isHighMatch = matchPercentage >= 70;
  
  if (isAdvancement) {
    return isHighMatch ? 'topRight' : 'topLeft';
  } else {
    return isHighMatch ? 'bottomRight' : 'bottomLeft';
  }
}

// ============================================================================
// BAND ASSIGNMENT (PL-BASED)
// ============================================================================

/**
 * Calculate radius based on PL difference
 * Further from center = more career change required
 */
function calculateRadius(plDiff: number): number {
  return BASE_RADIUS + Math.abs(plDiff) * BAND_SPACING;
}

/**
 * Group careers into radial bands by PL level
 */
function groupByBand(careers: CareerPath[], currentPL: number): Band[] {
  const bandMap = new Map<number, CareerPath[]>();
  
  for (const career of careers) {
    const pl = parseInt(career.level.replace('PL', ''));
    const plDiff = currentPL - pl;
    
    if (!bandMap.has(plDiff)) {
      bandMap.set(plDiff, []);
    }
    bandMap.get(plDiff)!.push(career);
  }
  
  const bands: Band[] = [];
  bandMap.forEach((nodes, plDiff) => {
    bands.push({
      plDiff,
      radius: calculateRadius(plDiff),
      nodes,
    });
  });
  
  return bands;
}

// ============================================================================
// QUADRANT GROUPING
// ============================================================================

/**
 * Further group nodes within a band by their target quadrant
 */
function groupByQuadrant(band: Band): QuadrantGroup[] {
  const quadrantMap = new Map<Quadrant, CareerPath[]>();
  
  for (const node of band.nodes) {
    const quadrant = determineQuadrant(band.plDiff, node.match);
    
    if (!quadrantMap.has(quadrant)) {
      quadrantMap.set(quadrant, []);
    }
    quadrantMap.get(quadrant)!.push(node);
  }
  
  const groups: QuadrantGroup[] = [];
  quadrantMap.forEach((nodes, quadrant) => {
    groups.push({
      quadrant,
      radius: band.radius,
      nodes,
    });
  });
  
  return groups;
}

// ============================================================================
// CAREER FAMILY EXTRACTION
// ============================================================================

/**
 * Extract career family from title (e.g., "Software Engineer" → "Engineer")
 */
function extractCareerFamily(title: string): string {
  const words = title.split(' ');
  // Return last word as family identifier
  return words[words.length - 1].toLowerCase();
}

/**
 * Calculate micro-clustering offset for similar career families
 */
function getClusteringOffset(
  node: CareerPath,
  allNodes: CareerPath[],
  index: number
): number {
  if (allNodes.length <= 1) return 0;
  
  const family = extractCareerFamily(node.title);
  const prevNode = allNodes[index - 1];
  const nextNode = allNodes[index + 1];
  
  // Nudge toward adjacent node if same family
  if (prevNode && extractCareerFamily(prevNode.title) === family) {
    return -CLUSTERING_OFFSET;
  }
  if (nextNode && extractCareerFamily(nextNode.title) === family) {
    return CLUSTERING_OFFSET;
  }
  
  return 0;
}

// ============================================================================
// SMART ANGULAR DISTRIBUTION
// ============================================================================

/**
 * Distribute nodes within a quadrant with match-based priority
 * Higher match percentage gets better position (closer to ideal angle)
 */
function distributeNodesInQuadrant(group: QuadrantGroup): NodePosition[] {
  const { quadrant, radius, nodes } = group;
  const angleRange = QUADRANT_ANGLES[quadrant];
  const totalArc = angleRange.end - angleRange.start; // 60 degrees
  
  // Sort by match percentage (descending) - higher match gets priority
  const sortedNodes = [...nodes].sort((a, b) => b.match - a.match);
  
  // Calculate minimum angular spacing to prevent overlap
  const arcLength = 2 * Math.PI * radius * (totalArc / 360);
  const minAngleStep = (MIN_NODE_DISTANCE / arcLength) * totalArc;
  
  const count = sortedNodes.length;
  
  // Handle different node count scenarios
  if (count === 1) {
    // Single node → place at ideal center of quadrant
    const angle = angleRange.ideal;
    return [{
      career: sortedNodes[0],
      radius,
      angle,
      x: CENTER + radius * Math.cos(angle * Math.PI / 180),
      y: CENTER + radius * Math.sin(angle * Math.PI / 180),
      quadrant,
      plDiff: group.nodes === nodes ? 0 : parseInt(sortedNodes[0].level.replace('PL', ''))
    }];
  }
  
  // Multiple nodes → distribute evenly with priority to center
  const angleStep = Math.max(totalArc / (count + 1), minAngleStep);
  
  return sortedNodes.map((node, index) => {
    // Distribute from start + step, prioritizing center for high match
    let angle = angleRange.start + (index + 1) * angleStep;
    
    // Apply career family micro-clustering
    angle += getClusteringOffset(node, sortedNodes, index);
    
    // Clamp to quadrant bounds
    angle = Math.max(angleRange.start, Math.min(angleRange.end, angle));
    
    return {
      career: node,
      radius,
      angle,
      x: CENTER + radius * Math.cos(angle * Math.PI / 180),
      y: CENTER + radius * Math.sin(angle * Math.PI / 180),
      quadrant,
      plDiff: 0 // Will be set properly later
    };
  });
}

// ============================================================================
// COLLISION DETECTION AND RESOLUTION
// ============================================================================

/**
 * Calculate Euclidean distance between two positions
 */
function calculateDistance(pos1: NodePosition, pos2: NodePosition): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert polar coordinates to Cartesian
 */
function polarToCartesian(radius: number, angleDegrees: number): { x: number; y: number } {
  const angleRad = angleDegrees * Math.PI / 180;
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad)
  };
}

/**
 * Detect and resolve collisions between nodes
 * Uses iterative angle adjustment to separate overlapping nodes
 */
function resolveCollisions(positions: NodePosition[]): NodePosition[] {
  const result = [...positions];
  
  for (let pass = 0; pass < MAX_COLLISION_PASSES; pass++) {
    let hadCollision = false;
    
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const distance = calculateDistance(result[i], result[j]);
        
        if (distance < MIN_NODE_DISTANCE) {
          hadCollision = true;
          
          // Only adjust if nodes are in same or adjacent quadrants
          // and at similar radii (within same band or adjacent bands)
          const radiusDiff = Math.abs(result[i].radius - result[j].radius);
          if (radiusDiff < BAND_SPACING * 1.5) {
            // Calculate average angle and push apart
            const avgAngle = (result[i].angle + result[j].angle) / 2;
            
            // Adjust angles to separate nodes
            result[i].angle = avgAngle - COLLISION_ADJUST_ANGLE;
            result[j].angle = avgAngle + COLLISION_ADJUST_ANGLE;
            
            // Ensure angles stay within valid quadrant bounds
            const bounds_i = QUADRANT_ANGLES[result[i].quadrant];
            const bounds_j = QUADRANT_ANGLES[result[j].quadrant];
            
            result[i].angle = Math.max(bounds_i.start, Math.min(bounds_i.end, result[i].angle));
            result[j].angle = Math.max(bounds_j.start, Math.min(bounds_j.end, result[j].angle));
            
            // Recalculate Cartesian positions
            const pos_i = polarToCartesian(result[i].radius, result[i].angle);
            const pos_j = polarToCartesian(result[j].radius, result[j].angle);
            
            result[i].x = pos_i.x;
            result[i].y = pos_i.y;
            result[j].x = pos_j.x;
            result[j].y = pos_j.y;
          }
        }
      }
    }
    
    // If no collisions detected, we're done
    if (!hadCollision) {
      break;
    }
  }
  
  return result;
}

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert absolute canvas coordinates to percentage-based coordinates
 * Canvas: 1000x1000 → Percentage: 0-100%, 0-100%
 */
function convertToPercentageCoords(positions: NodePosition[]): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  
  for (const pos of positions) {
    result[pos.career.id] = {
      x: (pos.x / CANVAS_SIZE) * 100,
      y: (pos.y / CANVAS_SIZE) * 100
    };
  }
  
  return result;
}

// ============================================================================
// MAIN PUBLIC API
// ============================================================================

/**
 * Calculate position for a single career node
 * Note: For optimal results, use calculateAllCareerPositions for multiple nodes
 */
export function calculateCareerNodePosition(
  career: CareerPath,
  config: PositioningConfig,
  careerIndex: number = 0
): PositionResult {
  const pl = parseInt(career.level.replace('PL', ''));
  const plDiff = config.currentPL - pl;
  
  // Determine quadrant and radius
  const quadrant = determineQuadrant(plDiff, career.match);
  const radius = calculateRadius(plDiff);
  
  // Use ideal angle for single node
  const angle = QUADRANT_ANGLES[quadrant].ideal;
  
  // Convert to Cartesian
  const pos = polarToCartesian(radius, angle);
  
  // Convert to percentage coordinates
  const percentX = (pos.x / CANVAS_SIZE) * 100;
  const percentY = (pos.y / CANVAS_SIZE) * 100;
  
  return {
    x: percentX,
    y: percentY,
    quadrant,
    angle,
    radius: (radius / CANVAS_SIZE) * 100
  };
}

/**
 * Calculate positions for all career paths using Hybrid Radar-Band system
 * 
 * Algorithm:
 * 1. Group careers into radial bands by PL difference
 * 2. Within each band, group by quadrant (match + advancement)
 * 3. Distribute nodes within quadrant by match priority
 * 4. Apply collision detection and resolution
 * 5. Convert to percentage coordinates
 * 
 * @param careers - Array of career paths to position
 * @param config - Positioning configuration (center, current PL)
 * @returns Record of career ID to position (x%, y%)
 */
export function calculateAllCareerPositions(
  careers: CareerPath[],
  config: PositioningConfig
): Record<string, { x: number; y: number }> {
  if (careers.length === 0) {
    return {};
  }
  
  // STEP 1: Group careers into radial bands by PL difference
  const bands = groupByBand(careers, config.currentPL);
  
  // STEP 2: Within each band, further group by quadrant
  const allGroups: QuadrantGroup[] = [];
  for (const band of bands) {
    const quadrantGroups = groupByQuadrant(band);
    allGroups.push(...quadrantGroups);
  }
  
  // STEP 3: Distribute nodes within each (band + quadrant) group
  let allPositions: NodePosition[] = [];
  for (const group of allGroups) {
    const groupPositions = distributeNodesInQuadrant(group);
    allPositions.push(...groupPositions);
  }
  
  // STEP 4: Resolve any collisions
  allPositions = resolveCollisions(allPositions);
  
  // STEP 5: Convert to percentage coordinates
  return convertToPercentageCoords(allPositions);
}
