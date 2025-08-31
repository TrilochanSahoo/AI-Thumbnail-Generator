"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Wand2,
  ImageIcon,
  Download,
  Settings,
  MessageSquare,
  Home,
  FolderHeart,
  Search,
  Trash2,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Dropzone } from "@/components/dropzone"
import { DraggableBoard, type BoardItem } from "@/components/draggable-board"

type GenMessage =
  | { id: string; role: "user"; content: string }
  | { id: string; role: "image"; prompt: string; url: string; aspect: string }

const ASPECT_OPTIONS = ["1:1", "16:9", "3:2", "4:5", "2:3"] as const
type Aspect = (typeof ASPECT_OPTIONS)[number]

export default function Page() {
  const [messages, setMessages] = useState<GenMessage[]>([])
  const [prompt, setPrompt] = useState("")
  const [aspect, setAspect] = useState<Aspect>("1:1")
  const [hiRes, setHiRes] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)

  const [uploads, setUploads] = useState<string[]>([])
  const [boardItems, setBoardItems] = useState<BoardItem[]>([])
  const [editorOpen, setEditorOpen] = useState(false)
  const STORAGE_KEY = "pastelthumb-board"

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
    }
  }, [messages, loading])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setBoardItems(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boardItems))
    } catch {}
  }, [boardItems])

  async function onGenerate() {
    if (!prompt.trim()) return
    const id = crypto.randomUUID()
    setMessages((m) => [...m, { id, role: "user", content: prompt }])
    setLoading(true)

    try {
      console.log("[v0] Generating image with params:", { prompt, aspect, hiRes })
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspect, hiRes, images: uploads }),
      })
      const data = await res.json().catch(() => null)
      const url =
        data?.imageUrl ||
        `/placeholder.svg?height=720&width=1280&query=generated%20thumbnail%20${encodeURIComponent(prompt.slice(0, 24))}`
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "image", prompt, url, aspect }])
    } catch (e) {
      console.error("[v0] Generation error", e)
    } finally {
      setLoading(false)
    }
  }

  function downloadImage(url: string, fileName = "thumbnail.png") {
    fetch(url, { mode: "cors" })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => window.open(url, "_blank"))
  }

  const addImageToCanvas = (src: string) =>
    setBoardItems((prev) => [...prev, { id: crypto.randomUUID(), type: "image", src, x: 24, y: 24, w: 160 }])

  const addTextToCanvas = (text: string) =>
    setBoardItems((prev) => [...prev, { id: crypto.randomUUID(), type: "text", text, x: 40, y: 40 }])

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <div className="grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_360px]">
        <aside className="border-r px-4 py-4 md:min-h-dvh">
          <Brand />
          <nav className="mt-6 flex flex-col gap-1">
            <NavItem icon={<Home size={18} />} label="Home" active />
            <NavItem icon={<MessageSquare size={18} />} label="Chat" />
            <NavItem icon={<ImageIcon size={18} />} label="Library" />
            <NavItem icon={<FolderHeart size={18} />} label="Favorites" />
            <NavItem icon={<Settings size={18} />} label="Settings" />
          </nav>

          <Card className="mt-6 bg-sky-200/40 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Inspiration</CardTitle>
            </CardHeader>
            <CardContent>
              <img src="/images/inspiration.png" alt="Inspiration UI reference" className="rounded-md border" />
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-rose-200 bg-rose-200/30 hover:bg-rose-200/50"
              onClick={() => setMessages([])}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear thread
            </Button>
          </div>
        </aside>

        <main className="px-4 py-4 h-dvh flex flex-col">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
              <Input placeholder="Search prompts or images..." className="pl-9" />
            </div>
            <Button className="bg-teal-200 text-slate-900 hover:bg-teal-200/80">
              <Wand2 className="mr-2 h-4 w-4" />
              Quick start
            </Button>
          </div>

          <div ref={listRef} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-3">
            {messages.map((m) =>
              m.role === "user" ? (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div
                    className="rounded-lg border bg-sky-200/30 px-3 py-2 text-sm max-w-prose"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/pastel-text", m.content)}
                    title="Drag text into Canvas editor"
                  >
                    {m.content}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Generation completed</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      <div
                        className="relative w-full overflow-hidden rounded-md border"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/pastel-image-src", m.url)}
                        title="Drag into Canvas editor"
                      >
                        <img
                          src={m.url || "/placeholder.svg"}
                          alt={`Generated thumbnail ${m.aspect}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs opacity-70">
                          Aspect {m.aspect} · Prompt: {m.prompt.slice(0, 60)}
                          {m.prompt.length > 60 ? "…" : ""}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-sky-200 bg-sky-200/30"
                            onClick={() => downloadImage(m.url)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            className="border-teal-200 bg-teal-200/50"
                            onClick={() => addImageToCanvas(m.url)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            className="border-rose-200 bg-rose-200/30"
                            onClick={() => {
                              setPrompt(m.prompt)
                              listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
                            }}
                          >
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ),
            )}
          </div>

          <div className="sticky bottom-0 left-0 right-0 mt-3 rounded-md border bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type a prompt…"
                  className="min-h-[52px] max-h-40 flex-1"
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onGenerate()
                  }}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/pastel-text", prompt)}
                />
                <Button
                  disabled={loading || !prompt.trim()}
                  onClick={onGenerate}
                  className="bg-teal-200 text-slate-900 hover:bg-teal-200/80"
                >
                  {loading ? "Generating…" : "Send"}
                </Button>
              </div>

              <Dropzone onImages={(urls) => setUploads((prev) => [...prev, ...urls])} className="bg-sky-200/30 p-2" />
              {uploads.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploads.map((src, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-md border bg-white"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/pastel-image-src", src)}
                      title="Drag into Canvas editor or click Add"
                    >
                      <img src={src || "/placeholder.svg"} alt="Upload" className="h-16 w-24 object-cover" />
                      <div className="absolute inset-0 hidden items-center justify-center gap-1 bg-black/20 p-1 group-hover:flex">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-teal-200 text-slate-900"
                          onClick={() => addImageToCanvas(src)}
                        >
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-rose-200 text-slate-900"
                          onClick={() => setUploads((u) => u.filter((_, idx) => idx !== i))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <section className="border-l px-4 py-4 md:min-h-dvh">
          <RightSettings
            boardItems={boardItems}
            setBoardItems={setBoardItems}
            onAddText={(t) =>
              setBoardItems((prev) => [...prev, { id: crypto.randomUUID(), type: "text", text: t, x: 40, y: 40 }])
            }
            aspect={aspect}
            setAspect={(v) => setAspect(v as Aspect)}
            editorOpen={editorOpen}
            setEditorOpen={setEditorOpen}
          />
        </section>
      </div>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="size-8 rounded-md bg-teal-200" />
      <div className="font-semibold">PastelThumb</div>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm w-full text-left hover:bg-sky-200/40",
        active && "bg-teal-200",
      )}
    >
      <span className="text-slate-900">{icon}</span>
      {label}
    </button>
  )
}

function RightSettings({
  boardItems,
  setBoardItems,
  onAddText,
  aspect,
  setAspect,
  editorOpen,
  setEditorOpen,
}: {
  boardItems: BoardItem[]
  setBoardItems: (items: BoardItem[]) => void
  onAddText: (text: string) => void
  aspect: string
  setAspect: (v: string) => void
  editorOpen: boolean
  setEditorOpen: (o: boolean) => void
}) {
  const [text, setText] = useState("Your title here")
  const savedAt = useMemo(() => new Date().toLocaleTimeString(), [boardItems])

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="text-lg font-semibold">Project</h2>

      <Card className="bg-sky-200/20 border-sky-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Aspect ratio</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={aspect} onValueChange={setAspect} className="flex flex-wrap gap-2">
            {ASPECT_OPTIONS.map((opt) => (
              <Label
                key={opt}
                className={cn(
                  "inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm",
                  aspect === opt ? "bg-teal-200" : "bg-sky-200/30",
                )}
              >
                <RadioGroupItem value={opt} className="sr-only" />
                {opt}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="bg-rose-200/20 border-rose-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          Use clear subjects, a style, and desired colors: Soft mint-and-sky pastel thumbnail for a mindful
          productivity video, clean typography, gentle shadows.
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Canvas editor</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div onClick={() => setEditorOpen(true)} className="cursor-pointer">
            <DraggableBoard items={boardItems} onItemsChange={setBoardItems} compact />
          </div>
          <div className="flex items-center gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add text to canvas" />
            <Button className="bg-teal-200 text-slate-900 hover:bg-teal-200/80" onClick={() => onAddText(text)}>
              Add text
            </Button>
          </div>
          <div className="text-xs opacity-60">Autosaved · {savedAt}</div>
          <div className="text-xs opacity-60">Tip: Drag generated images or uploads into the canvas.</div>

          <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-sky-200 bg-sky-200/30">
                Open full editor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
              <DialogHeader>
                <DialogTitle>Canvas editor</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <DraggableBoard items={boardItems} onItemsChange={setBoardItems} />
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add text to canvas"
                    className="max-w-sm"
                  />
                  <Button className="bg-teal-200 text-slate-900 hover:bg-teal-200/80" onClick={() => onAddText(text)}>
                    Add text
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-200 bg-rose-200/30"
                    onClick={() => setBoardItems([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
