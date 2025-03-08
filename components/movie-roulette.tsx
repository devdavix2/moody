"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Dices, Film } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface Movie {
  id: number
  title: string
  poster_path: string
  overview: string
}

interface MovieRouletteProps {
  mood: string
  onSelect: (movieId: number) => void
}

export default function MovieRoulette({ mood, onSelect }: MovieRouletteProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([])
  const spinInterval = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMovies()

    return () => {
      if (spinInterval.current) {
        clearInterval(spinInterval.current)
      }
    }
  }, [mood])

  const fetchMovies = async () => {
    setLoading(true)
    try {
      const { genres } = {
        cheerful: { genres: [35, 10751] },
        reflective: { genres: [18, 36] },
        gloomy: { genres: [18, 9648] },
        humorous: { genres: [35] },
        adventurous: { genres: [12, 28] },
        romantic: { genres: [10749] },
        thrilling: { genres: [53, 27] },
        relaxed: { genres: [36, 99] },
      }[mood]

      const genreParam = genres.join(",")

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=83492b666fdd114bc7f519241953fd4a&with_genres=${genreParam}&sort_by=popularity.desc&page=1`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }

      const data = await response.json()
      const fetchedMovies = data.results.filter((movie) => movie.poster_path)
      setMovies(fetchedMovies)

      // Initialize with first movie
      if (fetchedMovies.length > 0) {
        setVisibleMovies([fetchedMovies[0]])
      }
    } catch (error) {
      console.error("Error fetching movies:", error)
      toast({
        title: "Error",
        description: "Failed to fetch movies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const startSpin = () => {
    if (movies.length < 5) {
      toast({
        title: "Not enough movies",
        description: "We need more movies to spin the roulette.",
        variant: "destructive",
      })
      return
    }

    setSpinning(true)
    setSelectedMovie(null)

    let counter = 0
    const spinSpeed = 100 // ms
    const spinDuration = 2000 // ms
    const totalSpins = Math.floor(spinDuration / spinSpeed)

    // Start spinning
    spinInterval.current = setInterval(() => {
      counter++

      // Show a random movie
      const randomIndex = Math.floor(Math.random() * movies.length)
      setVisibleMovies([movies[randomIndex]])

      // Slow down and stop
      if (counter >= totalSpins) {
        if (spinInterval.current) {
          clearInterval(spinInterval.current)
        }

        // Select final movie
        const finalIndex = Math.floor(Math.random() * movies.length)
        const finalMovie = movies[finalIndex]
        setSelectedMovie(finalMovie)
        setVisibleMovies([finalMovie])
        setSpinning(false)

        toast({
          title: "Movie Selected!",
          description: `The roulette has chosen: ${finalMovie.title}`,
        })
      }
    }, spinSpeed)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dices className="h-5 w-5 text-primary" />
          Movie Roulette
        </CardTitle>
        <CardDescription>Can't decide what to watch? Let the roulette choose for you!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-xs aspect-[2/3] mb-6 overflow-hidden rounded-lg border-4 border-primary">
            {visibleMovies.length > 0 ? (
              <motion.div
                key={visibleMovies[0].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w500${visibleMovies[0].poster_path}`}
                  alt={visibleMovies[0].title}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <Film className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {spinning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>

          {selectedMovie && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
              <h3 className="text-xl font-bold mb-2">{selectedMovie.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{selectedMovie.overview}</p>
            </motion.div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button onClick={startSpin} disabled={spinning || movies.length < 5} className="gap-2">
          <Dices className="h-4 w-4" />
          Spin the Roulette
        </Button>

        {selectedMovie && (
          <Button variant="outline" onClick={() => onSelect(selectedMovie.id)}>
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

