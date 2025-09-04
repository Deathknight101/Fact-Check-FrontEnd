import { useState, useEffect } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  FileText,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { Button } from "~/components/ui/button";
// Removed client-side image upload - now handled by server actions

interface FactCheckResult {
  decision: "true" | "false" | "partially_true";
  confidence: number;
  summary: string;
  investigationSuggestions: string[];
  sources: string[];
}

export default function FactCheckerPage() {
  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Set page title and meta description
  useEffect(() => {
    document.title = "বাংলা সংবাদ যাচাইকারী - AI চালিত ফ্যাক্ট চেকার";

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "বাংলাদেশের সংবাদ ও তথ্য যাচাই করুন AI চালিত ফ্যাক্ট চেকার দিয়ে। ছবি সহ বা ছবি ছাড়াই যেকোনো সংবাদ যাচাই করুন।"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "বাংলাদেশের সংবাদ ও তথ্য যাচাই করুন AI চালিত ফ্যাক্ট চেকার দিয়ে। ছবি সহ বা ছবি ছাড়াই যেকোনো সংবাদ যাচাই করুন।";
      document.head.appendChild(meta);
    }
  }, []);

  // Update title when result changes
  useEffect(() => {
    if (result) {
      const decisionText = getDecisionText(result.decision);
      document.title = `${decisionText} - বাংলা সংবাদ যাচাইকারী`;
    }
  }, [result]);

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ছবি আপলোড করতে সমস্যা হয়েছে");
      }

      const result = await response.json();
      setImageUrl(result.imageUrl);
      setSelectedImage(file);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ছবি আপলোড করতে সমস্যা হয়েছে"
      );
      setSelectedImage(null);
      setImageUrl(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleFactCheckAnother = () => {
    setInputText("");
    setSelectedImage(null);
    setImageUrl(null);
    setResult(null);
    setError("");
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError("অনুগ্রহ করে একটি সংবাদ লিখুন");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/fact-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("ফ্যাক্ট চেক করতে সমস্যা হয়েছে");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি ত্রুটি ঘটেছে");
    } finally {
      setIsLoading(false);
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "true":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "false":
        return <XCircle className="h-6 w-6 text-red-600" />;
      case "partially_true":
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case "true":
        return "সত্য";
      case "false":
        return "মিথ্যা";
      case "partially_true":
        return "আংশিক সত্য";
      default:
        return "";
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "true":
        return "bg-green-100 text-green-800 border-green-200";
      case "false":
        return "bg-red-100 text-red-800 border-red-200";
      case "partially_true":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-[70vh] bg-background px-4 py-24 flex justify-center items-start">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2">
            বাংলা ফ্যাক্ট চেকার
          </h1>
          <p className="text-base sm:text-lg text-text">
            AI চালিত সংবাদ যাচাইকরণ সিস্টেম
          </p>
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
              disabled={isLoading}
              className="w-full min-h-[120px] max-h-[300px] text-base overflow-y-auto resize-none"
              style={{ fontFamily: "SolaimanLipi, Arial, sans-serif" }}
            />

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label
                className={`text-sm font-medium ${isLoading ? "text-muted-foreground" : "text-foreground"}`}
              >
                সংবাদ সংক্রান্ত ছবি সংযুক্ত করুন (ঐচ্ছিক)
              </label>
              <p className="text-xs text-muted-foreground">
                ছবিটি সংবাদের থাম্বনেইল, সোশ্যাল মিডিয়া পোস্ট, বা সম্পর্কিত
                ভিজুয়াল কনটেন্ট হতে পারে
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingImage || isLoading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 disabled:opacity-50"
              />

              {isUploadingImage && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  ছবি আপলোড হচ্ছে...
                </div>
              )}

              {selectedImage && imageUrl && (
                <div className="space-y-2">
                  <div className="text-sm text-green-500">
                    ✅ ছবি সফলভাবে আপলোড হয়েছে: {selectedImage.name} (
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                  <div className="w-full max-w-sm mx-auto">
                    <img
                      src={imageUrl}
                      alt="সংবাদ সংক্রান্ত ছবি"
                      className="w-full h-auto rounded-lg border"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ছবিটি সংবাদের সাথে সম্পর্কিত কিনা এবং এটি বিভ্রান্তিকর হতে
                    পারে কিনা তা যাচাই করা হবে
                  </p>
                </div>
              )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !inputText.trim() || isUploadingImage}
              className="w-full"
            >
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
                  <Badge
                    className={`text-lg px-4 py-2 ${getDecisionColor(result.decision)}`}
                  >
                    {getDecisionText(result.decision)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    নির্ভরযোগ্যতা: {Math.round(result.confidence)}%
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2 text-foreground">
                    সারসংক্ষেপ:
                  </h3>
                  <p className="text-foreground/80 leading-relaxed">
                    {result.summary}
                  </p>
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
                      <div className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-foreground/80 leading-relaxed">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    রেফারেন্স সূত্র
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.sources.map((source, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all text-sm"
                        >
                          {source}
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fact Check Another Button */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleFactCheckAnother}
                variant="outline"
                className="px-8 py-2"
              >
                <Search className="mr-2 h-4 w-4" />
                আরেকটি সংবাদ যাচাই করুন
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            এই সিস্টেমটি AI চালিত এবং ১০০% নির্ভুলতার গ্যারান্টি দেয় না।
            গুরুত্বপূর্ণ তথ্যের জন্য অতিরিক্ত যাচাইকরণ করুন।
          </p>
        </div>
      </div>
    </div>
  );
}
