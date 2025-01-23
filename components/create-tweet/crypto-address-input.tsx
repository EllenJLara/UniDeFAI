import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from '../tweets/hooks/use-media-query';
import { X } from 'lucide-react';

interface Position {
  left: number;
  bottom: number;
}

interface ValidationProps {
  inputAddress: string;
  validationStatus: 'idle' | 'validating' | 'invalid' | 'valid';
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleAddressSubmit: () => void;
  getValidationMessage: () => React.ReactNode;
  cryptoAddress: string;
  shortenAddress: (address: string) => string;
}

interface PopupProps extends ValidationProps {
  isOpen: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}
const CryptoAddressPopup: React.FC<PopupProps> = ({
    isOpen,
    buttonRef,
    inputAddress,
    validationStatus,
    handleInputChange,
    handleKeyDown,
    handleAddressSubmit,
    getValidationMessage,
    onClose
  }) => {
    const popupRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<Position>({ left: 0, bottom: 0 });
    const isMobile = useMediaQuery("(max-width: 773px)");
  
    useEffect(() => {
      if (isOpen && buttonRef?.current && popupRef?.current && !isMobile) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        let left = buttonRect.left;
        if (left + 400 > windowWidth) {
          left = windowWidth - 400 - 16;
        }
        left = Math.max(16, left);
        
        const bottom = window.innerHeight - buttonRect.top + 8;
        setPosition({ left, bottom });
      }
    }, [isOpen, buttonRef, isMobile]);
  
    const handlePopupClose = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
  
    const handleOverlayClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.target === e.currentTarget) {
        onClose();
      }
    };
  
    const handleContentClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
  
    const mobileStyles = isMobile ? {
      position: 'fixed',
      top: '2%',
      left: '10%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '400px',
      maxHeight: '90vh',
      zIndex: 61
    } : {
      position: 'fixed',
      left: position.left,
      bottom: position.bottom,
      width: '400px',
      zIndex: 61
    };
  
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="isolate" onClick={handleContentClick} onMouseDown={handleContentClick}>
            {isMobile && (
              <div 
                className="fixed inset-0 bg-black/50"
                style={{ zIndex: 60 }}
                onClick={handleOverlayClick}
                onMouseDown={handleOverlayClick}
              />
            )}
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, y: isMobile ? 20 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? 20 : 10 }}
              transition={{ duration: 0.2 }}
              style={mobileStyles}
              onClick={handleContentClick}
              onMouseDown={handleContentClick}
            >
              <div className="bg-black border border-gray-800 rounded-xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium">Add Memecoin Address</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-zinc-400/10"
                    onClick={handlePopupClose}
                    onMouseDown={handleContentClick}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste the address"
                    value={inputAddress}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={`
                      fun-text flex-1 h-10 text-sm border rounded-lg
                      ${validationStatus === "invalid" ? "border-red-500 text-red-500" : ""}
                      ${validationStatus === "valid" ? "border-green-500" : ""}
                      ${validationStatus === "validating" ? "border-zinc-200 dark:border-zinc-700" : ""}
                    `}
                    autoFocus
                  />
                </div>
                <div className="mt-4">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddressSubmit();
                    }}
                    onMouseDown={handleContentClick}
                    disabled={validationStatus !== "valid"}
                    className="h-10 px-4 bg-white text-black hover:bg-white/90 rounded-lg fun-text 
                      disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-2">
                  {getValidationMessage()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };
interface ButtonProps {
  cryptoAddress: string;
  isPopupOpen: boolean;
  setIsPopupOpen: (value: boolean) => void;
  shortenAddress: (address: string) => string;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const CryptoAddressButton: React.FC<ButtonProps> = ({
  cryptoAddress,
  isPopupOpen,
  setIsPopupOpen,
  shortenAddress,
  buttonRef,
  ...props
}) => {
  return (
    <Button
      type="button"
      ref={buttonRef}
      variant="outline"
      onClick={() => setIsPopupOpen(!isPopupOpen)}
      className="px-4 h-[40px] outline-none border-none rounded-full text-sm font-medium 
        justify-center flex items-center hover:bg-zinc-400/10 transition-colors duration-200 
        ease-in-out fun-text"
      {...props}
    >
      [{cryptoAddress ? shortenAddress(cryptoAddress) : "attach memecoin"}]
    </Button>
  );
};

interface CryptoAddressInputProps extends ValidationProps {
  isPopupOpen: boolean;
  setIsPopupOpen: (value: boolean) => void;
}

export default function CryptoAddressInput({
  cryptoAddress,
  inputAddress,
  validationStatus,
  handleInputChange,
  handleKeyDown,
  handleAddressSubmit,
  shortenAddress,
  getValidationMessage,
  isPopupOpen,
  setIsPopupOpen,
}: CryptoAddressInputProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsPopupOpen]);

  return (
    <div className="relative">
      <CryptoAddressButton
        cryptoAddress={cryptoAddress}
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        shortenAddress={shortenAddress}
        buttonRef={buttonRef}
      />

      <CryptoAddressPopup
        isOpen={isPopupOpen}
        buttonRef={buttonRef}
        inputAddress={inputAddress}
        validationStatus={validationStatus}
        handleInputChange={handleInputChange}
        handleKeyDown={handleKeyDown}
        handleAddressSubmit={handleAddressSubmit}
        getValidationMessage={getValidationMessage}
        cryptoAddress={cryptoAddress}
        shortenAddress={shortenAddress}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}