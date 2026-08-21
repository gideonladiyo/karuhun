import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ArrowLeft, RotateCw, Home, Compass } from "lucide-react";

export interface NotFoundProps {
  errorCode?: string | number;
  title?: string;
  message?: string;
  subMessage?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function NotFound({
  errorCode = "404",
  title,
  message = "The page you're looking for might have been moved or doesn't exist.",
  subMessage,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: NotFoundProps) {
  return (
    <div className={`relative flex min-h-[60vh] sm:min-h-[70vh] w-full items-center justify-center overflow-hidden py-12 px-4 ${className}`}>
      {/* Atmospheric Amber/Red Ambient Glow Background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.6) 0%, rgba(239, 68, 68, 0.3) 60%, transparent 80%)'
        }}
      />

      <Empty className="relative z-10 border border-[#27272a]/60 bg-[#121215]/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl max-w-xl">
        <EmptyHeader className="space-y-2">
          {/* Dynamic Error Code Number */}
          <EmptyTitle className="font-heading font-black text-7xl sm:text-9xl tracking-tight text-white/90 select-none bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
            {errorCode}
          </EmptyTitle>

          {title && (
            <h3 className="font-heading font-bold text-lg sm:text-xl text-white uppercase tracking-wider">
              {title}
            </h3>
          )}

          {/* Dynamic Error Message from API */}
          <EmptyDescription className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            {message}
            {subMessage && (
              <span className="block text-[11px] font-tech text-zinc-500 mt-2">
                {subMessage}
              </span>
            )}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="pt-2">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {onPrimaryAction ? (
              <Button
                onClick={onPrimaryAction}
                className="bg-amber-500 hover:bg-amber-400 text-black font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                <RotateCw className="size-4 mr-2" />
                {primaryActionLabel || "Try Again"}
              </Button>
            ) : (
              <Button asChild className="bg-amber-500 hover:bg-amber-400 text-black font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer">
                <a href="/">
                  <Home className="size-4 mr-2" />
                  Go Home
                </a>
              </Button>
            )}

            {onSecondaryAction ? (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
                className="border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-white font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-4 mr-2" />
                {secondaryActionLabel || "Back to Guild"}
              </Button>
            ) : (
              <Button asChild variant="outline" className="border border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-white font-heading font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer">
                <a href="/rankings">
                  <Compass className="size-4 mr-2" />
                  Explore
                </a>
              </Button>
            )}
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}

export default NotFound;
