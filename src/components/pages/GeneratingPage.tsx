import { cn } from "@/lib/utils";
import SafeAreaWrapper from "@/components/ui/SafeAreaWrapper";
import { Sparkles, Compass } from "lucide-react";

interface GeneratingPageProps {
  isDarkMode: boolean;
  glassPanelClass: string;
}

export function GeneratingPage({ isDarkMode, glassPanelClass }: GeneratingPageProps) {
  return (
    <div className={cn(
      "h-[100svh] relative flex items-center justify-center overflow-hidden", 
      isDarkMode ? "bg-slate-950" : "bg-gradient-to-br from-fuchsia-400 via-purple-400 to-indigo-500"
    )}>
      {/* Background Blobs - Extends into safe area notch */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className={cn("absolute top-1/4 left-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] animate-pulse opacity-40", isDarkMode ? "bg-fuchsia-600" : "bg-fuchsia-300 mix-blend-hard-light opacity-80")} style={{ animationDuration: '4s' }} />
         <div className={cn("absolute bottom-1/4 right-1/4 w-[60vw] h-[60vw] rounded-full blur-[120px] animate-pulse opacity-30", isDarkMode ? "bg-blue-600" : "bg-blue-300 mix-blend-hard-light opacity-80")} style={{ animationDuration: '5s' }} />
         {/* Grid Overlay */}
         <div className={cn("absolute inset-0 bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0",
            isDarkMode 
              ? "bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" 
              : "bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)]"
         )} />
      </div>
      
      {/* Content with safe area padding */}
      <SafeAreaWrapper fullHeight={false} includeTop={true} includeBottom={true} className="h-full flex items-center justify-center p-4">
        <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-12">
          
          {/* Pulsing Orb Centerpiece */}
          <div className="relative size-40 flex items-center justify-center">
            <div className={cn("absolute inset-0 rounded-full blur-xl animate-pulse opacity-50", isDarkMode ? "bg-fuchsia-500" : "bg-white/60")} />
            <div className="absolute inset-4 rounded-full border-2 border-white/20 animate-[spin_10s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border-2 border-white/40 animate-[spin_15s_linear_infinite_reverse]" />
            <div className={cn("size-20 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.5)] flex items-center justify-center animate-bounce", isDarkMode ? "bg-gradient-to-br from-fuchsia-500 to-indigo-600" : "bg-gradient-to-br from-fuchsia-400 to-indigo-500")}>
              <Sparkles className="size-10 text-white animate-pulse" />
            </div>
          </div>

          <div className="text-center space-y-4">
             <h2 className={cn("text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r drop-shadow-sm pb-2", isDarkMode ? "from-fuchsia-400 via-purple-400 to-blue-400" : "text-white")}>
              Crafting Your Journey
            </h2>
            <div className={cn("text-sm font-medium uppercase tracking-widest px-4 py-2 rounded-full border backdrop-blur-md inline-block", isDarkMode ? "bg-white/5 border-white/10 text-slate-400" : "bg-white/20 border-white/30 text-white/90")}>
               <span className="animate-pulse">AI Engine Analyzing...</span>
            </div>
          </div>

          {/* Glass Tip Card */}
          <div className={cn("w-full p-6 rounded-2xl border backdrop-blur-xl shadow-2xl transform transition-all hover:scale-[1.02]", isDarkMode ? glassPanelClass : "bg-white/10 border-white/20 text-white")}>
              <div className="flex items-center gap-3 mb-3">
                 <div className={cn("p-2 rounded-full", isDarkMode ? "bg-white/10" : "bg-white/20")}>
                    <Compass className={cn("size-5", isDarkMode ? "text-fuchsia-400" : "text-white")} />
                 </div>
                 <span className={cn("text-xs font-bold uppercase tracking-wider", isDarkMode ? "text-slate-400" : "text-white/80")}>Travel Tip</span>
              </div>
              <p className={cn("text-sm leading-relaxed", isDarkMode ? "text-slate-200" : "text-white")}>
                 "Did you know? The best itineraries mix planned activities with unstructured time for spontaneous discovery. Be wild."
              </p>
          </div>

        </div>
      </SafeAreaWrapper>
    </div>
  );
}
