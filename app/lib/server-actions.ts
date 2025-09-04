// Server actions for secure API calls
import { z } from "zod";
import OpenAI from "openai";

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 10, // 10 requests per window
  windowMs: 60 * 1000, // 1 minute window
  maxRequestsPerDay: 100, // 100 requests per day
};

// Input validation schemas
const FactCheckInputSchema = z.object({
  text: z
    .string()
    .min(10, "Text must be at least 10 characters")
    .max(5000, "Text must be less than 5000 characters"),
  imageUrl: z.string().url().optional(),
});

// Rate limiting function
function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT.maxRequests - 1,
      resetTime: now + RATE_LIMIT.windowMs,
    };
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userLimit.resetTime,
    };
  }

  // Increment count
  userLimit.count++;
  rateLimitMap.set(ip, userLimit);

  return {
    allowed: true,
    remaining: RATE_LIMIT.maxRequests - userLimit.count,
    resetTime: userLimit.resetTime,
  };
}

// Get client IP (simplified for Vercel)
function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

// Server-side OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OpenAI API key not configured on server");
  }

  return new OpenAI({
    apiKey: apiKey,
  });
}

// Server-side Serper search
async function searchBengaliNews(query: string, numResults: number = 5) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error("Serper API key not configured on server");
  }

  // Enhance query for Bengali news search
  const bengaliNewsSites = [
    "site:prothomalo.com",
    "site:thedailystar.net",
    "site:bbc.com/bengali",
    "site:bdnews24.com",
    "site:jugantor.com",
    "site:ittefaq.com.bd",
    "site:samakal.com",
    "site:banglanews24.com",
  ];

  const temporalKeywords = ["সাম্প্রতিক", "আজ", "গত সপ্তাহ", "২০২৪", "২০২৩"];
  const siteFilter = bengaliNewsSites.slice(0, 3).join(" OR ");
  const temporalFilter = temporalKeywords[0];
  const enhancedQuery = `(${siteFilter}) (${temporalFilter}) "${query}"`;

  try {
    console.log("=== SERPER API CALL ===");
    console.log("Enhanced Query:", enhancedQuery);
    console.log("Number of Results:", numResults);
    console.log("API Key present:", !!apiKey);

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: enhancedQuery,
        num: numResults,
        gl: "bd",
        hl: "bn",
        safe: "active",
        type: "search",
      }),
    });

    console.log("Serper API Response Status:", response.status);
    console.log(
      "Serper API Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Serper API Error Response:", errorText);
      throw new Error(
        `Serper API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Serper API Raw Response:", JSON.stringify(data, null, 2));

    return {
      results: data.organic || [],
      answerBox: data.answerBox,
      searchTime: data.searchInformation?.time || "0",
      totalResults: data.searchInformation?.totalResults || "0",
    };
  } catch (error) {
    console.error("Error calling Serper API:", error);
    throw new Error(
      `Failed to search: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Server-side ImageBB upload
async function uploadImageToImageBB(file: File): Promise<string> {
  const apiKey = process.env.IMAGEBB_API_KEY;

  if (!apiKey) {
    throw new Error("ImageBB API key not configured on server");
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image to ImageBB");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("ImageBB upload failed");
    }

    return result.data.url;
  } catch (error) {
    console.error("Error uploading to ImageBB:", error);
    throw new Error(
      `Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Main fact-check server action
export async function factCheckAction(formData: FormData) {
  try {
    // Get client IP for rate limiting
    const request = new Request("http://localhost"); // Simplified for server action
    const clientIP = "server-action"; // In real implementation, get from request context

    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`
      );
    }

    // Validate input
    const text = formData.get("text") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    const validationResult = FactCheckInputSchema.safeParse({
      text,
      imageUrl: imageUrl || undefined,
    });

    if (!validationResult.success) {
      throw new Error(
        `Validation failed: ${validationResult.error.errors.map((e) => e.message).join(", ")}`
      );
    }

    const { text: validatedText, imageUrl: validatedImageUrl } =
      validationResult.data;

    // Search for context using Serper
    console.log("Searching for relevant context...");
    const searchResults = await searchBengaliNews(validatedText, 3);

    // Console log the search results
    console.log("=== SERPER SEARCH RESULTS ===");
    console.log("Query:", validatedText);
    console.log("Total Results:", searchResults.totalResults);
    console.log("Search Time:", searchResults.searchTime);
    console.log("Number of results:", searchResults.results.length);
    console.log("Results:", JSON.stringify(searchResults.results, null, 2));
    if (searchResults.answerBox) {
      console.log(
        "Answer Box:",
        JSON.stringify(searchResults.answerBox, null, 2)
      );
    }

    // Format search context
    let searchContextString = "=== SEARCH RESULTS FOR FACT-CHECKING ===\n\n";
    if (searchResults.results.length > 0) {
      searchContextString += `Search Results:\n`;
      searchContextString += `Total Results: ${searchResults.totalResults}\n`;
      searchContextString += `Search Time: ${searchResults.searchTime}ms\n\n`;

      searchResults.results.forEach((result: any, index: number) => {
        searchContextString += `${index + 1}. ${result.title}\n`;
        searchContextString += `   Source: ${result.link}\n`;
        searchContextString += `   Snippet: ${result.snippet}\n\n`;
      });
    }

    // Create OpenAI client
    const openai = getOpenAIClient();

    // Create system prompt
    const systemPrompt = `You are a specialized fact-checking assistant for Bengali news and information, specifically focused on Bangladesh. You are an expert in Bengali language, Bangladeshi politics, society, culture, and current events.

Your task is to:
1. Analyze Bengali news text for factual accuracy with focus on Bangladesh context
2. If an image is provided, analyze it for visual context and potential misinformation related to Bangladesh
3. Consider Bangladeshi political landscape, social issues, economic conditions, and cultural context
4. Use the provided search results to verify claims and provide accurate analysis
5. Cross-reference the information with multiple sources when available
6. Provide a decision: "true", "false", or "partially_true"
7. Give a confidence score (0-100) based on available evidence
8. Write a summary of your analysis in Bengali
9. Provide investigation suggestions in Bengali

IMPORTANT: Use the search results provided below to verify the claims. If the search results contradict or support the claims, mention this in your analysis. Base your confidence score on the quality and quantity of evidence found.

You must respond with a JSON object in the following exact format:
- decision: "true", "false", or "partially_true"
- confidence: number between 0-100
- summary: string in Bengali describing your analysis
- investigationSuggestions: array of strings in Bengali with suggestions
- sources: array of URLs from the search results that support your analysis

Example format:
{
  "decision": "partially_true",
  "confidence": 75,
  "summary": "আপনার বিশ্লেষণের সারসংক্ষেপ এখানে বাংলায় লিখুন",
  "investigationSuggestions": [
    "বাংলাদেশের সরকারি সূত্র যাচাই করুন",
    "প্রতিষ্ঠিত সংবাদ মাধ্যমের রিপোর্ট দেখুন",
    "সামাজিক মাধ্যমের তথ্য যাচাই করুন"
  ],
  "sources": [
    "https://example.com/news1",
    "https://example.com/news2"
  ]
}

Focus on:
- Bangladeshi government sources and official statements
- Established Bengali news outlets (Prothom Alo, Daily Star, BBC Bangla, etc.)
- Social media verification for viral content
- Political context and recent events in Bangladesh
- Cultural sensitivity and local context

Be thorough, objective, and provide actionable suggestions for further investigation in Bengali.`;

    // Create user message
    let userMessage = `Please fact-check the following Bengali news text with focus on Bangladesh context:\n\n"${validatedText}"`;

    if (validatedImageUrl) {
      userMessage += `\n\nAdditionally, please analyze this image for visual context and potential misinformation related to Bangladesh. The image might be a news thumbnail, social media post, or related visual content. Consider if the image matches the news context and if it could be misleading or manipulated: ${validatedImageUrl}`;
    }

    // Add search context
    userMessage += `\n\n${searchContextString}`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from ChatGPT");
    }

    // Parse and validate response
    const parsedResult = JSON.parse(content);

    // Validate response structure
    const resultSchema = z.object({
      decision: z.enum(["true", "false", "partially_true"]),
      confidence: z.number().min(0).max(100),
      summary: z.string(),
      investigationSuggestions: z.array(z.string()),
      sources: z.array(z.string()),
    });

    const validatedResult = resultSchema.parse(parsedResult);

    // Add Serper result URLs as sources if not already included
    const serperSources = searchResults.results
      .map((result: any) => result.link)
      .filter(Boolean);
    const combinedSources = [
      ...new Set([...validatedResult.sources, ...serperSources]),
    ];

    const finalResult = {
      ...validatedResult,
      sources: combinedSources,
    };

    return {
      success: true,
      data: finalResult,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetTime: rateLimit.resetTime,
      },
    };
  } catch (error) {
    console.error("Error in fact-check server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

// Image upload server action
export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get("image") as File;

    if (!file) {
      throw new Error("No image file provided");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    const imageUrl = await uploadImageToImageBB(file);

    return {
      success: true,
      data: { imageUrl },
    };
  } catch (error) {
    console.error("Error in image upload server action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
