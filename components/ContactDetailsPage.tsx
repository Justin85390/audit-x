import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image';

interface ContactDetailsPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

type Language = 'en' | 'fr';

interface LanguageContent {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  timeCommitment: {
    question: string;
    placeholder: string;
    options: {
      lessThan2: string;
      twoToFour: string;
      fourToSix: string;
      moreThanSix: string;
    };
  };
  motivation: {
    question: string;
    placeholder: string;
    options: {
      work: string;
      academic: string;
      travel: string;
      personal: string;
      other: string;
    };
  };
  interests: {
    question: string;
    placeholder: string;
    options: {
      business: string;
      culture: string;
      science: string;
      currentEvents: string;
      other: string;
    };
  };
  privacyNotice: string;
  submitButton: string;
  videoButton: string;
}

type MotivationOption = 'work' | 'academic' | 'travel' | 'personal' | 'other';
type InterestOption = 'business' | 'culture' | 'science' | 'current' | 'other';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectOptionWithValue<T = string> {
  value: T;
  label: string;
}

// Add this type to handle multi-select values properly
type MultiSelectValue = string | string[];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  timeCommitment: string;
  motivation: string[];
  interests: string[];
}

export default function ContactDetailsPage({ onNext, updateUserData, onLanguageChange }: ContactDetailsPageProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    timeCommitment: "",
    motivation: [],
    interests: []
  });

  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [autoplayFailed, setAutoplayFailed] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const languageContent: Record<Language, LanguageContent> = {
    en: {
      title: "Your Contact Details",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      timeCommitment: {
        question: "How much time can you dedicate to learning English each week?",
        placeholder: "Select time commitment",
        options: {
          lessThan2: "Less than 2 hours",
          twoToFour: "2-4 hours",
          fourToSix: "4-6 hours",
          moreThanSix: "More than 6 hours"
        }
      },
      motivation: {
        question: "What motivates you to improve your English?",
        placeholder: "Select motivation",
        options: {
          work: "Work/Professional Development",
          academic: "Academic Studies",
          travel: "Travel",
          personal: "Personal Interest",
          other: "Other"
        }
      },
      interests: {
        question: "What topics interest you the most?",
        placeholder: "Select interests",
        options: {
          business: "Business & Professional",
          culture: "Culture & Entertainment",
          science: "Science & Technology",
          currentEvents: "Current Events",
          other: "Other"
        }
      },
      privacyNotice: "Linguaphone collects your personal details for internal purposes only, and doesn't share or sell your data to 3rd parties",
      submitButton: "Accept & Continue",
      videoButton: "Start with Sound"
    },
    fr: {
      title: "Vos Coordonnées",
      firstName: "Prénom",
      lastName: "Nom de famille",
      email: "Adresse e-mail",
      timeCommitment: {
        question: "Combien de temps pouvez-vous consacrer à l'apprentissage de l'anglais chaque semaine ?",
        placeholder: "Sélectionnez votre disponibilité",
        options: {
          lessThan2: "Moins de 2 heures",
          twoToFour: "2-4 heures",
          fourToSix: "4-6 heures",
          moreThanSix: "Plus de 6 heures"
        }
      },
      motivation: {
        question: "Qu'est-ce qui vous motive à améliorer votre anglais ?",
        placeholder: "Sélectionnez votre motivation",
        options: {
          work: "Travail/Développement professionnel",
          academic: "Études académiques",
          travel: "Voyage",
          personal: "Intérêt personnel",
          other: "Autre"
        }
      },
      interests: {
        question: "Quels sujets vous intéressent le plus ?",
        placeholder: "Sélectionnez vos intérêts",
        options: {
          business: "Affaires et professionnel",
          culture: "Culture et divertissement",
          science: "Science et technologie",
          currentEvents: "Actualités",
          other: "Autre"
        }
      },
      privacyNotice: "Linguaphone collecte vos données personnelles à des fins internes uniquement et ne partage ni ne vend vos données à des tiers",
      submitButton: "Accepter et Continuer",
      videoButton: "Démarrer avec le son"
    }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate only the fields that exist in the form
    if (!formData.firstName || 
        !formData.lastName || 
        !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('contactDetails', JSON.stringify(formData));
    
    // Update parent state
    updateUserData('contactDetails', formData);
    
    console.log('Contact Details saved:', formData);
    onNext();
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
              ? "https://justindonlon.com/wp-content/uploads/2025/01/ContactDetails3.mp4"
              : "https://justindonlon.com/wp-content/uploads/2025/01/FR-ContactDetails2.mp4"
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

      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  {languageContent[currentLanguage].firstName}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full"
                />
              </div>
              <div>
                <Label htmlFor="lastName">
                  {languageContent[currentLanguage].lastName}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">
                {languageContent[currentLanguage].email}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-2 border-gray-700 rounded-md p-2 w-full"
              />
            </div>
          </div>

          {/* Privacy notice and submit button */}
          <div className="mt-8 space-y-4">
            <p className="text-sm text-gray-600 text-center">
              {languageContent[currentLanguage].privacyNotice}
            </p>
            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full"
              >
                {languageContent[currentLanguage].submitButton}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}