"use client"

import type React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type BoardImageItem = {
  id: string
  type: "image"
  src: string
  x: number
  y: number
  w?: number
}

export type BoardTextItem = {
  id: string
  type: "text"
  text: string
  x: number
  y: number
}

export type BoardItem = BoardImageItem | BoardTextItem

type Props = {
  items: BoardItem[]
  onItemsChange: (next: BoardItem[]) => void
  className?: string
  compact?: boolean
}

export function DraggableBoard({ items, onItemsChange, className, compact }: Props) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const src = e.dataTransfer.getData("text/pastel-image-src")
    const text = e.dataTransfer.getData("text/pastel-text")
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (src) {
      onItemsChange([
        ...items,
        { id: crypto.randomUUID(), type: "image", src, x: Math.max(0, x - 60), y: Math.max(0, y - 40), w: 120 },
      ])
    } else if (text) {
      onItemsChange([
        ...items,
        { id: crypto.randomUUID(), type: "text", text, x: Math.max(0, x - 40), y: Math.max(0, y - 12) },
      ])
    }
  }

  const updatePos = (id: string, x: number, y: number) => {
    onItemsChange(items.map((it) => (it.id === id ? { ...it, x, y } : it)))
  }

  const removeItem = (id: string) => onItemsChange(items.filter((it) => it.id !== id))

  return (
    <div
      className={cn(
        compact
          ? "relative h-56 w-full overflow-hidden rounded-md border bg-white"
          : "relative h-[420px] w-full overflow-hidden rounded-md border bg-white",
        className,
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Board background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:16px_16px]" />
      {items.map((it) => {
        if (it.type === "image") {
          return (
            <motion.div
              key={it.id}
              className="absolute cursor-move touch-none"
              drag
              dragMomentum={false}
              initial={false}
              onDragEnd={(_, info) => updatePos(it.id, info.point.x, info.point.y)}
              style={{ top: it.y, left: it.x }}
            >
              <img
                src={it.src || "/placeholder.svg"}
                alt="Canvas item"
                className="pointer-events-none select-none rounded-md border shadow-sm"
                style={{ width: it.w ?? 160, height: "auto" }}
              />
              <button
                className="absolute -right-2 -top-2 rounded-full bg-rose-200 px-2 py-0.5 text-xs shadow"
                onClick={() => removeItem(it.id)}
              >
                ×
              </button>
            </motion.div>
          )
        }
        return (
          <motion.div
            key={it.id}
            className="absolute cursor-move touch-none rounded bg-sky-200/60 px-2 py-1 text-xs font-medium"
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => updatePos(it.id, info.point.x, info.point.y)}
            initial={false}
            style={{ top: it.y, left: it.x }}
          >
            {it.text}
            <button
              className="ml-2 rounded bg-rose-200 px-1 text-[10px]"
              onClick={() => removeItem(it.id)}
              aria-label="Remove"
              title="Remove"
            >
              x
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
