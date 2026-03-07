"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { History, Loader2, RotateCcw, Clock } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Version {
  id: string
  versionNum: number
  createdAt: string
}

interface Props {
  eventId: string
}

export function VersionHistoryPanel({ eventId }: Props) {
  const router = useRouter()
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [restoringNum, setRestoringNum] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/versions`)
      .then((r) => r.json())
      .then((data) => setVersions(data.versions ?? []))
      .catch(() => setVersions([]))
      .finally(() => setIsLoading(false))
  }, [eventId])

  const handleRestoreClick = (versionNum: number) => {
    setRestoringNum(versionNum)
    setConfirmOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (restoringNum === null) return
    setIsRestoring(true)
    try {
      const res = await fetch(`/api/events/${eventId}/versions/${restoringNum}`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to restore")
      toast.success(`Restored to v${restoringNum}`)
      setConfirmOpen(false)
      router.refresh()
    } catch {
      toast.error("Failed to restore version")
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-none bg-foreground">
            <History className="h-4 w-4 text-background" />
          </div>
          <div>
            <h2 className="font-mono text-xs font-bold tracking-widest text-foreground uppercase">
              Version History
            </h2>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Saved on each layout save
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-none border border-border bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
              No versions yet
            </p>
            <p className="font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
              A snapshot is created each time you save your layout.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-none border border-border bg-muted p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-foreground uppercase">
                      v{v.versionNum}
                    </span>
                    {idx === 0 && (
                      <span className="rounded-none border border-success bg-success/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-success uppercase">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                    {format(new Date(v.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 rounded-none border border-transparent font-mono text-[9px] tracking-widest text-muted-foreground uppercase hover:border-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => handleRestoreClick(v.versionNum)}
                >
                  <RotateCcw className="mr-1.5 h-3 w-3" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-muted p-3">
        <p className="text-center font-mono text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
          Up to 20 versions are kept per event.
        </p>
      </div>

      {/* Confirm restore dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-none border-2 border-border bg-card p-0 shadow-sm">
          <AlertDialogHeader className="border-b border-border bg-foreground px-5 py-4">
            <AlertDialogTitle className="font-mono text-xs tracking-widest text-background uppercase">
              Restore v{restoringNum}?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 font-mono text-xs leading-relaxed tracking-widest text-muted-foreground uppercase">
              This will replace all current canvas elements with the elements from this version.
              Your current unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-4 p-6 pt-0">
            <AlertDialogCancel
              disabled={isRestoring}
              className="mt-0 h-10 w-full rounded-none border-border font-mono text-xs tracking-widest text-foreground uppercase hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={isRestoring}
              className="m-0 h-10 w-full rounded-none border border-foreground bg-foreground font-mono text-xs tracking-widest text-background uppercase shadow-[2px_2px_0_0_currentColor] transition-colors hover:border-success hover:bg-success hover:text-white"
            >
              {isRestoring ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
