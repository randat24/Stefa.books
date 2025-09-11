"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageCircle,
  Check
} from "lucide-react";

interface BookShareMenuProps {
  title: string;
  author: string;
  url?: string;
}

export function BookShareMenu({ title, author, url }: BookShareMenuProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} від ${author} - українська дитяча література на Stefa.Books`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  
  const shareVia = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Подивіться на цю цікаву книгу: ${currentUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`
  };
  
  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="md" 
        className="flex-1 h-10"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Поділитися
      </Button>
      
      {isMenuOpen && (
        <div className="absolute top-12 left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-10">
          <div className="space-y-2">
            {/* Copy Link */}
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start h-9"
              onClick={copyToClipboard}
            >
              {isCopied ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {isCopied ? "Скопійовано!" : "Копіювати посилання"}
            </Button>
            
            {/* Facebook */}
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start h-9 text-brand-accent-light hover:text-blue-700"
              onClick={() => window.open(shareVia.facebook, '_blank')}
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            
            {/* Twitter */}
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start h-9 text-sky-600 hover:text-sky-700"
              onClick={() => window.open(shareVia.twitter, '_blank')}
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            
            {/* Telegram */}
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start h-9 text-brand-accent hover:text-brand-accent-light"
              onClick={() => window.open(shareVia.telegram, '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Telegram
            </Button>
            
            {/* Email */}
            <Button
              variant="outline"
              size="md"
              className="w-full justify-start h-9 text-neutral-600 hover:text-neutral-700"
              onClick={() => window.open(shareVia.email, '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Електронна пошта
            </Button>
          </div>
        </div>
      )}
      
      {/* Click outside to close */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}