import type { ActionFunctionArgs } from "react-router";
import { uploadImageAction } from "~/lib/server-actions";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();

    // Call server action for image upload
    const result = await uploadImageAction(formData);

    if (result.success) {
      return Response.json(result.data);
    } else {
      return Response.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing image upload request:", error);
    return Response.json(
      { error: "Failed to process image upload request" },
      { status: 500 }
    );
  }
}
