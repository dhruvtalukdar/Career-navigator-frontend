import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NetworkBackground from '@/components/layout/NetworkBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Briefcase, GraduationCap, Award, Target, Database } from 'lucide-react';
import type { ProfileData } from '@/lib/api';

const ProfileReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Get profile from sessionStorage (set during upload)
      const analysisResult = sessionStorage.getItem('analysisResult');
      if (!analysisResult) {
        throw new Error('No analysis data found');
      }

      const result = JSON.parse(analysisResult);
      setProfileData(result.profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast({
        title: "Error Loading Profile",
        description: "Failed to load your profile data. Please upload your resume again.",
        variant: "destructive",
      });
      // Redirect back to onboarding if profile not found
      setTimeout(() => navigate('/onboarding'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    toast({
      title: "Profile Confirmed!",
      description: "Loading your career dashboard...",
    });
    navigate('/dashboard');
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  const updateField = (field: keyof ProfileData, value: any) => {
    if (profileData) {
      setProfileData({ ...profileData, [field]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <NetworkBackground />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NetworkBackground />
      
      <main className="flex-1 pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Career Profile</h1>
            <p className="text-lg text-muted-foreground">
              Review and confirm your extracted information
            </p>
          </div>

          {/* Data Sources Used */}
          {profileData.data_sources_used && profileData.data_sources_used.length > 0 && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Data Sources Included:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileData.data_sources_used.map((source) => (
                    <Badge key={source} variant="secondary" className="capitalize">
                      {source === 'linkedin' ? 'LinkedIn' : source === 'scd' ? 'SCD' : 'My Learning World'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  {isEditing ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground mt-1">{profileData.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Years of Experience</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={profileData.years_experience}
                      onChange={(e) => updateField('years_experience', parseInt(e.target.value))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground mt-1">{profileData.years_experience} years</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Role */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <CardTitle>Current Position</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  {isEditing ? (
                    <Input
                      value={profileData.current_role}
                      onChange={(e) => updateField('current_role', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground mt-1">{profileData.current_role}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">PL Level</label>
                  {isEditing ? (
                    <Input
                      value={profileData.current_pl_level}
                      onChange={(e) => updateField('current_pl_level', e.target.value)}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-foreground mt-1">{profileData.current_pl_level}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>Your technical and professional skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <CardTitle>Education</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Input
                  value={profileData.education}
                  onChange={(e) => updateField('education', e.target.value)}
                />
              ) : (
                <p className="text-foreground">{profileData.education}</p>
              )}
            </CardContent>
          </Card>

          {/* Certifications */}
          {profileData.certifications.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <CardTitle>Certifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profileData.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-foreground">{cert}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {profileData.projects.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Key Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profileData.projects.map((project, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-foreground">{project}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Career Goal */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle>Career Goal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={profileData.career_goal}
                  onChange={(e) => updateField('career_goal', e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-foreground">{profileData.career_goal}</p>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleEdit}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
            <Button
              size="lg"
              onClick={handleConfirm}
              className="min-w-[200px]"
            >
              Confirm & Continue
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileReview;
