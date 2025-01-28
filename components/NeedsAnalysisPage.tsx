'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../app/contexts/LanguageContext';

type Language = 'en' | 'fr';

interface LanguageContent {
  title: string;
  searchPlaceholder: string;
  selectedNeeds: string;
  continueButton: string;
}

interface NeedsAnalysisPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
  onLanguageChange?: (language: Language) => void;
}

const languageContent: Record<Language, LanguageContent> = {
  en: {
    title: "Your Professional & General Language Needs",
    searchPlaceholder: "Search needs...",
    selectedNeeds: "Selected Needs:",
    continueButton: "Continue",
  },
  fr: {
    title: "Vos Besoins Professionnels et Linguistiques Généraux",
    searchPlaceholder: "Rechercher des besoins...",
    selectedNeeds: "Besoins Sélectionnés:",
    continueButton: "Continuer",
  }
};

interface NeedCategory {
  category: {
    en: string;
    fr: string;
  };
  needs: {
    en: string;
    fr: string;
  }[];
}

export const needsData: NeedCategory[] = [
  {
    category: {
      en: "Visitor Reception and Orientation",
      fr: "Accueil et orientation de visiteurs"
    },
    needs: [
      {
        en: "Ensure regular visitor reception",
        fr: "Assurer l'accueil habituel de visiteurs"
      },
      {
        en: "Ensure limited visitor reception, guide them, exchange simple information with an interlocutor",
        fr: "Assurer un accueil limité de visiteurs, les orienter, échanger des informations simples avec un interlocuteur"
      },
      {
        en: "Communicate with confidence in the vast majority of reception situations",
        fr: "Communiquer avec aisance dans la grande majorité des situations d'accueil"
      }
    ]
  },
  {
    category: {
      en: "Phone Communication",
      fr: "Communications téléphoniques"
    },
    needs: [
      {
        en: "Transfer calls/take simple messages",
        fr: "Transférer des appels/ prendre des messages très simples"
      },
      {
        en: "Exchange routine information in one's field by phone",
        fr: "Echanger des informations courantes dans son domaine au téléphone"
      },
      {
        en: "Communicate fairly easily in phone exchanges",
        fr: "Communiquer assez facilement dans des échanges téléphoniques"
      }
    ]
  },
  {
    category: {
      en: "Oral Communication",
      fr: "Echanges Oraux"
    },
    needs: [
      {
        en: "Participate in limited very simple professional exchanges",
        fr: "Participer de façon limitée à des échanges professionnels très simples"
      },
      {
        en: "Interact in familiar professional situations",
        fr: "Interagir dans des situations professionnelles connues"
      },
      {
        en: "Be interactive during professional exchanges",
        fr: "Être interactif lors des échanges professionnels"
      },
      {
        en: "Interact in a nuanced way on a variety of professional topics",
        fr: "Interagir de manière nuancée sur une variété de sujets professionnels"
      }
    ]
  },
  {
    category: {
      en: "Socio-professional Exchanges",
      fr: "Échanges socio-professionnels"
    },
    needs: [
      {
        en: "Exchange opinions and simple information in a familiar context",
        fr: "Échanger des opinions et des informations simples dans un contexte familier"
      },
      {
        en: "Maintain a conversation, express opinions in a predictable field",
        fr: "Entretenir une conversation, exprimer ses opinions dans un domaine prévisible"
      },
      {
        en: "Actively participate in formal or informal conversation on a wide range of topics",
        fr: "Participer activement à une conversation formelle ou informelle sur une gamme large de sujets"
      }
    ]
  },
  {
    category: {
      en: "Reading Professional Documents",
      fr: "Lecture de documents professionnels"
    },
    needs: [
      {
        en: "Decipher important information in a simple text",
        fr: "Déchiffrer les informations importantes dans un texte simple (des mails, des notices, manuels ou rapports simples dans son domaine)"
      },
      {
        en: "Read professional documents related to one's field and extract essential information",
        fr: "Lire des documents professionnels (mails, notice, memos) liés à son domaine et en extraire l'information essentielle"
      },
      {
        en: "Understand and effectively explore professional documents",
        fr: "Comprendre et exploiter efficacement des documents professionnels relatifs à son domaine (mails, comptes rendus, rapports...)"
      }
    ]
  },
  {
    category: {
      en: "Negotiation",
      fr: "Négociation"
    },
    needs: [
      {
        en: "Follow a simple negotiation in one's field, understand the essentials and intervene occasionally",
        fr: "Suivre une négociation simple dans son domaine, comprendre l'essentiel et intervenir ponctuellement"
      },
      {
        en: "Participate in a negotiation, present arguments on known themes",
        fr: "Participer à une négociation, exposer ses arguments sur des thèmes connus"
      },
      {
        en: "Negotiate relatively autonomously",
        fr: "Négocier de façon relativement autonome"
      }
    ]
  },
  {
    category: {
      en: "Presentations",
      fr: "Présentations"
    },
    needs: [
      {
        en: "Make a simple and factual presentation with preparation in one's field",
        fr: "Faire une présentation simple et factuelle avec préparation dans son domaine"
      },
      {
        en: "Deliver a coherent presentation and answer related questions",
        fr: "Réaliser une présentation cohérente et répondre aux questions qui y sont liées"
      },
      {
        en: "Deliver formal or informal presentations with ease, and answer questions with precision and diplomacy",
        fr: "Réaliser des présentations formelles ou informelles avec aisance, et répondre aux questions avec précision et diplomatie"
      }
    ]
  },
  {
    category: {
      en: "Writing Professional Documents",
      fr: "Rédaction de documents professionnels"
    },
    needs: [
      {
        en: "Write very simple and factual short professional documents",
        fr: "Rédiger des documents professionnels courts (courriers, mails) très simples et factuels"
      },
      {
        en: "Write short professional documents on a known subject",
        fr: "Rédiger des documents professionnels courts sur un sujet connu courriers, mails, mémos, comptes rendus simples"
      },
      {
        en: "Write clear and comprehensible professional documents",
        fr: "Rédiger des documents professionnels clairs et compréhensibles (courriers, mails, mémos, rapports)"
      },
      {
        en: "Write complex professional documents with precision and nuance",
        fr: "Rédiger des documents professionnels complexes avec précision et nuance"
      }
    ]
  },
  {
    category: {
      en: "Meetings",
      fr: "Réunions"
    },
    needs: [
      {
        en: "Participate passively in a routine information meeting in one's field",
        fr: "Participer de manière passive à une réunion d'information de routine dans son domaine"
      },
      {
        en: "Participate in a meeting and intervene in a clear and simple way to express one's point of view",
        fr: "Participer à une réunion et intervenir de manière claire et simple pour exprimer son point de vue"
      },
      {
        en: "Intervene, argue and clarify one's point of view in meetings",
        fr: "Intervenir, argumenter et préciser son point de vue en réunion"
      },
      {
        en: "Participate actively and facilitate meetings effectively and spontaneously",
        fr: "Participer activement et animer de façon efficace et spontanée des réunions"
      }
    ]
  },
  {
    category: {
      en: "Virtual Meetings",
      fr: "Réunions virtuelles"
    },
    needs: [
      {
        en: "Attend a teleconference or videoconference on a topic in one's field",
        fr: "Assister à une téléconférence ou une visioconférence sur un sujet de son domaine"
      },
      {
        en: "Understand and interact in teleconference or videoconference",
        fr: "Comprendre et interagir en téléconférence ou visioconférence"
      },
      {
        en: "Intervene, argue with confidence and precision in a teleconference or videoconference",
        fr: "Intervenir, argumenter avec confiance et précision dans une téléconférence ou une visioconférence"
      },
      {
        en: "Lead a teleconference or videoconference: participate actively and facilitate effectively and spontaneously",
        fr: "Mener une téléconférence ou une visioconférence : participer activement et animer de façon efficace et spontanée"
      }
    ]
  },
  {
    category: {
      en: "Oral Expression",
      fr: "Expression orale"
    },
    needs: [
      {
        en: "Acquire ease/confidence/fluency in oral expression",
        fr: "Acquérir une aisance/confiance/fluence en expression orale"
      },
      {
        en: "Improve precision in oral expression",
        fr: "Améliorer la précision en expression orale"
      },
      {
        en: "Improve pronunciation",
        fr: "Améliorer la prononciation"
      }
    ]
  },
  {
    category: {
      en: "Oral Comprehension",
      fr: "Compréhension orale"
    },
    needs: [
      {
        en: "Improve/perfect oral comprehension",
        fr: "Améliorer/perfectionner la compréhension orale"
      },
      {
        en: "Understand varied accents",
        fr: "Comprendre divers accents"
      }
    ]
  },
  {
    category: {
      en: "Grammar",
      fr: "Grammaire"
    },
    needs: [
      {
        en: "Acquire basic grammatical structures",
        fr: "Acquérir les structures grammaticales de base"
      },
      {
        en: "Improve syntax and consolidate grammatical structures",
        fr: "Améliorer la syntaxe et consolider les structures grammaticales"
      },
      {
        en: "Improve use of complex grammatical structures",
        fr: "Améliorer l'emploi des structures grammaticales complexes"
      },
      {
        en: "Master complex grammatical structures",
        fr: "Maitriser les structures grammaticales complexes"
      }
    ]
  },
  {
    category: {
      en: "Vocabulary",
      fr: "Vocabulaire"
    },
    needs: [
      {
        en: "Develop and expand professional vocabulary",
        fr: "Développer et élargir le lexique professionnel"
      },
      {
        en: "Develop and expand general vocabulary",
        fr: "Développer et élargir le lexique général"
      }
    ]
  },
  {
    category: {
      en: "Other",
      fr: "Autres"
    },
    needs: [
      {
        en: "Pass a certification",
        fr: "Passer une certification"
      },
      {
        en: "Intercultural",
        fr: "Interculturel"
      }
    ]
  }
];

export default function NeedsAnalysisPage({ onNext, updateUserData, onLanguageChange }: NeedsAnalysisPageProps) {
  const { language } = useLanguage();
  const [selectedNeeds, setSelectedNeeds] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoplayFailed, setAutoplayFailed] = useState(false);

  const handleNeedToggle = (need: string) => {
    setSelectedNeeds(prev => ({
      ...prev,
      [need]: !prev[need]
    }));
  };

  const handleSubmit = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) throw new Error('No user email found');

      const selectedNeedsList = Object.entries(selectedNeeds)
        .filter(([_, isSelected]) => isSelected)
        .map(([need]) => need);

      const { data, error } = await supabase
        .from('users')
        .update({
          needs_analysis: selectedNeedsList
        })
        .eq('email', userEmail)
        .select();

      if (error) throw error;

      onNext();
    } catch (error) {
      console.error('Error saving needs analysis:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        videoRef.current.load();
      } catch (error) {
        console.error('Error handling video on language change:', error);
      }
    }
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const filteredNeeds = searchTerm
    ? needsData.map(category => ({
        ...category,
        needs: category.needs.filter(need =>
          need[language].toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.needs.length > 0)
    : needsData;

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4 space-x-2">
          <button 
            onClick={() => handleLanguageChange('en')}
            className={`p-1 rounded ${language === 'en' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <img
              src="/images/flags/gb-flag.png"
              alt="English"
              width={32}
              height={24}
              className="rounded shadow-sm"
            />
          </button>
          <button 
            onClick={() => handleLanguageChange('fr')}
            className={`p-1 rounded ${language === 'fr' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <img
              src="/images/flags/fr-flag.png"
              alt="Français"
              width={32}
              height={24}
              className="rounded shadow-sm"
            />
          </button>
        </div>

        <h1 className="text-4xl font-bold text-center mb-6">{languageContent[language].title}</h1>
        
        <div className="w-full flex flex-col items-center">
          <video
            ref={videoRef}
            src={language === 'en' 
              ? "https://justindonlon.com/wp-content/uploads/2025/01/Pro-Needs2.mp4"
              : "https://justindonlon.com/wp-content/uploads/2025/01/FR-Pro-Needs2.mp4"
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
        </div>
      </div>

      {/* Needs Analysis Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        {/* Categories Accordion */}
        <Accordion type="single" collapsible className="mb-6">
          {needsData.map((category, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg font-semibold">
                {category.category[language]}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {category.needs.map((need, needIndex) => (
                    <div key={needIndex} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`need-${index}-${needIndex}`}
                        checked={selectedNeeds[need[language]] || false}
                        onCheckedChange={(_checked: boolean) => handleNeedToggle(need[language])}
                        className="w-5 h-5 border-2 border-gray-300 rounded 
                          data-[state=checked]:bg-blue-500 
                          data-[state=checked]:border-blue-500 
                          data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor={`need-${index}-${needIndex}`}
                        className="text-sm leading-tight cursor-pointer"
                      >
                        {need[language]}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Selected Needs Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="font-semibold mb-2">{languageContent[language].selectedNeeds}</h2>
          <div className="space-y-4">
            {needsData.map((category) => {
              const selectedInCategory = category.needs.filter(
                need => selectedNeeds[need[language]]
              );
              
              if (selectedInCategory.length === 0) return null;

              return (
                <div key={category.category[language]} className="space-y-1">
                  <h3 className="font-bold text-gray-800">{category.category[language]}</h3>
                  {selectedInCategory.map((need, index) => (
                    <div key={index} className="text-sm ml-4">
                      • {need[language]}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="px-8 py-3 rounded-full font-bold bg-green-500 hover:bg-green-600 text-white 
                    shadow-lg hover:shadow-xl transition-all duration-200 
                    flex items-center justify-center gap-2 w-full"
        >
          {language === 'en' ? 'Save and Continue' : 'Enregistrer et Continuer'}
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
