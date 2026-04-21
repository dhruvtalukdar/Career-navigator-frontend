/**
 * Upward Movement Career Positioning System
 * 
 * Cone-based positioning for career advancement paths (PL < current PL)
 * - Angular cone: 45° to 135° (90° total, centered at 90°)
 * - Concentric circles based on PL levels
 * - Max 2 nodes per PL level within the cone
 * - Progressive reveal: deeper PL nodes appear when parent is expanded
 * - Parent-child hierarchy for career progression chains
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
  parentId?: string; // Parent node for hierarchical structure
}

export interface PositionResult {
  x: number;
  y: number;
  angle: number;
  radius: number;
  plLevel: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isOverflow: boolean;
  overflowCount?: number;
}

export interface PositioningConfig {
  centerX: number;
  centerY: number;
  currentPL: number;
  expandedNodes?: Set<string>; // Track which nodes are expanded
}

interface NodeWithPosition {
  career: CareerPath;
  angle: number;
  radius: number;
  x: number;
  y: number;
  plLevel: number;
  children: NodeWithPosition[];
  isOverflow: boolean;
  hasChildren: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UPWARD_CONE = {
  startAngle: 45,   // degrees
  endAngle: 135,    // degrees
  midAngle: 90,     // center of cone
  width: 90         // total cone width
};

const BASE_RADIUS = 240;          // Starting radius for first PL level
const RADIUS_INCREMENT = 130;     // Distance between PL circles
const MAX_NODES_PER_LEVEL = 2;    // Maximum nodes shown per PL level
const ANGULAR_OFFSET = 15;      // Degrees offset for 2-node placement (15% of cone width)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate radius for a given PL level
 * Lower PL number (higher career level) = larger radius (further from center)
 */
function getRadiusForPL(pl: number, currentPL: number): number {
  const levelDiff = currentPL - pl;
  return BASE_RADIUS + levelDiff * RADIUS_INCREMENT;
}

/**
 * Convert polar coordinates to Cartesian percentages
 * Note: Y-axis is inverted for screen coordinates (negative Y = upward on screen)
 */
function polarToCartesian(angle: number, radius: number, centerX: number, centerY: number): { x: number; y: number } {
  const angleRad = (angle * Math.PI) / 180;
  
  // Convert radius from pixels to percentage (assuming 1000px canvas = 100%)
  const radiusPercent = (radius / 1000) * 100;
  
  const x = centerX + radiusPercent * Math.cos(angleRad);
  // Invert Y-axis: subtract instead of add to make positive angles go upward
  const y = centerY - radiusPercent * Math.sin(angleRad);
  
  return { x, y };
}

/**
 * Group careers by PL level
 */
function groupByPLLevel(careers: CareerPath[]): Map<number, CareerPath[]> {
  const grouped = new Map<number, CareerPath[]>();
  
  for (const career of careers) {
    const pl = parseInt(career.level.replace('PL', ''));
    if (!grouped.has(pl)) {
      grouped.set(pl, []);
    }
    grouped.get(pl)!.push(career);
  }
  
  return grouped;
}

/**
 * Calculate angle placement for nodes at a given PL level
 */
function calculateAnglesForNodes(nodeCount: number): number[] {
  if (nodeCount === 1) {
    return [UPWARD_CONE.midAngle];
  } else if (nodeCount === 2) {
    return [
      UPWARD_CONE.midAngle - ANGULAR_OFFSET,
      UPWARD_CONE.midAngle + ANGULAR_OFFSET
    ];
  }
  
  // Shouldn't reach here due to MAX_NODES_PER_LEVEL
  return [UPWARD_CONE.midAngle];
}

/**
 * Build hierarchical tree structure from flat career paths
 */
function buildHierarchy(careers: CareerPath[]): Map<string, CareerPath[]> {
  const childrenMap = new Map<string, CareerPath[]>();
  
  // Group children by parent
  for (const career of careers) {
    if (career.parentId) {
      if (!childrenMap.has(career.parentId)) {
        childrenMap.set(career.parentId, []);
      }
      childrenMap.get(career.parentId)!.push(career);
    }
  }
  
  // Sort children by match percentage (descending)
  childrenMap.forEach((children) => {
    children.sort((a, b) => b.match - a.match);
  });
  
  return childrenMap;
}

/**
 * Get root nodes (nodes without parents)
 */
function getRootNodes(careers: CareerPath[]): CareerPath[] {
  return careers.filter(career => !career.parentId);
}

/**
 * Process nodes at a specific PL level with parent angle inheritance
 */
function processNodesAtLevel(
  nodes: CareerPath[],
  plLevel: number,
  currentPL: number,
  centerX: number,
  centerY: number,
  childrenMap: Map<string, CareerPath[]>,
  expandedNodes: Set<string>,
  parentAngle?: number // Inherit angle from parent for straight line progression
): NodeWithPosition[] {
  const radius = getRadiusForPL(plLevel, currentPL);
  const positions: NodeWithPosition[] = [];
  
  // Sort by match percentage (descending)
  const sortedNodes = [...nodes].sort((a, b) => b.match - a.match);
  
  // Take top MAX_NODES_PER_LEVEL nodes
  const visibleNodes = sortedNodes.slice(0, MAX_NODES_PER_LEVEL);
  const overflowNodes = sortedNodes.slice(MAX_NODES_PER_LEVEL);
  
  // Calculate angles for visible nodes (or use parent angle if provided)
  const angles = parentAngle !== undefined 
    ? [parentAngle] // Use same angle as parent for straight line
    : calculateAnglesForNodes(visibleNodes.length);
  
  visibleNodes.forEach((node, index) => {
    const angle = parentAngle !== undefined ? parentAngle : angles[index];
    const { x, y } = polarToCartesian(angle, radius, centerX, centerY);
    const hasChildren = childrenMap.has(node.id);
    
    // Recursively process children if node is expanded
    let children: NodeWithPosition[] = [];
    if (hasChildren && expandedNodes.has(node.id)) {
      const childNodes = childrenMap.get(node.id)!;
      // Take only the first child to maintain single line progression
      const singleChild = childNodes.slice(0, 1);
      const childPLLevels = groupByPLLevel(singleChild);
      
      childPLLevels.forEach((childNodesAtLevel, childPL) => {
        // Pass the current node's angle to children for straight line
        const childPositions = processNodesAtLevel(
          childNodesAtLevel,
          childPL,
          currentPL,
          centerX,
          centerY,
          childrenMap,
          expandedNodes,
          angle // Inherit this node's angle
        );
        children.push(...childPositions);
      });
    }
    
    positions.push({
      career: node,
      angle,
      radius,
      x,
      y,
      plLevel,
      children,
      isOverflow: false,
      hasChildren
    });
  });
  
  // Handle overflow nodes (show as "+X more" badge)
  if (overflowNodes.length > 0) {
    // Create a virtual overflow node
    const firstOverflowNode = overflowNodes[0];
    const angle = parentAngle !== undefined ? parentAngle : UPWARD_CONE.midAngle;
    const { x, y } = polarToCartesian(angle, radius, centerX, centerY);
    
    positions.push({
      career: {
        ...firstOverflowNode,
        id: `overflow-pl${plLevel}`,
        title: `+${overflowNodes.length} more`
      },
      angle,
      radius,
      x,
      y,
      plLevel,
      children: [],
      isOverflow: true,
      hasChildren: false
    });
  }
  
  return positions;
}

// ============================================================================
// MAIN POSITIONING FUNCTION
// ============================================================================

/**
 * Calculate positions for all upward movement career paths
 * Returns a map of node ID to position result
 */
export function calculateUpwardPositions(
  careers: CareerPath[],
  config: PositioningConfig
): Map<string, PositionResult> {
  const { centerX, centerY, currentPL, expandedNodes = new Set() } = config;
  const positionMap = new Map<string, PositionResult>();
  
  // Filter only upward movement nodes (PL < currentPL)
  const upwardCareers = careers.filter(career => {
    const pl = parseInt(career.level.replace('PL', ''));
    return pl < currentPL;
  });
  
  if (upwardCareers.length === 0) {
    return positionMap;
  }
  
  // Build hierarchy
  const childrenMap = buildHierarchy(upwardCareers);
  const rootNodes = getRootNodes(upwardCareers);
  
  // Group root nodes by PL level
  const rootByPL = groupByPLLevel(rootNodes);
  
  // Process each PL level starting from closest to current (highest PL number)
  const sortedPLLevels = Array.from(rootByPL.keys()).sort((a, b) => b - a);
  
  for (const plLevel of sortedPLLevels) {
    const nodesAtLevel = rootByPL.get(plLevel)!;
    const positions = processNodesAtLevel(
      nodesAtLevel,
      plLevel,
      currentPL,
      centerX,
      centerY,
      childrenMap,
      expandedNodes,
      undefined // Root nodes get calculated angles
    );
    
    // Flatten tree into position map
    const flattenPositions = (nodePositions: NodeWithPosition[]) => {
      for (const nodePos of nodePositions) {
        positionMap.set(nodePos.career.id, {
          x: nodePos.x,
          y: nodePos.y,
          angle: nodePos.angle,
          radius: nodePos.radius,
          plLevel: nodePos.plLevel,
          hasChildren: nodePos.hasChildren,
          isExpanded: expandedNodes.has(nodePos.career.id),
          isOverflow: nodePos.isOverflow,
          overflowCount: nodePos.isOverflow 
            ? parseInt(nodePos.career.title.replace(/\D/g, '')) 
            : undefined
        });
        
        // Recursively flatten children
        if (nodePos.children.length > 0) {
          flattenPositions(nodePos.children);
        }
      }
    };
    
    flattenPositions(positions);
  }
  
  return positionMap;
}

/**
 * Get all visible node IDs (including children of expanded nodes)
 */
export function getVisibleNodeIds(
  careers: CareerPath[],
  expandedNodes: Set<string>
): Set<string> {
  const visible = new Set<string>();
  const childrenMap = buildHierarchy(careers);
  const rootNodes = getRootNodes(careers);
  
  const addVisibleNodes = (nodes: CareerPath[]) => {
    for (const node of nodes) {
      visible.add(node.id);
      
      if (expandedNodes.has(node.id) && childrenMap.has(node.id)) {
        addVisibleNodes(childrenMap.get(node.id)!);
      }
    }
  };
  
  addVisibleNodes(rootNodes);
  return visible;
}
