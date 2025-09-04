import type { ActionFunctionArgs } from "react-router";
import { factCheckAction } from "~/lib/server-actions";

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Convert JSON request to FormData for server action
    const body = await request.json();
    const formData = new FormData();
    formData.append("text", body.text);
    if (body.imageUrl) {
      formData.append("imageUrl", body.imageUrl);
    }

    // Call server action for fact-checking
    console.log("=== BACKEND INPUT ===");
    console.log("Text:", body.text);
    console.log("Image URL:", body.imageUrl || "No image provided");

    const result = await factCheckAction(formData);

    if (result.success) {
      console.log("Fact-check result:", result.data);
      return Response.json(result.data);
    } else {
      console.error("Fact-check error:", result.error);
      return Response.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing fact-check request:", error);
    return Response.json(
      { error: "Failed to process fact-check request" },
      { status: 500 }
    );
  }
}
