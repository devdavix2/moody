"use client"
import { useRouter } from "next/navigation"
import { Film, Shuffle, Github, Twitter } from "lucide-react"
import MoodSelector from "@/components/mood-selector"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"

// Define mood types and their corresponding genres/keywords
const moodMap = {
  cheerful: { genres: [35, 10751], keywords: "feel-good,happy" },
  reflective: { genres: [18, 36], keywords: "thought-provoking,philosophical" },
  gloomy: { genres: [18, 9648], keywords: "melancholy,sad" },
  humorous: { genres: [35], keywords: "comedy,funny" },
  adventurous: { genres: [12, 28], keywords: "adventure,action" },
  romantic: { genres: [10749], keywords: "romance,love" },
  thrilling: { genres: [53, 27], keywords: "suspense,thriller" },
  relaxed: { genres: [36, 99], keywords: "calm,peaceful" },
}

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()

  const handleMoodSelect = (mood) => {
    router.push(`/recommendations/${mood}`)
  }

  const handleRandomPick = () => {
    const moods = Object.keys(moodMap)
    const randomMood = moods[Math.floor(Math.random() * moods.length)]

    toast({
      title: "Random Mood Selected!",
      description: `We've selected "${randomMood}" for you. Enjoy!`,
    })

    router.push(`/recommendations/${randomMood}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">MoodyFlicks</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRandomPick}>
              <Shuffle className="mr-2 h-4 w-4" />
              Random Mood
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <section className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">How are you feeling today?</h2>
            <p className="text-muted-foreground">Select a mood to get personalized movie recommendations</p>
          </div>

          <MoodSelector onSelectMood={handleMoodSelect} selectedMood="" />
        </section>
      </main>

      <footer className="bg-muted py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <p className="mb-2 text-center">Developed by devdavix</p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/devdavix2"
              className="hover:text-primary flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-5 w-5" />
              <span>devdavix2</span>
            </a>
            <a
              href="https://twitter.com/devdavix"
              className="hover:text-primary flex items-center gap-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-5 w-5" />
              <span>devdavix</span>
            </a>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  )
}

