import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SelectWrapper } from "@/components/ui/select-wrapper"

export default function LearnerDataPage({ 
  onNext,
  updateUserData 
}: {
  onNext: () => void;
  updateUserData: (key: string, data: any) => void;
}) {
  const [currentForm, setCurrentForm] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    timeToLearn: "",
    motivation: [] as string[],
    otherMotivation: "",
    interests: [] as string[],
    otherInterests: "",
    device: [] as string[],
    contentType: [] as string[],
    classroomFormat: [] as string[]
  });
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFirstFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save first form data to localStorage
    const firstFormData = {
      timeToLearn: formData.timeToLearn,
      motivation: formData.motivation,
      interests: formData.interests
    };
    localStorage.setItem('learnerPreferences', JSON.stringify(firstFormData));
    
    setCurrentForm(2);
  };

  const handleSecondFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save second form data to localStorage
    const secondFormData = {
      device: formData.device,
      contentType: formData.contentType,
      classroomFormat: formData.classroomFormat
    };
    localStorage.setItem('technicalPreferences', JSON.stringify(secondFormData));
    
    // Combine both forms' data and update parent state
    const combinedData = {
      ...formData
    };
    
    // Update parent state with all learner data
    updateUserData('learnerData', combinedData);
    
    console.log('Learner Data saved:', combinedData);
    onNext();
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
    }
  };

  const textareaStyles = "border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"

  // For time commitment
  const timeOptions = [
    { id: '1-2', value: '1-2', label: '1-2 hours per week' },
    { id: '3-5', value: '3-5', label: '3-5 hours per week' },
    { id: '6-10', value: '6-10', label: '6-10 hours per week' },
    { id: '10+', value: '10+', label: 'More than 10 hours per week' }
  ];

  // Define the motivation options array
  const motivationOptions = [
    { id: 'work', value: 'work', label: 'Work/Professional Development' },
    { id: 'study', value: 'study', label: 'Academic Studies' },
    { id: 'travel', value: 'travel', label: 'Travel' },
    { id: 'personal', value: 'personal', label: 'Personal Interest' },
    { id: 'other', value: 'other', label: 'Other' }
  ];

  // Define the interests options array
  const interestsOptions = [
    { id: 'business', value: 'business', label: 'Business & Professional' },
    { id: 'culture', value: 'culture', label: 'Culture & Entertainment' },
    { id: 'science', value: 'science', label: 'Science & Technology' },
    { id: 'current', value: 'current', label: 'Current Events' },
    { id: 'other', value: 'other', label: 'Other' }
  ];

  // Define device options
  const deviceOptions = [
    { id: 'desktop', value: 'desktop', label: 'Desktop' },
    { id: 'tablet', value: 'tablet', label: 'Tablet' },
    { id: 'mobile', value: 'mobile', label: 'Mobile Phone' },
    { id: 'all', value: 'all', label: 'All of the above' }
  ];

  // Define content type options
  const contentTypeOptions = [
    { id: 'podcasts', value: 'podcasts', label: 'Podcasts' },
    { id: 'video', value: 'video', label: 'Video' },
    { id: 'interactive', value: 'interactive', label: 'Interactive Exercises' },
    { id: 'micro', value: 'micro', label: 'Micro-learning' },
    { id: 'webinars', value: 'webinars', label: 'Webinars' },
    { id: 'all', value: 'all', label: 'All of the above' }
  ];

  // Define classroom format options
  const classroomFormatOptions = [
    { id: 'oneToOne', value: 'oneToOne', label: '1 to 1 with a teacher' },
    { id: 'group', value: 'group', label: 'Group classes' },
    { id: 'workshop', value: 'workshop', label: 'Workshops' }
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Learner Data</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src="https://justindonlon.com/wp-content/uploads/2024/11/Learnerdata.mp4"
            controls
            playsInline
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          <button 
            onClick={handlePlayVideo}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
          >
            <span>▶️</span> Play Video
          </button>
        </div>
      </div>

      {/* Conditional Form Rendering */}
      {currentForm === 1 ? (
        <form onSubmit={handleFirstFormSubmit} className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <div>
            <Label htmlFor="timeToLearn">
              How much time can you dedicate to learning English each week?
              <p className="text-gray-400 text-sm mt-1">
                Combien de temps pouvez-vous consacrer à l&apos;apprentissage de l&apos;anglais chaque semaine ?
              </p>
            </Label>
            <SelectWrapper
              options={timeOptions}
              value={formData.timeToLearn}
              onValueChange={(value) => setFormData(prev => ({ ...prev, timeToLearn: value }))}
              placeholder="Select time commitment"
              prefix="time"
            />
          </div>

          <div>
            <Label htmlFor="motivation">
              What motivates you to improve your English?
              <p className="text-gray-400 text-sm mt-1">
                Qu&apos;est-ce qui vous motive à améliorer votre anglais ?
              </p>
            </Label>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              {motivationOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={`motivation-${option.id}`}
                    checked={formData.motivation.includes(option.value)}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        motivation: e.target.checked 
                          ? [...prev.motivation, option.value]
                          : prev.motivation.filter(m => m !== option.value)
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label 
                    htmlFor={`motivation-${option.id}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            {formData.motivation.includes("other") && (
              <div className="mt-4">
                <Label htmlFor="otherMotivation">
                  Please specify your motivation:
                </Label>
                <Textarea
                  id="otherMotivation"
                  name="otherMotivation"
                  value={formData.otherMotivation}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherMotivation: e.target.value }))}
                  placeholder="Enter your motivation here..."
                  className="w-full border-2 border-gray-700 rounded-md p-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="interests">
              What topics interest you the most?
              <p className="text-gray-400 text-sm mt-1">
                Quels sujets vous intéressent le plus ?
              </p>
            </Label>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              {interestsOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={`interests-${option.id}`}
                    checked={formData.interests.includes(option.value)}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        interests: e.target.checked 
                          ? [...prev.interests, option.value]
                          : prev.interests.filter(i => i !== option.value)
                      }));
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label 
                    htmlFor={`interests-${option.id}`}
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            {formData.interests.includes("other") && (
              <div className="mt-4">
                <Label htmlFor="otherInterests">
                  Please specify your interests:
                </Label>
                <Textarea
                  id="otherInterests"
                  name="otherInterests"
                  value={formData.otherInterests}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherInterests: e.target.value }))}
                  placeholder="Enter your interests here..."
                  className="w-full border-2 border-gray-700 rounded-md p-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Next
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSecondFormSubmit} className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Device Preferences */}
            <div>
              <Label htmlFor="device">
                What device do you prefer for e-learning?
                <p className="text-gray-400 text-sm mt-1">
                  Quel appareil préférez-vous pour l&apos;apprentissage en ligne ?
                </p>
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {deviceOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`device-${option.id}`}
                      checked={formData.device.includes(option.value)}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          device: e.target.checked 
                            ? [...prev.device, option.value]
                            : prev.device.filter(d => d !== option.value)
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`device-${option.id}`}
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Type Preferences */}
            <div>
              <Label htmlFor="contentType">
                What type of content do you prefer?
                <p className="text-gray-400 text-sm mt-1">
                  Quel type de contenu préférez-vous ?
                </p>
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {contentTypeOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`content-${option.id}`}
                      checked={formData.contentType.includes(option.value)}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          contentType: e.target.checked 
                            ? [...prev.contentType, option.value]
                            : prev.contentType.filter(c => c !== option.value)
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`content-${option.id}`}
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Classroom Format Preferences */}
            <div>
              <Label htmlFor="classroomFormat">
                Which of the following classroom formats do you prefer?
                <p className="text-gray-400 text-sm mt-1">
                  Quel format de classe préférez-vous ?
                </p>
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {classroomFormatOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`format-${option.id}`}
                      checked={formData.classroomFormat.includes(option.value)}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          classroomFormat: e.target.checked 
                            ? [...prev.classroomFormat, option.value]
                            : prev.classroomFormat.filter(f => f !== option.value)
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`format-${option.id}`}
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              Next
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}