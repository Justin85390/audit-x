import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, 
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend,
  Treemap
} from 'recharts';
import { BookOpen, Clock, Target, Star, TrendingUp, Activity, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
  learnerData?: {
    timeToLearn?: string;
    interests?: string;
  };
  speakingData?: any;
  listeningScore?: number;
  readingScore?: number;
  writingData?: any;
  contactDetails?: {
    firstName?: string;
    lastName?: string;
  };
  opinionData?: {
    speechAceAnalysis?: {
      analysis?: {
        text_score?: {
          cefr_score?: {
            pronunciation?: string;
          };
        };
      };
    };
  };
}

interface PersonalizedDashboardProps {
  userData: UserData | null;
}

interface Skills {
  [key: string]: number;
  speaking: number;
  listening: number;
  reading: number;
  writing: number;
}

interface StudentData {
  name: string;
  cefr: string;
  interests: string[];
  timeAvailable: string;
  skills: Skills;
}

// Mock data for visualizations
const progressData = [
  { month: 'Jan', speechace: 75, ielts: 6.5, toeic: 150 },
  { month: 'Feb', speechace: 82, ielts: 7.0, toeic: 160 },
  { month: 'Mar', speechace: 88, ielts: 7.5, toeic: 170 },
  { month: 'Apr', speechace: 92, ielts: 8.0, toeic: 180 },
  { month: 'May', speechace: 95, ielts: 8.5, toeic: 190 }
];

const skillsData = [
  { subject: 'Pronunciation', score: 95 },
  { subject: 'Fluency', score: 92 },
  { subject: 'Grammar', score: 88 },
  { subject: 'Vocabulary', score: 85 },
  { subject: 'Comprehension', score: 90 }
];

const speakingPatternData = [
  { metric: 'Speech Rate', value: 3.6, fullMark: 5 },
  { metric: 'Pause Control', value: 4.2, fullMark: 5 },
  { metric: 'Run Length', value: 3.8, fullMark: 5 },
  { metric: 'Rhythm', value: 4.0, fullMark: 5 },
  { metric: 'Stress', value: 3.9, fullMark: 5 }
];

export function PersonalizedDashboard({ userData }: PersonalizedDashboardProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Save dashboard data when it's loaded
    if (userData) {
      localStorage.setItem('dashboardData', JSON.stringify(userData));
    }
  }, [userData]);
  
  // Add these console logs
  console.log('Full userData:', userData);
  console.log('SpeechAce data:', userData?.opinionData?.speechAceAnalysis);
  
  // Transform userData into dashboard format
  const studentData = {
    name: userData?.contactDetails 
      ? `${userData.contactDetails.firstName || ''} ${userData.contactDetails.lastName || ''}`
      : 'Not specified',
    // Add console log here too
    cefr: (() => {
      const cefrScore = userData?.opinionData?.speechAceAnalysis?.analysis?.text_score?.cefr_score?.pronunciation;
      console.log('CEFR Score:', cefrScore);
      return cefrScore || "Not Available";
    })(),
    interests: userData?.learnerData?.interests?.split(',') || [],
    timeAvailable: userData?.learnerData?.timeToLearn || "Not specified",
    skills: {
      speaking: calculateScore(userData?.speakingData || null),
      listening: userData?.listeningScore || 0,
      reading: userData?.readingScore || 0,
      writing: calculateWritingScore(userData?.writingData || null) || 0
    }
  };

  const [selectedSkill, setSelectedSkill] = useState('speaking');

  // Helper function to calculate scores
  function calculateScore(data: any) {
    // Implement your scoring logic here
    return 65; // Placeholder
  }

  function calculateWritingScore(data: any) {
    // Implement your writing score logic here
    return 60; // Placeholder
  }

  const generateMilestones = () => {
    const currentSkillValue = studentData.skills[selectedSkill as 'speaking' | 'listening' | 'reading' | 'writing'];
    
    return [
      {
        week: 1,
        target: currentSkillValue + 5,
        actual: currentSkillValue + 3
      },
      {
        week: 2,
        target: currentSkillValue + 10,
        actual: currentSkillValue + 8
      },
      {
        week: 3,
        target: currentSkillValue + 15
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back to Report Button */}
        <div className="flex justify-end">
          <button
            onClick={() => router.push('/report')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg 
              transition-colors duration-200 flex items-center gap-2"
          >
            <span>Your Report</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
            <Target className="text-blue-500" />
            <div>
              <div className="text-sm font-medium">Current Level</div>
              <div className="text-2xl font-bold">{studentData.cefr}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
            <Clock className="text-green-500" />
            <div>
              <div className="text-sm font-medium">Time Commitment</div>
              <div className="text-2xl font-bold">{studentData.timeAvailable}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg">
            <Star className="text-purple-500" />
            <div>
              <div className="text-sm font-medium">Focus Area</div>
              <div className="text-2xl font-bold capitalize">{selectedSkill}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-orange-50 rounded-lg">
            <BookOpen className="text-orange-500" />
            <div>
              <div className="text-sm font-medium">Interests</div>
              <div className="text-sm font-medium">{studentData.interests.join(", ")}</div>
            </div>
          </div>
        </div>

        {/* Progress Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progress Timeline
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="speechace" />
                  <YAxis yAxisId="ielts" orientation="right" />
                  <YAxis yAxisId="toeic" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="speechace" type="monotone" dataKey="speechace" stroke="#8884d8" name="SpeechAce Score" />
                  <Line yAxisId="ielts" type="monotone" dataKey="ielts" stroke="#82ca9d" name="IELTS Score" />
                  <Line yAxisId="toeic" type="monotone" dataKey="toeic" stroke="#ffc658" name="TOEIC Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Radar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Skills Distribution
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillsData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Skills" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Speaking Pattern Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Speaking Pattern Analysis
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={speakingPatternData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar name="Pattern" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Or if using default export:
// export default PersonalizedDashboard; 