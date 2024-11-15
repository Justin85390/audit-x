import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function LearnerDataPage({ 
  onNext,
  updateUserData 
}: {
  onNext: () => void;
  updateUserData: (key: string, data: any) => void;
}) {
  const [formData, setFormData] = useState({
    timeToLearn: "",
    motivation: "", 
    interests: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateUserData("learnerData", formData)
    onNext()
  }

  const textareaStyles = "border-2 border-gray-700 rounded-md p-2 w-full focus:outline-none focus:border-blue-500 transition-colors"

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <h1 className="text-4xl font-bold text-center">Tell Me More</h1>
      <iframe
        width="560"
        height="315"
        src="https://www.youtube.com/embed/lnjfpj60-r8"
        title="Learner Data Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg shadow-lg"
      ></iframe>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <Label htmlFor="timeToLearn">How much time do you have to learn English?</Label>
          <Textarea
            id="timeToLearn"
            name="timeToLearn"
            value={formData.timeToLearn}
            onChange={handleChange}
            required
            placeholder="2 hours a week / 6 hours per month"
            className={textareaStyles}
          />
        </div>
        <div>
          <Label htmlFor="motivation">What is your motivation to learn English?</Label>
          <Textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            required
            placeholder="For my job / To study abroad / For travel"
            className={textareaStyles}
          />
        </div>
        <div>
          <Label htmlFor="interests">What are some of your interests?</Label>
          <Textarea
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            required
            placeholder="Movies, sports, cooking, technology..."
            className={textareaStyles}
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