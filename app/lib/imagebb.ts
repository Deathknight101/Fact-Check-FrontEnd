// ImageBB integration utility
export interface ImageBBResponse {
  data: {
    url: string;
    delete_url: string;
    id: string;
    title: string;
    size: number;
    time: string;
  };
  success: boolean;
  status: number;
}

export async function uploadImageToImageBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  // You'll need to get your API key from https://api.imgbb.com/
  // For now, using a placeholder - replace with your actual API key
  const apiKey = import.meta.env.VITE_IMAGEBB_API_KEY || "your_api_key_here";

  if (apiKey === "your_api_key_here") {
    throw new Error(
      "Please set your ImageBB API key in the environment variables"
    );
  }

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to ImageBB");
  }

  const result: ImageBBResponse = await response.json();

  if (!result.success) {
    throw new Error("ImageBB upload failed");
  }

  return result.data.url;
}
