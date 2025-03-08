"use client"

import { Facebook, Twitter, Linkedin, Mail, LinkIcon, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface ShareMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  text: string
  url: string
}

export default function ShareMenu({ open, onOpenChange, title, text, url }: ShareMenuProps) {
  const { toast } = useToast()

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
          "_blank",
        )
      },
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
      },
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
      },
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + url)}`
      },
    },
  ]

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard.",
        })
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        toast({
          title: "Failed to copy",
          description: "Could not copy the link to clipboard.",
          variant: "destructive",
        })
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 py-4">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="flex flex-col items-center justify-center h-20 gap-2"
              onClick={option.action}
            >
              <option.icon className="h-6 w-6" />
              <span className="text-xs">{option.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Button variant="secondary" className="px-3 flex gap-2" onClick={copyToClipboard}>
              <LinkIcon className="h-4 w-4" />
              <span>Copy Link</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

