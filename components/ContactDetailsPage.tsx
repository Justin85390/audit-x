import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateUserData("contactDetails", formData)
    onNext()
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Your Contact Details</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/rbpcbMMdbyo"
        title="Contact Details Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg shadow-lg"
      ></iframe>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
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
          <Label htmlFor="lastName">Last Name</Label>
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
          <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Submit
        </Button>
      </form>
    </div>
  )
}