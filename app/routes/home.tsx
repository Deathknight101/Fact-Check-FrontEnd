import { useState } from "react"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { CheckCircle, XCircle, Search, Loader2, FileText, AlertTriangle } from "lucide-react"
import { Button } from "~/components/ui/button"


interface FactCheckResult {
  decision: "true" | "false" | "partially_true"
  confidence: number
  summary: string
  investigationSuggestions: string[]
  sources?: string[]
}

export default function FactCheckerPage() {
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<FactCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError("অনুগ্রহ করে একটি সংবাদ লিখুন")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/fact-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error("ফ্যাক্ট চেক করতে সমস্যা হয়েছে")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে")
    } finally {
      setIsLoading(false)
    }
  }

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "true":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "false":
        return <XCircle className="h-6 w-6 text-red-600" />
      case "partially_true":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      default:
        return null
    }
  }

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case "true":
        return "সত্য"
      case "false":
        return "মিথ্যা"
      case "partially_true":
        return "আংশিক সত্য"
      default:
        return ""
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "true":
        return "bg-green-100 text-green-800 border-green-200"
      case "false":
        return "bg-red-100 text-red-800 border-red-200"
      case "partially_true":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-[70vh] bg-background p-4 flex justify-center items-center">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-2">বাংলা ফ্যাক্ট চেকার</h1>
          <p className="text-lg text-text">AI চালিত সংবাদ যাচাইকরণ সিস্টেম</p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              সংবাদ লিখুন
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="এখানে আপনার সংবাদটি লিখুন যা যাচাই করতে চান..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[120px] text-base"
              style={{ fontFamily: "SolaimanLipi, Arial, sans-serif" }}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button onClick={handleSubmit} disabled={isLoading || !inputText.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  যাচাই করা হচ্ছে...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  ফ্যাক্ট চেক করুন
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Decision Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getDecisionIcon(result.decision)}
                  যাচাইকরণ ফলাফল
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className={`text-lg px-4 py-2 ${getDecisionColor(result.decision)}`}>
                    {getDecisionText(result.decision)}
                  </Badge>
                  <div className="text-sm text-gray-600">নির্ভরযোগ্যতা: {Math.round(result.confidence)}%</div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">সারসংক্ষেপ:</h3>
                  <p className="text-gray-700 leading-relaxed">{result.summary}</p>
                </div>
              </CardContent>
            </Card>

            {/* Investigation Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  অনুসন্ধানের পরামর্শ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.investigationSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sources (if available) */}
            {result.sources && result.sources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>রেফারেন্স সূত্র</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.sources.map((source, index) => (
                      <div key={index} className="text-sm text-blue-600 hover:text-blue-800">
                        • {source}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>এই সিস্টেমটি AI চালিত এবং ১০০% নির্ভুলতার গ্যারান্টি দেয় না। গুরুত্বপূর্ণ তথ্যের জন্য অতিরিক্ত যাচাইকরণ করুন।</p>
        </div>
      </div>
    </div>
  )
}
