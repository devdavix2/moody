"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, Check, X, Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Image from "next/image"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: string
  image?: string
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
  const { toast } = useToast()
  const [achievements, setAchievements] = useLocalStorage("moodyflicks-achievements", [])

  useEffect(() => {
    generateQuizQuestions()
  }, [mood])

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
      }[mood]

      const genreParam = genres.join(",")

      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=83492b666fdd114bc7f519241953fd4a&with_genres=${genreParam}&sort_by=popularity.desc&page=1`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch movies for quiz")
      }

      const data = await response.json()
      const movies = data.results.slice(0, 10)

      // Create quiz questions
      const quizQuestions: QuizQuestion[] = [
        {
          question: `Which movie has the highest rating?`,
          options: movies.slice(0, 4).map((m) => m.title),
          correctAnswer: movies.slice(0, 4).sort((a, b) => b.vote_average - a.vote_average)[0].title,
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
        },
        {
          question: `Which movie does this image belong to?`,
          options: movies.slice(1, 5).map((m) => m.title),
          correctAnswer: movies[1].title,
          image: movies[1].poster_path ? `https://image.tmdb.org/t/p/w300${movies[1].poster_path}` : undefined,
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
        },
        {
          question: `Based on the poster, which movie would you most likely watch when feeling ${mood}?`,
          options: movies.slice(5, 9).map((m) => m.title),
          correctAnswer: movies[5].title, // First option is correct for simplicity
          image: movies[5].poster_path ? `https://image.tmdb.org/t/p/w300${movies[5].poster_path}` : undefined,
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

  const handleStartQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestion(0)
    setScore(0)
    setQuizCompleted(false)
    setSelectedAnswer(null)
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)

    // Check if answer is correct
    const isCorrect = answer === questions[currentQuestion].correctAnswer

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedAnswer(null)
      } else {
        completeQuiz()
      }
    }, 1000)
  }

  // Replace the completeQuiz function with this version that uses local variables
  // instead of depending on state that might change during the function execution
  const completeQuiz = useCallback(() => {
    // Capture current values to avoid dependency on changing state
    const currentScore = score
    const currentQuestionsLength = questions.length
    const earnedPoints = currentScore * 10

    setQuizCompleted(true)

    // Award achievement if perfect score
    if (currentScore === currentQuestionsLength && !achievements.includes("quiz-master")) {
      const newAchievements = [...achievements, "quiz-master"]
      setAchievements(newAchievements)

      toast({
        title: "New Achievement! 🏆",
        description: "Quiz Master: You got a perfect score!",
      })
    }

    // Award points
    onComplete(earnedPoints)

    toast({
      title: `Quiz Completed! 🎉`,
      description: `You scored ${currentScore}/${currentQuestionsLength} and earned ${earnedPoints} points!`,
    })
  }, [score, questions.length, achievements, setAchievements, onComplete, toast])

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
            <HelpCircle className="h-5 w-5 text-primary" />
            Movie Quiz Challenge
          </CardTitle>
          <CardDescription>Test your knowledge about {mood} movies and earn points!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This quiz contains {questions.length} questions about {mood} movies. Each correct answer is worth 10 points.
            Are you ready to test your movie knowledge?
          </p>
          <div className="flex justify-center">
            <Image
              src="/placeholder.svg?height=200&width=300"
              alt="Movie Quiz"
              width={300}
              height={200}
              className="rounded-lg mb-4"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleStartQuiz}>Start Quiz</Button>
        </CardFooter>
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
            <p className="text-muted-foreground">You earned {score * 10} points!</p>
          </div>

          <div className="mb-4">
            <h3 className="font-medium mb-2">Your performance:</h3>
            <Progress value={(score / questions.length) * 100} className="h-2 mb-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={handleStartQuiz} variant="outline">
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
          <div className="text-sm font-medium">Score: {score}</div>
        </div>
        <Progress value={(currentQuestion / questions.length) * 100} className="h-2" />
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
              className="rounded-lg"
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
      </CardContent>
    </Card>
  )
}

