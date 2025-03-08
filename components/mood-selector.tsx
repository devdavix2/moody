"use client"

import { motion } from "framer-motion"
import { Smile, Coffee, CloudRain, Laugh, Compass, Heart, Zap, Sunset } from "lucide-react"
import { cn } from "@/lib/utils"

const moods = [
  { id: "cheerful", icon: Smile, label: "Cheerful", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { id: "reflective", icon: Coffee, label: "Reflective", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { id: "gloomy", icon: CloudRain, label: "Gloomy", color: "bg-gray-100 text-gray-700 border-gray-300" },
  { id: "humorous", icon: Laugh, label: "Humorous", color: "bg-green-100 text-green-700 border-green-300" },
  { id: "adventurous", icon: Compass, label: "Adventurous", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { id: "romantic", icon: Heart, label: "Romantic", color: "bg-pink-100 text-pink-700 border-pink-300" },
  { id: "thrilling", icon: Zap, label: "Thrilling", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { id: "relaxed", icon: Sunset, label: "Relaxed", color: "bg-indigo-100 text-indigo-700 border-indigo-300" },
]

interface MoodSelectorProps {
  onSelectMood: (mood: string) => void
  selectedMood: string
}

export default function MoodSelector({ onSelectMood, selectedMood }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {moods.map((mood) => {
        const Icon = mood.icon
        const isSelected = selectedMood === mood.id

        return (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectMood(mood.id)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
              mood.color,
              isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary",
            )}
          >
            <Icon className="h-8 w-8 mb-2" />
            <span className="font-medium">{mood.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

