'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/lib/supabase';

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
      en: "Phone Communications",
      fr: "Communications téléphoniques"
    },
    needs: [
      {
        en: "Communicate fairly easily in telephone exchanges",
        fr: "Communiquer facilement dans les échanges téléphoniques"
      },
      {
        en: "Exchange routine information in one's field over the phone",
        fr: "Échanger des informations de routine dans le champ sur le téléphone"
      },
      {
        en: "Transfer calls/take very simple messages",
        fr: "Transférer des appels/prendre très simples messages"
      }
    ]
  },
  {
    category: {
      en: "Oral Exchanges",
      fr: "Échanges oraux"
    },
    needs: [
      {
        en: "Be interactive during professional exchanges",
        fr: "Être interactif lors des échanges professionnels"
      },
      {
        en: "Handle known professional situations",
        fr: "Gérer les situations professionnelles connues"
      },
      {
        en: "Interact in a nuanced way on a variety of professional subjects",
        fr: "Interagir de manière nuancée sur une variété de sujets professionnels"
      },
      {
        en: "Participate in a limited way in very simple professional exchanges",
        fr: "Participer de manière limitée dans des échanges professionnels très simples"
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
        fr: "Maintenir une conversation, exprimer des opinions dans un champ prévisible"
      },
      {
        en: "Actively participate in formal or informal conversation on a wide range of topics",
        fr: "Participer activement à une conversation formelle ou informelle sur une grande variété de sujets"
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
        en: "Understand and effectively explore professional documents related to one's field (emails, reports, minutes...)",
        fr: "Comprendre et explorer efficacement les documents professionnels liés au champ (courriels, rapports, minutes...)"
      },
      {
        en: "Decipher important information in a simple text (emails, notices, manuals or simple reports in one's field)",
        fr: "Décoder des informations importantes dans un texte simple (courriels, avis, manuels ou rapports simples dans le champ)"
      },
      {
        en: "Read professional documents (emails, notice, memos) related to one's field and extract essential information",
        fr: "Lire les documents professionnels (courriels, avis, mémos) liés au champ et extraire des informations essentielles"
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
        en: "Negotiate relatively autonomously",
        fr: "Négocier relativement de manière autonome"
      },
      {
        en: "Participate in a negotiation, present arguments on known themes",
        fr: "Participer à une négociation, présenter des arguments sur des thèmes connus"
      },
      {
        en: "Follow a simple negotiation in one's field, understand the essentials and intervene occasionally",
        fr: "Suivre une négociation simple dans le champ, comprendre les éléments essentiels et intervenir occasionnellement"
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
        en: "Give a simple and factual presentation with preparation in one's field",
        fr: "Donner une présentation simple et factuelle avec préparation dans le champ"
      },
      {
        en: "Deliver formal or informal presentations with confidence, and answer questions with precision and diplomacy",
        fr: "Réaliser des présentations formelles ou informelles avec confiance, et répondre aux questions avec précision et diplomatie"
      },
      {
        en: "Give a coherent presentation and answer related questions",
        fr: "Donner une présentation cohérente et répondre aux questions connexes"
      }
    ]
  },
  {
    category: {
      en: "Writing Professional Documents",
      fr: "Écriture de documents professionnels"
    },
    needs: [
      {
        en: "Write clear and comprehensible professional documents (letters, emails, memos, reports)",
        fr: "Écrire des documents professionnels clairs et compréhensibles (lettres, courriels, mémos, rapports)"
      },
      {
        en: "Write complex professional documents with precision and nuance",
        fr: "Écrire des documents professionnels complexes avec précision et nuance"
      },
      {
        en: "Write very simple and factual short professional documents (letters, emails)",
        fr: "Écrire très simples et factuels documents professionnels (lettres, courriels)"
      },
      {
        en: "Write short professional documents on a known subject (letters, emails, memos, simple reports)",
        fr: "Écrire des documents professionnels courts sur un sujet connu (lettres, courriels, mémos, rapports simples)"
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
        en: "Intervene, argue and clarify one's point of view in a meeting",
        fr: "Intervenir, argumenter et clarifier la vue d'un membre dans une réunion"
      },
      {
        en: "Participate in a meeting and intervene in a clear and simple way to express one's point of view",
        fr: "Participer à une réunion et intervenir de manière claire et simple pour exprimer la vue d'un membre"
      },
      {
        en: "Actively participate and facilitate meetings effectively and spontaneously",
        fr: "Participer activement et faciliter les réunions de manière efficace et spontanée"
      },
      {
        en: "Participate passively in a routine information meeting in one's field",
        fr: "Participer passivement dans une réunion d'informations de routine dans le champ"
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
        en: "Attend a teleconference or videoconference on a subject in one's field",
        fr: "Assister à une conférence téléphonique ou vidéoconférence sur un sujet dans le champ"
      },
      {
        en: "Understand and interact in teleconference or videoconference",
        fr: "Comprendre et interagir dans une conférence téléphonique ou vidéoconférence"
      },
      {
        en: "Intervene, argue with confidence and precision in a teleconference or videoconference",
        fr: "Intervenir, argumenter avec confiance et précision dans une conférence téléphonique ou vidéoconférence"
      },
      {
        en: "Lead a teleconference or videoconference: actively participate and facilitate effectively and spontaneously",
        fr: "Mener une conférence téléphonique ou vidéoconférence: participer activement et faciliter de manière efficace et spontanée"
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
        fr: "Acquérir des structures grammaticales de base"
      },
      {
        en: "Improve use of complex grammatical structures",
        fr: "Améliorer l'utilisation de structures grammaticales complexes"
      },
      {
        en: "Improve syntax and consolidate grammatical structures",
        fr: "Améliorer la syntaxe et consolider les structures grammaticales"
      },
      {
        en: "Master complex grammatical structures",
        fr: "Maîtriser des structures grammaticales complexes"
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
        en: "Develop and expand general vocabulary",
        fr: "Développer et élargir le vocabulaire général"
      },
      {
        en: "Develop and expand professional vocabulary",
        fr: "Développer et élargir le vocabulaire professionnel"
      }
    ]
  },
  {
    category: {
      en: "Others",
      fr: "Autres"
    },
    needs: [
      {
        en: "Pass a certification",
        fr: "Réussir un certificat"
      },
      {
        en: "Intercultural",
        fr: "Interculturel"
      }
    ]
  }
];

export default function NeedsAnalysisPage({ onNext, updateUserData, onLanguageChange }: NeedsAnalysisPageProps) {
  const [selectedNeeds, setSelectedNeeds] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
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

  const filteredNeeds = searchTerm
    ? needsData.map(category => ({
        ...category,
        needs: category.needs.filter(need =>
          need[currentLanguage].toLowerCase().includes(searchTerm.toLowerCase())
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
            className={`p-1 rounded ${currentLanguage === 'en' ? 'ring-2 ring-blue-500' : ''}`}
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
            className={`p-1 rounded ${currentLanguage === 'fr' ? 'ring-2 ring-blue-500' : ''}`}
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

        <h1 className="text-4xl font-bold text-center mb-6">{languageContent[currentLanguage].title}</h1>
        
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src={currentLanguage === 'en' 
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
                {category.category[currentLanguage]}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {category.needs.map((need, needIndex) => (
                    <div key={needIndex} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <Checkbox
                        id={`need-${index}-${needIndex}`}
                        checked={selectedNeeds[need[currentLanguage]] || false}
                        onCheckedChange={(_checked: boolean) => handleNeedToggle(need[currentLanguage])}
                        className="w-5 h-5 border-2 border-gray-300 rounded 
                          data-[state=checked]:bg-blue-500 
                          data-[state=checked]:border-blue-500 
                          data-[state=checked]:text-white"
                      />
                      <label
                        htmlFor={`need-${index}-${needIndex}`}
                        className="text-sm leading-tight cursor-pointer"
                      >
                        {need[currentLanguage]}
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
          <h2 className="font-semibold mb-2">{languageContent[currentLanguage].selectedNeeds}</h2>
          <div className="space-y-4">
            {needsData.map((category) => {
              const selectedInCategory = category.needs.filter(
                need => selectedNeeds[need[currentLanguage]]
              );
              
              if (selectedInCategory.length === 0) return null;

              return (
                <div key={category.category[currentLanguage]} className="space-y-1">
                  <h3 className="font-bold text-gray-800">{category.category[currentLanguage]}</h3>
                  {selectedInCategory.map((need, index) => (
                    <div key={index} className="text-sm ml-4">
                      • {need[currentLanguage]}
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
          {currentLanguage === 'en' ? 'Save and Continue' : 'Enregistrer et Continuer'}
          <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
