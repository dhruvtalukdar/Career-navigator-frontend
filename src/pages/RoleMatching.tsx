import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NetworkBackground from '@/components/layout/NetworkBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Target, TrendingUp, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import type { RoleMatch } from '@/lib/api';

const RoleMatching = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [roleMatches, setRoleMatches] = useState<RoleMatch[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    loadRoleMatches();
  }, []);

  const loadRoleMatches = async () => {
    try {
      // Get role matches from sessionStorage (set during upload)
      const analysisResult = sessionStorage.getItem('analysisResult');
      if (!analysisResult) {
        throw new Error('No analysis data found');
      }

      const result = JSON.parse(analysisResult);
      setRoleMatches(result.role_matches || []);
    } catch (error) {
      console.error('Failed to load role matches:', error);
      toast({
        title: "Error Loading Matches",
        description: "Failed to load role matches. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => navigate('/profile-review'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    toast({
      title: "Finding Opportunities",
      description: "Searching for job openings that match your profile...",
    });
    navigate('/job-openings');
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getMatchBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <NetworkBackground />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Analyzing your career matches...</p>
            <p className="text-sm text-muted-foreground mt-2">Using AI to find your best career paths</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NetworkBackground />
      
      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">AI-Powered Career Matches</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              We've analyzed your profile and found these career opportunities
            </p>
          </div>

          {roleMatches.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No role matches found</p>
                <Button onClick={() => navigate('/profile-review')} className="mt-4">
                  Go Back to Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 mb-8">
                {roleMatches.map((match, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedRole === match.role ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRole(match.role === selectedRole ? null : match.role)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-2xl">{match.role}</CardTitle>
                            <Badge variant={getMatchBadgeVariant(match.percentage_match)}>
                              {match.percentage_match >= 80 ? 'Excellent Match' : match.percentage_match >= 60 ? 'Good Match' : 'Potential Match'}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">{match.explanation}</CardDescription>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`text-4xl font-bold ${getMatchColor(match.percentage_match)}`}>
                            {match.percentage_match}%
                          </div>
                          <div className="text-sm text-muted-foreground">Match Score</div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Progress value={match.percentage_match} className="h-2" />
                      </div>
                    </CardHeader>

                    {selectedRole === match.role && (
                      <CardContent className="pt-0 animate-in slide-in-from-top">
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Target className="w-5 h-5 text-primary mt-1" />
                            <div>
                              <h4 className="font-semibold text-foreground mb-2">Detailed Analysis</h4>
                              <p className="text-sm text-muted-foreground">{match.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/profile-review')}
                >
                  Back to Profile
                </Button>
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="min-w-[200px]"
                >
                  View Job Openings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RoleMatching;
