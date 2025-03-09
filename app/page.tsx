"use client"
import { useRouter } from "next/navigation"
import { Film, Shuffle, Github, Twitter, TrendingUp, Award, Heart, Zap, Star } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import MoodSelector from "@/components/mood-selector"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
  const [trendingMovies, setTrendingMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [points, setPoints] = useLocalStorage("moodyflicks-points", 0)
  const [achievements, setAchievements] = useLocalStorage("moodyflicks-achievements", [])
  const [moviesWatched, setMoviesWatched] = useLocalStorage("moodyflicks-watched", [])
  const [moviesRated, setMoviesRated] = useLocalStorage("moodyflicks-rated", [])

  useEffect(() => {
    fetchTrendingMovies()
  }, [])

  const fetchTrendingMovies = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/trending/movie/day?api_key=83492b666fdd114bc7f519241953fd4a`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch trending movies")
      }

      const data = await response.json()
      setTrendingMovies(data.results.slice(0, 5))
    } catch (error) {
      console.error("Error fetching trending movies:", error)
    } finally {
      setLoading(false)
    }
  }

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

  // Calculate user stats
  const userLevel = Math.floor(points / 100) + 1
  const totalAchievements = achievements.length
  const completionPercentage = Math.min(Math.round((moviesWatched.length / 20) * 100), 100)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
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
            {points > 0 && (
              <Badge variant="outline" className="ml-2 flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span>{points} points</span>
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="relative rounded-xl overflow-hidden h-[300px] md:h-[400px] mb-8">
            {trendingMovies.length > 0 && !loading ? (
              <>
                <Image
                  src={`https://image.tmdb.org/t/p/original${trendingMovies[0].backdrop_path}`}
                  alt="Featured movie"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                    <h2 className="text-white text-2xl md:text-4xl font-bold mb-2">Find Movies That Match Your Mood</h2>
                    <p className="text-white/80 text-sm md:text-base mb-4 max-w-xl">
                      Discover personalized movie recommendations based on how you're feeling right now. MoodyFlicks
                      helps you find the perfect movie for any mood.
                    </p>
                    <Button
                      size="lg"
                      onClick={() => document.getElementById("mood-selector").scrollIntoView({ behavior: "smooth" })}
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div id="mood-selector" className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">How are you feeling today?</h2>
            <p className="text-muted-foreground mb-6">Select a mood to get personalized movie recommendations</p>
            <MoodSelector onSelectMood={handleMoodSelect} selectedMood="" />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How MoodyFlicks Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card rounded-lg p-6 shadow-sm border"
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Select Your Mood</h3>
              <p className="text-muted-foreground">
                Choose how you're feeling from our mood selector. Whether you're cheerful, reflective, or thrilling,
                we've got you covered.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-card rounded-lg p-6 shadow-sm border"
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Get Recommendations</h3>
              <p className="text-muted-foreground">
                Our algorithm finds the perfect movies that match your current mood, providing personalized
                recommendations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-card rounded-lg p-6 shadow-sm border"
            >
              <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Earn & Track</h3>
              <p className="text-muted-foreground">
                Mark movies as watched, take quizzes, and earn points. Track your movie journey and unlock achievements.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-100 rounded-full p-2 text-yellow-700">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Daily Challenges</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete daily movie challenges to earn bonus points and maintain your streak.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 text-blue-700">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Movie Quiz</h3>
                    <p className="text-sm text-muted-foreground">
                      Test your movie knowledge with our interactive quizzes and earn points.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 text-green-700">
                    <Shuffle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Movie Roulette</h3>
                    <p className="text-sm text-muted-foreground">
                      Can't decide? Let our roulette pick a random movie for you to watch.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 text-purple-700">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Collections</h3>
                    <p className="text-sm text-muted-foreground">
                      Create and manage your own movie collections for different occasions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trending Movies Section */}
        {trendingMovies.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Trending Today</h2>
              <Button variant="ghost" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                View All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {trendingMovies.map((movie) => (
                <motion.div
                  key={movie.id}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/movie/${movie.id}`)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                          : "/placeholder.svg?height=300&width=200"
                      }
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-2 text-sm font-medium line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* User Stats Section - Only show if user has points */}
        {points > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Movie Journey</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{userLevel}</div>
                  <p className="text-sm text-muted-foreground">Current Level</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{points}</div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{moviesWatched.length}</div>
                  <p className="text-sm text-muted-foreground">Movies Watched</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{totalAchievements}</div>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="text-center mb-12">
          <div className="bg-primary/5 rounded-xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold mb-3">Ready to find your perfect movie?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Select your mood and let MoodyFlicks guide you to the perfect movie for your current state of mind.
            </p>
            <Button
              size="lg"
              onClick={() => document.getElementById("mood-selector").scrollIntoView({ behavior: "smooth" })}
            >
              Get Started Now
            </Button>
          </div>
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

