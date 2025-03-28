"use client"

import { FileText, Image, Activity, CheckCircle, AlertCircle, Loader2, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

type FileType = "xray" | "pdf" | "ecg"
type FileStatus = "idle" | "uploading" | "processing" | "complete" | "error"

interface UploadedFile {
  id: string
  file: File
  type: FileType
  status: FileStatus
  progress: number
  error?: string
}

interface FileUploadStatusProps {
  file: UploadedFile
  onRemove: () => void
}

export function FileUploadStatus({ file, onRemove }: FileUploadStatusProps) {
  const getFileIcon = () => {
    switch (file.type) {
      case "xray":
        return <Image className="h-5 w-5" />
      case "pdf":
        return <FileText className="h-5 w-5" />
      case "ecg":
        return <Activity className="h-5 w-5" />
    }
  }

  const getStatusIcon = () => {
    switch (file.status) {
      case "idle":
        return null
      case "uploading":
        return <Progress value={file.progress} className="h-2 w-16" />
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case "complete":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusText = () => {
    switch (file.status) {
      case "idle":
        return "Ready to process"
      case "uploading":
        return `Uploading ${file.progress}%`
      case "processing":
        return "Processing..."
      case "complete":
        return "Processing complete"
      case "error":
        return file.error || "Error"
    }
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-md border ${
        file.status === "error"
          ? "border-destructive/50 bg-destructive/10"
          : file.status === "complete"
            ? "border-green-500/50 bg-green-500/10"
            : "border-border"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-muted rounded-md">{getFileIcon()}</div>
        <div>
          <p className="text-sm font-medium truncate max-w-[200px]">{file.file.name}</p>
          <p className="text-xs text-muted-foreground">{(file.file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-xs text-muted-foreground">{getStatusText()}</span>
        </div>

        {file.status !== "uploading" && file.status !== "processing" && (
          <Button variant="ghost" size="icon" onClick={onRemove} className="h-7 w-7">
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        )}
      </div>
    </div>
  )
}

