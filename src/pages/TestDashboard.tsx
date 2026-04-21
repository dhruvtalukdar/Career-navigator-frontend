import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import FilterBar from '@/components/dashboard/FilterBar';
import CurrentRole from '@/components/dashboard/CurrentRole';
import CareerNode from '@/components/dashboard/CareerNode';
import MatchLegend from '@/components/dashboard/MatchLegend';
import ZoomControls from '@/components/dashboard/ZoomControls';
import DirectionLabel from '@/components/dashboard/DirectionLabel';
import RadialBackground from '@/components/dashboard/RadialBackground';
import { calculateUpwardPositions, type CareerPath as UpwardCareerPath } from '@/lib/careerPositioning-upward';
import { calculateLateralPositions, type CareerPath as LateralCareerPath } from '@/lib/careerPositioning-lateral';
import PathButton from '@/components/dashboard/PathButton';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type CareerPath = UpwardCareerPath | LateralCareerPath;

const TestDashboard = () => {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showOverflowDialog, setShowOverflowDialog] = useState(false);
  const [overflowType, setOverflowType] = useState<'upward' | 'lateral'>('upward');

  // Mock profile data
  const mockProfile = {
    name: 'Test User',
    current_role: 'Senior Software Engineer',
    current_pl_level: 'PL10',
  };

  // Test data: Both UPWARD and LATERAL movements
  // Each node has ONLY ONE child - forms straight radial lines
  const testCareerPaths: CareerPath[] = [
    // UPWARD MOVEMENT (PL < 10)
    // Branch 1: Technical Leadership Path
    { id: 'lead-eng', title: 'Lead Software Engineer', level: 'PL9', match: 88, pathType: 'technical' },
    { id: 'principal-eng', title: 'Principal Engineer', level: 'PL8', match: 92, pathType: 'technical', parentId: 'lead-eng' },
    { id: 'distinguished-eng', title: 'Distinguished Engineer', level: 'PL7', match: 93, pathType: 'technical', parentId: 'principal-eng' },
    { id: 'fellow', title: 'Engineering Fellow', level: 'PL6', match: 90, pathType: 'technical', parentId: 'distinguished-eng' },
    
    // Branch 2: Staff Engineering Path
    { id: 'staff-eng', title: 'Staff Engineer', level: 'PL9', match: 91, pathType: 'technical' },
    { id: 'staff-arch', title: 'Staff Architect', level: 'PL8', match: 90, pathType: 'technical', parentId: 'staff-eng' },
    { id: 'chief-arch', title: 'Chief Architect', level: 'PL7', match: 88, pathType: 'technical', parentId: 'staff-arch' },
    
    // Branch 3: Management Path (3rd upward - will show in overflow button)
    { id: 'eng-manager', title: 'Engineering Manager', level: 'PL9', match: 85, pathType: 'leadership' },
    { id: 'senior-manager', title: 'Senior Engineering Manager', level: 'PL8', match: 87, pathType: 'leadership', parentId: 'eng-manager' },
    { id: 'director-eng', title: 'Director of Engineering', level: 'PL7', match: 85, pathType: 'leadership', parentId: 'senior-manager' },
    
    // LATERAL MOVEMENT (PL = 10)
    // Branch 1: Backend Specialization
    { id: 'backend-eng', title: 'Senior Backend Engineer', level: 'PL10', match: 90, pathType: 'technical' },
    { id: 'api-specialist', title: 'API Architecture Specialist', level: 'PL10', match: 88, pathType: 'technical', parentId: 'backend-eng' },
    { id: 'microservices-expert', title: 'Microservices Expert', level: 'PL10', match: 85, pathType: 'technical', parentId: 'api-specialist' },
    
    // Branch 2: Frontend Specialization
    { id: 'frontend-eng', title: 'Senior Frontend Engineer', level: 'PL10', match: 87, pathType: 'technical' },
    { id: 'ui-architect', title: 'UI/UX Architect', level: 'PL10', match: 84, pathType: 'technical', parentId: 'frontend-eng' },
  ];

  // Calculate positions
  const centerX = 50;
  const centerY = 50;
  const currentPL = 10;

  // Calculate positions for both upward and lateral
  const upwardPositions = calculateUpwardPositions(testCareerPaths, {
    centerX,
    centerY,
    currentPL,
    expandedNodes,
  });

  const lateralPositions = calculateLateralPositions(testCareerPaths, {
    centerX,
    centerY,
    currentPL,
    expandedNodes,
  });

  // Combine both position maps
  const nodePositions = new Map([...upwardPositions, ...lateralPositions]);

  const handleNodeClick = (nodeId: string, hasChildren: boolean) => {
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
    
    if (hasChildren) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
          newSet.delete(nodeId);
        } else {
          newSet.add(nodeId);
        }
        return newSet;
      });
    }
  };

  // Get overflow nodes (nodes not shown due to max 2 per level limit)
  const getOverflowNodes = (type: 'upward' | 'lateral') => {
    const filteredCareers = testCareerPaths.filter(career => {
      const pl = parseInt(career.level.replace('PL', ''));
      return type === 'upward' ? pl < currentPL : pl === currentPL;
    });

    // Get root nodes only (no parents)
    const rootNodes = filteredCareers.filter(c => !c.parentId);
    
    // Return nodes beyond the first 2 (overflow)
    return rootNodes.slice(2).sort((a, b) => b.match - a.match);
  };

  const upwardOverflow = getOverflowNodes('upward');
  const lateralOverflow = getOverflowNodes('lateral');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Test Banner */}
      <div className="bg-purple-600 text-white px-4 py-2 text-center font-semibold flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-white hover:bg-purple-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Real Dashboard
        </Button>
        <span>🎯 CONE SYSTEM TEST - Upward + Lateral Movement</span>
        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      <div className="pt-[73px]">
        <FilterBar />
      </div>
      
      <main className="flex-1 relative overflow-hidden">
        {/* Radial background */}
        <RadialBackground 
          showRadarScan={false}
          onScanComplete={() => {}}
          showGrid={true}
        />

        {/* Zoom controls */}
        <ZoomControls
          zoom={zoom}
          onZoomIn={() => setZoom(Math.min(zoom + 10, 150))}
          onZoomOut={() => setZoom(Math.max(zoom - 10, 50))}
        />

        <div 
          className="relative h-full min-h-[calc(100vh-140px)] flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Direction Labels - Upward and Lateral */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
            <DirectionLabel direction="upward" />
          </div>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 z-10">
            <DirectionLabel direction="lateral" />
          </div>

          {/* Current Role (Center) */}
          <div 
            className="absolute z-20"
            style={{
              left: `${centerX}%`,
              top: `${centerY}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CurrentRole
              name={mockProfile.name}
              title={mockProfile.current_role}
              level={mockProfile.current_pl_level}
            />
          </div>

          {/* Connection Lines - SVG Layer */}
          {selectedNode && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(174 100% 31%)" />
                  <stop offset="100%" stopColor="hsl(174 100% 31%)" />
                </linearGradient>
              </defs>
              
              {(() => {
                const position = nodePositions.get(selectedNode);
                if (!position || position.isOverflow) return null;

                const career = testCareerPaths.find(c => c.id === selectedNode);
                if (!career) return null;

                // Determine parent position
                let parentX = centerX;
                let parentY = centerY;
                
                if (career.parentId && nodePositions.has(career.parentId)) {
                  const parentPosition = nodePositions.get(career.parentId)!;
                  parentX = parentPosition.x;
                  parentY = parentPosition.y;
                }

                return (
                  <g>
                    {/* Connection line */}
                    <line 
                      x1={`${parentX}%`} 
                      y1={`${parentY}%`} 
                      x2={`${position.x}%`} 
                      y2={`${position.y}%`} 
                      stroke="hsl(174 100% 31%)" 
                      strokeWidth="2.5" 
                      className="animate-line-draw"
                    />
                    {/* Parent dot */}
                    <circle 
                      cx={`${parentX}%`} 
                      cy={`${parentY}%`} 
                      r="5" 
                      fill="hsl(174 100% 31%)" 
                      className="animate-scale-in"
                    />
                    {/* Node dot */}
                    <circle 
                      cx={`${position.x}%`} 
                      cy={`${position.y}%`} 
                      r="5" 
                      fill="hsl(174 100% 31%)" 
                      className="animate-scale-in"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </g>
                );
              })()}
            </svg>
          )}

          {/* Career Nodes */}
          {Array.from(nodePositions.entries()).map(([nodeId, position]) => {
            const career = testCareerPaths.find(c => c.id === nodeId);
            if (!career) return null;

            return (
              <div
                key={nodeId}
                className="absolute z-10 transition-all duration-300 ease-out"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {position.isOverflow ? (
                  // Overflow badge
                  <div className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold cursor-pointer hover:bg-purple-600 transition-colors">
                    +{position.overflowCount} more
                  </div>
                ) : (
                  <div className="relative">
                    <CareerNode
                      title={career.title}
                      level={career.level}
                      matchPercentage={career.match}
                      isSelected={selectedNode === nodeId}
                      onClick={() => handleNodeClick(nodeId, position.hasChildren)}
                    />
                    {/* Expand/Collapse indicator */}
                    {position.hasChildren && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-1 shadow-md transition-transform duration-200 hover:scale-110">
                        {position.isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Match Legend */}
          <div className="absolute bottom-8 right-8 z-20">
            <MatchLegend />
          </div>

          {/* Overflow Path Buttons */}
          {upwardOverflow.length > 0 && (
            <div 
              className="absolute left-1/2 top-[42%] -translate-x-1/2 z-20 cursor-pointer" 
              onClick={() => { setOverflowType('upward'); setShowOverflowDialog(true); }}
            >
              <PathButton count={upwardOverflow.length} direction="upward" />
            </div>
          )}

          {lateralOverflow.length > 0 && (
            <div 
              className="absolute right-[18%] top-[52%] z-20 cursor-pointer" 
              onClick={() => { setOverflowType('lateral'); setShowOverflowDialog(true); }}
            >
              <PathButton count={lateralOverflow.length} direction="lateral" />
            </div>
          )}

          {/* Test Info Panel */}
          <div className="absolute top-8 left-8 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-md">
            <h3 className="font-semibold text-lg mb-2 text-purple-600">🎯 Combined Cone System</h3>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><strong>Current PL:</strong> PL{currentPL}</p>
              <p><strong>Total Visible:</strong> {nodePositions.size}</p>
              <p><strong>Upward Nodes:</strong> {upwardPositions.size}</p>
              <p><strong>Lateral Nodes:</strong> {lateralPositions.size}</p>
              <p><strong>Expanded:</strong> {expandedNodes.size}</p>
              <div className="mt-2 pt-2 border-t">
                <p className="font-medium text-foreground mb-1">Upward Cone (Top):</p>
                <p>📐 45° → 135° | 🎯 Center: 90°</p>
                <p>⬆️ Career advancement (PL &lt; 10)</p>
                <p>⭕ Concentric PL circles</p>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="font-medium text-foreground mb-1">Lateral Cone (Right):</p>
                <p>📐 315° → 45° | 🎯 Center: 0°</p>
                <p>↔️ Same level specialization (PL = 10)</p>
                <p>⭕ Concentric depth circles</p>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="font-medium text-foreground mb-1">Features:</p>
                <p>✓ Max 2 nodes per cone+level</p>
                <p>✓ Progressive reveal system</p>
                <p>✓ One child per node (straight lines)</p>
                <p>✓ Same angle inheritance</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Overflow Nodes Dialog */}
      <Dialog open={showOverflowDialog} onOpenChange={setShowOverflowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {overflowType === 'upward' ? 'Additional Upward' : 'Additional Lateral'} Career Paths
            </DialogTitle>
            <DialogDescription>
              {overflowType === 'upward' 
                ? 'These are additional career advancement opportunities based on your profile.'
                : 'These are additional lateral movement options at your current level.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {(overflowType === 'upward' ? upwardOverflow : lateralOverflow).map((career) => (
              <div
                key={career.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => setShowOverflowDialog(false)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{career.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{career.level}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      career.match >= 70 ? 'bg-match-good text-white' :
                      career.match >= 50 ? 'bg-primary text-white' :
                      'bg-match-low text-white'
                    }`}>
                      {career.match}%
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {career.pathType === 'leadership' ? '👔 Leadership Track' :
                   career.pathType === 'technical' ? '💻 Technical Track' :
                   '🔍 Exploratory Path'}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestDashboard;
