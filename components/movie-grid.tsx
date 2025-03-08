"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Movie {
  id: number
  title: string
  poster_path: string
  vote_average: number
  release_date: string
  overview: string
}

interface MovieGridProps {
  movies: Movie[]
  loading: boolean
  watchedMovies: number[]
  onMarkWatched: (id: number) => void
}

export default function MovieGrid({ movies, loading, watchedMovies, onMarkWatched }: MovieGridProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-[200px] w-full" />
              <div className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No movies found</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => {
          const isWatched = watchedMovies.includes(movie.id)

          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <Card
                className={`overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow ${isWatched ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className="p-0 h-full flex flex-col">
                  <div className="relative aspect-[2/3] w-full" onClick={() => router.push(`/movie/${movie.id}`)}>
                    <Image
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "/placeholder.svg?height=300&width=200"
                      }
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                    {isWatched && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h3
                      className="font-medium text-sm line-clamp-2 mb-1 hover:text-primary"
                      onClick={() => router.push(`/movie/${movie.id}`)}
                    >
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              onMarkWatched(movie.id)
                            }}
                            disabled={isWatched}
                          >
                            <Check className="h-3 w-3" />
                            <span className="sr-only">Mark as watched</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isWatched ? "Already watched" : "Mark as watched"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

