import React, { useState } from 'react';
import { AlertCircle, ExternalLink, RefreshCw, Play } from 'lucide-react';

interface SafeGameEmbedProps {
  embedUrl: string;
  gameTitle: string;
  onFallbackPlay?: () => void;
}

export const SafeGameEmbed: React.FC<SafeGameEmbedProps> = ({
  embedUrl,
  gameTitle,
  onFallbackPlay
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full aspect-[16/10] max-h-[700px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl">
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 z-10">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">
            Loading {gameTitle}...
          </span>
        </div>
      )}

      {hasError ? (
        <div className="p-8 max-w-md text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white font-display mb-1">
            External Game Embed Unavailable
          </h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            The external provider's iframe embed was blocked or unreachable from your current browser environment. You can open it in an isolated tab or switch to our built-in offline engine.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            {onFallbackPlay && (
              <button
                onClick={onFallbackPlay}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors shadow-md shadow-cyan-400/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Play In-House Arcade
              </button>
            )}
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title={gameTitle}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          allow="fullscreen; autoplay"
        />
      )}
    </div>
  );
};
