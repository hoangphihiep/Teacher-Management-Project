"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { apiService, type CourseFile } from "@/lib/api"
import { Upload, X, FileText, Loader2 } from "lucide-react"

interface FileUploadProps {
  courseId: number
  onFileUploaded: (file: CourseFile) => void
  className?: string
}

export function FileUpload({ courseId, onFileUploaded, className }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileCategory, setFileCategory] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const allowedTypes = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".rtf"]

  const maxFileSize = 50 * 1024 * 1024 // 50MB

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File quá lớn (tối đa 50MB)`)
        return
      }

      // Check file type
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(`${file.name}: Định dạng file không được hỗ trợ`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      toast({
        title: "Lỗi validation file",
        description: errors.join(", "),
        variant: "destructive",
      })
    }

    setSelectedFiles(validFiles)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file để upload",
        variant: "destructive",
      })
      return
    }

    if (!fileCategory) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn loại tài liệu",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const totalFiles = selectedFiles.length
      let completedFiles = 0

      for (const file of selectedFiles) {
        const response = await apiService.uploadCourseFile(file, courseId, fileCategory)

        if (response.success) {
          onFileUploaded(response.data)
          completedFiles++
          setUploadProgress((completedFiles / totalFiles) * 100)
        }
      }

      toast({
        title: "Thành công",
        description: `Upload thành công ${completedFiles} file`,
      })

      // Reset form
      setSelectedFiles([])
      setFileCategory("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi upload file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-4">
        {/* File Category Selection */}
        <div>
          <Label htmlFor="fileCategory">Loại tài liệu *</Label>
          <Select value={fileCategory} onValueChange={setFileCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại tài liệu..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEACHING_MATERIAL">Tài liệu giảng dạy</SelectItem>
              <SelectItem value="REFERENCE_MATERIAL">Tài liệu tham khảo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Input */}
        <div>
          <Label htmlFor="fileInput">Chọn file</Label>
          <Input
            ref={fileInputRef}
            id="fileInput"
            type="file"
            multiple
            accept={allowedTypes.join(",")}
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <p className="text-sm text-slate-600 mt-1">Hỗ trợ: {allowedTypes.join(", ")} (tối đa 50MB mỗi file)</p>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>File đã chọn:</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{file.name}</div>
                      <div className="text-xs text-slate-600">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)} disabled={uploading}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Đang upload...</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || !fileCategory || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file` : ""}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
