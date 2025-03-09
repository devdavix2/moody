"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  FolderPlus,
  Folder,
  Film,
  Plus,
  X,
  Edit,
  Trash2,
  Check,
  Star,
  Download,
  Loader2,
  Settings,
  Share2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Collection {
  id: string
  name: string
  description: string
  movies: number[]
  createdAt: string
  updatedAt: string
}

interface Movie {
  id: number
  title: string
  poster_path: string
  release_date: string
  vote_average: number
}

// Add new interfaces for PDF settings
interface PdfSettings {
  theme: "light" | "dark"
  includeStats: boolean
  includePosters: boolean
  layout: "grid" | "list"
  sortBy: "title" | "rating" | "date"
}

export default function MovieCollections() {
  const [collections, setCollections] = useLocalStorage<Collection[]>("moodyflicks-collections", [])
  const [newCollectionName, setNewCollectionName] = useState("")
  const [newCollectionDescription, setNewCollectionDescription] = useState("")
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [collectionMovies, setCollectionMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const pdfContainerRef = useRef<HTMLDivElement>(null)

  // Add to your component
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>({
    theme: "light",
    includeStats: true,
    includePosters: true,
    layout: "grid",
    sortBy: "title",
  })

  useEffect(() => {
    if (selectedCollection) {
      fetchCollectionMovies(selectedCollection.movies)
    }
  }, [selectedCollection])

  const fetchCollectionMovies = async (movieIds: number[]) => {
    if (!movieIds.length) {
      setCollectionMovies([])
      return
    }

    setLoading(true)
    try {
      const movies = await Promise.all(
        movieIds.map(async (id) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=83492b666fdd114bc7f519241953fd4a`,
          )

          if (!response.ok) {
            throw new Error(`Failed to fetch movie ${id}`)
          }

          return response.json()
        }),
      )

      setCollectionMovies(movies)
    } catch (error) {
      console.error("Error fetching collection movies:", error)
      toast({
        title: "Error",
        description: "Failed to fetch collection movies.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast({
        title: "Error",
        description: "Collection name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    const now = new Date().toISOString()
    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      name: newCollectionName,
      description: newCollectionDescription,
      movies: [],
      createdAt: now,
      updatedAt: now,
    }

    setCollections([...collections, newCollection])
    setNewCollectionName("")
    setNewCollectionDescription("")
    setIsDialogOpen(false)

    toast({
      title: "Collection Created",
      description: `"${newCollectionName}" has been created.`,
    })
  }

  const handleUpdateCollection = () => {
    if (!editingCollection) return

    if (!editingCollection.name.trim()) {
      toast({
        title: "Error",
        description: "Collection name cannot be empty.",
        variant: "destructive",
      })
      return
    }

    const updatedCollections = collections.map((col) =>
      col.id === editingCollection.id ? { ...editingCollection, updatedAt: new Date().toISOString() } : col,
    )

    setCollections(updatedCollections)
    setEditingCollection(null)

    toast({
      title: "Collection Updated",
      description: `"${editingCollection.name}" has been updated.`,
    })
  }

  const handleDeleteCollection = (id: string) => {
    const collectionToDelete = collections.find((col) => col.id === id)

    if (!collectionToDelete) return

    const updatedCollections = collections.filter((col) => col.id !== id)
    setCollections(updatedCollections)

    if (selectedCollection?.id === id) {
      setSelectedCollection(null)
    }

    toast({
      title: "Collection Deleted",
      description: `"${collectionToDelete.name}" has been deleted.`,
    })
  }

  const handleRemoveFromCollection = (movieId: number) => {
    if (!selectedCollection) return

    const updatedCollection = {
      ...selectedCollection,
      movies: selectedCollection.movies.filter((id) => id !== movieId),
      updatedAt: new Date().toISOString(),
    }

    const updatedCollections = collections.map((col) => (col.id === selectedCollection.id ? updatedCollection : col))

    setCollections(updatedCollections)
    setSelectedCollection(updatedCollection)

    // Update the displayed movies
    setCollectionMovies((prev) => prev.filter((movie) => movie.id !== movieId))

    toast({
      title: "Movie Removed",
      description: "Movie has been removed from the collection.",
    })
  }

  // Add new function to calculate collection stats
  const calculateCollectionStats = (movies: Movie[]) => {
    const totalMovies = movies.length
    const averageRating = movies.reduce((acc, movie) => acc + movie.vote_average, 0) / totalMovies
    const yearStats = movies.reduce(
      (acc, movie) => {
        const year = new Date(movie.release_date).getFullYear()
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<number, number>,
    )

    const oldestYear = Math.min(...Object.keys(yearStats).map(Number))
    const newestYear = Math.max(...Object.keys(yearStats).map(Number))

    return {
      totalMovies,
      averageRating: averageRating.toFixed(1),
      oldestYear,
      newestYear,
      yearDistribution: yearStats,
    }
  }

  // Enhance the generatePDF function
  const generatePDF = useCallback(async () => {
    if (!selectedCollection || !pdfContainerRef.current) return

    setPdfGenerating(true)

    try {
      // Create a new PDF
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // Add logo
      const logoSize = 10
      pdf.addImage(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/android-chrome-192x192-e3w8N1d1BJdyZwefJRsrYeSETHEHTG.png",
        "PNG",
        pageWidth - 20,
        10,
        logoSize,
        logoSize,
      )

      // Add heading
      pdf.setFontSize(24)
      pdf.setTextColor(33, 33, 33)
      pdf.text(`${selectedCollection.name}`, 14, 22)

      // Add description if exists
      if (selectedCollection.description) {
        pdf.setFontSize(12)
        pdf.setTextColor(100, 100, 100)
        pdf.text(selectedCollection.description, 14, 32)
      }

      // Add date and metadata
      const dateString = new Date(selectedCollection.updatedAt).toLocaleDateString()
      pdf.setFontSize(10)
      pdf.setTextColor(120, 120, 120)
      pdf.text(`Last updated: ${dateString}`, 14, 40)

      let currentY = 50

      // Add collection stats if enabled
      if (pdfSettings.includeStats && collectionMovies.length > 0) {
        const stats = calculateCollectionStats(collectionMovies)

        pdf.setFontSize(14)
        pdf.setTextColor(33, 33, 33)
        pdf.text("Collection Statistics", 14, currentY)

        currentY += 8
        pdf.setFontSize(10)
        pdf.setTextColor(80, 80, 80)
        pdf.text(
          [
            `Total Movies: ${stats.totalMovies}`,
            `Average Rating: ${stats.averageRating}`,
            `Year Range: ${stats.oldestYear} - ${stats.newestYear}`,
          ],
          14,
          currentY,
        )

        currentY += 20
      }

      // Sort movies based on settings
      const sortedMovies = [...collectionMovies].sort((a, b) => {
        switch (pdfSettings.sortBy) {
          case "rating":
            return b.vote_average - a.vote_average
          case "date":
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
          default:
            return a.title.localeCompare(b.title)
        }
      })

      // Add movies
      if (sortedMovies.length > 0) {
        if (pdfSettings.layout === "grid" && pdfSettings.includePosters) {
          // Grid layout with posters
          const canvas = await html2canvas(pdfContainerRef.current, {
            scale: 2,
            backgroundColor: pdfSettings.theme === "dark" ? "#1a1a1a" : "#ffffff",
            logging: false,
          })

          const imgData = canvas.toDataURL("image/png")
          const imgWidth = pageWidth - 28
          const imgHeight = (canvas.height * imgWidth) / canvas.width

          // Check if we need a new page
          if (currentY + imgHeight > pageHeight) {
            pdf.addPage()
            currentY = 20
          }

          pdf.addImage(imgData, "PNG", 14, currentY, imgWidth, imgHeight)
        } else {
          // List layout
          sortedMovies.forEach((movie, index) => {
            if (currentY > pageHeight - 20) {
              pdf.addPage()
              currentY = 20
            }

            pdf.setFontSize(12)
            pdf.setTextColor(33, 33, 33)
            pdf.text(`${index + 1}. ${movie.title}`, 14, currentY)

            pdf.setFontSize(10)
            pdf.setTextColor(100, 100, 100)
            pdf.text(
              `Rating: ${movie.vote_average.toFixed(1)} • Released: ${new Date(movie.release_date).getFullYear()}`,
              14,
              currentY + 5,
            )

            currentY += 15
          })
        }
      } else {
        pdf.setFontSize(14)
        pdf.setTextColor(100, 100, 100)
        pdf.text("No movies in this collection yet.", 14, currentY)
      }

      // Add footer
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text(`Generated by MoodyFlicks on ${new Date().toLocaleDateString()}`, 14, pageHeight - 10)

      // Save the PDF
      pdf.save(`MoodyFlicks-${selectedCollection.name}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Your collection has been saved as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPdfGenerating(false)
    }
  }, [selectedCollection, collectionMovies, pdfSettings, toast])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Movie Collections</h2>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>Create a new collection to organize your favorite movies.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Collection Name
                </label>
                <Input
                  id="name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Sci-Fi Favorites"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  id="description"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="A short description of your collection"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCollection}>Create Collection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Collections Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first collection to organize your favorite movies.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden">
              {editingCollection?.id === collection.id ? (
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        value={editingCollection.name}
                        onChange={(e) =>
                          setEditingCollection({
                            ...editingCollection,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        value={editingCollection.description}
                        onChange={(e) =>
                          setEditingCollection({
                            ...editingCollection,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingCollection(null)}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleUpdateCollection}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-primary" />
                          {collection.name}
                        </CardTitle>
                        {collection.description && (
                          <CardDescription className="mt-1">{collection.description}</CardDescription>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingCollection(collection)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{collection.movies.length} movies</span>
                      <span>Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <Film className="h-4 w-4 mr-2" />
                      View Collection
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Collection Details Dialog */}
      <Dialog open={!!selectedCollection} onOpenChange={(open) => !open && setSelectedCollection(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-primary" />
              {selectedCollection?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCollection?.description || "A collection of your favorite movies"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : collectionMovies.length === 0 ? (
              <div className="text-center py-8">
                <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Movies Yet</h3>
                <p className="text-muted-foreground mb-4">Add movies to this collection when browsing movies.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-4 gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        PDF Settings
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel>PDF Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="theme">Dark Theme</Label>
                          <Switch
                            id="theme"
                            checked={pdfSettings.theme === "dark"}
                            onCheckedChange={(checked) =>
                              setPdfSettings((prev) => ({ ...prev, theme: checked ? "dark" : "light" }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="stats">Include Statistics</Label>
                          <Switch
                            id="stats"
                            checked={pdfSettings.includeStats}
                            onCheckedChange={(checked) =>
                              setPdfSettings((prev) => ({ ...prev, includeStats: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="posters">Include Posters</Label>
                          <Switch
                            id="posters"
                            checked={pdfSettings.includePosters}
                            onCheckedChange={(checked) =>
                              setPdfSettings((prev) => ({ ...prev, includePosters: checked }))
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Layout</Label>
                          <select
                            className="w-full p-2 rounded-md border"
                            value={pdfSettings.layout}
                            onChange={(e) =>
                              setPdfSettings((prev) => ({ ...prev, layout: e.target.value as "grid" | "list" }))
                            }
                          >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                          </select>
                        </div>
                        <div className="space-y-1 mt-2">
                          <Label>Sort By</Label>
                          <select
                            className="w-full p-2 rounded-md border"
                            value={pdfSettings.sortBy}
                            onChange={(e) =>
                              setPdfSettings((prev) => ({
                                ...prev,
                                sortBy: e.target.value as "title" | "rating" | "date",
                              }))
                            }
                          >
                            <option value="title">Title</option>
                            <option value="rating">Rating</option>
                            <option value="date">Release Date</option>
                          </select>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {pdfGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download as PDF
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = window.location.href
                      navigator
                        .share?.({
                          title: `MoodyFlicks Collection: ${selectedCollection?.name}`,
                          text: `Check out my movie collection "${selectedCollection?.name}" on MoodyFlicks!`,
                          url,
                        })
                        .catch(() => {
                          navigator.clipboard.writeText(url)
                          toast({
                            title: "Link Copied!",
                            description: "Collection link copied to clipboard.",
                          })
                        })
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  {/* This div is for PDF generation, hidden from view but used for HTML to canvas conversion */}
                  <div ref={pdfContainerRef} className="bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {collectionMovies.map((movie) => (
                        <Card key={movie.id} className="overflow-hidden h-full">
                          <div className="flex flex-col h-full">
                            <div className="relative aspect-[2/3] w-full">
                              <Image
                                src={
                                  movie.poster_path
                                    ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
                                    : "/placeholder.svg?height=200&width=133"
                                }
                                alt={movie.title}
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="p-2 flex-1 flex flex-col">
                              <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                <span>{movie.vote_average?.toFixed(1)}</span>
                                <span className="mx-1">•</span>
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                              </div>

                              <div className="flex gap-1 mt-auto pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 text-xs px-2 flex-1"
                                  onClick={() => router.push(`/movie/${movie.id}`)}
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs px-2 text-destructive"
                                  onClick={() => handleRemoveFromCollection(movie.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCollection(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

