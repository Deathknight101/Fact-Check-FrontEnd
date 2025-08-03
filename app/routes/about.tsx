import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Users, Target, BookOpen, Globe, Shield, Brain, Database, TrendingUp } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    { name: "Sajida", role: "Research Lead" },
    { name: "Mahadi", role: "Data Scientist" },
    { name: "John", role: "ML Engineer" },
    { name: "Rabby", role: "Backend Developer" },
  ]

  const objectives = [
    "Analyze the performance of various Large Language Models (LLMs)",
    "Compare model behavior in detecting false claims across multiple languages",
    "Assess multilingual capabilities focusing on Bengali language performance",
    "Investigate models' strengths and weaknesses in reasoning and accuracy",
    "Create a comprehensive Bengali misinformation dataset",
    "Evaluate models like GPT-3.5-Turbo, BanglaBERT, and Mistral-7B",
    "Design a framework for misinformation detection in low-resource languages",
  ]

  return (
    <div className="min-h-screen bg-background py-10 mx-auto max-w-5xl ">
      {/* Header */}
      <div className="shadow-sm border-b mx-2 rounded-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text mb-2">বাংলা ফ্যাক্ট চেকার প্রকল্প সম্পর্কে</h1>
            <p className="text-xl text-text">About the Bengali Fact Checker Project</p>
            <div className="mt-4 flex justify-center">
              <p className="text-lg px-4 py-2 text-center">
                University of Liberal Arts Bangladesh - Capstone Project
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="h-6 w-6" />
              প্রকল্প পরিচিতি / Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed text-text">
              ডিজিটাল মিডিয়ার মাধ্যমে তথ্যের প্রবেশাধিকার সময়ের সাথে দ্রুত বৃদ্ধি পাচ্ছে। এর ব্যাপক প্রবেশাধিকার এমন তথ্য ছড়ায় যা মানুষের মতামত
              গঠন করে এবং তাদের জীবনের পছন্দগুলিকে প্রভাবিত করে।
            </p>
            <p className="text-lg leading-relaxed text-text">
              The access to information through digital media is expanding rapidly with time. While this advancement
              helps people become more aware, it also holds the potential to mislead people through the spread of "fake
              news" and disrupt societal harmony across health, education, industry, and political sectors.
            </p>
            <div className="bg-card p-4 rounded-lg border-l-4 border-primary">
              <p className="text-text font-medium">
                <strong>Key Challenge:</strong> Bengali, despite being one of the most spoken languages globally with
                256 million speakers, remains under-served by fact-checking tools due to its status as a low-resource
                language.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6" />
              গবেষণা দল / Research Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-text">Team Members</h3>
                <div className="grid grid-cols-2 gap-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-semibold text-background">{member.name}</h4>
                      <p className="text-sm text-background/70">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-text">Supervision</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold text-background">Nafees Monsoor</h4>
                    <p className="text-background">Capstone Supervisor</p>
                    <p className="text-sm text-background/70 mt-2">University of Liberal Arts Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problem Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-6 w-6" />
              সমস্যা বিবৃতি / Problem Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-gray-800 leading-relaxed">
                The proliferation of misinformation in rapidly growing digital media imposes a significant threat on
                public decision making and understanding, especially in low-resource and unexplored languages like
                Bengali. This leaves Bengali speakers vulnerable to the detrimental effects of misinformation.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-background mb-2">Real Impact Example</h4>
                <p className="text-sm text-background">
                  In Bangladesh, the price of salt doubled due to a rumor of its shortage in 2019, demonstrating the
                  real-world consequences of misinformation.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-background mb-2">Research Gap</h4>
                <p className="text-sm text-background">
                  Existing studies lack appropriate datasets and exploration of Large Language Models for
                  state-of-the-art misinformation detection in Bengali.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Approach */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="h-6 w-6" />
              আমাদের পদ্ধতি / Our Approach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-600">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-text mb-2">Dataset Creation</h3>
                <p className="text-sm text-text">
                  Curating a diverse collection of Bengali misinformation instances from various digital media sources
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-600">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-text mb-2">LLM Evaluation</h3>
                <p className="text-sm text-text">
                  Testing Large Language Models including GPT-3.5-Turbo, BanglaBERT, and Mistral-7B
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-primary">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-text mb-2">Framework Design</h3>
                <p className="text-sm text-text">
                  Developing a framework to improve misinformation detection in Bengali and other low-resource languages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6" />
              গবেষণার উদ্দেশ্য / Research Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {objectives.map((objective, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-card text-primary rounded-full flex items-center justify-center text-sm font-medium border border-primary">
                    {index + 1}
                  </div>
                  <p className="text-text leading-relaxed">{objective}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact & Motivation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="h-6 w-6" />
              প্রভাব ও অনুপ্রেরণা / Impact & Motivation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-text mb-3">Expected Impact</h3>
              <p className="text-text leading-relaxed mb-4">
                This research will support the fact-checking community in Bangladesh by providing necessary tools and
                resources to combat misinformation in Bengali. It addresses the critical gap in fact-checking systems
                for low-resource languages.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg">
                  <h4 className="font-semibold text-text mb-2">For Bengali Speakers</h4>
                  <p className="text-sm text-text">
                    Protecting 256 million Bengali speakers from misinformation across health, politics, and social
                    media
                  </p>
                </div>
                <div className="bg-card rounded-lg">
                  <h4 className="font-semibold text-text mb-2">For Research Community</h4>
                  <p className="text-sm text-text">
                    Contributing to the advancement of fact-checking systems for low-resource languages globally
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <Separator className="mb-6" />
          <div className="space-y-2">
            <p className="text-lg font-semibold text-text">University of Liberal Arts Bangladesh</p>
            <p className="text-text">Computer Science & Engineering Department</p>
            <p className="text-sm text-gray-500">Capstone Project - 2025</p>
          </div>
        </div>
      </div>
    </div>
  )
}
