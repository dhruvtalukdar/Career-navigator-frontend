import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import FilterBar from '@/components/dashboard/FilterBar';
import CurrentRole from '@/components/dashboard/CurrentRole';
import CareerNode from '@/components/dashboard/CareerNode';
import PathButton from '@/components/dashboard/PathButton';
import MatchLegend from '@/components/dashboard/MatchLegend';
import ZoomControls from '@/components/dashboard/ZoomControls';
import DirectionLabel from '@/components/dashboard/DirectionLabel';
import RadialBackground from '@/components/dashboard/RadialBackground';
import QuickTour from '@/components/dashboard/QuickTour';
import ChatAssistant from '@/components/dashboard/ChatAssistant';
import CareerDetailsDialog from '@/components/dashboard/CareerDetailsDialog';
import { calculateUpwardPositions, type CareerPath as UpwardCareerPath } from '@/lib/careerPositioning-upward';
import { calculateLateralPositions, type CareerPath as LateralCareerPath } from '@/lib/careerPositioning-lateral';
import type { RoleMatch, ProfileData } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type CareerPath = UpwardCareerPath | LateralCareerPath;

const Dashboard = () => {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [showTour, setShowTour] = useState(true);
  const [showRadarScan, setShowRadarScan] = useState(false);
  const [showPaths, setShowPaths] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showOverflowDialog, setShowOverflowDialog] = useState(false);
  const [overflowType, setOverflowType] = useState<'upward' | 'lateral'>('upward');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedCareerDetails, setSelectedCareerDetails] = useState<{
    title: string;
    level: string;
    matchPercentage: number;
    explanation: string;
    growthPath?: string;
    keySkills?: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleMatches, setRoleMatches] = useState<RoleMatch[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobRole, setSelectedJobRole] = useState<string>('');
  const [selectedCareerType, setSelectedCareerType] = useState<string>('');
  const [selectedMatchLevel, setSelectedMatchLevel] = useState<string>('');

  useEffect(() => {
    loadCareerData();
  }, []);

  const loadCareerData = () => {
    try {
      const analysisResult = sessionStorage.getItem('analysisResult');
      if (!analysisResult) {
        console.error('No analysis data found');
        navigate('/onboarding');
        return;
      }

      const result = JSON.parse(analysisResult);
      console.log('=== FULL API RESPONSE ===');
      console.log(JSON.stringify(result, null, 2));
      console.log('=== PROFILE DATA ===');
      console.log(result.profile);
      console.log('=== ROLE MATCHES ===');
      console.log(result.role_matches);
      console.log('========================');
      
      setProfileData(result.profile);
      setRoleMatches(result.role_matches || []);
    } catch (error) {
      console.error('Failed to load career data:', error);
      navigate('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTourComplete = useCallback(() => {
    setShowTour(false);
    setShowRadarScan(true);
  }, []);

  const handleScanComplete = useCallback(() => {
    setShowPaths(true);
  }, []);

  const handleNodeClick = (nodeId: string, hasChildren: boolean) => {
    // Simply toggle selection - no expansion needed since we show all root nodes
    setSelectedNode(prev => prev === nodeId ? null : nodeId);
  };

  const handleShowDetails = (title: string, level: string, matchPercentage: number, explanation: string, growthPath?: string, keySkills?: string[]) => {
    setSelectedCareerDetails({ title, level, matchPercentage, explanation, growthPath, keySkills });
    setDetailsDialogOpen(true);
  };

  // Convert API role matches to CareerPath format
  const convertToPaths = (): { upward: CareerPath[], lateral: CareerPath[] } => {
    if (!profileData || filteredRoleMatches.length === 0) {
      return { upward: [], lateral: [] };
    }

    const currentPLNum = parseInt(profileData.current_pl_level.replace('PL', '')) || 11;
    const upward: CareerPath[] = [];
    const lateral: CareerPath[] = [];

    // Create career paths WITHOUT parent-child relationships
    // API returns flat list of role matches - treat each as independent root node
    filteredRoleMatches.forEach((match, index) => {
      const matchPLNum = parseInt(match.pl_level.replace('PL', ''));
      const nodeId = match.role.toLowerCase().replace(/\s+/g, '-') + '-' + matchPLNum;
      
      const careerPath: CareerPath = {
        id: nodeId,
        title: match.role,
        level: match.pl_level,
        match: match.percentage_match,
        pathType: match.percentage_match >= 70 ? 'technical' : match.percentage_match >= 50 ? 'technical' : 'exploratory'
        // No parentId - all nodes are root nodes for now
      };

      // Determine if upward or lateral based on PL level
      if (matchPLNum < currentPLNum) {
        upward.push(careerPath);
      } else if (matchPLNum === currentPLNum) {
        lateral.push(careerPath);
      } else {
        upward.push(careerPath); // Higher PL also goes upward
      }
    });

    return { upward, lateral };
  };

  // Apply filters to roleMatches before converting to paths
  const filteredRoleMatches = roleMatches.filter(match => {
    // Search filter
    if (searchQuery && !match.role.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Job role filter
    if (selectedJobRole && selectedJobRole !== 'all' && !match.role.toLowerCase().includes(selectedJobRole.toLowerCase())) {
      return false;
    }
    
    // Career type filter (based on match percentage)
    if (selectedCareerType && selectedCareerType !== 'all') {
      if (selectedCareerType === 'technical' && match.percentage_match < 70) {
        return false;
      }
      if (selectedCareerType === 'management' && (match.percentage_match < 50 || match.percentage_match >= 70)) {
        return false;
      }
      if (selectedCareerType === 'hybrid' && match.percentage_match >= 50) {
        return false;
      }
    }
    
    // Match level filter
    if (selectedMatchLevel && selectedMatchLevel !== 'all') {
      if (selectedMatchLevel === 'high' && match.percentage_match < 70) {
        return false;
      }
      if (selectedMatchLevel === 'medium' && (match.percentage_match < 50 || match.percentage_match >= 70)) {
        return false;
      }
      if (selectedMatchLevel === 'low' && match.percentage_match >= 50) {
        return false;
      }
    }
    
    return true;
  });

  const { upward: upwardPaths, lateral: lateralPaths } = convertToPaths();

  // Current user's PL level
  const currentPL = profileData ? parseInt(profileData.current_pl_level.replace('PL', '')) || 11 : 11;

  // Center position (aligned with RadialBackground circles)
  const centerX = 50;
  const centerY = 50;

  // Combine all career paths
  const allCareerPaths: CareerPath[] = [...upwardPaths, ...lateralPaths];

  // Calculate positions using separate upward and lateral systems
  const upwardPositions = calculateUpwardPositions(allCareerPaths, {
    centerX,
    centerY,
    currentPL,
    expandedNodes,
  });

  const lateralPositions = calculateLateralPositions(allCareerPaths, {
    centerX,
    centerY,
    currentPL,
    expandedNodes,
  });

  // Combine both position maps
  const nodePositions = new Map([...upwardPositions, ...lateralPositions]);

  // Get overflow nodes (nodes not shown due to max 2 per level limit)
  const getOverflowNodes = (type: 'upward' | 'lateral') => {
    const filteredCareers = allCareerPaths.filter(career => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading your career paths...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="pt-[73px]"> {/* Spacer for fixed header */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedJobRole={selectedJobRole}
          onJobRoleChange={setSelectedJobRole}
          selectedCareerType={selectedCareerType}
          onCareerTypeChange={setSelectedCareerType}
          selectedMatchLevel={selectedMatchLevel}
          onMatchLevelChange={setSelectedMatchLevel}
          availableRoles={roleMatches.map(m => m.role)}
        />
        {/* Job Openings Button - only on Dashboard, styled with theme */}
        <div className="w-full flex justify-end mt-6 pr-8">
          <Button
            variant="default"
            onClick={() => navigate('/job-openings')}
            aria-label="Go to Job Openings"
          >
            Job Openings
          </Button>
        </div>
      </div>
      
      <main className="flex-1 relative overflow-hidden">
        {/* Radial background with radar scan */}
        <RadialBackground 
          showRadarScan={showRadarScan} 
          onScanComplete={handleScanComplete}
          showGrid={showPaths}
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
          {/* Direction Labels - positioned as in reference */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
            <DirectionLabel direction="upward" />
          </div>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 z-10">
            <DirectionLabel direction="lateral" />
          </div>
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10">
            <DirectionLabel direction="scope" />
          </div>

          {/* Connection lines - SVG layer */}
          {showPaths && selectedNode && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(174 100% 31%)" />
                  <stop offset="100%" stopColor="hsl(174 100% 31%)" />
                </linearGradient>
              </defs>
              
              {(() => {
                const position = nodePositions.get(selectedNode);
                if (!position || position.isOverflow) return null;

                const career = allCareerPaths.find(c => c.id === selectedNode);
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

          {/* Current Role - Center */}
          <div className="relative z-10">
            <CurrentRole
              name={profileData?.name.split(' ')[0] || 'User'}
              title={profileData?.current_role || 'Professional'}
              level={profileData?.current_pl_level || 'PL11'}
            />
          </div>

          {/* Career Paths - shown after radar scan */}
          {showPaths && (
            <>
              {/* Render career nodes using Map positions */}
              {Array.from(nodePositions.entries()).map(([nodeId, position]) => {
                const career = allCareerPaths.find(c => c.id === nodeId);
                if (!career || position.isOverflow) return null;

                const roleMatch = roleMatches.find(m => m.role === career.title);
                
                return (
                  <div 
                    key={nodeId}
                    className="absolute animate-fade-in z-20" 
                    style={{ 
                      left: `${position.x}%`, 
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <CareerNode
                      title={career.title}
                      level={career.level}
                      matchPercentage={career.match}
                      skillsMatch={career.skills}
                      isSelected={selectedNode === nodeId}
                      onClick={() => handleNodeClick(nodeId, position.hasChildren)}
                      onShowDetails={() => handleShowDetails(
                        career.title, 
                        career.level, 
                        career.match, 
                        roleMatch?.explanation || '',
                        roleMatch?.growth_path,
                        roleMatch?.key_skills
                      )}
                    />
                  </div>
                );
              })}

              {/* Upward Path Button - for overflow nodes */}
              {upwardOverflow.length > 0 && (
                <div 
                  className="absolute left-1/2 top-[42%] -translate-x-1/2 z-20 animate-fade-in cursor-pointer" 
                  style={{ animationDelay: '0.3s' }}
                  onClick={() => { setOverflowType('upward'); setShowOverflowDialog(true); }}
                >
                  <PathButton count={upwardOverflow.length} direction="upward" />
                </div>
              )}

              {/* Lateral Path Button - for overflow nodes */}
              {lateralOverflow.length > 0 && (
                <div 
                  className="absolute right-[18%] top-[52%] z-20 animate-fade-in cursor-pointer" 
                  style={{ animationDelay: '0.35s' }}
                  onClick={() => { setOverflowType('lateral'); setShowOverflowDialog(true); }}
                >
                  <PathButton count={lateralOverflow.length} direction="lateral" />
                </div>
              )}
            </>
          )}
        </div>

        <MatchLegend />

        {/* Career Details Dialog */}
        {selectedCareerDetails && (
          <CareerDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            title={selectedCareerDetails.title}
            level={selectedCareerDetails.level}
            matchPercentage={selectedCareerDetails.matchPercentage}
            explanation={selectedCareerDetails.explanation}
            growthPath={selectedCareerDetails.growthPath}
            keySkills={selectedCareerDetails.keySkills}
          />
        )}

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
              {(overflowType === 'upward' ? upwardOverflow : lateralOverflow).map((career) => {
                const roleMatch = roleMatches.find(m => m.role === career.title);
                return (
                  <div
                    key={career.id}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => {
                      setShowOverflowDialog(false);
                      handleShowDetails(
                        career.title,
                        career.level,
                        career.match,
                        roleMatch?.explanation || '',
                        roleMatch?.growth_path,
                        roleMatch?.key_skills
                      );
                    }}
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
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Tour */}
        {showTour && <QuickTour onComplete={handleTourComplete} />}
        
        {/* Chat Assistant */}
        {!showTour && <ChatAssistant />}
      </main>
    </div>
  );
};

export default Dashboard;
