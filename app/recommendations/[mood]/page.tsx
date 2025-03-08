"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles, ArrowLeft, Share2, Film, Github, Twitter, Info, Trophy, Zap, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import MovieGrid from "@/components/movie-grid"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import ShareMenu from "@/components/share-menu"
import MovieQuiz from "@/components/movie-quiz"
import MovieRoulette from "@/components/movie-roulette"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"

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

export default function RecommendationsPage({ params }) {
  const router = useRouter()
  const { mood } = params
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("movies")
  const [shareOpen, setShareOpen] = useState(false)
  const [points, setPoints] = useLocalStorage("moodyflicks-points", 0)
  const [achievements, setAchievements] = useLocalStorage("moodyflicks-achievements", [])
  const [moviesWatched, setMoviesWatched] = useLocalStorage("moodyflicks-watched", [])
  const [level, setLevel] = useState(1)
  const [confetti, setConfetti] = useState(false)

  const processedMoods = useRef(new Set())

  useEffect(() => {
    if (!mood || !moodMap[mood]) {
      router.push("/")
      return
    }

    fetchMovies(mood)
  }, [mood, router])

  useEffect(() => {
    // Skip if no mood or already processed this mood
    if (!mood || !moodMap[mood] || processedMoods.current.has(mood)) {
      return
    }

    // Check for new mood achievement - only runs once per mood
    if (!achievements.includes(`mood-${mood}`)) {
      const newAchievements = [...achievements, `mood-${mood}`]
      setAchievements(newAchievements)

      // Mark this mood as processed to prevent repeated processing
      processedMoods.current.add(mood)

      // Award points for discovering a new mood
      setPoints((prev) => prev + 25)

      toast({
        title: "New Achievement! 🏆",
        description: `You've unlocked the ${mood.charAt(0).toUpperCase() + mood.slice(1)} Explorer badge!`,
      })
    } else {
      // Still mark as processed even if achievement already exists
      processedMoods.current.add(mood)
    }
  }, [mood, achievements, setAchievements, toast, setPoints])

  const fetchMovies = async (selectedMood) => {
    setLoading(true)
    try {
      const { genres, keywords } = moodMap[selectedMood]
      const genreParam = genres.join(",")

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=83492b666fdd114bc7f519241953fd4a&with_genres=${genreParam}&sort_by=popularity.desc&page=1`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }

      const data = await response.json()
      setMovies(data.results)
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

  const handleShare = () => {
    setShareOpen(true)

    // Award points for sharing
    if (!achievements.includes("sharing")) {
      const newAchievements = [...achievements, "sharing"]
      setAchievements(newAchievements)
      addPoints(15)
    }
  }

  const addPoints = useCallback(
    (amount) => {
      setPoints((prev) => {
        const newPoints = prev + amount
        return newPoints
      })
    },
    [setPoints],
  )

  const markAsWatched = (movieId) => {
    if (!moviesWatched.includes(movieId)) {
      const newWatched = [...moviesWatched, movieId]
      setMoviesWatched(newWatched)
      addPoints(10)

      toast({
        title: "Movie Marked as Watched! ✅",
        description: "You've earned 10 points for your movie journey.",
      })

      // Check for achievements
      if (newWatched.length === 5 && !achievements.includes("watched-5")) {
        const newAchievements = [...achievements, "watched-5"]
        setAchievements(newAchievements)
        addPoints(50)

        toast({
          title: "New Achievement! 🏆",
          description: "Movie Buff: You've watched 5 movies!",
        })
      }
    }
  }

  const handleRandomMovie = () => {
    if (movies.length > 0) {
      const randomIndex = Math.floor(Math.random() * movies.length)
      const randomMovie = movies[randomIndex]
      router.push(`/movie/${randomMovie.id}`)

      // Award points for using random feature
      if (!achievements.includes("random-pick")) {
        const newAchievements = [...achievements, "random-pick"]
        setAchievements(newAchievements)
        addPoints(5)
      }
    }
  }

  useEffect(() => {
    const newLevel = Math.floor(points / 100) + 1
    if (level !== newLevel) {
      setLevel(newLevel)

      // Only show level up notification if actually leveling up (not initial load)
      if (level > 0 && newLevel > level) {
        setConfetti(true)
        setTimeout(() => setConfetti(false), 3000)

        toast({
          title: "Level Up! 🎉",
          description: `You've reached level ${newLevel}! Keep exploring to unlock more features.`,
        })
      }
    }
  }, [points, level, toast])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {confetti && <div className="fixed inset-0 pointer-events-none z-50" id="confetti-container"></div>}

      <header className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
            <Film className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">MoodyFlicks</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{points} pts</span>
            </div>
            <div className="bg-muted rounded-full px-3 py-1 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">Level {level}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold capitalize flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              {mood} Recommendations
            </h2>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRandomMovie}>
                <Shuffle className="mr-2 h-4 w-4" />
                Random Movie
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2 text-sm">
              <span>Level {level}</span>
              <span>Level {level + 1}</span>
            </div>
            <Progress value={points % 100} max={100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{100 - (points % 100)} points until next level</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="movies">Movie Picks</TabsTrigger>
              <TabsTrigger value="quiz">Movie Quiz</TabsTrigger>
              <TabsTrigger value="roulette">Movie Roulette</TabsTrigger>
            </TabsList>

            <TabsContent value="movies">
              <MovieGrid
                movies={movies}
                loading={loading}
                watchedMovies={moviesWatched}
                onMarkWatched={markAsWatched}
              />
            </TabsContent>

            <TabsContent value="quiz">
              <MovieQuiz mood={mood} onComplete={addPoints} />
            </TabsContent>

            <TabsContent value="roulette">
              <MovieRoulette mood={mood} onSelect={(movieId) => router.push(`/movie/${movieId}`)} />
            </TabsContent>
          </Tabs>

          {achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                Your Achievements
              </h3>
              <div className="flex flex-wrap gap-2">
                {achievements.includes("mood-cheerful") && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                    Cheerful Explorer
                  </Badge>
                )}
                {achievements.includes("mood-reflective") && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    Reflective Explorer
                  </Badge>
                )}
                {achievements.includes("mood-gloomy") && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                    Gloomy Explorer
                  </Badge>
                )}
                {achievements.includes("mood-humorous") && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Humorous Explorer
                  </Badge>
                )}
                {achievements.includes("mood-adventurous") && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                    Adventurous Explorer
                  </Badge>
                )}
                {achievements.includes("mood-romantic") && (
                  <Badge variant="outline" className="bg-pink-100 text-pink-800 hover:bg-pink-200">
                    Romantic Explorer
                  </Badge>
                )}
                {achievements.includes("mood-thrilling") && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                    Thrilling Explorer
                  </Badge>
                )}
                {achievements.includes("mood-relaxed") && (
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                    Relaxed Explorer
                  </Badge>
                )}
                {achievements.includes("watched-5") && (
                  <Badge variant="outline" className="bg-primary/20 text-primary hover:bg-primary/30">
                    Movie Buff
                  </Badge>
                )}
                {achievements.includes("quiz-master") && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    Quiz Master
                  </Badge>
                )}
                {achievements.includes("sharing") && (
                  <Badge variant="outline" className="bg-teal-100 text-teal-800 hover:bg-teal-200">
                    Social Butterfly
                  </Badge>
                )}
                {achievements.includes("random-pick") && (
                  <Badge variant="outline" className="bg-violet-100 text-violet-800 hover:bg-violet-200">
                    Adventurous Spirit
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </motion.section>
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
          <div className="mt-4 text-xs text-muted-foreground flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>Powered by TMDB API</span>
          </div>
        </div>
      </footer>

      <ShareMenu
        open={shareOpen}
        onOpenChange={setShareOpen}
        title={`${mood.charAt(0).toUpperCase() + mood.slice(1)} Movie Recommendations`}
        text={`Check out these ${mood} movies I found on MoodyFlicks! I'm currently at Level ${level} with ${points} points.`}
        url={typeof window !== "undefined" ? window.location.href : ""}
      />

      <Toaster />
    </div>
  )
}

