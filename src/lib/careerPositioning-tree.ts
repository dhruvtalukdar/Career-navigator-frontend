/**
 * Tree-Based Career Positioning System with Hierarchical Cone Constraints
 * 
 * This system positions nodes on circular rings (by level) within angular cones
 * defined by their parent nodes. Each parent creates a cone for its children,
 * and children subdivide that cone among their own children.
 * 
 * Key Principles:
 * - Each level (PL) maps to a specific radius
 * - Each node has an angle and defines a cone for its children
 * - Children are distributed evenly within their parent's cone
 * - No global angular grid - each subtree is independent
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
  parentId?: string; // Parent node for tree structure
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

interface TreeNode {
  career: CareerPath;
  angle: number;           // Center angle of this node
  radius: number;          // Distance from center (based on PL)
  coneMin: number;         // Minimum angle for children
  coneMax: number;         // Maximum angle for children
  coneWidth: number;       // Total cone width for children
  children: TreeNode[];    // Child nodes in the tree
  x: number;              // Cartesian X coordinate
  y: number;              // Cartesian Y coordinate
  movementType: 'upward' | 'lateral' | 'changeScope'; // Movement category
  isOverflow: boolean;     // True if node exceeds capacity
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_SIZE = 1000;
const CENTER = 500;
const NODE_RADIUS = 30;

// Radius mapping for each PL level (outward as PL decreases)
// Lower PL number = higher position = larger radius (further from center)
const BASE_RADIUS = 150;
const RADIUS_INCREMENT = 80;

function getRadiusForPL(pl: number, currentPL: number): number {
  const levelDiff = currentPL - pl;
  // PL decreases (higher level) → radius increases (further out)
  // PL increases (lower level) → radius decreases (closer in)
  return BASE_RADIUS + levelDiff * RADIUS_INCREMENT;
}

// Fixed angular ranges for movement types (in degrees)
const MOVEMENT_CONES = {
  upward: { min: 45, max: 135 },      // Career advancement (PL < current)
  lateral: { min: -45, max: 45 },     // Same level (PL = current)
  changeScope: { min: 225, max: 315 } // Lower/different (PL > current)
};

// Maximum nodes per (circle + cone) combination
const MAX_NODES_PER_CONE = 2;

// Default cone width for children (in degrees)
const DEFAULT_CONE_WIDTH = 60;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine movement type based on PL relationship
 */
function getMovementType(pl: number, currentPL: number): 'upward' | 'lateral' | 'changeScope' {
  if (pl < currentPL) return 'upward';      // Career advancement
  if (pl === currentPL) return 'lateral';   // Same level
  return 'changeScope';                      // Lower/different level
}

/**
 * Get cone bounds for a movement type
 */
function getConeBounds(movementType: 'upward' | 'lateral' | 'changeScope'): { min: number; max: number } {
  return MOVEMENT_CONES[movementType];
}

// Cone width adjustment based on number of children
function calculateConeWidth(numChildren: number, parentConeWidth: number): number {
  if (numChildren === 0) return DEFAULT_CONE_WIDTH;
  if (numChildren === 1) return Math.min(DEFAULT_CONE_WIDTH, parentConeWidth * 0.8);
  if (numChildren === 2) return Math.min(45, parentConeWidth * 0.7);
  return Math.min(30, parentConeWidth * 0.6);
}

// ============================================================================
// TREE CONSTRUCTION
// ============================================================================

/**
 * Build tree structure from flat career paths
 * Nodes without parentId are root nodes
 */
function buildTree(careers: CareerPath[], currentPL: number): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];
  
  // Create all nodes first
  for (const career of careers) {
    const pl = parseInt(career.level.replace('PL', ''));
    const radius = getRadiusForPL(pl, currentPL);
    const movementType = getMovementType(pl, currentPL);
    
    const node: TreeNode = {
      career,
      angle: 0,           // Will be set during placement
      radius,
      coneMin: 0,         // Will be calculated
      coneMax: 0,         // Will be calculated
      coneWidth: DEFAULT_CONE_WIDTH,
      children: [],
      x: 0,
      y: 0,
      movementType,
      isOverflow: false,
    };
    
    nodeMap.set(career.id, node);
  }
  
  // Build parent-child relationships
  for (const career of careers) {
    const node = nodeMap.get(career.id)!;
    
    if (career.parentId && nodeMap.has(career.parentId)) {
      const parent = nodeMap.get(career.parentId)!;
      parent.children.push(node);
    } else {
      // No parent - this is a root node
      rootNodes.push(node);
    }
  }
  
  return rootNodes;
}

/**
 * Build a simple quadrant-based tree structure when no parent relationships exist
 * This creates a virtual tree based on quadrant assignment
 */
function buildQuadrantBasedTree(careers: CareerPath[], currentPL: number): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  
  // Group careers by quadrant
  const quadrantGroups: Record<string, CareerPath[]> = {
    topRight: [],
    topLeft: [],
    bottomRight: [],
    bottomLeft: [],
  };
  
  // Assign careers to quadrants
  for (const career of careers) {
    const pl = parseInt(career.level.replace('PL', ''));
    const plDiff = currentPL - pl;
    const isAdvancement = plDiff > 0;
    const isHighMatch = career.match >= 70;
    
    let quadrant: string;
    if (isAdvancement && isHighMatch) quadrant = 'topRight';
    else if (isAdvancement && !isHighMatch) quadrant = 'topLeft';
    else if (!isAdvancement && isHighMatch) quadrant = 'bottomRight';
    else quadrant = 'bottomLeft';
    
    quadrantGroups[quadrant].push(career);
  }
  
  // Create virtual root nodes for each quadrant
  const rootNodes: TreeNode[] = [];
  const quadrantAngles: Record<string, number> = {
    topRight: 45,
    topLeft: 135,
    bottomLeft: 225,
    bottomRight: 315,
  };
  
  Object.entries(quadrantGroups).forEach(([quadrant, careers]) => {
    if (careers.length === 0) return;
    
    // Sort by PL level (closest to current first)
    careers.sort((a, b) => {
      const plA = parseInt(a.level.replace('PL', ''));
      const plB = parseInt(b.level.replace('PL', ''));
      return Math.abs(currentPL - plA) - Math.abs(currentPL - plB);
    });
    
    // Group by PL level within quadrant
    const plGroups = new Map<number, CareerPath[]>();
    for (const career of careers) {
      const pl = parseInt(career.level.replace('PL', ''));
      if (!plGroups.has(pl)) plGroups.set(pl, []);
      plGroups.get(pl)!.push(career);
    }
    
    // Create nodes, applying capacity limits
    plGroups.forEach((plCareers, pl) => {
      const radius = getRadiusForPL(pl, currentPL);
      const movementType = getMovementType(pl, currentPL);
      const coneBounds = getConeBounds(movementType);
      const coneWidth = coneBounds.max - coneBounds.min;
      
      // Apply capacity limit: max 2 nodes per cone
      const visibleNodes = plCareers.slice(0, MAX_NODES_PER_CONE);
      const overflowCount = plCareers.length - visibleNodes.length;
      
      for (const career of visibleNodes) {
        const node: TreeNode = {
          career,
          angle: quadrantAngles[quadrant],
          radius,
          coneMin: coneBounds.min,
          coneMax: coneBounds.max,
          coneWidth,
          children: [],
          x: 0,
          y: 0,
          movementType,
          isOverflow: false,
        };
        
        nodeMap.set(career.id, node);
        rootNodes.push(node);
      }
      
      // Create overflow indicator if needed
      if (overflowCount > 0) {
        const overflowCareer: CareerPath = {
          id: `overflow-${quadrant}-${pl}`,
          title: `+${overflowCount} more ${movementType}`,
          level: `PL${pl}`,
          match: 0,
          pathType: 'exploratory'
        };
        
        const overflowNode: TreeNode = {
          career: overflowCareer,
          angle: quadrantAngles[quadrant],
          radius,
          coneMin: coneBounds.min,
          coneMax: coneBounds.max,
          coneWidth,
          children: [],
          x: 0,
          y: 0,
          movementType,
          isOverflow: true,
        };
        
        rootNodes.push(overflowNode);
      }
    });
  });
  
  return rootNodes;
}

// ============================================================================
// TREE POSITIONING
// ============================================================================

/**
 * Position a node and its children recursively within a cone
 */
function positionNodeAndChildren(
  node: TreeNode,
  parentAngle: number,
  parentConeMin: number,
  parentConeMax: number,
  isRoot: boolean = false
): void {
  const numChildren = node.children.length;
  
  if (isRoot) {
    // Root node: use its default angle
    node.coneMin = node.angle - (node.coneWidth / 2);
    node.coneMax = node.angle + (node.coneWidth / 2);
  } else {
    // Non-root: angle is already set by parent
    // Define cone for this node's children
    const childConeWidth = calculateConeWidth(numChildren, parentConeMax - parentConeMin);
    node.coneWidth = childConeWidth;
    node.coneMin = node.angle - (childConeWidth / 2);
    node.coneMax = node.angle + (childConeWidth / 2);
  }
  
  // Calculate Cartesian coordinates
  const angleRad = (node.angle * Math.PI) / 180;
  node.x = CENTER + node.radius * Math.cos(angleRad);
  node.y = CENTER + node.radius * Math.sin(angleRad);
  
  // Position children within this node's cone
  if (numChildren > 0) {
    const coneWidth = node.coneMax - node.coneMin;
    const sectorSize = coneWidth / numChildren;
    
    // Sort children by match percentage (higher match gets better position)
    const sortedChildren = [...node.children].sort((a, b) => b.career.match - a.career.match);
    
    sortedChildren.forEach((child, index) => {
      // Calculate angle for this child within parent's cone
      // Center each child within its sector
      child.angle = node.coneMin + sectorSize * (index + 0.5);
      
      // Recursively position this child and its descendants
      positionNodeAndChildren(child, node.angle, node.coneMin, node.coneMax, false);
    });
  }
}

/**
 * Position all root nodes with equal angular spacing
 */
function positionRootNodes(roots: TreeNode[]): void {
  if (roots.length === 0) return;
  
  if (roots.length === 1) {
    // Single root - position at 0 degrees (right)
    roots[0].angle = 0;
    positionNodeAndChildren(roots[0], 0, -180, 180, true);
    return;
  }
  
  // Multiple roots - distribute around circle
  const angleStep = 360 / roots.length;
  
  roots.forEach((root, index) => {
    // Position root at its angle
    root.angle = index * angleStep;
    
    // Define cone for this root's children
    const halfCone = root.coneWidth / 2;
    root.coneMin = root.angle - halfCone;
    root.coneMax = root.angle + halfCone;
    
    // Position this root and all its descendants
    positionNodeAndChildren(root, root.angle, root.coneMin, root.coneMax, true);
  });
}

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert tree nodes to position records
 */
function extractPositions(nodes: TreeNode[]): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {};
  
  function traverse(node: TreeNode) {
    positions[node.career.id] = {
      x: (node.x / CANVAS_SIZE) * 100,
      y: (node.y / CANVAS_SIZE) * 100,
    };
    
    node.children.forEach(traverse);
  }
  
  nodes.forEach(traverse);
  return positions;
}

/**
 * Determine quadrant from angle
 */
function getQuadrantFromAngle(angle: number): 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft' {
  // Normalize angle to 0-360
  const normalized = ((angle % 360) + 360) % 360;
  
  if (normalized >= 0 && normalized < 90) return 'topRight';
  if (normalized >= 90 && normalized < 180) return 'topLeft';
  if (normalized >= 180 && normalized < 270) return 'bottomLeft';
  return 'bottomRight';
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Calculate position for a single career node
 */
export function calculateCareerNodePosition(
  career: CareerPath,
  config: PositioningConfig,
  careerIndex: number = 0
): PositionResult {
  const pl = parseInt(career.level.replace('PL', ''));
  const radius = getRadiusForPL(pl, config.currentPL);
  const movementType = getMovementType(pl, config.currentPL);
  const coneBounds = getConeBounds(movementType);
  const angle = (coneBounds.min + coneBounds.max) / 2; // Center of movement cone
  
  const angleRad = (angle * Math.PI) / 180;
  const x = CENTER + radius * Math.cos(angleRad);
  const y = CENTER + radius * Math.sin(angleRad);
  
  return {
    x: (x / CANVAS_SIZE) * 100,
    y: (y / CANVAS_SIZE) * 100,
    quadrant: getQuadrantFromAngle(angle),
    angle,
    radius: (radius / CANVAS_SIZE) * 100,
  };
}

/**
 * Calculate positions for all career paths using tree-based cone system
 * 
 * @param careers - Array of career paths (can include parentId for hierarchy)
 * @param config - Positioning configuration
 * @returns Record of career ID to position (x%, y%)
 */
export function calculateAllCareerPositions(
  careers: CareerPath[],
  config: PositioningConfig
): Record<string, { x: number; y: number }> {
  if (careers.length === 0) {
    return {};
  }
  
  // Check if any careers have parent relationships
  const hasParentRelationships = careers.some(c => c.parentId);
  
  // Build tree structure
  const rootNodes = hasParentRelationships
    ? buildTree(careers, config.currentPL)
    : buildQuadrantBasedTree(careers, config.currentPL);
  
  // Position all nodes
  positionRootNodes(rootNodes);
  
  // Extract positions
  return extractPositions(rootNodes);
}
