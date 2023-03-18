import { useEffect, useState } from "react";
import { createApi } from "unsplash-js";

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "",
});

const useUnsplashImage = (imageId?: string): string => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (!imageId) {
      return;
    }
    unsplash.photos
      .get({ photoId: imageId })
      .then((res: any) => {
        setImageUrl(res.response.urls.regular);
      })
      .catch((error: Error) => console.error(error));
  }, [imageId]);

  return imageUrl;
};

export default useUnsplashImage;
