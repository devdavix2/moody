"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, Check, X, Trophy, Timer, Brain, Award, Zap, Star, Film } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import confetti from "canvas-confetti"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  image?: string
  type: "multiple-choice" | "true-false" | "image-based"
  difficulty: "easy" | "medium" | "hard"
  points: number
  explanation?: string
}

interface MovieQuizProps {
  mood: string
  onComplete: (points: number) => void
}

export default function MovieQuiz({ mood, onComplete }: MovieQuizProps) {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizMode, setQuizMode] = useState<"regular" | "timed" | "challenge">("regular")
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [earnedPoints, setEarnedPoints] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([])
  const [quizStats, setQuizStats] = useLocalStorage("moodyflicks-quiz-stats", {
    totalQuizzes: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    bestScore: 0,
    streaks: 0,
    lastQuizDate: null,
  })
  const { toast } = useToast()
  const [achievements, setAchievements] = useLocalStorage("moodyflicks-achievements", [])

  useEffect(() => {
    generateQuizQuestions()
    fetchFeaturedMovies()
  }, [mood])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (timerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timerActive && timeLeft === 0) {
      // Time's up - move to next question or end quiz
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setTimeLeft(30) // Reset timer for next question
      } else {
        completeQuiz()
      }
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timerActive, timeLeft, currentQuestion, questions.length])

  const fetchFeaturedMovies = async () => {
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
      }[mood] || { genres: [28, 12] } // Default to action/adventure if mood not found

      const genreParam = genres.join(",")

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=83492b666fdd114bc7f519241953fd4a&with_genres=${genreParam}&sort_by=popularity.desc&page=1`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch featured movies")
      }

      const data = await response.json()
      setFeaturedMovies(data.results.slice(0, 5))
    } catch (error) {
      console.error("Error fetching featured movies:", error)
    }
  }

  const generateQuizQuestions = async () => {
    setLoading(true)
    try {
      // Get movies for the current mood to create questions from
      const { genres } = {
        cheerful: { genres: [35, 10751] },
        reflective: { genres: [18, 36] },
        gloomy: { genres: [18, 9648] },
        humorous: { genres: [35] },
        adventurous: { genres: [12, 28] },
        romantic: { genres: [10749] },
        thrilling: { genres: [53, 27] },
        relaxed: { genres: [36, 99] },
      }[mood] || { genres: [28, 12] } // Default to action/adventure if mood not found

      const genreParam = genres.join(",")

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=83492b666fdd114bc7f519241953fd4a&with_genres=${genreParam}&sort_by=popularity.desc&page=1`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch movies for quiz")
      }

      const data = await response.json()
      const movies = data.results.slice(0, 15)

      // Create quiz questions
      const quizQuestions: QuizQuestion[] = [
        {
          question: `Which movie has the highest rating?`,
          options: movies.slice(0, 4).map((m) => m.title),
          correctAnswer: movies.slice(0, 4).sort((a, b) => b.vote_average - a.vote_average)[0].title,
          type: "multiple-choice",
          difficulty: "easy",
          points: 10,
          explanation: `${movies.slice(0, 4).sort((a, b) => b.vote_average - a.vote_average)[0].title} has the highest rating of ${movies
            .slice(0, 4)
            .sort((a, b) => b.vote_average - a.vote_average)[0]
            .vote_average.toFixed(1)}/10.`,
        },
        {
          question: `What year was this movie released?`,
          options: [
            new Date(movies[0].release_date).getFullYear().toString(),
            (new Date(movies[0].release_date).getFullYear() - 1).toString(),
            (new Date(movies[0].release_date).getFullYear() + 1).toString(),
            (new Date(movies[0].release_date).getFullYear() - 2).toString(),
          ],
          correctAnswer: new Date(movies[0].release_date).getFullYear().toString(),
          image: movies[0].poster_path ? `https://image.tmdb.org/t/p/w300${movies[0].poster_path}` : undefined,
          type: "image-based",
          difficulty: "medium",
          points: 15,
          explanation: `${movies[0].title} was released in ${new Date(movies[0].release_date).getFullYear()}.`,
        },
        {
          question: `Which movie does this image belong to?`,
          options: movies.slice(1, 5).map((m) => m.title),
          correctAnswer: movies[1].title,
          image: movies[1].poster_path ? `https://image.tmdb.org/t/p/w300${movies[1].poster_path}` : undefined,
          type: "image-based",
          difficulty: "medium",
          points: 15,
          explanation: `This is the poster for ${movies[1].title}, released in ${new Date(movies[1].release_date).getFullYear()}.`,
        },
        {
          question: `True or False: "${movies[2].title}" was released after 2015.`,
          options: ["True", "False"],
          correctAnswer: new Date(movies[2].release_date).getFullYear() > 2015 ? "True" : "False",
          type: "true-false",
          difficulty: "easy",
          points: 10,
          explanation: `${movies[2].title} was released in ${new Date(movies[2].release_date).getFullYear()}, which is ${new Date(movies[2].release_date).getFullYear() > 2015 ? "after" : "before or during"} 2015.`,
        },
        {
          question: `Which of these movies is NOT in the ${mood} category?`,
          options: [
            movies[2].title,
            movies[3].title,
            "The Shawshank Redemption", // This is a fake answer that doesn't match the mood
            movies[4].title,
          ],
          correctAnswer: "The Shawshank Redemption",
          type: "multiple-choice",
          difficulty: "medium",
          points: 15,
          explanation: `The Shawshank Redemption is a drama film and doesn't fit the ${mood} category.`,
        },
        {
          question: `Based on the poster, which movie would you most likely watch when feeling ${mood}?`,
          options: movies.slice(5, 9).map((m) => m.title),
          correctAnswer: movies[5].title, // First option is correct for simplicity
          image: movies[5].poster_path ? `https://image.tmdb.org/t/p/w300${movies[5].poster_path}` : undefined,
          type: "image-based",
          difficulty: "hard",
          points: 20,
          explanation: `${movies[5].title} is a great choice for a ${mood} mood with its ${mood === "cheerful" ? "uplifting tone" : mood === "thrilling" ? "suspenseful elements" : mood === "romantic" ? "love story" : "engaging storyline"}.`,
        },
        {
          question: `True or False: The movie "${movies[6].title}" has a rating higher than 7.0.`,
          options: ["True", "False"],
          correctAnswer: movies[6].vote_average > 7.0 ? "True" : "False",
          type: "true-false",
          difficulty: "medium",
          points: 15,
          explanation: `${movies[6].title} has a rating of ${movies[6].vote_average.toFixed(1)}, which is ${movies[6].vote_average > 7.0 ? "higher than" : "not higher than"} 7.0.`,
        },
        {
          question: `Which movie has the most intriguing plot based on this overview?`,
          options: movies.slice(7, 11).map((m) => m.title),
          correctAnswer: movies[7].title,
          image: undefined,
          type: "multiple-choice",
          difficulty: "hard",
          points: 20,
          explanation: `While subjective, ${movies[7].title} is known for its compelling storyline: "${movies[7].overview.substring(0, 100)}..."`,
        },
      ]

      // Shuffle the questions
      setQuestions(quizQuestions.sort(() => Math.random() - 0.5))
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to generate quiz questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = (mode: "regular" | "timed" | "challenge") => {
    setQuizMode(mode)
    setQuizStarted(true)
    setCurrentQuestion(0)
    setScore(0)
    setEarnedPoints(0)
    setQuizCompleted(false)
    setSelectedAnswer(null)
    setShowExplanation(false)

    if (mode === "timed") {
      setTimeLeft(30)
      setTimerActive(true)
    } else {
      setTimerActive(false)
    }
  }

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return // Prevent multiple selections

    setSelectedAnswer(answer)

    // Check if answer is correct
    const isCorrect = answer === questions[currentQuestion].correctAnswer
    const questionPoints = questions[currentQuestion].points

    // Apply time bonus for timed mode
    let pointsEarned = questionPoints
    if (quizMode === "timed" && isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3) // 1 bonus point for every 3 seconds left
      pointsEarned += timeBonus
    }

    if (isCorrect) {
      setScore((prev) => prev + 1)
      setEarnedPoints((prev) => prev + pointsEarned)

      // Show mini confetti for correct answer
      if (typeof window !== "undefined" && window.innerWidth > 0) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        })
      }
    }

    // Pause timer if in timed mode
    if (quizMode === "timed") {
      setTimerActive(false)
    }

    // Show explanation
    setShowExplanation(true)

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
        setShowExplanation(false)

        // Resume timer if in timed mode
        if (quizMode === "timed") {
          setTimeLeft(30) // Reset timer
          setTimerActive(true)
        }
      } else {
        completeQuiz()
      }
    }, 2500)
  }

  // Replace the completeQuiz function with this version that uses local variables
  // instead of depending on state that might change during the function execution
  const completeQuiz = useCallback(() => {
    // Capture current values to avoid dependency on changing state
    const currentScore = score
    const currentQuestionsLength = questions.length
    const currentEarnedPoints = earnedPoints

    setQuizCompleted(true)
    setTimerActive(false)

    // Update quiz stats
    const today = new Date().toDateString()
    const isNewStreak = quizStats.lastQuizDate !== today

    setQuizStats((prev) => {
      const newStats = {
        totalQuizzes: prev.totalQuizzes + 1,
        correctAnswers: prev.correctAnswers + currentScore,
        totalQuestions: prev.totalQuestions + currentQuestionsLength,
        bestScore: Math.max(prev.bestScore, currentScore),
        streaks: isNewStreak ? prev.streaks + 1 : prev.streaks,
        lastQuizDate: today,
      }
      return newStats
    })

    // Award achievement if perfect score
    if (currentScore === currentQuestionsLength && !achievements.includes("quiz-master")) {
      const newAchievements = [...achievements, "quiz-master"]
      setAchievements(newAchievements)

      toast({
        title: "New Achievement! 🏆",
        description: "Quiz Master: You got a perfect score!",
      })
    }

    // Award streak achievement
    if (isNewStreak && quizStats.streaks + 1 >= 3 && !achievements.includes("quiz-streak")) {
      const newAchievements = [...achievements, "quiz-streak"]
      setAchievements(newAchievements)

      toast({
        title: "New Achievement! 🏆",
        description: "Quiz Enthusiast: You've completed quizzes 3 days in a row!",
      })
    }

    // Award points
    onComplete(currentEarnedPoints)

    // Show confetti for quiz completion
    if (typeof window !== "undefined" && window.innerWidth > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    toast({
      title: `Quiz Completed! 🎉`,
      description: `You scored ${currentScore}/${currentQuestionsLength} and earned ${currentEarnedPoints} points!`,
    })
  }, [score, questions.length, earnedPoints, quizStats, achievements, setAchievements, setQuizStats, onComplete, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Movie Quiz Challenge
          </CardTitle>
          <CardDescription>Test your knowledge about {mood} movies and earn points!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex justify-center mb-6">
              {featuredMovies.length > 0 ? (
                <div className="relative w-full h-[225px] rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={`https://image.tmdb.org/t/p/original${featuredMovies[0].backdrop_path || featuredMovies[0].poster_path}`}
                    alt="Movie Quiz"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-xl font-bold">{featuredMovies[0].title}</h3>
                      <div className="flex items-center text-sm mt-1">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{featuredMovies[0].vote_average.toFixed(1)}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(featuredMovies[0].release_date).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-[225px] rounded-lg overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                  <Film className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <p className="mb-4">Choose your quiz mode below. Each mode offers different challenges and rewards:</p>

            <Tabs defaultValue="regular" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="regular">Regular</TabsTrigger>
                <TabsTrigger value="timed">Timed</TabsTrigger>
                <TabsTrigger value="challenge">Challenge</TabsTrigger>
              </TabsList>

              <TabsContent value="regular" className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                    Regular Quiz
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Take your time to answer {questions.length} questions about {mood} movies. Each correct answer is
                    worth 10-20 points depending on difficulty.
                  </p>
                  <Button onClick={() => handleStartQuiz("regular")} className="w-full">
                    Start Regular Quiz
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="timed" className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <Timer className="h-4 w-4 mr-2 text-amber-500" />
                    Timed Challenge
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Answer questions with a 30-second timer for each question. Earn bonus points for answering quickly!
                  </p>
                  <Button onClick={() => handleStartQuiz("timed")} className="w-full">
                    Start Timed Quiz
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="challenge" className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                    Expert Challenge
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Harder questions with higher point rewards. Test your movie expertise!
                  </p>
                  <Button onClick={() => handleStartQuiz("challenge")} className="w-full">
                    Start Expert Quiz
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {quizStats.totalQuizzes > 0 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Award className="h-4 w-4 mr-2 text-primary" />
                Your Quiz Stats
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="bg-background rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{quizStats.totalQuizzes}</div>
                  <div className="text-xs text-muted-foreground">Quizzes Taken</div>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">
                    {quizStats.totalQuestions > 0
                      ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{quizStats.bestScore}</div>
                  <div className="text-xs text-muted-foreground">Best Score</div>
                </div>
                <div className="bg-background rounded-lg p-3 text-center sm:col-span-3">
                  <div className="text-lg font-bold flex items-center justify-center">
                    <Zap className="h-4 w-4 mr-1 text-yellow-500" />
                    {quizStats.streaks} Day Streak
                  </div>
                </div>
              </div>
            </div>
          )}

          {featuredMovies.length > 1 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="font-medium mb-3 flex items-center">
                <Film className="h-4 w-4 mr-2 text-primary" />
                Featured {mood.charAt(0).toUpperCase() + mood.slice(1)} Movies
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {featuredMovies.slice(1, 5).map((movie) => (
                  <div key={movie.id} className="relative aspect-[2/3] rounded overflow-hidden">
                    <Image
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                          : "/placeholder.svg?height=150&width=100"
                      }
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (quizCompleted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Quiz Results
          </CardTitle>
          <CardDescription>You've completed the {mood} movies quiz!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2">
              {score}/{questions.length}
            </div>
            <p className="text-muted-foreground">You earned {earnedPoints} points!</p>

            {quizMode === "timed" && (
              <Badge variant="outline" className="mt-2 bg-amber-100 text-amber-800">
                Timed Mode
              </Badge>
            )}

            {quizMode === "challenge" && (
              <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800">
                Expert Challenge
              </Badge>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Your performance:</h3>
            <Progress value={(score / questions.length) * 100} className="h-2 mb-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{quizStats.totalQuizzes}</div>
              <div className="text-xs text-muted-foreground">Total Quizzes</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{quizStats.streaks}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 mb-4">
            <h3 className="font-medium mb-2">Quiz Insights:</h3>
            <ul className="space-y-2 text-sm">
              {score === questions.length && (
                <li className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-2" />
                  Perfect score! You're a movie expert!
                </li>
              )}
              {score >= questions.length * 0.7 && score < questions.length && (
                <li className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-2" />
                  Great job! You know your movies well.
                </li>
              )}
              {score < questions.length * 0.7 && score >= questions.length * 0.4 && (
                <li className="flex items-center text-amber-600">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Good effort! Try watching more {mood} movies to improve.
                </li>
              )}
              {score < questions.length * 0.4 && (
                <li className="flex items-center text-red-600">
                  <X className="h-4 w-4 mr-2" />
                  Keep exploring {mood} movies to learn more!
                </li>
              )}
              {quizStats.streaks >= 3 && (
                <li className="flex items-center text-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  You're on a {quizStats.streaks} day streak! Keep it up!
                </li>
              )}
            </ul>
          </div>

          {featuredMovies.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Recommended {mood} movies:</h3>
              <div className="grid grid-cols-3 gap-2">
                {featuredMovies.slice(0, 3).map((movie) => (
                  <div key={movie.id} className="relative aspect-[2/3] rounded overflow-hidden">
                    <Image
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                          : "/placeholder.svg?height=150&width=100"
                      }
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                      <div className="p-2 text-white text-xs">
                        <div className="font-bold line-clamp-1">{movie.title}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={() => handleStartQuiz(quizMode)} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => setQuizStarted(false)}>Back to Quiz Menu</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">Score: {score}</div>

            {quizMode === "timed" && (
              <div className={`text-sm font-medium flex items-center ${timeLeft < 10 ? "text-red-500" : ""}`}>
                <Timer className="h-4 w-4 mr-1" />
                {timeLeft}s
              </div>
            )}
          </div>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />

        <div className="flex items-center mt-2">
          <Badge
            variant="outline"
            className={`
            ${questions[currentQuestion].difficulty === "easy" ? "bg-green-100 text-green-800" : ""}
            ${questions[currentQuestion].difficulty === "medium" ? "bg-amber-100 text-amber-800" : ""}
            ${questions[currentQuestion].difficulty === "hard" ? "bg-red-100 text-red-800" : ""}
          `}
          >
            {questions[currentQuestion].difficulty.charAt(0).toUpperCase() +
              questions[currentQuestion].difficulty.slice(1)}
          </Badge>

          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
            {questions[currentQuestion].points} pts
          </Badge>

          {quizMode === "timed" && (
            <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
              Time Bonus: +{Math.floor(timeLeft / 3)} pts
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-4">{questions[currentQuestion].question}</h3>

        {questions[currentQuestion].image && (
          <div className="flex justify-center mb-6">
            <Image
              src={questions[currentQuestion].image || "/placeholder.svg"}
              alt="Quiz question"
              width={200}
              height={300}
              className="rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="grid gap-3">
          <AnimatePresence mode="wait">
            {questions[currentQuestion].options.map((option) => {
              const isSelected = selectedAnswer === option
              const isCorrect = option === questions[currentQuestion].correctAnswer

              return (
                <motion.div
                  key={option}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-3 px-4 ${
                      selectedAnswer && isCorrect
                        ? "bg-green-100 border-green-500 text-green-800"
                        : isSelected && !isCorrect
                          ? "bg-red-100 border-red-500 text-red-800"
                          : ""
                    }`}
                    onClick={() => !selectedAnswer && handleAnswerSelect(option)}
                    disabled={selectedAnswer !== null}
                  >
                    <div className="flex items-center w-full">
                      <span className="flex-1">{option}</span>
                      {selectedAnswer && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                      {isSelected && !isCorrect && <X className="h-5 w-5 text-red-600" />}
                    </div>
                  </Button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {showExplanation && questions[currentQuestion].explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-muted rounded-lg text-sm"
          >
            <p className="font-medium">Explanation:</p>
            <p>{questions[currentQuestion].explanation}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

