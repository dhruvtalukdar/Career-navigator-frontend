import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NetworkBackground from '@/components/layout/NetworkBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  MapPin, 
  Building2, 
  TrendingUp, 
  ExternalLink, 
  Briefcase, 
  AlertCircle, 
  Search,
  Filter,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import type { JobOpening } from '@/lib/api';

const JobOpenings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPLLevel, setSelectedPLLevel] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedMatchLevel, setSelectedMatchLevel] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadJobOpenings();
  }, []);

  const loadJobOpenings = async () => {
    try {
      // Get job openings from sessionStorage (set during upload)
      const analysisResult = sessionStorage.getItem('analysisResult');
      
      // Mock data for UI demonstration
      const mockJobOpenings: JobOpening[] = [
        {
          role: "Senior Software Engineer",
          pl_level: "PL09",
          percentage_match: 92,
          location: "Munich, Germany",
          department: "Digital Industries",
          description: "Lead the development of cutting-edge industrial IoT solutions. Work with a talented team to build scalable cloud-native applications that power smart manufacturing systems.",
          requirements: ["Python", "React", "TypeScript", "AWS", "Docker", "Kubernetes", "Microservices", "PostgreSQL"]
        },
        {
          role: "Full Stack Developer",
          pl_level: "PL10",
          percentage_match: 88,
          location: "Berlin, Germany",
          department: "Smart Infrastructure",
          description: "Design and implement full-stack solutions for building automation systems. Create intuitive user interfaces and robust backend services for smart city applications.",
          requirements: ["JavaScript", "Node.js", "React", "MongoDB", "REST APIs", "Git", "Agile"]
        },
        {
          role: "DevOps Engineer",
          pl_level: "PL10",
          percentage_match: 85,
          location: "Munich, Germany",
          department: "Digital Industries",
          description: "Build and maintain CI/CD pipelines and cloud infrastructure. Implement automation solutions to enhance development workflows and ensure high availability of services.",
          requirements: ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS", "Linux", "Python", "Ansible"]
        },
        {
          role: "Data Scientist",
          pl_level: "PL09",
          percentage_match: 78,
          location: "Erlangen, Germany",
          department: "Siemens Healthineers",
          description: "Apply machine learning and statistical analysis to medical imaging data. Develop predictive models to improve diagnostic accuracy and patient outcomes.",
          requirements: ["Python", "TensorFlow", "PyTorch", "SQL", "Machine Learning", "Statistics", "Data Visualization"]
        },
        {
          role: "Cloud Architect",
          pl_level: "PL10",
          percentage_match: 75,
          location: "Frankfurt, Germany",
          department: "Digital Industries",
          description: "Design enterprise-scale cloud architectures for industrial automation solutions. Lead technical strategy and mentor development teams on cloud best practices.",
          requirements: ["AWS", "Azure", "Cloud Architecture", "Microservices", "Security", "Leadership", "DevOps"]
        },
        {
          role: "Frontend Developer",
          pl_level: "PL11",
          percentage_match: 70,
          location: "Berlin, Germany",
          department: "Smart Infrastructure",
          description: "Create responsive and accessible user interfaces for building management systems. Collaborate with UX designers to deliver exceptional user experiences.",
          requirements: ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Responsive Design", "Git"]
        },
        {
          role: "Machine Learning Engineer",
          pl_level: "PL10",
          percentage_match: 82,
          location: "Munich, Germany",
          department: "Siemens Mobility",
          description: "Develop ML models for predictive maintenance in railway systems. Work on computer vision and sensor data analysis to enhance transportation safety and efficiency.",
          requirements: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "MLOps", "Docker", "Scikit-learn"]
        }
      ];

      if (!analysisResult) {
        // Use mock data if no real data available
        console.log('Using mock job openings data');
        setJobOpenings(mockJobOpenings);
      } else {
        const result = JSON.parse(analysisResult);
        // Fallback to mock data if no job openings in result
        setJobOpenings(result.job_openings && result.job_openings.length > 0 ? result.job_openings : mockJobOpenings);
      }
    } catch (error) {
      console.error('Failed to load job openings:', error);
      
      // Use mock data on error as well
      const mockJobOpenings: JobOpening[] = [
        {
          role: "Senior Software Engineer",
          pl_level: "PL4",
          percentage_match: 92,
          location: "Munich, Germany",
          department: "Digital Industries",
          description: "Lead the development of cutting-edge industrial IoT solutions. Work with a talented team to build scalable cloud-native applications that power smart manufacturing systems.",
          requirements: ["Python", "React", "TypeScript", "AWS", "Docker", "Kubernetes", "Microservices", "PostgreSQL"]
        },
        {
          role: "Full Stack Developer",
          pl_level: "PL3",
          percentage_match: 88,
          location: "Berlin, Germany",
          department: "Smart Infrastructure",
          description: "Design and implement full-stack solutions for building automation systems. Create intuitive user interfaces and robust backend services for smart city applications.",
          requirements: ["JavaScript", "Node.js", "React", "MongoDB", "REST APIs", "Git", "Agile"]
        },
        {
          role: "DevOps Engineer",
          pl_level: "PL3",
          percentage_match: 85,
          location: "Munich, Germany",
          department: "Digital Industries",
          description: "Build and maintain CI/CD pipelines and cloud infrastructure. Implement automation solutions to enhance development workflows and ensure high availability of services.",
          requirements: ["Kubernetes", "Docker", "Jenkins", "Terraform", "AWS", "Linux", "Python", "Ansible"]
        },
        {
          role: "Data Scientist",
          pl_level: "PL4",
          percentage_match: 78,
          location: "Erlangen, Germany",
          department: "Siemens Healthineers",
          description: "Apply machine learning and statistical analysis to medical imaging data. Develop predictive models to improve diagnostic accuracy and patient outcomes.",
          requirements: ["Python", "TensorFlow", "PyTorch", "SQL", "Machine Learning", "Statistics", "Data Visualization"]
        },
        {
          role: "Cloud Architect",
          pl_level: "PL5",
          percentage_match: 75,
          location: "Frankfurt, Germany",
          department: "Digital Industries",
          description: "Design enterprise-scale cloud architectures for industrial automation solutions. Lead technical strategy and mentor development teams on cloud best practices.",
          requirements: ["AWS", "Azure", "Cloud Architecture", "Microservices", "Security", "Leadership", "DevOps"]
        },
        {
          role: "Frontend Developer",
          pl_level: "PL2",
          percentage_match: 70,
          location: "Berlin, Germany",
          department: "Smart Infrastructure",
          description: "Create responsive and accessible user interfaces for building management systems. Collaborate with UX designers to deliver exceptional user experiences.",
          requirements: ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Responsive Design", "Git"]
        },
        {
          role: "Machine Learning Engineer",
          pl_level: "PL3",
          percentage_match: 82,
          location: "Munich, Germany",
          department: "Siemens Mobility",
          description: "Develop ML models for predictive maintenance in railway systems. Work on computer vision and sensor data analysis to enhance transportation safety and efficiency.",
          requirements: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "MLOps", "Docker", "Scikit-learn"]
        }
      ];
      
      setJobOpenings(mockJobOpenings);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique values for filters
  const uniquePLLevels = useMemo(() => {
    const levels = new Set(jobOpenings.map(job => job.pl_level));
    return Array.from(levels).sort();
  }, [jobOpenings]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(jobOpenings.map(job => job.location));
    return Array.from(locations).sort();
  }, [jobOpenings]);

  // Filtered jobs based on search and filters
  const filteredJobs = useMemo(() => {
    return jobOpenings.filter(job => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        job.role.toLowerCase().includes(searchLower) ||
        job.department.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.requirements.some(req => req.toLowerCase().includes(searchLower));

      // PL Level filter
      const matchesPL = selectedPLLevel === 'all' || job.pl_level === selectedPLLevel;

      // Location filter
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;

      // Match Level filter
      const matchesMatchLevel = selectedMatchLevel === 'all' || 
        (selectedMatchLevel === 'high' && job.percentage_match >= 80) ||
        (selectedMatchLevel === 'medium' && job.percentage_match >= 60 && job.percentage_match < 80) ||
        (selectedMatchLevel === 'low' && job.percentage_match < 60);

      return matchesSearch && matchesPL && matchesLocation && matchesMatchLevel;
    });
  }, [jobOpenings, searchQuery, selectedPLLevel, selectedLocation, selectedMatchLevel]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPLLevel('all');
    setSelectedLocation('all');
    setSelectedMatchLevel('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedPLLevel !== 'all' || 
                          selectedLocation !== 'all' || selectedMatchLevel !== 'all';

  const handleApply = (role: string) => {
    toast({
      title: "Application Submitted",
      description: `Your interest in ${role} has been recorded. The hiring team will contact you soon.`,
      duration: 4000,
    });
  };

  const handleViewDashboard = () => {
    toast({
      title: "Navigating to Dashboard",
      description: "View your complete career path visualization...",
    });
    navigate('/dashboard');
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
    return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Potential Match';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <NetworkBackground />
        <main className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Finding job opportunities for you...</p>
            <p className="text-sm text-muted-foreground mt-2">Matching your skills with available positions</p>
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
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="w-8 h-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Open Positions</h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Personalized job recommendations based on your profile and career goals
            </p>
          </div>

          {/* Search and Filter Bar */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="pt-6">
              {/* Search Input */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by role, department, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:w-auto"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      !
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="pt-4 border-t border-border animate-in slide-in-from-top">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* PL Level Filter */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        PL Level
                      </label>
                      <Select value={selectedPLLevel} onValueChange={setSelectedPLLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {uniquePLLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Location
                      </label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Match Level Filter */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Match Level
                      </label>
                      <Select value={selectedMatchLevel} onValueChange={setSelectedMatchLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Matches" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Matches</SelectItem>
                          <SelectItem value="high">Excellent (80%+)</SelectItem>
                          <SelectItem value="medium">Good (60-79%)</SelectItem>
                          <SelectItem value="low">Potential (&lt;60%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Clear all filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredJobs.length === 0 ? (
                'No matching positions found'
              ) : (
                <>
                  Showing <span className="font-semibold text-foreground">{filteredJobs.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{jobOpenings.length}</span>{' '}
                  {jobOpenings.length === 1 ? 'position' : 'positions'}
                </>
              )}
            </p>
          </div>

          {/* Job Listings or Empty State */}
          {filteredJobs.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {jobOpenings.length === 0 ? 'No Job Openings Available' : 'No Matches Found'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {jobOpenings.length === 0 
                    ? 'Check back later or explore your career path visualization to discover future opportunities.'
                    : 'Try adjusting your filters or search criteria to find more positions.'
                  }
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button onClick={handleViewDashboard}>
                    View Career Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Job Cards */}
              <div className="grid gap-6 mb-8">
                {filteredJobs.map((job, index) => (
                  <Card 
                    key={`${job.role}-${index}`}
                    className={`cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 ${
                      selectedJob === job.role ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedJob(job.role === selectedJob ? null : job.role)}
                  >
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Job Title and Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <CardTitle className="text-xl sm:text-2xl">{job.role}</CardTitle>
                            <Badge 
                              className={`${getMatchColor(job.percentage_match)} border`}
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              {job.percentage_match}% Match
                            </Badge>
                          </div>
                          
                          {/* Job Meta Information */}
                          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="font-normal">
                                {job.pl_level}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{job.department}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                          </div>

                          {/* Job Description */}
                          <CardDescription className="text-sm sm:text-base line-clamp-2">
                            {job.description}
                          </CardDescription>
                        </div>

                        {/* Match Badge - Desktop */}
                        <div className="hidden sm:block">
                          <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg border-2 ${getMatchColor(job.percentage_match)}`}>
                            <div className="text-center">
                              <div className="text-sm font-medium">{getMatchLabel(job.percentage_match)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {/* Required Skills Preview */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, selectedJob === job.role ? undefined : 5).map((req, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {!selectedJob && job.requirements.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.requirements.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedJob === job.role && (
                        <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top duration-200">
                          {/* Why This Role Matches */}
                          <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                            <div className="flex items-start gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground mb-2">Why This Role Matches</h4>
                                <p className="text-sm text-muted-foreground">
                                  Your skills and experience align well with this {job.role} position in the {job.department} department. 
                                  This role offers growth opportunities that match your career trajectory and goals.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Full Description */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Full Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {job.description}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 flex-wrap">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApply(job.role);
                              }}
                              className="flex-1 sm:flex-none"
                            >
                              Express Interest
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(null);
                              }}
                              className="sm:flex-none"
                            >
                              Close Details
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Click to expand hint */}
                      {selectedJob !== job.role && (
                        <div className="mt-3 text-center">
                          <p className="text-xs text-muted-foreground">
                            Click to view full details
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                {/* <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/role-matching')}
                  className="w-full sm:w-auto"
                >
                  Back to Role Matches
                </Button> */}
                <Button
                  size="lg"
                  onClick={handleViewDashboard}
                  className="w-full sm:w-auto sm:min-w-[220px]"
                >
                  View Career Dashboard
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

export default JobOpenings;
