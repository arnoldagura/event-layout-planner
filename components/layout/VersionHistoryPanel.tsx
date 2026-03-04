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
      <div className="shrink-0 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
            <History className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900">Version History</h2>
            <p className="text-xs text-zinc-500">Saved on each layout save</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        ) : versions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
              <Clock className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="mb-1 text-sm text-zinc-500">No versions yet</p>
            <p className="text-xs text-zinc-400">
              A snapshot is created each time you save your layout.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-zinc-900">v{v.versionNum}</span>
                    {idx === 0 && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {format(new Date(v.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-zinc-500 hover:text-zinc-900"
                  onClick={() => handleRestoreClick(v.versionNum)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t bg-zinc-50 p-3">
        <p className="text-center text-xs text-zinc-500">Up to 20 versions are kept per event.</p>
      </div>

      {/* Confirm restore dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore v{restoringNum}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current canvas elements with the elements from this version.
              Your current unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={isRestoring}
              className="bg-zinc-900 hover:bg-zinc-800"
            >
              {isRestoring ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
