"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Star, Film, Award, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface DailyChallengeProps {
  onComplete: (points: number) => void
}

export default function DailyChallenge({ onComplete }: DailyChallengeProps) {
  const [loading, setLoading] = useState(true)
  const [dailyMovie, setDailyMovie] = useState<any>(null)
  const [completed, setCompleted] = useLocalStorage("moodyflicks-daily-completed", false)
  const [lastCompletedDate, setLastCompletedDate] = useLocalStorage("moodyflicks-daily-date", "")
  const [streak, setStreak] = useLocalStorage("moodyflicks-daily-streak", 0)
  const [achievements, setAchievements] = useLocalStorage("moodyflicks-achievements", [])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkDailyReset()
    fetchDailyMovie()
  }, [])

  const checkDailyReset = () => {
    const today = new Date().toDateString()

    if (lastCompletedDate !== today) {
      // Reset daily challenge if it's a new day
      setCompleted(false)

      // Update streak
      if (new Date(lastCompletedDate).getTime() > 0) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        if (lastCompletedDate === yesterday.toDateString()) {
          // Increment streak if last completed was yesterday
          setStreak((prev) => prev + 1)
        } else {
          // Reset streak if there was a gap
          setStreak(1)
        }
      }
    }
  }

  const fetchDailyMovie = async () => {
    setLoading(true)
    try {
      // Use the current date as a seed for "random" movie selection
      // This ensures everyone gets the same daily movie
      const today = new Date()
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
      const page = (dayOfYear % 10) + 1 // Use day of year to determine page (1-10)

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=83492b666fdd114bc7f519241953fd4a&sort_by=popularity.desc&page=${page}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch daily movie")
      }

      const data = await response.json()

      // Use the day of month to select a movie from the results (0-19)
      const dayOfMonth = today.getDate() % 20
      const selectedMovie = data.results[dayOfMonth]

      // Fetch additional details for the movie
      const detailsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${selectedMovie.id}?api_key=83492b666fdd114bc7f519241953fd4a`,
      )

      if (!detailsResponse.ok) {
        throw new Error("Failed to fetch movie details")
      }

      const detailsData = await detailsResponse.json()
      setDailyMovie({ ...selectedMovie, ...detailsData })
    } catch (error) {
      console.error("Error fetching daily movie:", error)
      toast({
        title: "Error",
        description: "Failed to fetch daily movie. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    if (completed) return

    const today = new Date().toDateString()
    setCompleted(true)
    setLastCompletedDate(today)

    // Award points
    const points = 50 + streak * 5 // Base points + streak bonus
    onComplete(points)

    // Check for achievements
    if (streak >= 3 && !achievements.includes("daily-streak")) {
      const newAchievements = [...achievements, "daily-streak"]
      setAchievements(newAchievements)

      toast({
        title: "New Achievement! 🏆",
        description: "Daily Devotion: You've completed the daily challenge 3 days in a row!",
      })
    }

    toast({
      title: "Daily Challenge Completed! 🎉",
      description: `You've earned ${points} points! (${streak} day streak)`,
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!dailyMovie) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Movie Challenge</CardTitle>
          <CardDescription>Could not load today's challenge. Please try again later.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={fetchDailyMovie}>Retry</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Daily Movie Challenge
            </CardTitle>
            <CardDescription>Watch today's featured movie to earn bonus points</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {streak} Day Streak
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[120px_1fr] gap-4">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
            <Image
              src={
                dailyMovie.poster_path
                  ? `https://image.tmdb.org/t/p/w300${dailyMovie.poster_path}`
                  : "/placeholder.svg?height=300&width=200"
              }
              alt={dailyMovie.title}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold mb-1">{dailyMovie.title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span>{dailyMovie.vote_average?.toFixed(1)}</span>
              <span className="mx-2">•</span>
              <span>{new Date(dailyMovie.release_date).getFullYear()}</span>
              {dailyMovie.runtime && (
                <>
                  <span className="mx-2">•</span>
                  <span>
                    {Math.floor(dailyMovie.runtime / 60)}h {dailyMovie.runtime % 60}m
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{dailyMovie.overview}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {dailyMovie.genres?.slice(0, 3).map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => router.push(`/movie/${dailyMovie.id}`)}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Film className="h-4 w-4" />
                View Details
              </Button>

              <Button onClick={handleComplete} disabled={completed} size="sm" className="gap-1">
                {completed ? (
                  <>
                    <Check className="h-4 w-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    Mark as Watched
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-primary/10 rounded-lg p-3 text-center"
          >
            <p className="font-medium">You've completed today's challenge! Come back tomorrow for a new movie.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

