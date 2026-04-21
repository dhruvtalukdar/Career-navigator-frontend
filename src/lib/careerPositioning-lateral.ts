/**
 * Lateral Movement Career Positioning System
 * 
 * Cone-based positioning for lateral career moves (PL = current PL)
 * - Angular cone: 315° to 45° (90° total, right side, wraps around 0°)
 * - Concentric circles based on specialization depth
 * - Max 2 nodes per depth level within the cone
 * - Progressive reveal: deeper specializations appear when parent is expanded
 * - Parent-child hierarchy for specialization chains
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
  parentId?: string;
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
  expandedNodes?: Set<string>;
}

interface NodeWithPosition {
  career: CareerPath;
  angle: number;
  radius: number;
  x: number;
  y: number;
  plLevel: number;
  depth: number;
  children: NodeWithPosition[];
  isOverflow: boolean;
  hasChildren: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LATERAL_CONE = {
  startAngle: -45,   // degrees (same as 315°)
  endAngle: 45,      // degrees
  midAngle: 0,       // center of cone (right side)
  width: 90          // total cone width
};

const BASE_RADIUS = 240;          // Starting radius for first depth level (same as upward)
const RADIUS_INCREMENT = 130;     // Distance between depth circles (same as upward)
const MAX_NODES_PER_LEVEL = 2;    // Maximum nodes shown per depth level
const ANGULAR_OFFSET = 30;      // Degrees offset for 2-node placement (15% of cone width - SAME AS UPWARD)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate radius for a given depth level
 * Depth 0 = closest to center, higher depth = further out
 */
function getRadiusForDepth(depth: number): number {
  return BASE_RADIUS + depth * RADIUS_INCREMENT;
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
 * Group careers by depth level
 */
function groupByDepthLevel(careers: CareerPath[], depthMap: Map<string, number>): Map<number, CareerPath[]> {
  const grouped = new Map<number, CareerPath[]>();
  
  for (const career of careers) {
    const depth = depthMap.get(career.id) || 0;
    if (!grouped.has(depth)) {
      grouped.set(depth, []);
    }
    grouped.get(depth)!.push(career);
  }
  
  return grouped;
}

/**
 * Calculate angle placement for nodes at a given depth level
 */
function calculateAnglesForNodes(nodeCount: number): number[] {
  if (nodeCount === 1) {
    return [LATERAL_CONE.midAngle];
  } else if (nodeCount === 2) {
    return [
      LATERAL_CONE.midAngle - ANGULAR_OFFSET,
      LATERAL_CONE.midAngle + ANGULAR_OFFSET
    ];
  }
  
  return [LATERAL_CONE.midAngle];
}

/**
 * Build hierarchical tree structure from flat career paths
 */
function buildHierarchy(careers: CareerPath[]): Map<string, CareerPath[]> {
  const childrenMap = new Map<string, CareerPath[]>();
  
  for (const career of careers) {
    if (career.parentId) {
      if (!childrenMap.has(career.parentId)) {
        childrenMap.set(career.parentId, []);
      }
      childrenMap.get(career.parentId)!.push(career);
    }
  }
  
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
 * Calculate depth for each node (how many parents it has)
 */
function calculateDepths(careers: CareerPath[], childrenMap: Map<string, CareerPath[]>): Map<string, number> {
  const depthMap = new Map<string, number>();
  
  const calculateDepth = (nodeId: string, parentDepth: number): void => {
    depthMap.set(nodeId, parentDepth);
    const children = childrenMap.get(nodeId);
    if (children) {
      children.forEach(child => calculateDepth(child.id, parentDepth + 1));
    }
  };
  
  getRootNodes(careers).forEach(root => calculateDepth(root.id, 0));
  
  return depthMap;
}

/**
 * Process nodes at a specific depth level with parent angle inheritance
 */
function processNodesAtDepth(
  nodes: CareerPath[],
  depth: number,
  currentPL: number,
  centerX: number,
  centerY: number,
  childrenMap: Map<string, CareerPath[]>,
  expandedNodes: Set<string>,
  parentAngle?: number
): NodeWithPosition[] {
  const radius = getRadiusForDepth(depth);
  const positions: NodeWithPosition[] = [];
  
  const sortedNodes = [...nodes].sort((a, b) => b.match - a.match);
  const visibleNodes = sortedNodes.slice(0, MAX_NODES_PER_LEVEL);
  const overflowNodes = sortedNodes.slice(MAX_NODES_PER_LEVEL);
  
  const angles = parentAngle !== undefined 
    ? [parentAngle]
    : calculateAnglesForNodes(visibleNodes.length);
  
  visibleNodes.forEach((node, index) => {
    const angle = parentAngle !== undefined ? parentAngle : angles[index];
    const { x, y } = polarToCartesian(angle, radius, centerX, centerY);
    const hasChildren = childrenMap.has(node.id);
    
    let children: NodeWithPosition[] = [];
    if (hasChildren && expandedNodes.has(node.id)) {
      const childNodes = childrenMap.get(node.id)!;
      const singleChild = childNodes.slice(0, 1);
      
      const childPositions = processNodesAtDepth(
        singleChild,
        depth + 1,
        currentPL,
        centerX,
        centerY,
        childrenMap,
        expandedNodes,
        angle
      );
      children.push(...childPositions);
    }
    
    positions.push({
      career: node,
      angle,
      radius,
      x,
      y,
      plLevel: currentPL,
      depth,
      children,
      isOverflow: false,
      hasChildren
    });
  });
  
  if (overflowNodes.length > 0) {
    const firstOverflowNode = overflowNodes[0];
    const angle = parentAngle !== undefined ? parentAngle : LATERAL_CONE.midAngle;
    const { x, y } = polarToCartesian(angle, radius, centerX, centerY);
    
    positions.push({
      career: {
        ...firstOverflowNode,
        id: `overflow-lateral-depth${depth}`,
        title: `+${overflowNodes.length} more`
      },
      angle,
      radius,
      x,
      y,
      plLevel: currentPL,
      depth,
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
 * Calculate positions for lateral movement career paths
 * Returns a map of node ID to position result
 */
export function calculateLateralPositions(
  careers: CareerPath[],
  config: PositioningConfig
): Map<string, PositionResult> {
  const { centerX, centerY, currentPL, expandedNodes = new Set() } = config;
  const positionMap = new Map<string, PositionResult>();
  
  // Filter only lateral movement nodes (PL = currentPL)
  const lateralCareers = careers.filter(career => {
    const pl = parseInt(career.level.replace('PL', ''));
    return pl === currentPL;
  });
  
  if (lateralCareers.length === 0) {
    return positionMap;
  }
  
  const childrenMap = buildHierarchy(lateralCareers);
  const rootNodes = getRootNodes(lateralCareers);
  const depthMap = calculateDepths(lateralCareers, childrenMap);
  
  const rootByDepth = groupByDepthLevel(rootNodes, depthMap);
  const sortedDepthLevels = Array.from(rootByDepth.keys()).sort((a, b) => a - b);
  
  for (const depth of sortedDepthLevels) {
    const nodesAtDepth = rootByDepth.get(depth)!;
    const positions = processNodesAtDepth(
      nodesAtDepth,
      depth,
      currentPL,
      centerX,
      centerY,
      childrenMap,
      expandedNodes,
      undefined
    );
    
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
