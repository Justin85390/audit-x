import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectWrapper } from "@/components/ui/select-wrapper";
import { Textarea } from "@/components/ui/textarea";

interface ContactDetailsPageProps {
  onNext: () => void;
  updateUserData: (key: string, value: any) => void;
}

export default function ContactDetailsPage({ onNext, updateUserData }: ContactDetailsPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    age: "",
    address: "",
    company: "",
    jobTitle: "",
  })

  const [countryCode, setCountryCode] = useState("33");

  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const countryCodes = [
    { id: 'us-can', code: "1", country: "USA/Canada" },
    { id: 'fr', code: "33", country: "France" },
    { id: 'uk', code: "44", country: "UK" },
    { id: 'de', code: "49", country: "Germany" },
    { id: 'es', code: "34", country: "Spain" },
    { id: 'it', code: "39", country: "Italy" },
    { id: 'pt', code: "351", country: "Portugal" },
    { id: 'nl', code: "31", country: "Netherlands" },
    { id: 'be', code: "32", country: "Belgium" },
    { id: 'at', code: "43", country: "Austria" },
    { id: 'dk', code: "45", country: "Denmark" },
    { id: 'fi', code: "358", country: "Finland" },
    { id: 'gr', code: "30", country: "Greece" },
    { id: 'ie', code: "353", country: "Ireland" },
    { id: 'lu', code: "352", country: "Luxembourg" },
    { id: 'se', code: "46", country: "Sweden" },
    { id: 'pl', code: "48", country: "Poland" },
    { id: 'cz', code: "420", country: "Czech Republic" },
    { id: 'hu', code: "36", country: "Hungary" },
    { id: 'ro', code: "40", country: "Romania" },
    { id: 'bg', code: "359", country: "Bulgaria" },
    { id: 'hr', code: "385", country: "Croatia" },
    { id: 'ee', code: "372", country: "Estonia" },
    { id: 'lv', code: "371", country: "Latvia" },
    { id: 'lt', code: "370", country: "Lithuania" },
    { id: 'si', code: "386", country: "Slovenia" },
    { id: 'sk', code: "421", country: "Slovakia" },
    { id: 'mt', code: "356", country: "Malta" },
    { id: 'cy', code: "357", country: "Cyprus" },
    { id: 'cn', code: "86", country: "China" },
    { id: 'jp', code: "81", country: "Japan" },
    { id: 'kr', code: "82", country: "South Korea" },
    { id: 'in', code: "91", country: "India" },
    { id: 'ru', code: "7", country: "Russia" },
    { id: 'br', code: "55", country: "Brazil" },
    { id: 'au', code: "61", country: "Australia" },
    { id: 'mx', code: "52", country: "Mexico" },
    { id: 'sg', code: "65", country: "Singapore" },
    { id: 'ch', code: "41", country: "Switzerland" },
    { id: 'no', code: "47", country: "Norway" },
    { id: 'za', code: "27", country: "South Africa" },
    { id: 'ae', code: "971", country: "UAE" },
    { id: 'sa', code: "966", country: "Saudi Arabia" },
    { id: 'eg', code: "20", country: "Egypt" },
    { id: 'il', code: "972", country: "Israel" },
    { id: 'tr', code: "90", country: "Turkey" },
    { id: 'pk', code: "92", country: "Pakistan" },
    { id: 'vn', code: "84", country: "Vietnam" },
    { id: 'id', code: "62", country: "Indonesia" },
    { id: 'my', code: "60", country: "Malaysia" },
    { id: 'ph', code: "63", country: "Philippines" },
    { id: 'th', code: "66", country: "Thailand" },
    { id: 'ar', code: "54", country: "Argentina" },
    { id: 'cl', code: "56", country: "Chile" },
    { id: 'co', code: "57", country: "Colombia" }
  ].sort((a, b) => a.code.localeCompare(b.code));

  const countryCodeOptions = countryCodes.map(country => ({
    id: country.id,
    value: country.code,
    label: `+${country.code} ${country.country}`
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('contactDetails', JSON.stringify(formData));
    
    // Update parent state
    updateUserData('contactDetails', formData);
    
    console.log('Contact Details saved:', formData);
    onNext();
  };

  const handlePlayVideo = () => {
    if (videoRef) {
      videoRef.muted = false;
      videoRef.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Your Contact Details</h1>

      {/* Video Container */}
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="w-full flex flex-col items-center">
          <video
            ref={(el) => setVideoRef(el)}
            src="https://justindonlon.com/wp-content/uploads/2024/11/ContactDetails.mp4"
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

      <form onSubmit={handleSubmit} className="w-full">
        {/* Forms Container - Side by Side */}
        <div className="w-full max-w-3xl mx-auto flex gap-6">
          {/* Left Form - Contact Details */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="flex items-center">
                  First Name 
                  <span className="ml-2 text-sm text-gray-500 italic">(Prénom)</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="flex items-center">
                  Last Name
                  <span className="ml-2 text-sm text-gray-500 italic">(Nom de famille)</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center">
                  Email
                  <span className="ml-2 text-sm text-gray-500 italic">(Courriel)</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="flex items-center">
                  Phone Number
                  <span className="ml-2 text-sm text-gray-500 italic">(Numéro de téléphone)</span>
                </Label>
                <div className="flex gap-2">
                  <SelectWrapper
                    options={countryCodeOptions}
                    value={countryCode}
                    onValueChange={setCountryCode}
                    placeholder="Country"
                    prefix="country"
                    className="w-[140px]"
                  />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="123456789"
                    className="flex-1 border-2 border-gray-700 rounded-md p-2 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Form - Additional Details */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="age" className="flex items-center">
                  Age
                  <span className="ml-2 text-sm text-gray-500 italic">(Âge)</span>
                </Label>
                <SelectWrapper
                  options={[
                    { id: 'under18', value: 'under 18', label: 'Under 18' },
                    { id: '18-25', value: '18-25', label: '18 - 25' },
                    { id: '25-45', value: '25-45', label: '25 - 45' },
                    { id: '45plus', value: '45+', label: '45+' }
                  ]}
                  value={formData.age}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}
                  placeholder="Select age range"
                  prefix="age"
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="address" className="flex items-center">
                  Full Address
                  <span className="ml-2 text-sm text-gray-500 italic">(Adresse complète)</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="company" className="flex items-center">
                  Company
                  <span className="ml-2 text-sm text-gray-500 italic">(Entreprise)</span>
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <Label htmlFor="jobTitle" className="flex items-center">
                  Job Title
                  <span className="ml-2 text-sm text-gray-500 italic">(Titre du poste)</span>
                </Label>
                <Input
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-center">
          <Button 
            type="submit"
            className="w-full max-w-3xl bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  )
}