"use client";

import { useEffect, useState } from "react";
import { Brush } from "lucide-react";

interface ImageGeneratedProps {
  generateImage: (text: string) => Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
    id?: number;
  }>;
  getImages: () => Promise<Record<string, any>[] | undefined>;
}

interface ImageGen {
  url: string;
  name: string;
  id: number;
}

export default function ImageGenerated({
  generateImage,
  getImages,
}: ImageGeneratedProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [images, setImages] = useState<ImageGen[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await generateImage(inputText);
      if (!result.success) {
        throw new Error(result.error || "Failed to generate image");
      }
      if (result.imageUrl && result.id) {
        const newImage: ImageGen = {
          url: result.imageUrl,
          name: inputText,
          id: result.id,
        };

        setImages(prev => [newImage, ...prev ]);
        setInputText("");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUrlImages = async () => {
    try {
      const data = await getImages();
      data?.map(record => {
        const img = new Image();
        const url = record.name;
        const name = record.value;
        const id = record.id;
        const image: ImageGen = { url, name, id };
        img.onload = () => {
          setImages(prev => {
            const isDuplicate = prev.some(
              existingImage => existingImage.id === image.id
            );
            if (isDuplicate) {
              return prev;
            }
            return [image,...prev];
          });
        };
        img.src = url;
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    try {
      getUrlImages();
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between p-8">
      <main className="flex-1  max-w-5xl mx-auto">
        <div className="flex justify-center w-full">
          <h1 className="flex items-center gap-2 text-5xl mb-8">
            <Brush className="h-8 w-8" /> Paicasso
          </h1>
        </div>
        <div className="w-full  mx-auto mb-10">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-black/[.05] dark:bg-white/[.06] border border-black/[.08] dark:border-white/[.145] focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                placeholder="Describe the image you want to generate..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-lg bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {" "}
          {images &&
            images.map(img => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt={img.name} className="w-full h-auto" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                  <h3 className="text-white">{img.name}</h3>
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
