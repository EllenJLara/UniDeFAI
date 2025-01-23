import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Search, X } from 'lucide-react';
import { gifService, type GifResult } from '@/lib/gif-service';
import { useInView } from 'react-intersection-observer';
import { useDevice } from '../tweets/hooks/use-media-query';

interface GifSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

const GifSearch: React.FC<GifSearchProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { isMobile } = useDevice();
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const nextPosRef = useRef<string | undefined>();
  const loadingRef = useRef(false);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const loadGifs = useCallback(async (isInitial: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    
    try {
      const response = searchQuery
        ? await gifService.search(searchQuery, 20, !isInitial ? nextPosRef.current : undefined)
        : await gifService.trending(20, !isInitial ? nextPosRef.current : undefined);

      if (response?.results?.length > 0) {
        if (isInitial) {
          setGifs(response.results);
        } else {
          setGifs(prev => [...prev, ...response.results]);
        }
        nextPosRef.current = response.next;
        setHasMore(!!response.next);
      } else {
        if (isInitial) {
          setGifs([]);
        }
        nextPosRef.current = undefined;
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading GIFs:', error);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchQuery || searchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        setGifs([]);
        nextPosRef.current = undefined;
        setHasMore(true);
        loadingRef.current = false;
        loadGifs(true);
      }, searchQuery ? 500 : 0);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, isOpen, loadGifs]);

  useEffect(() => {
    if (!isOpen || !inView || !hasMore || loadingRef.current) return;
    loadGifs();
  }, [inView, loadGifs, hasMore, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setGifs([]);
      nextPosRef.current = undefined;
      setHasMore(true);
      loadingRef.current = false;
    }
  }, [isOpen]);

  const handleSelect = (gif: GifResult) => {
    onSelect(gif.url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`
        ${isMobile ? 'w-screen h-screen m-0 max-w-none rounded-none' : 'sm:max-w-[600px]'}
        bg-black p-0 text-white overflow-hidden
      `}>
        <DialogHeader className="px-4 py-2 border-b border-gray-800">
          <div className="flex items-center gap-4 my-2">
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <DialogTitle className="text-xl font-bold ">Choose a GIF</DialogTitle>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Tenor"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-800 text-white placeholder:text-gray-400"
            />
          </div>
          <div/>
        </DialogHeader>

        <div className={`
          overflow-y-auto
          ${isMobile ? 'h-[calc(100vh-120px)]' : 'max-h-[600px]'}
        `}>
          <div className="grid grid-cols-2 gap-2 p-4">
            {gifs.map((gif, index) => (
              <button
                key={`${gif.id}-${index}`}
                onClick={() => handleSelect(gif)}
                className="relative aspect-video w-full overflow-hidden rounded-lg hover:opacity-80 transition-opacity bg-gray-900"
              >
                <img
                  src={gif.previewUrl}
                  alt={gif.description}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {hasMore && (
            <div ref={loadMoreRef} className="h-20 w-full" />
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {!isLoading && gifs.length === 0 && (
            <div className="flex justify-center items-center h-40 text-gray-400">
              {searchQuery.length >= 2 ? 'No GIFs found' : 'Search for GIFs'}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GifSearch;