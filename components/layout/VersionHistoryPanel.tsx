'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { History, Loader2, RotateCcw, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

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
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to restore')
      toast.success(`Restored to v${restoringNum}`)
      setConfirmOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to restore version')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
            <History className="w-4 h-4 text-white" />
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
            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">No versions yet</p>
            <p className="text-xs text-zinc-400">
              A snapshot is created each time you save your layout.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {versions.map((v, idx) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-zinc-900">
                      v{v.versionNum}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {format(new Date(v.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-zinc-500 hover:text-zinc-900 shrink-0"
                  onClick={() => handleRestoreClick(v.versionNum)}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-zinc-50 shrink-0">
        <p className="text-xs text-zinc-500 text-center">
          Up to 20 versions are kept per event.
        </p>
      </div>

      {/* Confirm restore dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore v{restoringNum}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current canvas elements with the elements
              from this version. Your current unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={isRestoring}
              className="bg-zinc-900 hover:bg-zinc-800"
            >
              {isRestoring ? 'Restoring...' : 'Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
