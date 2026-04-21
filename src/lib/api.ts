
// API Configuration
// Uses environment variable for API base URL if set, otherwise defaults to Render backend in production and localhost in development.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production'
    ? 'https://career-navigator-backend.onrender.com'
    : 'http://127.0.0.1:5000');

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  UPLOAD_RESUME: `${API_BASE_URL}/api/upload-resume`,
  CREATE_PROFILE: `${API_BASE_URL}/api/create-profile`,
  ROLE_MATCHING: `${API_BASE_URL}/api/role-matching`,
  JOB_OPENINGS: `${API_BASE_URL}/api/job-openings`,
  COMPLETE_ANALYSIS: `${API_BASE_URL}/api/complete-analysis`,
};

// API Types
export interface UploadOptions {
  includeLinkedIn?: boolean;
  includeSCD?: boolean;
  includeMyLearning?: boolean;
}

export interface ProfileData {
  name: string;
  current_role: string;
  current_pl_level: string;
  years_experience: number;
  skills: string[];
  education: string;
  certifications: string[];
  projects: string[];
  interests: string[];
  career_goal: string;
  data_sources_used?: string[];
}

export interface RoleMatch {
  role: string;
  pl_level: string;
  percentage_match: number;
  explanation: string;
  growth_path?: string;
  key_skills?: string[];
}

export interface JobOpening {
  role: string;
  pl_level: string;
  percentage_match: number;
  location: string;
  department: string;
  description: string;
  requirements: string[];
}

export interface CompleteAnalysisResponse {
  status: string;
  profile_id: string;
  profile: ProfileData;
  role_matches: RoleMatch[];
  top_match: RoleMatch;
  job_openings: JobOpening[];
  data_sources_used: string[];
  processing_time_ms: number;
}

// API Helper Functions

/**
 * Upload resume and get complete analysis (profile, role matches, job openings)
 * This is the main function that combines all steps
 */
export async function uploadResumeAndAnalyze(
  file: File, 
  options: UploadOptions = {}
): Promise<CompleteAnalysisResponse> {
  const formData = new FormData();
  formData.append('resume', file);
  
  // Convert boolean to string 'true' or 'false' as backend expects
  if (options.includeLinkedIn) formData.append('include_linkedin', 'true');
  if (options.includeSCD) formData.append('include_scd', 'true');
  if (options.includeMyLearning) formData.append('include_mylearning', 'true');

  try {
    const response = await fetch(API_ENDPOINTS.COMPLETE_ANALYSIS, {
      method: 'POST',
      body: formData,
      mode: 'cors', // Explicitly enable CORS
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Upload and analysis failed:', error);
    
    // Provide specific error message for CORS issues
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'CORS Error: The backend server needs to allow requests from your frontend.\n\n' +
        'Backend fix needed:\n' +
        '1. Install: pip install flask-cors\n' +
        '2. Add to your Flask app:\n' +
        '   from flask_cors import CORS\n' +
        '   CORS(app)\n\n' +
        'Or ensure the backend is running on http://127.0.0.1:5000'
      );
    }
    
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error: Unable to reach the server. Please ensure the backend is running on http://127.0.0.1:5000');
  }
}

/**
 * Get profile data (used for profile review page)
 */
export async function getProfileData(profileId: string): Promise<ProfileData> {
  // Profile data is returned from the complete analysis
  // This function is kept for compatibility but data should come from uploadResumeAndAnalyze
  throw new Error('Use uploadResumeAndAnalyze instead - no separate profile endpoint');
}

/**
 * Get role matches for a profile
 */
export async function getRoleMatches(profileId: string): Promise<RoleMatch[]> {
  try {
    const response = await fetch(API_ENDPOINTS.ROLE_MATCHING, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch role matches');
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Failed to get role matches:', error);
    throw error;
  }
}

/**
 * Get job openings based on role matches
 */
export async function getJobOpenings(profileId: string): Promise<JobOpening[]> {
  try {
    const response = await fetch(API_ENDPOINTS.JOB_OPENINGS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_id: profileId }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job openings');
    }

    const data = await response.json();
    return data.job_openings || [];
  } catch (error) {
    console.error('Failed to get job openings:', error);
    throw error;
  }
}
