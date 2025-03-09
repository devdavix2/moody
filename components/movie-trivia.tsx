"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Lightbulb, RefreshCw, ThumbsUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MovieTriviaProps {
  mood?: string
  movieId?: number
  onLike?: () => void
}

export default function MovieTrivia({ mood, movieId, onLike }: MovieTriviaProps) {
  const [trivia, setTrivia] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [likedTrivia, setLikedTrivia] = useLocalStorage<string[]>("moodyflicks-liked-trivia", [])
  const { toast } = useToast()

  useEffect(() => {
    generateTrivia()
  }, [mood, movieId])

  const generateTrivia = async () => {
    setLoading(true)

    try {
      // If we have a specific movie ID, fetch trivia for that movie
      if (movieId) {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=83492b666fdd114bc7f519241953fd4a&append_to_response=credits,keywords`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch movie details")
        }

        const movie = await response.json()

        // Generate trivia based on movie details
        const triviaOptions = [
          `${movie.title} was released in ${new Date(movie.release_date).getFullYear()} and has a rating of ${movie.vote_average.toFixed(1)}/10.`,
          `${movie.title} was directed by ${movie.credits?.crew?.find((c) => c.job === "Director")?.name || "an acclaimed director"}.`,
          `The budget for ${movie.title} was ${movie.budget > 0 ? `$${(movie.budget / 1000000).toFixed(1)} million` : "not publicly disclosed"}.`,
          `${movie.title} stars ${
            movie.credits?.cast
              ?.slice(0, 3)
              .map((c) => c.name)
              .join(", ") || "talented actors"
          }.`,
          `${movie.title} has a runtime of ${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m.`,
          `${movie.title} was filmed in ${movie.production_countries?.map((c) => c.name).join(", ") || "various locations"}.`,
          `${movie.title} is categorized as ${movie.genres?.map((g) => g.name).join(", ")}.`,
        ]

        // Pick a random trivia fact
        setTrivia(triviaOptions[Math.floor(Math.random() * triviaOptions.length)])
      }
      // Otherwise, generate general trivia based on mood
      else if (mood) {
        const moodTrivia = {
          cheerful: [
            "Studies show that watching comedy movies can boost your immune system by increasing antibody production.",
            "The first feature-length comedy film was 'Tillie's Punctured Romance' (1914) starring Charlie Chaplin.",
            "Laughter during funny movies can burn up to 40 calories per 10 minutes!",
            "The longest running comedy film series is 'Carry On' with 31 films between 1958 and 1992.",
            "The term 'feel-good movie' originated in the 1980s to describe films that leave audiences feeling positive.",
          ],
          reflective: [
            "The term 'arthouse film' originated in the 1950s to describe movies with artistic or experimental styles.",
            "Philosophical films often use visual metaphors to represent complex ideas about existence.",
            "Many reflective films use the technique of 'slow cinema' with long takes and minimal dialogue.",
            "Studies show that watching thought-provoking films can increase empathy and emotional intelligence.",
            "The 'Golden Age of Philosophical Cinema' is often considered to be the 1960s European art films.",
          ],
          gloomy: [
            "The term 'film noir' (dark film) was coined by French critics to describe Hollywood crime dramas of the 1940s.",
            "Melancholic films often use desaturated colors and rain to enhance the somber mood.",
            "Studies show that sad movies can actually improve mood by triggering empathy hormones.",
            "The 'pathetic fallacy' is a literary device where weather reflects emotions, commonly used in gloomy films.",
            "Many directors use the 'blue filter' technique to create a cold, detached feeling in melancholic scenes.",
          ],
          humorous: [
            "The first comedy film was 'L'Arroseur Arrosé' (1895), showing a gardener being sprayed with his own hose.",
            "Comedies are one of the oldest film genres, dating back to the silent film era.",
            "The term 'slapstick' comes from a prop made of two wooden slats that made a 'slap' sound when hit together.",
            "Studies show that comedy films can reduce stress hormones and increase endorphins.",
            "The longest laugh recorded in a test screening was 3 minutes and 16 seconds during 'There's Something About Mary'.",
          ],
          adventurous: [
            "The adventure film genre dates back to the silent era with films like 'The Thief of Bagdad' (1924).",
            "Many adventure films are shot in IMAX to capture the grandeur of exotic locations.",
            "The Wilhelm Scream is a famous sound effect used in over 400 adventure and action films.",
            "Adventure films often follow the 'Hero's Journey' narrative structure identified by Joseph Campbell.",
            "The most expensive adventure film ever made was 'Pirates of the Caribbean: On Stranger Tides' at $379 million.",
          ],
          romantic: [
            "The term 'meet-cute' describes the scenario where future romantic partners meet for the first time.",
            "The first on-screen kiss was in the 1896 film 'The Kiss', which caused moral outrage at the time.",
            "Studies show that watching romantic movies can increase oxytocin, the 'love hormone'.",
            "The 'golden hour' (just after sunrise or before sunset) is often used to film romantic scenes for its warm glow.",
            "The longest on-screen kiss was 3 minutes and 24 seconds in the film 'You're Next' (2013).",
          ],
          thrilling: [
            "Alfred Hitchcock, the 'Master of Suspense', never won an Oscar for directing despite making over 50 films.",
            "The term 'MacGuffin' refers to a plot device that motivates characters but is ultimately unimportant.",
            "Suspenseful music often uses the 'Shepard tone' illusion to create a feeling of ever-increasing tension.",
            "Studies show that watching thrillers can burn calories due to increased heart rate and adrenaline.",
            "The shower scene in 'Psycho' contains 78 camera setups and 52 cuts, but the knife never actually touches the victim.",
          ],
          relaxed: [
            "The 'slow cinema' movement features long takes, minimal dialogue, and contemplative pacing.",
            "Nature documentaries are often filmed at higher frame rates and slowed down to create a calming effect.",
            "Studies show that watching peaceful scenes in films can lower blood pressure and heart rate.",
            "The 'golden ratio' (approximately 1.618:1) is often used in composing visually pleasing, calming shots.",
            "ASMR (Autonomous Sensory Meridian Response) videos became popular for their relaxing, tingling sensations.",
          ],
        }

        const moodTriviaList = moodTrivia[mood] || moodTrivia.cheerful
        setTrivia(moodTriviaList[Math.floor(Math.random() * moodTriviaList.length)])
      } else {
        // General movie trivia
        const generalTrivia = [
          "The first film ever made was 'Roundhay Garden Scene' (1888), which is only 2.11 seconds long.",
          "The Wilhelm Scream is a famous sound effect used in over 400 films since 1951.",
          "The longest film ever made is 'Logistics' (2012) with a runtime of 857 hours (35 days and 17 hours).",
          "The highest-grossing film of all time adjusted for inflation is 'Gone with the Wind' (1939).",
          "The first feature-length animated film was Disney's 'Snow White and the Seven Dwarfs' (1937).",
          "The shortest performance to win an Oscar was Beatrice Straight in 'Network' (1976) with 5 minutes 40 seconds of screen time.",
          "The most expensive film ever made was 'Pirates of the Caribbean: On Stranger Tides' (2011) with a budget of $379 million.",
          "The first film to use CGI was 'Westworld' (1973), which used it to show the robot's point of view.",
          "The highest-grossing R-rated film is 'Joker' (2019), which made over $1 billion worldwide.",
          "The first 3D film was 'The Power of Love' (1922), which used the anaglyph color system with red/green glasses.",
        ]

        setTrivia(generalTrivia[Math.floor(Math.random() * generalTrivia.length)])
      }
    } catch (error) {
      console.error("Error generating trivia:", error)
      setTrivia("Did you know? The art of filmmaking dates back to the late 19th century!")
    } finally {
      setLoading(false)
    }
  }

  const handleLike = () => {
    if (!trivia) return

    // Check if already liked
    if (likedTrivia.includes(trivia)) {
      toast({
        title: "Already Liked",
        description: "You've already liked this trivia fact.",
      })
      return
    }

    // Add to liked trivia
    setLikedTrivia([...likedTrivia, trivia])

    // Call parent callback if provided
    if (onLike) {
      onLike()
    }

    toast({
      title: "Trivia Liked!",
      description: "This fact has been saved to your collection.",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Movie Trivia
        </CardTitle>
        <CardDescription>
          Interesting facts about {movieId ? "this movie" : mood ? `${mood} movies` : "cinema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-sm mb-4">{trivia}</p>
            <div className="flex justify-between">
              <Button variant="ghost" size="sm" onClick={generateTrivia} className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                New Fact
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLike} className="text-xs">
                <ThumbsUp className="h-3 w-3 mr-1" />
                Like
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

