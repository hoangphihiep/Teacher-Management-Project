"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Plus, Send, Mail, MailOpen, Users, MessageSquare, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react"
import {
  apiService,
  type Message,
  type User,
  type CreateMessage,
  type MessageType,
  type MessagePriority,
} from "@/lib/api"

const createMessageSchema = z.object({
  subject: z.string().min(1, "Tiêu đề không được để trống").max(200, "Tiêu đề không được vượt quá 200 ký tự"),
  content: z.string().min(1, "Nội dung không được để trống").max(5000, "Nội dung không được vượt quá 5000 ký tự"),
  messageType: z.string().min(1, "Vui lòng chọn loại tin nhắn"),
  priority: z.string().min(1, "Vui lòng chọn mức độ ưu tiên"),
  isBroadcast: z.boolean(),
  recipientIds: z.array(z.number()).optional(),
})

type CreateMessageData = z.infer<typeof createMessageSchema>

export default function AdminMessagesPage() {
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([])
  const [messagePriorities, setMessagePriorities] = useState<MessagePriority[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const form = useForm<CreateMessageData>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      messageType: "GENERAL",
      priority: "NORMAL",
      isBroadcast: false,
      recipientIds: [],
    },
  })

  const isBroadcast = form.watch("isBroadcast")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load all data in parallel
      const [sentResult, receivedResult, usersResult, typesResult, prioritiesResult] = await Promise.all([
        apiService.getSentMessages(),
        apiService.getReceivedMessages(),
        apiService.getAllUsers(),
        apiService.getMessageTypes(),
        apiService.getMessagePriorities(),
      ])

      if (sentResult.success) {
        setSentMessages(sentResult.data || [])
      } else {
        console.error("Failed to load sent messages:", sentResult.message)
        toast.error("Không thể tải tin nhắn đã gửi")
      }

      if (receivedResult.success) {
        setReceivedMessages(receivedResult.data || [])
      } else {
        console.error("Failed to load received messages:", receivedResult.message)
        toast.error("Không thể tải tin nhắn đã nhận")
      }

      if (usersResult.success) {
        setUsers(usersResult.data || [])
      } else {
        console.error("Failed to load users:", usersResult.message)
        toast.error("Không thể tải danh sách người dùng")
      }

      if (typesResult.success) {
        setMessageTypes(typesResult.data || [])
      } else {
        console.error("Failed to load message types:", typesResult.message)
        // Set default message types if API fails
        setMessageTypes([
          { value: "GENERAL", label: "Tin nhắn chung" },
          { value: "ANNOUNCEMENT", label: "Thông báo" },
          { value: "SCHEDULE_UPDATE", label: "Cập nhật lịch" },
          { value: "ACADEMIC_INFO", label: "Thông tin học tập" },
          { value: "ADMINISTRATIVE", label: "Hành chính" },
        ])
      }

      if (prioritiesResult.success) {
        setMessagePriorities(prioritiesResult.data || [])
      } else {
        console.error("Failed to load message priorities:", prioritiesResult.message)
        // Set default priorities if API fails
        setMessagePriorities([
          { value: "LOW", label: "Thấp" },
          { value: "NORMAL", label: "Bình thường" },
          { value: "HIGH", label: "Cao" },
          { value: "URGENT", label: "Khẩn cấp" },
        ])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Có lỗi xảy ra khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }

  const onCreateSubmit = async (data: CreateMessageData) => {
    try {
      setSubmitting(true)

      const messageData: CreateMessage = {
        subject: data.subject,
        content: data.content,
        messageType: data.messageType,
        priority: data.priority,
        isBroadcast: data.isBroadcast,
        recipientIds: data.isBroadcast ? [] : data.recipientIds || [],
      }

      const result = await apiService.sendMessage(messageData)

      if (result.success) {
        toast.success("Gửi tin nhắn thành công")
        setCreateDialogOpen(false)
        form.reset({
          messageType: "GENERAL",
          priority: "NORMAL",
          isBroadcast: false,
          recipientIds: [],
        })
        // Reload sent messages
        const sentResult = await apiService.getSentMessages()
        if (sentResult.success) {
          setSentMessages(sentResult.data || [])
        }
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi gửi tin nhắn")
      }
    } catch (error: any) {
      console.error("Error creating message:", error)
      toast.error(error.message || "Có lỗi xảy ra khi gửi tin nhắn")
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetail = async (message: Message) => {
    try {
      // Get full message details
      const result = await apiService.getMessageById(message.id)
      if (result.success) {
        setSelectedMessage(result.data)
        setDetailDialogOpen(true)

        // Mark as read if it's a received message
        if (receivedMessages.find((m) => m.id === message.id) && !message.isRead) {
          await apiService.markMessageAsRead(message.id)
          // Update local state
          setReceivedMessages(
            receivedMessages.map((m) =>
              m.id === message.id ? { ...m, isRead: true, readAt: new Date().toISOString() } : m,
            ),
          )
        }
      } else {
        toast.error("Không thể tải chi tiết tin nhắn")
      }
    } catch (error) {
      console.error("Error viewing message detail:", error)
      toast.error("Có lỗi xảy ra khi xem chi tiết tin nhắn")
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <Zap className="h-3 w-3 mr-1" />
            Khẩn cấp
          </Badge>
        )
      case "HIGH":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cao
          </Badge>
        )
      case "NORMAL":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Bình thường
          </Badge>
        )
      case "LOW":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
            <Clock className="h-3 w-3 mr-1" />
            Thấp
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch (error) {
      return dateString
    }
  }

  const unreadCount = receivedMessages.filter((m) => !m.isRead).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tin nhắn</h1>
          <p className="text-slate-600 mt-1">Gửi và nhận tin nhắn với giáo viên</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Soạn tin nhắn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Soạn tin nhắn mới</DialogTitle>
              <DialogDescription>Gửi tin nhắn đến giáo viên</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiêu đề</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tiêu đề tin nhắn..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="messageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại tin nhắn</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại tin nhắn" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {messageTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mức độ ưu tiên</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn mức độ ưu tiên" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {messagePriorities.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isBroadcast"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Gửi đến tất cả giáo viên</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Tin nhắn sẽ được gửi đến tất cả giáo viên trong hệ thống
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                {!isBroadcast && (
                  <FormField
                    control={form.control}
                    name="recipientIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Người nhận</FormLabel>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`user-${user.id}`}
                                checked={field.value?.includes(user.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || []
                                  if (checked) {
                                    field.onChange([...currentValue, user.id])
                                  } else {
                                    field.onChange(currentValue.filter((id) => id !== user.id))
                                  }
                                }}
                              />
                              <label
                                htmlFor={`user-${user.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {user.fullName} ({user.email})
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nội dung</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Nhập nội dung tin nhắn..." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Đang gửi..." : "Gửi tin nhắn"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Messages Tabs */}
      <Tabs defaultValue="received" className="space-y-4">
        <TabsList>
          <TabsTrigger value="received">
            Hộp thư đến ({receivedMessages.length})
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Đã gửi ({sentMessages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          <MessagesList messages={receivedMessages} onViewDetail={handleViewDetail} type="received" />
        </TabsContent>

        <TabsContent value="sent">
          <MessagesList messages={sentMessages} onViewDetail={handleViewDetail} type="sent" />
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  {selectedMessage.senderName} - {formatDateTime(selectedMessage.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedMessage.messageTypeDisplay}</Badge>
                  {getPriorityBadge(selectedMessage.priority)}
                  {selectedMessage.isBroadcast && (
                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                      <Users className="h-3 w-3 mr-1" />
                      Gửi tất cả
                    </Badge>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-md">
                  <div className="whitespace-pre-wrap text-sm">{selectedMessage.content}</div>
                </div>

                {selectedMessage.recipients && selectedMessage.recipients.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Người nhận ({selectedMessage.recipients.length})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedMessage.recipients.map((recipient) => (
                        <div
                          key={recipient.id}
                          className="flex items-center justify-between text-sm p-2 bg-white rounded border"
                        >
                          <div>
                            <span className="font-medium">{recipient.recipientName}</span>
                            <span className="text-slate-600 ml-2">({recipient.recipientEmail})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {recipient.isRead ? (
                              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                <MailOpen className="h-3 w-3 mr-1" />
                                Đã đọc
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                                <Mail className="h-3 w-3 mr-1" />
                                Chưa đọc
                              </Badge>
                            )}
                            {recipient.readAt && (
                              <span className="text-xs text-slate-500">{formatDateTime(recipient.readAt)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MessagesList({
  messages,
  onViewDetail,
  type,
}: {
  messages: Message[]
  onViewDetail: (message: Message) => void
  type: "sent" | "received"
}) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <Zap className="h-3 w-3 mr-1" />
            Khẩn cấp
          </Badge>
        )
      case "HIGH":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cao
          </Badge>
        )
      case "NORMAL":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Bình thường
          </Badge>
        )
      case "LOW":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
            <Clock className="h-3 w-3 mr-1" />
            Thấp
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
    } catch (error) {
      return dateString
    }
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có tin nhắn</h3>
          <p className="text-slate-600 text-center">
            {type === "sent" ? "Bạn chưa gửi tin nhắn nào" : "Bạn chưa nhận tin nhắn nào"}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {messages.map((message) => (
        <Card
          key={message.id}
          className={`cursor-pointer transition-colors hover:bg-slate-50 ${
            type === "received" && !message.isRead ? "border-blue-200 bg-blue-50/30" : ""
          }`}
          onClick={() => onViewDetail(message)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {type === "received" && !message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    {message.subject}
                  </CardTitle>
                  <CardDescription>
                    {type === "sent" ? "Gửi đến" : "Từ"}: {message.senderName} ({message.senderEmail})
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(message.priority)}
                {message.isBroadcast && (
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                    <Users className="h-3 w-3 mr-1" />
                    Tất cả
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{message.messageTypeDisplay}</Badge>
                <span className="text-sm text-slate-600">{formatDateTime(message.createdAt)}</span>
              </div>

              <p className="text-slate-700 line-clamp-2">{message.content}</p>

              {type === "sent" && message.recipients && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {message.recipients.length} người nhận
                    {message.recipients.filter((r) => r.isRead).length > 0 && (
                      <span className="text-green-600 ml-2">
                        ({message.recipients.filter((r) => r.isRead).length} đã đọc)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
