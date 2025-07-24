"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Plus, Send, Inbox, Mail, MailOpen, AlertCircle, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  apiService,
  type Message,
  type CreateMessage,
  type MessageType,
  type MessagePriority,
  type User,
} from "@/lib/api"

const createMessageSchema = z.object({
  subject: z.string().min(1, {
    message: "Tiêu đề không được để trống",
  }),
  content: z.string().min(10, {
    message: "Nội dung phải có ít nhất 10 ký tự",
  }),
  messageType: z.string({
    required_error: "Vui lòng chọn loại tin nhắn",
  }),
  priority: z.string().optional(),
  isBroadcast: z.boolean().optional(),
  recipientIds: z.array(z.number()).min(1, {
    message: "Vui lòng chọn ít nhất một người nhận",
  }),
})

export default function MessagesPage() {
  const [sentMessages, setSentMessages] = useState<Message[]>([])
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([])
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([])
  const [messageTypes, setMessageTypes] = useState<MessageType[]>([])
  const [messagePriorities, setMessagePriorities] = useState<MessagePriority[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createMessageSchema>>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      priority: "NORMAL",
      isBroadcast: false,
      recipientIds: [],
    },
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sentResponse, receivedResponse, unreadResponse, typesResponse, prioritiesResponse, usersResponse] =
        await Promise.all([
          apiService.getSentMessages(),
          apiService.getReceivedMessages(),
          apiService.getUnreadMessages(),
          apiService.getMessageTypes(),
          apiService.getMessagePriorities(),
          apiService.getAllUsers(),
        ])

      if (sentResponse.success) {
        setSentMessages(sentResponse.data)
      }

      if (receivedResponse.success) {
        setReceivedMessages(receivedResponse.data)
      }

      if (unreadResponse.success) {
        setUnreadMessages(unreadResponse.data)
      }

      if (typesResponse.success) {
        setMessageTypes(typesResponse.data)
      }

      if (prioritiesResponse.success) {
        setMessagePriorities(prioritiesResponse.data)
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof createMessageSchema>) => {
    try {
      setSubmitting(true)
      const createMessage: CreateMessage = {
        subject: values.subject,
        content: values.content,
        messageType: values.messageType,
        priority: values.priority || "NORMAL",
        isBroadcast: values.isBroadcast || false,
        recipientIds: values.recipientIds,
      }

      const response = await apiService.sendMessage(createMessage)
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Tin nhắn đã được gửi thành công",
        })
        setDialogOpen(false)
        form.reset()
        fetchData()
      } else {
        toast({
          title: "Lỗi",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)
    setMessageDialogOpen(true)

    // Mark as read if it's a received message and not read yet
    if (message.isRead === false) {
      try {
        await apiService.markMessageAsRead(message.id)
        fetchData() // Refresh data to update read status
      } catch (error) {
        console.error("Error marking message as read:", error)
      }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Khẩn cấp</Badge>
      case "HIGH":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
            Cao
          </Badge>
        )
      case "NORMAL":
        return <Badge variant="outline">Bình thường</Badge>
      case "LOW":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
            Thấp
          </Badge>
        )
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <AlertCircle className="h-4 w-4" />
      case "SCHEDULE_UPDATE":
        return <Clock className="h-4 w-4" />
      case "ACADEMIC_INFO":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi })
  }

  const MessageCard = ({ message, showSender = true }: { message: Message; showSender?: boolean }) => (
    <Card
      className={cn(
        "cursor-pointer hover:bg-slate-50 transition-colors",
        message.isRead === false && "border-l-4 border-l-royal-500 bg-blue-50/30",
      )}
      onClick={() => handleMessageClick(message)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getMessageTypeIcon(message.messageType)}
            <CardTitle className="text-base">{message.subject}</CardTitle>
            {message.isRead === false && <div className="w-2 h-2 bg-royal-500 rounded-full" />}
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(message.priority)}
            {message.isBroadcast && <Badge variant="outline">Thông báo chung</Badge>}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-slate-600">
          {showSender && <span>Từ: {message.senderName}</span>}
          <span>{formatDate(message.createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-600 line-clamp-2">{message.content}</p>
      </CardContent>
    </Card>
  )

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

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received">Hộp thư đến</TabsTrigger>
            <TabsTrigger value="sent">Đã gửi</TabsTrigger>
            <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tin nhắn</h1>
          <p className="text-slate-600 mt-1">Gửi và nhận tin nhắn, thông báo</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-royal-500 hover:bg-royal-600 gap-2">
              <Plus className="h-4 w-4" />
              Soạn tin nhắn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Soạn tin nhắn mới</DialogTitle>
              <DialogDescription>Gửi tin nhắn hoặc thông báo đến người khác</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  name="recipientIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Người nhận</FormLabel>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                        {users.map((user) => (
                          <FormField
                            key={user.id}
                            control={form.control}
                            name="recipientIds"
                            render={({ field }) => {
                              return (
                                <FormItem key={user.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(user.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, user.id])
                                          : field.onChange(field.value?.filter((value) => value !== user.id))
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {user.fullName} ({user.role === "ADMIN" ? "Quản trị viên" : "Giáo viên"})
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isBroadcast"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Thông báo chung</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Đánh dấu là thông báo chung cho tất cả mọi người
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

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
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-royal-500 hover:bg-royal-600 gap-2">
                    <Send className="h-4 w-4" />
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
          <TabsTrigger value="received" className="gap-2">
            <Inbox className="h-4 w-4" />
            Hộp thư đến
            {unreadMessages.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                {unreadMessages.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Đã gửi
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <MailOpen className="h-4 w-4" />
            Chưa đọc
            {unreadMessages.length > 0 && (
              <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                {unreadMessages.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Inbox className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có tin nhắn nào</h3>
                <p className="text-slate-600">Bạn chưa nhận được tin nhắn nào</p>
              </CardContent>
            </Card>
          ) : (
            receivedMessages.map((message) => <MessageCard key={message.id} message={message} showSender={true} />)
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa gửi tin nhắn nào</h3>
                <p className="text-slate-600 mb-4">Bạn chưa gửi tin nhắn nào</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-royal-500 hover:bg-royal-600 gap-2">
                  <Plus className="h-4 w-4" />
                  Soạn tin nhắn đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            sentMessages.map((message) => <MessageCard key={message.id} message={message} showSender={false} />)
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MailOpen className="h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Không có tin nhắn chưa đọc</h3>
                <p className="text-slate-600">Tất cả tin nhắn đã được đọc</p>
              </CardContent>
            </Card>
          ) : (
            unreadMessages.map((message) => <MessageCard key={message.id} message={message} showSender={true} />)
          )}
        </TabsContent>
      </Tabs>

      {/* Message Detail Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedMessage && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {getMessageTypeIcon(selectedMessage.messageType)}
                  <DialogTitle>{selectedMessage.subject}</DialogTitle>
                </div>
                <div className="flex items-center justify-between">
                  <DialogDescription>
                    Từ: {selectedMessage.senderName} • {formatDate(selectedMessage.createdAt)}
                  </DialogDescription>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedMessage.priority)}
                    {selectedMessage.isBroadcast && <Badge variant="outline">Thông báo chung</Badge>}
                  </div>
                </div>
              </DialogHeader>
              <div className="py-4">
                <div className="whitespace-pre-wrap text-slate-700">{selectedMessage.content}</div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
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
