"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Film,
  Github,
  Twitter,
  Share2,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  BookmarkCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import ShareMenu from "@/components/share-menu"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MovieTrivia from "@/components/movie-trivia"
import MovieMoodMeter from "@/components/movie-mood-meter"
import confetti from "canvas-confetti"

export default function MovieDetailPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [triviaPoints, setTriviaPoints] = useState(0)
  const { toast } = useToast()
  const [points, setPoints] = useLocalStorage("moodyflicks-points", 0)
  const [moviesWatched, setMoviesWatched] = useLocalStorage("moodyflicks-watched", [])
  const [moviesRated, setMoviesRated] = useLocalStorage("moodyflicks-rated", [])
  const [moviesSaved, setMoviesSaved] = useLocalStorage("moodyflicks-saved", [])
  const [achievements, setAchievements] = useLocalStorage("moodyflicks-achievements", [])
  const [similarMovies, setSimilarMovies] = useState([])
  const [collections, setCollections] = useLocalStorage("moodyflicks-collections", [])
  const [selectedCollection, setSelectedCollection] = useState("")

  // Redirect to home if no id, then fetch movie details.
  useEffect(() => {
    if (!id) {
      router.push("/")
      return
    }
    fetchMovieDetails(id)
  }, [id, router])

  const fetchMovieDetails = async (movieId) => {
    setLoading(true)
    try {
      // Fetch movie details
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=83492b666fdd114bc7f519241953fd4a&append_to_response=videos`,
      )

      if (!movieResponse.ok) {
        throw new Error("Failed to fetch movie details")
      }

      const movieData = await movieResponse.json()
      setMovie(movieData)

      // Fetch movie credits
      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=83492b666fdd114bc7f519241953fd4a`,
      )

      if (!creditsResponse.ok) {
        throw new Error("Failed to fetch movie credits")
      }

      const creditsData = await creditsResponse.json()
      setCredits(creditsData)

      // Fetch similar movies
      const similarResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=83492b666fdd114bc7f519241953fd4a&page=1`,
      )

      if (!similarResponse.ok) {
        throw new Error("Failed to fetch similar movies")
      }

      const similarData = await similarResponse.json()
      setSimilarMovies(similarData.results.slice(0, 4))
    } catch (error) {
      console.error("Error fetching movie details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch movie details. Please try again.",
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
      setPoints((prev) => prev + amount)
    },
    [setPoints],
  )

  const markAsWatched = useCallback(() => {
    const movieId = Number(id)

    // Guard against already watched movies
    if (moviesWatched.includes(movieId)) {
      toast({
        title: "Already Watched",
        description: "You've already marked this movie as watched.",
      })
      return
    }

    // Update watched movies
    const newWatched = [...moviesWatched, movieId]
    setMoviesWatched(newWatched)

    // Add points
    addPoints(10)

    // Show confetti
    if (typeof window !== "undefined" && window.innerWidth > 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    toast({
      title: "Movie Marked as Watched! ✅",
      description: "You've earned 10 points for your movie journey.",
    })

    // Check for achievements - only if exactly 5 movies watched
    if (newWatched.length === 5 && !achievements.includes("watched-5")) {
      setAchievements((prev) => [...prev, "watched-5"])

      // Add achievement points separately
      setTimeout(() => {
        addPoints(50)
        toast({
          title: "New Achievement! 🏆",
          description: "Movie Buff: You've watched 5 movies!",
        })
      }, 100)
    }
  }, [id, moviesWatched, setMoviesWatched, addPoints, achievements, setAchievements, toast])

  const rateMovie = useCallback(
    (liked) => {
      const movieId = Number(id)

      // Guard against already rated movies
      if (moviesRated.includes(movieId)) {
        toast({
          title: "Already Rated",
          description: "You've already rated this movie.",
        })
        return
      }

      // Update rated movies
      const newRated = [...moviesRated, movieId]
      setMoviesRated(newRated)

      // Add points
      addPoints(5)

      toast({
        title: liked ? "You liked this movie! 👍" : "You disliked this movie 👎",
        description: "You've earned 5 points for rating.",
      })

      // Check for achievements - only if exactly 10 movies rated
      if (newRated.length === 10 && !achievements.includes("critic")) {
        setAchievements((prev) => [...prev, "critic"])

        // Add achievement points separately
        setTimeout(() => {
          addPoints(30)
          toast({
            title: "New Achievement! 🏆",
            description: "Movie Critic: You've rated 10 movies!",
          })
        }, 100)
      }
    },
    [id, moviesRated, setMoviesRated, addPoints, achievements, setAchievements, toast],
  )

  const toggleSaveMovie = useCallback(() => {
    const movieId = Number(id)
    const isSaved = moviesSaved.includes(movieId)

    if (isSaved) {
      // Remove from saved
      const newSaved = moviesSaved.filter((savedId) => savedId !== movieId)
      setMoviesSaved(newSaved)

      toast({
        title: "Movie Removed",
        description: "Movie has been removed from your watchlist.",
      })
    } else {
      // Add to saved
      const newSaved = [...moviesSaved, movieId]
      setMoviesSaved(newSaved)

      // Award points for first save only
      if (moviesSaved.length === 0) {
        addPoints(5)
      }

      toast({
        title: "Movie Saved! 🎬",
        description: "Added to your watchlist for later.",
      })

      // Check for achievement
      if (!achievements.includes("collector") && newSaved.length >= 10) {
        setAchievements((prev) => [...prev, "collector"])

        setTimeout(() => {
          addPoints(25)
          toast({
            title: "New Achievement! 🏆",
            description: "Movie Collector: You've saved 10 movies to your watchlist!",
          })
        }, 100)
      }
    }
  }, [id, moviesSaved, setMoviesSaved, addPoints, achievements, setAchievements, toast])

  const handleAddToCollection = useCallback(() => {
    if (!selectedCollection || !id) return

    const movieId = Number(id)
    const collectionId = selectedCollection

    // Find the collection
    const collection = collections.find((c) => c.id === collectionId)
    if (!collection) return

    // Check if movie is already in collection
    if (collection.movies.includes(movieId)) {
      toast({
        title: "Already Added",
        description: `This movie is already in "${collection.name}".`,
      })
      return
    }

    // Add movie to collection
    const updatedCollections = collections.map((c) =>
      c.id === collectionId
        ? { ...c, movies: [...c.movies, movieId], updatedAt: new Date().toISOString() }
        : c,
    )

    setCollections(updatedCollections)
    setSelectedCollection("")

    toast({
      title: "Added to Collection",
      description: `Added to "${collection.name}".`,
    })

    // Award points for first collection addition
    if (!achievements.includes("curator")) {
      const allMoviesInCollections = collections.flatMap((c) => c.movies)
      if (allMoviesInCollections.length === 0) {
        addPoints(10)

        setTimeout(() => {
          setAchievements((prev) => [...prev, "curator"])
          toast({
            title: "New Achievement! 🏆",
            description: "Movie Curator: You've started organizing your movie collection!",
          })
        }, 100)
      }
    }
  }, [id, selectedCollection, collections, setCollections, achievements, setAchievements, addPoints, toast])

  const handleTriviaLike = useCallback(() => {
    // Award points for liking trivia (max 3 times per movie)
    if (triviaPoints < 3) {
      setTriviaPoints((prev) => prev + 1)
      addPoints(2)

      toast({
        title: "Trivia Liked!",
        description: "You earned 2 points for engaging with movie trivia.",
      })
    }
  }, [triviaPoints, addPoints, toast])

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
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
            {movie && (
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            <Skeleton className="h-[450px] w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : movie ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
              <div>
                {movie.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="bg-muted h-[450px] w-full rounded-lg flex items-center justify-center">
                    <Film className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <Button onClick={markAsWatched} disabled={moviesWatched.includes(Number(id))} className="w-full">
                    {moviesWatched.includes(Number(id)) ? "Watched ✓" : "Mark as Watched"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => rateMovie(true)}
                      disabled={moviesRated.includes(Number(id))}
                      className="flex items-center gap-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Like
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => rateMovie(false)}
                      disabled={moviesRated.includes(Number(id))}
                      className="flex items-center gap-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      Dislike
                    </Button>
                  </div>

                  <Button variant="outline" onClick={toggleSaveMovie} className="flex items-center gap-2">
                    {moviesSaved.includes(Number(id)) ? (
                      <>
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                        Saved to Watchlist
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4" />
                        Add to Watchlist
                      </>
                    )}
                  </Button>

                  {collections.length > 0 && (
                    <div className="mt-2">
                      <select
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="w-full p-2 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Add to collection...</option>
                        {collections.map((collection) => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>

                      {selectedCollection && (
                        <Button onClick={handleAddToCollection} size="sm" className="w-full mt-2">
                          Add to Collection
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <MovieMoodMeter movieId={Number(id)} />
                </div>

                <div className="mt-4">
                  <MovieTrivia movieId={Number(id)} onLike={handleTriviaLike} />
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {movie.release_date && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}

                  {movie.vote_average > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}

                  {movie.runtime > 0 && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres?.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="cast">Cast &amp; Crew</TabsTrigger>
                    {movie.videos?.results?.length > 0 && (
                      <TabsTrigger value="videos">Videos</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="overview" className="mt-4">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Overview</h2>
                      <p className="text-muted-foreground">{movie.overview}</p>

                      {movie.tagline && (
                        <div className="mt-4 italic text-muted-foreground">
                          "{movie.tagline}"
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {movie.production_companies?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Production</h3>
                          <p className="text-sm text-muted-foreground">
                            {movie.production_companies.map((c) => c.name).join(", ")}
                          </p>
                        </div>
                      )}

                      {movie.production_countries?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Country</h3>
                          <p className="text-sm text-muted-foreground">
                            {movie.production_countries.map((c) => c.name).join(", ")}
                          </p>
                        </div>
                      )}

                      {movie.budget > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Budget</h3>
                          <p className="text-sm text-muted-foreground">
                            ${(movie.budget / 1000000).toFixed(1)} million
                          </p>
                        </div>
                      )}

                      {movie.revenue > 0 && (
                        <div>
                          <h3 className="text-sm font-medium mb-1">Revenue</h3>
                          <p className="text-sm text-muted-foreground">
                            ${(movie.revenue / 1000000).toFixed(1)} million
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="cast" className="mt-4">
                    {credits && (
                      <>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold mb-2">Cast</h2>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {credits.cast?.slice(0, 8).map((person) => (
                              <div key={person.id} className="text-center">
                                <div className="relative w-full aspect-square mb-2 rounded-lg overflow-hidden bg-muted">
                                  {person.profile_path ? (
                                    <Image
                                      src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                                      alt={person.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-4xl">👤</span>
                                    </div>
                                  )}
                                </div>
                                <h3 className="font-medium text-sm">{person.name}</h3>
                                <p className="text-xs text-muted-foreground">{person.character}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold mb-2">Crew</h2>
                          <div className="grid grid-cols-2 gap-4">
                            {credits.crew
                              ?.filter((c) =>
                                ["Director", "Producer", "Screenplay", "Writer"].includes(c.job),
                              )
                              .slice(0, 6)
                              .map((person) => (
                                <div key={`${person.id}-${person.job}`} className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                                    {person.profile_path ? (
                                      <Image
                                        src={`https://image.tmdb.org/t/p/w200${person.profile_path}`}
                                        alt={person.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl">👤</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-sm">{person.name}</h3>
                                    <p className="text-xs text-muted-foreground">{person.job}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="videos" className="mt-4">
                    {movie.videos?.results?.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-2">Videos</h2>
                        <div className="aspect-video w-full max-w-2xl rounded-lg overflow-hidden mb-4">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${movie.videos.results[0].key}`}
                            title={`${movie.title} Trailer`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>

                        {movie.videos.results.length > 1 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {movie.videos.results.slice(1, 4).map((video) => (
                              <div key={video.id} className="text-center">
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-2">
                                  <Image
                                    src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                    alt={video.name}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-colors">
                                    <Film className="h-8 w-8 text-white" />
                                  </div>
                                </div>
                                <p className="text-xs line-clamp-1">{video.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.id}`, "_blank")}>
                    More Info
                  </Button>
                  <Button variant="outline" onClick={() => router.back()}>
                    Back to Recommendations
                  </Button>
                </div>
              </div>
            </div>

            {similarMovies.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Similar Movies You Might Like</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {similarMovies.map((similarMovie) => (
                    <motion.div
                      key={similarMovie.id}
                      whileHover={{ y: -5 }}
                      className="cursor-pointer"
                      onClick={() => router.push(`/movie/${similarMovie.id}`)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                        <Image
                          src={
                            similarMovie.poster_path
                              ? `https://image.tmdb.org/t/p/w300${similarMovie.poster_path}`
                              : "/placeholder.svg?height=300&width=200"
                          }
                          alt={similarMovie.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="mt-2 text-sm font-medium line-clamp-1">{similarMovie.title}</h3>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Movie not found</p>
            <Button variant="outline" onClick={() => router.push("/")} className="mt-4">
              Back to Home
            </Button>
          </div>
        )}
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

      {movie && (
        <ShareMenu
          open={shareOpen}
          onOpenChange={setShareOpen}
          title={movie.title}
          text={`Check out this movie: ${movie.title}`}
          url={typeof window !== "undefined" ? window.location.href : ""}
        />
      )}

      <Toaster />
    </div>
  )
}

export default MovieDetailPage
