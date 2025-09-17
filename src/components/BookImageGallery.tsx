"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/BookCover";
import { ChevronLeft, ChevronRight, BookOpen, Search } from "lucide-react";

interface BookImageGalleryProps {
  title: string;
  cover_url?: string | null;
  images?: string[];
}

export function BookImageGallery({ title, cover_url, images = [] }: BookImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Use useMemo to ensure consistent value across renders
  const allImages = useMemo(() => {
    return cover_url ? [cover_url, ...images] : images;
  }, [cover_url, images]);
  
  // Move useEffect outside of conditional logic
  useEffect(() => {
    allImages.forEach((image) => {
      const img = new window.Image();
      img.src = image;
    });
  }, [allImages]);

  if (allImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
          <BookOpen className="h-24 w-24 text-neutral-400" />
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImage((prev: any) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev: any) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="overflow-hidden rounded-xl group relative">
        <div className="relative aspect-[3/4]">
          <BookCover
            src={allImages[currentImage]}
            alt={title}
            title={title}
            width={400}
            height={533}
            className={`w-full h-full transition-transform duration-300 ${
              isZoomed ? 'scale-110' : 'hover:scale-105'
            }`}
            priority={true}
            showFallback={true}
          />
          
          {/* Zoom button */}
          <Button
            variant="outline"
            size="md"
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Navigation arrows (only if multiple images) */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="md"
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="md"
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              className={`relative w-16 h-20 rounded-md overflow-hidden border-2 transition-all ${
                index === currentImage 
                  ? 'border-primary ring-2 ring-primary ring-offset-2' 
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => setCurrentImage(index)}
            >
              <Image
                src={image}
                alt={`${title} ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Image counter */}
      {allImages.length > 1 && (
        <div className="text-center text-body-sm text-neutral-500">
          {currentImage + 1} з {allImages.length}
        </div>
      )}
    </div>
  );
}