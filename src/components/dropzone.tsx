"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { ImageIcon } from "lucide-react"

type Props = {
  onImages: (urls: string[]) => void
  className?: string
}

export function Dropzone({ onImages, className }: Props) {
  const [isOver, setIsOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      const reads = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const r = new FileReader()
            r.onload = () => resolve((r.result as string) || "")
            r.readAsDataURL(file)
          }),
      )
      const urls = await Promise.all(reads)
      onImages(urls.filter(Boolean))
    },
    [onImages],
  )

  return (
    <div
      className={cn(
        "rounded-md border border-dashed p-4 text-center transition-colors",
        isOver ? "bg-sky-200/40" : "bg-sky-200/20",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsOver(false)
        handleFiles(e.dataTransfer.files)
      }}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
      }}
      aria-label="Upload reference images"
      title="Click or drop images"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-sm">
        <ImageIcon className="h-5 w-5 opacity-70" />
        <div>
          Drop images here or <span className="font-medium underline">click to upload</span>
        </div>
        <div className="text-xs opacity-70">Supports multiple files</div>
      </div>
    </div>
  )
}

export default Dropzone
