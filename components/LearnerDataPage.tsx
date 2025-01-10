import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SelectWrapper } from "@/components/ui/select-wrapper"
import Image from 'next/image';

type Language = 'en' | 'fr';

interface LanguageContent {
  title: string;
  timeToLearn: {
    question: string;
    placeholder: string;
  };
  motivation: {
    question: string;
    placeholder: string;
  };
  interests: {
    question: string;
    placeholder: string;
  };
  device: {
    question: string;
    placeholder: string;
  };
  contentType: {
    question: string;
    placeholder: string;
  };
  classroomFormat: {
    question: string;
    placeholder: string;
  };
  nextButton: string;
  videoButton: string;
  formNumber: {
    first: string;
    second: string;
  };
}

export default function LearnerDataPage({ 
  onNext,
  updateUserData,
  onLanguageChange
}: {
  onNext: () => void;
  updateUserData: (key: string, data: any) => void;
  onLanguageChange?: (language: Language) => void;
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
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Your Preferences",
      timeToLearn: {
        question: "How much time can you dedicate to learning English each week?",
        placeholder: "Select time commitment"
      },
      motivation: {
        question: "What motivates you to improve your English?",
        placeholder: "Select motivation"
      },
      interests: {
        question: "What topics interest you the most?",
        placeholder: "Select interests"
      },
      device: {
        question: "What device do you prefer for e-learning?",
        placeholder: "Select device"
      },
      contentType: {
        question: "What type of content do you prefer?",
        placeholder: "Select content type"
      },
      classroomFormat: {
        question: "Which of the following classroom formats do you prefer?",
        placeholder: "Select classroom format"
      },
      nextButton: "Next",
      videoButton: "Start with Sound",
      formNumber: {
        first: "Form 1/2",
        second: "Form 2/2"
      },
    },
    fr: {
      title: "Vos Préférences",
      timeToLearn: {
        question: "Combien de temps pouvez-vous consacrer à l'apprentissage de l'anglais chaque semaine ?",
        placeholder: "Sélectionnez votre disponibilité"
      },
      motivation: {
        question: "Qu'est-ce qui vous motive à améliorer votre anglais ?",
        placeholder: "Sélectionnez votre motivation"
      },
      interests: {
        question: "Quels sujets vous intéressent le plus ?",
        placeholder: "Sélectionnez vos intérêts"
      },
      device: {
        question: "Quel appareil préférez-vous pour l'apprentissage en ligne ?",
        placeholder: "Sélectionnez votre appareil"
      },
      contentType: {
        question: "Quel type de contenu préférez-vous ?",
        placeholder: "Sélectionnez le type de contenu"
      },
      classroomFormat: {
        question: "Quel format de classe préférez-vous ?",
        placeholder: "Sélectionnez le format de classe"
      },
      nextButton: "Suivant",
      videoButton: "Démarrer avec le son",
      formNumber: {
        first: "Formulaire 1/2",
        second: "Formulaire 2/2"
      },
    }
  };

  useEffect(() => {
    const attemptAutoplay = async () => {
      if (!videoRef) return;
      
      try {
        videoRef.muted = false;
        await videoRef.play();
        setAutoplayFailed(false);
      } catch (error) {
        console.log('Unmuted autoplay failed:', error);
        setAutoplayFailed(true);
        
        // Try muted playback as fallback
        try {
          videoRef.muted = true;
          await videoRef.play();
        } catch (secondError) {
          console.error('Muted autoplay also failed:', secondError);
        }
      }
    };

    attemptAutoplay();
  }, [videoRef]);

  const handleStartWithSound = async () => {
    if (!videoRef) return;
    
    try {
      videoRef.muted = false;
      videoRef.currentTime = 0;
      await videoRef.play();
      setAutoplayFailed(false);
    } catch (error) {
      console.error('Manual play with sound failed:', error);
    }
  };

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
      setAutoplayFailed(false);
    }
  };

  const textareaStyles = "border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"

  // For time commitment
  const timeOptions = currentLanguage === 'en' ? [
    { id: '1-2', value: '1-2', label: '1-2 hours per week' },
    { id: '3-5', value: '3-5', label: '3-5 hours per week' },
    { id: '6-10', value: '6-10', label: '6-10 hours per week' },
    { id: '10+', value: '10+', label: 'More than 10 hours per week' }
  ] : [
    { id: '1-2', value: '1-2', label: '1-2 heures par semaine' },
    { id: '3-5', value: '3-5', label: '3-5 heures par semaine' },
    { id: '6-10', value: '6-10', label: '6-10 heures par semaine' },
    { id: '10+', value: '10+', label: 'Plus de 10 heures par semaine' }
  ];

  // Define the motivation options array
  const motivationOptions = currentLanguage === 'en' ? [
    { id: 'work', value: 'work', label: 'Work/Professional Development' },
    { id: 'study', value: 'study', label: 'Academic Studies' },
    { id: 'travel', value: 'travel', label: 'Travel' },
    { id: 'personal', value: 'personal', label: 'Personal Interest' },
    { id: 'other', value: 'other', label: 'Other' }
  ] : [
    { id: 'work', value: 'work', label: 'Travail/Développement professionnel' },
    { id: 'study', value: 'study', label: 'Études académiques' },
    { id: 'travel', value: 'travel', label: 'Voyage' },
    { id: 'personal', value: 'personal', label: 'Intérêt personnel' },
    { id: 'other', value: 'other', label: 'Autre' }
  ];

  // Define the interests options array
  const interestsOptions = currentLanguage === 'en' ? [
    { id: 'business', value: 'business', label: 'Business & Professional' },
    { id: 'culture', value: 'culture', label: 'Culture & Entertainment' },
    { id: 'science', value: 'science', label: 'Science & Technology' },
    { id: 'current', value: 'current', label: 'Current Events' },
    { id: 'other', value: 'other', label: 'Other' }
  ] : [
    { id: 'business', value: 'business', label: 'Affaires et professionnel' },
    { id: 'culture', value: 'culture', label: 'Culture et divertissement' },
    { id: 'science', value: 'science', label: 'Science et technologie' },
    { id: 'current', value: 'current', label: 'Actualités' },
    { id: 'other', value: 'other', label: 'Autre' }
  ];

  // Define device options
  const deviceOptions = currentLanguage === 'en' ? [
    { id: 'desktop', value: 'desktop', label: 'Desktop' },
    { id: 'tablet', value: 'tablet', label: 'Tablet' },
    { id: 'mobile', value: 'mobile', label: 'Mobile Phone' },
    { id: 'all', value: 'all', label: 'All of the above' }
  ] : [
    { id: 'desktop', value: 'desktop', label: 'Ordinateur' },
    { id: 'tablet', value: 'tablet', label: 'Tablette' },
    { id: 'mobile', value: 'mobile', label: 'Téléphone portable' },
    { id: 'all', value: 'all', label: 'Tous les appareils' }
  ];

  // Define content type options
  const contentTypeOptions = currentLanguage === 'en' ? [
    { id: 'podcasts', value: 'podcasts', label: 'Podcasts' },
    { id: 'video', value: 'video', label: 'Video' },
    { id: 'interactive', value: 'interactive', label: 'Interactive Exercises' },
    { id: 'micro', value: 'micro', label: 'Micro-learning' },
    { id: 'webinars', value: 'webinars', label: 'Webinars' },
    { id: 'all', value: 'all', label: 'All of the above' }
  ] : [
    { id: 'podcasts', value: 'podcasts', label: 'Podcasts' },
    { id: 'video', value: 'video', label: 'Vidéo' },
    { id: 'interactive', value: 'interactive', label: 'Exercices interactifs' },
    { id: 'micro', value: 'micro', label: 'Micro-apprentissage' },
    { id: 'webinars', value: 'webinars', label: 'Webinaires' },
    { id: 'all', value: 'all', label: 'Tous les types' }
  ];

  // Define classroom format options
  const classroomFormatOptions = currentLanguage === 'en' ? [
    { id: 'oneToOne', value: 'oneToOne', label: '1 to 1 with a teacher' },
    { id: 'group', value: 'group', label: 'Group classes' },
    { id: 'workshop', value: 'workshop', label: 'Workshops' }
  ] : [
    { id: 'oneToOne', value: 'oneToOne', label: '1 à 1 avec un professeur' },
    { id: 'group', value: 'group', label: 'Cours en groupe' },
    { id: 'workshop', value: 'workshop', label: 'Ateliers' }
  ];

  const handleLanguageChange = async (language: Language) => {
    setCurrentLanguage(language);
    if (videoRef) {
      try {
        videoRef.pause();
        videoRef.load();
      } catch (error) {
        console.error('Error handling video on language change:', error);
      }
    }
    if (onLanguageChange) {
      onLanguageChange(language);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4 space-x-2">
          <button 
            onClick={() => handleLanguageChange('en')}
            className={`p-1 rounded ${currentLanguage === 'en' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Image
              src="/gb-flag.png"
              alt="English"
              width={32}
              height={24}
              className="rounded shadow-sm"
            />
          </button>
          <button 
            onClick={() => handleLanguageChange('fr')}
            className={`p-1 rounded ${currentLanguage === 'fr' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Image
              src="/fr-flag.png"
              alt="Français"
              width={32}
              height={24}
              className="rounded shadow-sm"
            />
          </button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-6">{languageContent[currentLanguage].title}</h1>
        
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src={currentLanguage === 'en' 
              ? "https://justindonlon.com/wp-content/uploads/2025/01/LearnerData2.mp4"
              : "https://justindonlon.com/wp-content/uploads/2025/01/FR-LearnerData2.mp4"
            }
            playsInline
            autoPlay
            controls
            muted={false}
            className="rounded-lg"
            width="100%"
          >
            Your browser does not support the video tag.
          </video>
          
          {autoplayFailed && (
            <button 
              onClick={handleStartWithSound}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 mx-auto mt-4"
            >
              <span>🔊</span> {languageContent[currentLanguage].videoButton}
            </button>
          )}
        </div>
      </div>

      {/* Conditional Form Rendering */}
      {currentForm === 1 ? (
        <form onSubmit={handleFirstFormSubmit} className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {languageContent[currentLanguage].formNumber.first}
          </h2>
          <div className="space-y-8">
            <div>
              <Label htmlFor="timeToLearn">
                {languageContent[currentLanguage].timeToLearn.question}
              </Label>
              <SelectWrapper
                options={timeOptions}
                value={formData.timeToLearn}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeToLearn: value }))}
                placeholder={languageContent[currentLanguage].timeToLearn.placeholder}
                prefix="time"
              />
            </div>

            <div>
              <Label htmlFor="motivation">
                {languageContent[currentLanguage].motivation.question}
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
                {languageContent[currentLanguage].interests.question}
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
          </div>

          <div className="mt-8 flex justify-center">
            <Button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
            >
              {languageContent[currentLanguage].nextButton}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSecondFormSubmit} className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {languageContent[currentLanguage].formNumber.second}
          </h2>
          <div className="space-y-6">
            {/* Device Preferences */}
            <div>
              <Label htmlFor="device">
                {languageContent[currentLanguage].device.question}
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
                {languageContent[currentLanguage].contentType.question}
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
                {languageContent[currentLanguage].classroomFormat.question}
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

          <div className="mt-8 flex flex-col items-center">
            <Button 
              type="submit"
              className="px-8 py-3 rounded-full font-bold bg-green-500 hover:bg-green-600 text-white 
                        shadow-lg hover:shadow-xl transition-all duration-200 
                        flex items-center justify-center gap-2 w-full"
            >
              {currentLanguage === 'en' ? 'Save & Continue' : 'Enregistrer & Continuer'}
              <span className="text-xl">→</span>
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}