import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VideoPlayer } from "./video-preview";

interface IMedia {
  id: string;
  media_url: string;
  media_type: string;
  media_path: string;
  tweet_id?: string;
}

interface MediaPreviewProps {
  media: IMedia[];
  initialImageIndex?: number;
  goToPost: () => void;
}

const MediaPreview = ({
  media,
  initialImageIndex = 0,
  goToPost,
}: MediaPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [touchStart, setTouchStart] = useState(0);

  const handlePrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const swipeDistance = touchStart - touchEnd;

    if (Math.abs(swipeDistance) > 40) {
      if (swipeDistance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  };

  const getGridLayout = () => {
    switch (media.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
      case 4:
        return "grid-cols-2";
      default:
        return "grid-cols-2";
    }
  };

  const getMediaStyle = (index: number) => {
    if (media.length === 1) return "row-span-1 max-h-[500px]";
    if (media.length === 2) return "row-span-1 max-h-[250px]";
    if (media.length === 3 && index === 0) return "row-span-2 max-h-[500px]";
    if (media.length === 3) return "row-span-1 max-h-[250px]";
    return "row-span-1 max-h-[250px]";
  };

  const renderMedia = (item: IMedia, inDialog: boolean = false) => {
    const isVideo = item.media_type.toLowerCase().includes("video");

    if (isVideo) {
      return (
        <VideoPlayer
          src={item.media_url}
          id={item.id}
          inDialog={inDialog}
          className={inDialog ? "object-contain" : "object-cover"}
        />
      );
    }

    return (
      <div
        className={`relative w-full h-full ${
          inDialog ? "flex items-center justify-center" : ""
        }`}
      >
        <Image
          src={item.media_url}
          alt="Media content"
          width={1000}
          height={1000}
          className={`${
            inDialog
              ? "h-[80-vh] max-h-[90vh] w-auto object-contain"
              : "w-full h-full object-cover"
          }`}
          priority={true}
        />
      </div>
    );
  };

  return (
    <>
      <div className="relative mt-2 rounded-xl overflow-hidden">
        <div
          className={`grid ${getGridLayout()} gap-0.5 bg-neutral-800`}
          style={{ maxHeight: "500px" }}
        >
          {media.map((item, index) => (
            <div
              key={item.id}
              className={`relative overflow-hidden cursor-pointer ${getMediaStyle(
                index
              )}`}
              onClick={() => {
                setCurrentIndex(index);
                setIsOpen(true);
              }}
            >
              {renderMedia(item)}
            </div>
          ))}
        </div>
        {media.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {media.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] bg-transparent border-none p-0 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative w-full h-[90vh] flex items-center justify-center"
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest(".media-content")) return;
              setIsOpen(false);
            }}
          >
            {media.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors sm:flex hidden"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors sm:flex hidden"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div className="media-content relative max-w-full max-h-full px-4">
              {renderMedia(media[currentIndex], true)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MediaPreview;
