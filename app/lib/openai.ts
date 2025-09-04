// OpenAI ChatGPT integration for fact-checking
import OpenAI from "openai";
import { z } from "zod";
import { searchMultipleQueries, formatSearchContextForPrompt } from "./serper";

// Zod schema for validation
export const FactCheckResultSchema = z.object({
  decision: z.enum(["true", "false", "partially_true"]),
  confidence: z.number().min(0).max(100),
  summary: z.string(),
  investigationSuggestions: z.array(z.string()),
});

export type FactCheckResult = z.infer<typeof FactCheckResultSchema>;

// Note: With structured output, we don't need JSON extraction

// Initialize OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey =
    import.meta.env.VITE_OPENAI_API_KEY || "your_openai_api_key_here";

  if (apiKey === "your_openai_api_key_here") {
    throw new Error(
      "Please set your OpenAI API key in the environment variables"
    );
  }

  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Only for client-side usage
  });
}

export async function factCheckWithChatGPT(
  text: string,
  imageUrl?: string
): Promise<FactCheckResult> {
  try {
    const openai = getOpenAIClient();

    // Search for relevant context using Serper
    console.log("Searching for relevant context...");
    const searchContexts = await searchMultipleQueries(text, 3);
    const searchContextString = formatSearchContextForPrompt(searchContexts);
    console.log(
      "Search context retrieved:",
      searchContextString.substring(0, 500) + "..."
    );

    // Create the system prompt for Bengali news fact-checking
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

Example format:
{
  "decision": "partially_true",
  "confidence": 75,
  "summary": "আপনার বিশ্লেষণের সারসংক্ষেপ এখানে বাংলায় লিখুন",
  "investigationSuggestions": [
    "বাংলাদেশের সরকারি সূত্র যাচাই করুন",
    "প্রতিষ্ঠিত সংবাদ মাধ্যমের রিপোর্ট দেখুন",
    "সামাজিক মাধ্যমের তথ্য যাচাই করুন"
  ]
}

Focus on:
- Bangladeshi government sources and official statements
- Established Bengali news outlets (Prothom Alo, Daily Star, BBC Bangla, etc.)
- Social media verification for viral content
- Political context and recent events in Bangladesh
- Cultural sensitivity and local context

Be thorough, objective, and provide actionable suggestions for further investigation in Bengali.`;

    // Create the user message for Bengali news fact-checking
    let userMessage = `Please fact-check the following Bengali news text with focus on Bangladesh context:\n\n"${text}"`;

    if (imageUrl) {
      userMessage += `\n\nAdditionally, please analyze this image for visual context and potential misinformation related to Bangladesh. The image might be a news thumbnail, social media post, or related visual content. Consider if the image matches the news context and if it could be misleading or manipulated: ${imageUrl}`;
    }

    // Add search context to the user message
    userMessage += `\n\n${searchContextString}`;

    // Prepare messages for OpenAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    // Call OpenAI API with structured output
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4 with vision capabilities
      messages: messages,
      max_tokens: 1000,
      temperature: 0.3, // Lower temperature for more consistent fact-checking
      response_format: { type: "json_object" },
    });

    // Get the JSON response
    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from ChatGPT");
    }

    console.log("OpenAI JSON response:", content);

    try {
      // Parse the JSON response
      const parsedResult = JSON.parse(content);
      console.log("Parsed result:", parsedResult);

      // Validate with Zod schema
      const validatedResult = FactCheckResultSchema.parse(parsedResult);
      console.log("Validated result:", validatedResult);

      return validatedResult;
    } catch (parseError) {
      // If JSON parsing or validation fails, create a fallback response
      console.error(
        "Failed to parse or validate ChatGPT response:",
        parseError
      );
      console.error("Original content:", content);

      return {
        decision: "partially_true" as const,
        confidence: 50,
        summary:
          "বিশ্লেষণ সম্পন্ন হয়েছে, কিন্তু প্রতিক্রিয়ার ফরম্যাট অপ্রত্যাশিত ছিল। অনুগ্রহ করে অতিরিক্ত সূত্রের মাধ্যমে তথ্য যাচাই করুন।",
        investigationSuggestions: [
          "তথ্যের উৎস যাচাই করুন",
          "এই বিষয়ে সাম্প্রতিক আপডেট দেখুন",
          "বহু নির্ভরযোগ্য সূত্রের সাথে তুলনা করুন",
        ],
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(
      `Failed to fact-check: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
