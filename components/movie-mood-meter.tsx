"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Smile, Coffee, CloudRain, Laugh, Compass, Heart, Zap, Sunset, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MoodData {
  mood: string
  percentage: number
  icon: any
  color: string
}

interface MovieMoodMeterProps {
  movieId?: number
}

export default function MovieMoodMeter({ movieId }: MovieMoodMeterProps) {
  const [loading, setLoading] = useState(true)
  const [moodData, setMoodData] = useState<MoodData[]>([])
  const [watchedMovies, useWatchedMovies] = useLocalStorage("moodyflicks-watched", [])
  const [movieDetails, setMovieDetails] = useState<any>(null)

  useEffect(() => {
    if (movieId) {
      fetchMovieDetails()
    } else {
      analyzeUserMoods()
    }
  }, [movieId, watchedMovies])

  const fetchMovieDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=83492b666fdd114bc7f519241953fd4a&append_to_response=keywords`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch movie details")
      }

      const movie = await response.json()
      setMovieDetails(movie)

      // Analyze movie mood based on genres and keywords
      analyzeMoodFromMovie(movie)
    } catch (error) {
      console.error("Error fetching movie details:", error)
      setLoading(false)
    }
  }

  const analyzeMoodFromMovie = (movie) => {
    // Map of genres and keywords to moods
    const moodMapping = {
      cheerful: {
        genres: [35, 10751, 16], // Comedy, Family, Animation
        keywords: ["funny", "happy", "comedy", "feel-good", "heartwarming"],
      },
      reflective: {
        genres: [18, 36], // Drama, History
        keywords: ["thought-provoking", "philosophical", "meaningful", "deep"],
      },
      gloomy: {
        genres: [18, 9648, 10752], // Drama, Mystery, War
        keywords: ["sad", "melancholy", "depressing", "tragic", "dark"],
      },
      humorous: {
        genres: [35], // Comedy
        keywords: ["comedy", "funny", "humor", "laugh", "parody"],
      },
      adventurous: {
        genres: [12, 28, 878], // Adventure, Action, Science Fiction
        keywords: ["adventure", "action", "journey", "quest", "exploration"],
      },
      romantic: {
        genres: [10749], // Romance
        keywords: ["romance", "love", "relationship", "romantic", "passion"],
      },
      thrilling: {
        genres: [53, 27, 80], // Thriller, Horror, Crime
        keywords: ["suspense", "thriller", "tension", "mystery", "twist"],
      },
      relaxed: {
        genres: [36, 99, 10770], // History, Documentary, TV Movie
        keywords: ["calm", "peaceful", "soothing", "gentle", "relaxing"],
      },
    }

    // Calculate mood scores
    const moodScores = {
      cheerful: 0,
      reflective: 0,
      gloomy: 0,
      humorous: 0,
      adventurous: 0,
      romantic: 0,
      thrilling: 0,
      relaxed: 0,
    }

    // Score based on genres
    if (movie.genres) {
      movie.genres.forEach((genre) => {
        Object.entries(moodMapping).forEach(([mood, data]) => {
          if (data.genres.includes(genre.id)) {
            moodScores[mood] += 20 // Add 20 points for each matching genre
          }
        })
      })
    }

    // Score based on keywords
    if (movie.keywords && movie.keywords.keywords) {
      movie.keywords.keywords.forEach((keyword) => {
        Object.entries(moodMapping).forEach(([mood, data]) => {
          if (data.keywords.some((k) => keyword.name.toLowerCase().includes(k))) {
            moodScores[mood] += 10 // Add 10 points for each matching keyword
          }
        })
      })
    }

    // Convert scores to percentages
    const totalScore = Object.values(moodScores).reduce((sum: number, score: number) => sum + score, 0) || 100

    const moodPercentages = Object.entries(moodScores).map(([mood, score]) => ({
      mood,
      percentage: Math.round((score / totalScore) * 100),
    }))

    // Sort by percentage (descending)
    moodPercentages.sort((a, b) => b.percentage - a.percentage)

    // Take top 4 moods
    const topMoods = moodPercentages.slice(0, 4)

    // Add icons and colors
    const moodIcons = {
      cheerful: { icon: Smile, color: "text-yellow-500" },
      reflective: { icon: Coffee, color: "text-blue-500" },
      gloomy: { icon: CloudRain, color: "text-gray-500" },
      humorous: { icon: Laugh, color: "text-green-500" },
      adventurous: { icon: Compass, color: "text-orange-500" },
      romantic: { icon: Heart, color: "text-pink-500" },
      thrilling: { icon: Zap, color: "text-purple-500" },
      relaxed: { icon: Sunset, color: "text-indigo-500" },
    }

    const formattedMoodData = topMoods.map((item) => ({
      mood: item.mood,
      percentage: item.percentage,
      icon: moodIcons[item.mood].icon,
      color: moodIcons[item.mood].color,
    }))

    setMoodData(formattedMoodData)
    setLoading(false)
  }

  const analyzeUserMoods = () => {
    setLoading(true)

    // Default mood distribution if no data
    const defaultMoods: MoodData[] = [
      { mood: "cheerful", percentage: 25, icon: Smile, color: "text-yellow-500" },
      { mood: "adventurous", percentage: 25, icon: Compass, color: "text-orange-500" },
      { mood: "romantic", percentage: 25, icon: Heart, color: "text-pink-500" },
      { mood: "thrilling", percentage: 25, icon: Zap, color: "text-purple-500" },
    ]

    // If no watched movies, use default
    if (!watchedMovies || watchedMovies.length === 0) {
      setMoodData(defaultMoods)
      setLoading(false)
      return
    }

    // In a real app, we would fetch details for each watched movie
    // and analyze their genres/keywords to determine mood preferences
    // For this demo, we'll just use random data based on the number of watched movies

    const moodIcons = {
      cheerful: { icon: Smile, color: "text-yellow-500" },
      reflective: { icon: Coffee, color: "text-blue-500" },
      gloomy: { icon: CloudRain, color: "text-gray-500" },
      humorous: { icon: Laugh, color: "text-green-500" },
      adventurous: { icon: Compass, color: "text-orange-500" },
      romantic: { icon: Heart, color: "text-pink-500" },
      thrilling: { icon: Zap, color: "text-purple-500" },
      relaxed: { icon: Sunset, color: "text-indigo-500" },
    }

    // Generate pseudo-random mood distribution based on watched movies count
    // This is just for demonstration - in a real app, we'd analyze actual movie data
    const seed = watchedMovies.length
    const moods = Object.keys(moodIcons)

    // Shuffle moods based on seed
    const shuffledMoods = [...moods].sort(() => (seed % 2 === 0 ? 1 : -1) * 0.5)

    // Generate percentages that sum to 100
    let remaining = 100
    const percentages = []

    for (let i = 0; i < 4; i++) {
      const isLast = i === 3
      const percentage = isLast ? remaining : Math.floor(remaining * (0.3 + (seed % 10) / 30))
      percentages.push(percentage)
      remaining -= percentage
    }

    // Create mood data
    const generatedMoodData = shuffledMoods.slice(0, 4).map((mood, index) => ({
      mood,
      percentage: percentages[index],
      icon: moodIcons[mood].icon,
      color: moodIcons[mood].color,
    }))

    setMoodData(generatedMoodData)
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          {movieId ? "Movie Mood Analysis" : "Your Mood Profile"}
        </CardTitle>
        <CardDescription>
          {movieId ? "How this movie makes viewers feel" : "Based on your watched movies"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {moodData.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.mood}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-1">
                    <Icon className={`h-4 w-4 mr-2 ${item.color}`} />
                    <span className="text-sm font-medium capitalize">{item.mood}</span>
                    <span className="ml-auto text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </motion.div>
              )
            })}

            {movieId && movieDetails && (
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <p>Based on genres: {movieDetails.genres?.map((g) => g.name).join(", ")}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

