"use client"

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, SparklesIcon } from "lucide-react";

interface CardCarouselProps {
  images: Array<{
    src: string;
    alt: string;
    title?: string;
    description?: string;
    badge?: string;
    capabilities?: string[];
    complexity?: string;
  }>;
  autoplayDelay?: number;
  showPagination?: boolean;
  showNavigation?: boolean;
}

export function CardCarousel({
  images,
  autoplayDelay = 1000,
  showPagination = true,
  showNavigation = true,
}: CardCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<any>(null);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    if (!api || !autoplayDelay) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [api, autoplayDelay]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("overflow-hidden");
    };
  }, [isModalOpen]);

  const handleImageError = (index: number) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-[24px] border border-black/5 p-2 shadow-sm">
      <div className="relative mx-auto flex w-full flex-col items-center justify-center rounded-[24px] border border-black/5 bg-neutral-800/5 shadow-sm md:gap-4 md:rounded-b-[20px] md:rounded-t-[40px] p-4">
        <div className="mb-6 text-center">
          <Badge 
            variant="outline" 
            className="mb-3 rounded-[14px] border border-black/10 bg-white text-base"
          >
            <SparklesIcon className="fill-[#EEBDE0] stroke-1 text-neutral-800 mr-2" />
            AI Models
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight">Choose Your AI Assistant</h2>
        </div>
        
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent className="px-2">
            {images.map((image, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-2 pr-2">
                <div 
                  className={`group relative transition-all duration-500 ease-out ${hoveredIndex === index ? 'z-20 scale-110 -translate-y-2' : hoveredIndex !== null ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setIsModalOpen(true);
                  }}
                  style={{
                    transformOrigin: 'center center',
                  }}
                >
                  <motion.div
                    layoutId={`card-${index}`}
                    className="h-full"
                  >
                    <Card className="bg-white border border-black/5 overflow-hidden rounded-[20px] shadow-sm group-hover:shadow-2xl transition-all duration-500 h-full relative">
                      {/* Glow effect */}
                      <div className={`absolute inset-0 rounded-[20px] transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-100 shadow-[0_0_30px_rgba(0,0,0,0.1)]' : 'opacity-0'}`} />
                      
                      <CardHeader className="p-4 pb-2 relative z-10">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <CardTitle className="text-lg font-semibold text-neutral-800 transition-colors duration-300 group-hover:text-neutral-900">
                              {image.title || image.alt}
                            </CardTitle>
                          </div>
                          {image.badge && (
                            <Badge className="bg-neutral-100 text-neutral-800 text-xs font-medium transition-all duration-300 group-hover:bg-neutral-200">
                              {image.badge}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm text-neutral-600 transition-colors duration-300 group-hover:text-neutral-700">
                          {image.description || ""}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-4 pt-0 relative z-10">
                        <motion.div 
                          layoutId={`image-${index}`}
                          className="relative aspect-[3/2] overflow-hidden rounded-md bg-neutral-100 mb-3 transition-all duration-500"
                        >
                          {imgErrors[index] ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                              <AlertCircle className="w-8 h-8 mb-2" />
                              <span className="text-sm">Image not available</span>
                            </div>
                          ) : (
                            <img
                              src={image.src}
                              alt={image.alt}
                              className={`object-cover w-full h-full transition-all duration-700 ease-out ${hoveredIndex === index ? 'scale-110 brightness-110' : 'scale-100 brightness-100'}`}
                              onError={() => handleImageError(index)}
                            />
                          )}
                          
                          {/* Image overlay on hover */}
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/5 to-transparent transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`} />
                        </motion.div>
                        
                        {image.complexity && (
                          <div className="mb-3">
                            <h4 className="text-xs font-medium text-neutral-500 mb-1 transition-colors duration-300 group-hover:text-neutral-600">
                              Complexity:
                            </h4>
                            <div className="flex items-center">
                              <div className="h-2 bg-neutral-200 rounded-full w-full overflow-hidden">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-700 ease-out ${image.complexity === "Low" ? "bg-emerald-500" : image.complexity === "Medium" ? "bg-amber-500" : "bg-rose-500"} ${hoveredIndex === index ? image.complexity === "Low" ? "w-1/3" : image.complexity === "Medium" ? "w-2/3" : "w-full" : "w-0"}`}
                                  style={{
                                    width: hoveredIndex !== index ? '0%' : 
                                      image.complexity === "Low" ? '33.333%' : 
                                      image.complexity === "Medium" ? '66.667%' : '100%'
                                  }}
                                />
                              </div>
                              <span className="text-xs ml-2 text-neutral-600 transition-colors duration-300 group-hover:text-neutral-700">
                                {image.complexity}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {image.capabilities && (
                          <div className="space-y-1">
                            <h4 className="text-xs font-medium text-neutral-500 transition-colors duration-300 group-hover:text-neutral-600">
                              Capabilities:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {image.capabilities.map((capability, capIndex) => (
                                <Badge 
                                  key={capIndex} 
                                  variant="outline" 
                                  className={`border-neutral-200 bg-neutral-50 text-neutral-700 text-xs py-0 px-2 rounded-full transition-all duration-300 ${hoveredIndex === index ? 'border-neutral-300 bg-neutral-100 transform scale-105' : 'transform scale-100'}`}
                                  style={{
                                    transitionDelay: hoveredIndex === index ? `${capIndex * 50}ms` : '0ms'
                                  }}
                                >
                                  {capability}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {showNavigation && (
            <>
              <CarouselPrevious className="-left-4 lg:-left-6 bg-white border border-black/5 shadow-sm hover:bg-neutral-50 transition-all duration-300 hover:scale-110" />
              <CarouselNext className="-right-4 lg:-right-6 bg-white border border-black/5 shadow-sm hover:bg-neutral-50 transition-all duration-300 hover:scale-110" />
            </>
          )}
        </Carousel>

        {showPagination && (
          <div className="flex justify-center space-x-2 mt-6">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`rounded-full transition-all duration-500 hover:scale-125 ${index === currentSlide ? "bg-neutral-800 w-4 h-2" : "bg-neutral-300 w-2 h-2 hover:bg-neutral-400"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal for expanded image view */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-content-center bg-white/40 backdrop-blur-sm dark:bg-black/40"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="cursor-pointer overflow-hidden rounded-2xl bg-black"
            >
              <motion.div
                layoutId={`image-${selectedImageIndex}`}
                className="relative size-96"
              >
                {!imgErrors[selectedImageIndex] && (
                  <img
                    src={images[selectedImageIndex].src}
                    alt={images[selectedImageIndex].alt}
                    className="absolute left-1/2 top-1/2 size-full -translate-x-1/2 -translate-y-1/2 object-cover"
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}