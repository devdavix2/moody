"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface QuirkyCategoriesProps {
  mood: string
}

// Define quirky categories for each mood
const quirkyCategoriesMap = {
  cheerful: [
    {
      title: "For the Perpetually Optimistic",
      description: "Movies so upbeat they'll make your plants grow faster.",
    },
    {
      title: "Sunshine in Film Form",
      description: "Warning: May cause spontaneous dancing and excessive smiling.",
    },
    {
      title: "The 'Everything is Awesome' Collection",
      description: "Films that make Monday mornings feel like Friday afternoons.",
    },
    {
      title: "Serotonin Boosters",
      description: "Scientifically proven* to be impossible to watch without grinning. (*Not actual science)",
    },
  ],
  reflective: [
    {
      title: "Existential Crisis Starters",
      description: "Films that make you question if that red shirt is really red.",
    },
    {
      title: "The 'Stare Out Windows Dramatically' Pack",
      description: "Perfect for rainy days and pretending you're in a music video.",
    },
    {
      title: "Philosophical Rabbit Holes",
      description: "Movies that will have you debating the meaning of life with your houseplants.",
    },
    {
      title: "Contemplative Coffee Shop Vibes",
      description: "Best enjoyed while writing poetry nobody will ever read.",
    },
  ],
  gloomy: [
    {
      title: "Emotional Damage: The Collection",
      description: "Films that pair perfectly with ice cream and tissues.",
    },
    {
      title: "The 'Beautiful Tragedy' Marathon",
      description: "Because sometimes you just need a good cry.",
    },
    {
      title: "Rainy Day Mood Amplifiers",
      description: "When you want to feel even more melancholy than the weather.",
    },
    {
      title: "The 'Text Your Ex' Danger Zone",
      description: "Warning: May cause regrettable late-night messaging. Proceed with caution.",
    },
  ],
  humorous: [
    {
      title: "Laugh Until You Snort Collection",
      description: "Films that will make you embarrass yourself in public.",
    },
    {
      title: "The 'Milk Through Your Nose' Risk Group",
      description: "Do not consume beverages during viewing. We warned you.",
    },
    {
      title: "Dad Joke: The Movie Experience",
      description: "So bad they're good. Just like dad's jokes.",
    },
    {
      title: "Abs Workout Through Laughter",
      description: "Who needs the gym when you have these comedies?",
    },
  ],
  adventurous: [
    {
      title: "Couch Potato Explorer Series",
      description: "All the adventure, none of the mosquito bites.",
    },
    {
      title: "The 'I Could Do That' Delusion Collection",
      description: "Films that make you think you could survive in the wild (you can't).",
    },
    {
      title: "Adrenaline Rush Without the Insurance Costs",
      description: "Experience danger from the safety of your snack-filled living room.",
    },
    {
      title: "Vacation Inspiration That Exceeds Your Budget",
      description: "Dream big, spend small, watch movies instead.",
    },
  ],
  romantic: [
    {
      title: "Unrealistic Expectations Generators",
      description: "Where everyone has perfect hair, even in the rain.",
    },
    {
      title: "The 'Why Is My Love Life Not Like This' Collection",
      description: "Films that make your dating app experiences seem even worse.",
    },
    {
      title: "Hopeless Romantic Support Group",
      description: "You're not alone in talking to your TV during these scenes.",
    },
    {
      title: "First Date Idea Stealers",
      description: "Borrow these grand gestures at your own risk.",
    },
  ],
  thrilling: [
    {
      title: "The 'Check Behind the Shower Curtain' Collection",
      description: "Films that make normal house noises suddenly suspicious.",
    },
    {
      title: "Cardio Through Fear",
      description: "Who needs a fitness tracker when your heart rate is through the roof?",
    },
    {
      title: "The 'I'm Never Going Camping' Convincers",
      description: "Urban living never seemed so appealing.",
    },
    {
      title: "Popcorn-Launching Jump Scares",
      description: "The real reason your floor is always sticky.",
    },
  ],
  relaxed: [
    {
      title: "Cinematic ASMR",
      description: "Movies so calming you might miss the ending... because you're asleep.",
    },
    {
      title: "The 'Gentle Background Noise' Collection",
      description: "Perfect for pretending to watch while scrolling your phone.",
    },
    {
      title: "Meditation for People Who Can't Meditate",
      description: "Find your zen without having to sit cross-legged.",
    },
    {
      title: "Digital Lullabies",
      description: "The sophisticated adult version of being read a bedtime story.",
    },
  ],
}

export default function QuirkyCategories({ mood }: QuirkyCategoriesProps) {
  const categories = quirkyCategoriesMap[mood] || []

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {categories.map((category, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">{category.title}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

