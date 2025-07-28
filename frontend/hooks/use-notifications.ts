"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService, type Message } from "@/lib/api"

export function useNotifications() {
  const [announcements, setAnnouncements] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setError(null)
      const [announcementsResponse, countResponse] = await Promise.all([
        apiService.getAnnouncements(5),
        apiService.getUnreadAnnouncementsCount(),
      ])

      if (announcementsResponse.success) {
        setAnnouncements(announcementsResponse.data)
      }

      if (countResponse.success) {
        setUnreadCount(countResponse.data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (messageId: number) => {
    try {
      await apiService.markMessageAsRead(messageId)

      // Update local state
      setAnnouncements((prev) =>
        prev.map((announcement) => (announcement.id === messageId ? { ...announcement, isRead: true } : announcement)),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }, [])

  const refreshNotifications = useCallback(() => {
    setLoading(true)
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    fetchNotifications()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    announcements,
    unreadCount,
    loading,
    error,
    markAsRead,
    refreshNotifications,
  }
}
