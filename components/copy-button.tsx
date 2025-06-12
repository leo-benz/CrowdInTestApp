'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  manifestUrl: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ manifestUrl }) => {
  const [copied, setCopied] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success' | 'error'>('idle');

  const copyToClipboard = async () => {
    setCopyStatus('copying');

    try {
      await navigator.clipboard.writeText(manifestUrl);
      setCopied(true);
      setCopyStatus('success');

      // Announce success to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = 'Manifest URL copied to clipboard successfully';
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    } catch (error) {
      setCopyStatus('error');
      console.error('Failed to copy to clipboard:', error);

      // Announce error to screen readers
      const errorAnnouncement = document.createElement('div');
      errorAnnouncement.setAttribute('aria-live', 'assertive');
      errorAnnouncement.setAttribute('aria-atomic', 'true');
      errorAnnouncement.className = 'sr-only';
      errorAnnouncement.textContent = 'Failed to copy manifest URL to clipboard';
      document.body.appendChild(errorAnnouncement);

      setTimeout(() => {
        document.body.removeChild(errorAnnouncement);
      }, 1000);
    }
  };

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
        setCopyStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
    return () => {}; // Always return cleanup function
  }, [copied]);

  const getButtonLabel = () => {
    switch (copyStatus) {
      case 'copying':
        return 'Copying manifest URL...';
      case 'success':
        return 'Manifest URL copied to clipboard';
      case 'error':
        return 'Failed to copy - try again';
      default:
        return 'Copy manifest URL to clipboard';
    }
  };

  const getButtonIcon = () => {
    if (copyStatus === 'success' || copied) {
      return <Check className="h-5 w-5 text-green-500" aria-hidden="true" />;
    }
    return <Copy className="h-5 w-5" aria-hidden="true" />;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-10 rounded-l-none border-l-0 px-3"
      onClick={copyToClipboard}
      disabled={copyStatus === 'copying'}
      aria-label={getButtonLabel()}
      aria-describedby="copy-button-help"
      aria-pressed={copied}
      title={getButtonLabel()}
    >
      {getButtonIcon()}
      <span id="copy-button-help" className="sr-only">
        {copied
          ? 'Manifest URL has been copied to your clipboard'
          : 'Click to copy the manifest URL for app installation'}
      </span>
    </Button>
  );
};
