"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiService, type CourseFile } from "@/lib/api"
import { FileText, Download, Eye, Trash2, Calendar, User, HardDrive, Loader2 } from "lucide-react"

interface FileListProps {
  files: CourseFile[]
  onFileDeleted: (fileId: number) => void
  showCategory?: boolean
  className?: string
}

export function FileList({ files, onFileDeleted, showCategory = true, className }: FileListProps) {
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null)
  const { toast } = useToast()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "TEACHING_MATERIAL":
        return "Tài liệu giảng dạy"
      case "REFERENCE_MATERIAL":
        return "Tài liệu tham khảo"
      default:
        return category
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "TEACHING_MATERIAL":
        return "bg-blue-100 text-blue-800"
      case "REFERENCE_MATERIAL":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    return <FileText className="h-5 w-5 text-blue-500" />
  }

  const handleDownload = async (file: CourseFile) => {
    try {
      const response = await apiService.downloadCourseFile(file.id)
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = file.originalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Thành công",
        description: `Đã tải xuống file ${file.originalFileName}`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống file",
        variant: "destructive",
      })
    }
  }

  const handleView = async (file: CourseFile) => {
    try {
      const response = await apiService.viewCourseFile(file.id)
      const blob = await response.blob()

      // Open in new tab
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")

      // Clean up after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.error("View error:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xem file",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (file: CourseFile) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa file "${file.originalFileName}"?`)) {
      return
    }

    setDeletingFileId(file.id)
    try {
      await apiService.deleteCourseFile(file.id)
      onFileDeleted(file.id)
      toast({
        title: "Thành công",
        description: `Đã xóa file ${file.originalFileName}`,
      })
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa file",
        variant: "destructive",
      })
    } finally {
      setDeletingFileId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có file nào</h3>
        <p className="text-slate-600">Upload file để bắt đầu chia sẻ tài liệu</p>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {files.map((file) => (
        <div key={file.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getFileIcon(file.originalFileName)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900 truncate">{file.originalFileName}</h4>
                  {showCategory && (
                    <Badge className={`text-xs ${getCategoryColor(file.fileCategory)}`}>
                      {getCategoryLabel(file.fileCategory)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {formatFileSize(file.fileSize)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(file.uploadedAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {file.uploadedByName}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-4">
              <Button variant="ghost" size="icon" onClick={() => handleView(file)} title="Xem file">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDownload(file)} title="Tải xuống">
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(file)}
                disabled={deletingFileId === file.id}
                title="Xóa file"
              >
                {deletingFileId === file.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
