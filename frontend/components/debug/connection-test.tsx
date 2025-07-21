"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiService } from "@/lib/api"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export function ConnectionTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await apiService.testConnection()
      setResult({
        success: true,
        message: `✅ Backend connected successfully! Response: ${response}`,
      })
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Backend connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔧</span>
          Backend Connection Test
        </CardTitle>
        <CardDescription>Test kết nối với backend server</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <div>
            <strong>Backend URL:</strong> http://localhost:8080
          </div>
          <div>
            <strong>Test Endpoint:</strong> /api/test/all
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
