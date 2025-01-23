import { IChosenImages } from "../type";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_VIDEO_DURATION = 140; // seconds

const validateVideo = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration <= MAX_VIDEO_DURATION);
    };
    video.src = URL.createObjectURL(file);
  });
};

const getMediaDimensions = (
  file: File,
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };
      video.src = url;
    } else {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };
      img.src = url;
    }
  });
};

export const chooseImages = async ({
  event,
  chosenImagesLength,
  setChosenImages,
}: {
  event: React.ChangeEvent<HTMLInputElement>;
  chosenImagesLength: number;
  setChosenImages: React.Dispatch<React.SetStateAction<IChosenImages[]>>;
}) => {
  const files = event?.target?.files;
  if (!files) return;

  if (files.length + chosenImagesLength > 4) {
    event.target.value = "";
    return console.log("Please choose either 1 GIF or up to 4 photos/videos.");
  }

  for (const file of files) {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.log(`File ${file.name} exceeds maximum size of 50MB`);
      continue;
    }

    // Check video duration if it's a video
    if (file.type.startsWith("video/")) {
      const isValidDuration = await validateVideo(file);
      if (!isValidDuration) {
        console.log(
          `Video ${file.name} exceeds maximum duration of ${MAX_VIDEO_DURATION} seconds`
        );
        continue;
      }
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const dimensions = await getMediaDimensions(
        file,
        reader.result as string
      );

      setChosenImages((prev) => [
        ...prev,
        {
          url: reader.result,
          id: Math.random(),
          file: file,
          width: dimensions.width,
          height: dimensions.height,
          type: file.type.startsWith("video/") ? "video" : "image",
        },
      ]);
    };
  }

  event.target.value = "";
};
