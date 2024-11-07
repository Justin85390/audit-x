import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Clock, Target, Star } from 'lucide-react';

interface PersonalizedDashboardProps {
  userData: {
    contactDetails: {
      firstName: string;
      lastName: string;
    };
    learnerData: {
      timeToLearn: string;
      interests: string;
    };
    speakingData: {
      transcription: string;
    };
    opinionData: {
      transcription: string;
      analysis: string;
    };
    listeningScore: number;
    readingScore: number;
    writingData: {
      email: string;
    };
  };
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

const PersonalizedDashboard = ({ userData }: PersonalizedDashboardProps) => {
  // Transform userData into dashboard format
  const studentData = {
    name: userData.contactDetails.firstName + " " + userData.contactDetails.lastName,
    cefr: "B1", // You might want to calculate this based on scores
    interests: userData.learnerData.interests?.split(',') || [],
    timeAvailable: userData.learnerData.timeToLearn || "Not specified",
    skills: {
      speaking: calculateScore(userData.speakingData),
      listening: userData.listeningScore || 0,
      reading: userData.readingScore || 0,
      writing: calculateWritingScore(userData.writingData) || 0
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
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Personal Learning Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generateMilestones()}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="target" fill="#93c5fd" name="Target" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(studentData.skills).map(([skill, value]) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`p-4 rounded-lg text-center ${
                    selectedSkill === skill 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium capitalize">{skill}</div>
                  <div className="text-2xl font-bold">{value}%</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizedDashboard; 