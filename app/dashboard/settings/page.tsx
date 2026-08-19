// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { Check, ImageOff, MapPin } from "lucide-react";
// import { BACKGROUNDS, useBackground } from "@/app/context/BackgroundContext";
// import { useEffect, useState } from "react";
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { useUserContext } from "@/app/context/UserContext";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// export default function SettingsPage() {
//   const { selected, setBackground } = useBackground();
//   const [previewId, setPreviewId] = useState<string | null>(null);
//   const activeId = previewId ?? selected.id;
//   const activeBg = BACKGROUNDS.find((b) => b.id === activeId) ?? BACKGROUNDS[0];

//   const user = useUserContext();
//   const setLocation = useMutation(api.users.setLocation);
//   const [locationInput, setLocationInput] = useState("");
//   const [savingLocation, setSavingLocation] = useState(false);

//   useEffect(() => {
//     setLocationInput(user?.location ?? "");
//   }, [user?.location]);

//   async function handleLocationSave(e: React.FormEvent) {
//     e.preventDefault();
//     const trimmed = locationInput.trim();
//     if (!trimmed || trimmed === user?.location || savingLocation) return;
//     setSavingLocation(true);
//     try {
//       await setLocation({ location: trimmed });
//     } catch (err) {
//       const message =
//         err instanceof Error
//           ? err.message
//           : "Couldn't update your location — try again.";
//       toast.error(message);
//     } finally {
//       setSavingLocation(false);
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
//           Settings
//         </h1>
//         <p className="text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
//           Personalise your search experience
//         </p>
//       </div>

//       {/* Location section */}
//       <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
//         <div className="mb-5 flex items-center gap-2">
//           <MapPin className="h-4 w-4 text-white/70" />
//           <div>
//             <h2 className="text-base font-semibold text-white">
//               Preferred job location
//             </h2>
//             <p className="text-sm text-white/70">
//               Searches default to postings near this location. Enter a single
//               city, region, or country — or type &quot;Remote&quot; for
//               remote-only roles.
//             </p>
//           </div>
//         </div>

//         <form onSubmit={handleLocationSave} className="flex flex-col gap-2">
//           <div className="flex gap-3">
//             <Input
//               value={locationInput}
//               onChange={(e) => setLocationInput(e.target.value)}
//               placeholder="e.g. Durban, South Africa"
//               className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
//               disabled={savingLocation}
//             />
//             <Button
//               type="submit"
//               disabled={
//                 savingLocation ||
//                 !locationInput.trim() ||
//                 locationInput.trim() === user?.location
//               }
//             >
//               {savingLocation ? "Saving..." : "Save"}
//             </Button>
//           </div>
//           <p className="text-xs text-white/50">
//             One location only — don&apos;t combine a place and
//             &quot;Remote&quot; with &quot;or&quot;.
//           </p>
//         </form>
//       </div>

//       {/* Section */}
//       <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
//         <h2 className="text-base font-semibold text-white mb-1">
//           Game Board Background
//         </h2>
//         <p className="text-sm text-white/70 mb-5">
//           Hover to preview · click to select · saved automatically
//         </p>

//         {/* Live preview strip */}
//         <div className="relative w-full h-36 rounded-xl overflow-hidden mb-6 border border-white/30">
//           {/* Actual background --- img tag is most reliable */}
//           {activeBg.src ? (
//             <img
//               src={activeBg.src}
//               alt=""
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           ) : (
//             <div
//               className="absolute inset-0"
//               style={{
//                 background:
//                   "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
//               }}
//             />
//           )}
//           {activeBg.overlay && (
//             <div
//               className="absolute inset-0"
//               style={{ background: activeBg.overlay }}
//             />
//           )}
//           {/* Preview label */}
//           <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold z-10">
//             {activeBg.label}
//           </div>
//           {/* Mini demo cards */}
//           <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-40 pointer-events-none z-10">
//             {[0, 1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="w-8 h-12 rounded-lg bg-white/20 border border-white/30"
//                 style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Grid of options */}
//         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
//           {BACKGROUNDS.map((bg) => {
//             const isSelected = selected.id === bg.id;
//             return (
//               <motion.button
//                 key={bg.id}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.96 }}
//                 onMouseEnter={() => setPreviewId(bg.id)}
//                 onMouseLeave={() => setPreviewId(null)}
//                 onClick={() => setBackground(bg.id)}
//                 className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all focus:outline-none group"
//                 style={{
//                   borderColor: isSelected ? "#ffffff" : "transparent",
//                   boxShadow: isSelected
//                     ? "0 0 0 1px #ffffff, 0 0 16px rgba(255,255,255,0.4)"
//                     : "0 2px 8px rgba(0,0,0,0.2)",
//                 }}
//               >
//                 {/* Thumbnail or CSS fallback */}
//                 {bg.thumbnail ? (
//                   <img
//                     src={bg.thumbnail}
//                     alt={bg.label}
//                     className="absolute inset-0 w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div
//                     className="absolute inset-0"
//                     style={{
//                       background:
//                         "radial-gradient(ellipse at 38% 32%, #1a4a2e 0%, #0f2d1c 50%, #091a10 100%)",
//                     }}
//                   >
//                     <div
//                       className="absolute inset-0 opacity-50"
//                       style={{
//                         backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
//                         backgroundSize: "100px 100px",
//                       }}
//                     />
//                   </div>
//                 )}
//                 {/* Overlay tint */}
//                 {bg.overlay && (
//                   <div
//                     className="absolute inset-0"
//                     style={{ background: bg.overlay }}
//                   />
//                 )}
//                 {/* Hover glass tint */}
//                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
//                 {/* No thumbnail placeholder */}
//                 {!bg.thumbnail && bg.id !== "felt" && (
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <ImageOff size={16} className="text-white/50" />
//                   </div>
//                 )}
//                 {/* Label */}
//                 <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 backdrop-blur-sm">
//                   <p className="text-white text-[9px] font-semibold text-center truncate">
//                     {bg.label}
//                   </p>
//                 </div>
//                 {/* Selected checkmark */}
//                 <AnimatePresence>
//                   {isSelected && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.5 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.5 }}
//                       className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/50"
//                     >
//                       <Check size={11} className="text-white" />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.button>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ImageOff, MapPin } from "lucide-react";
import { BACKGROUNDS, useBackground } from "@/app/context/BackgroundContext";
import { CyberVoidBackground } from "@/app/components/background/Cybervoidbackground";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserContext } from "@/app/context/UserContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const FALLBACK_GRADIENT =
  "radial-gradient(ellipse at center, #180f05 0%, #0a0603 68%)";

export default function SettingsPage() {
  const { selected, setBackground } = useBackground();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const activeId = previewId ?? selected.id;
  const activeBg = BACKGROUNDS.find((b) => b.id === activeId) ?? BACKGROUNDS[0];

  const user = useUserContext();
  const setLocation = useMutation(api.users.setLocation);
  const [locationInput, setLocationInput] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  useEffect(() => {
    setLocationInput(user?.location ?? "");
  }, [user?.location]);

  async function handleLocationSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = locationInput.trim();
    if (!trimmed || trimmed === user?.location || savingLocation) return;
    setSavingLocation(true);
    try {
      await setLocation({ location: trimmed });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Couldn't update your location — try again.";
      toast.error(message);
    } finally {
      setSavingLocation(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          Settings
        </h1>
        <p className="text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
          Personalise your search experience
        </p>
      </div>

      {/* Location section */}
      <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
        <div className="mb-5 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-white/70" />
          <div>
            <h2 className="text-base font-semibold text-white">
              Preferred job location
            </h2>
            <p className="text-sm text-white/70">
              Searches default to postings near this location. Enter a single
              city, region, or country — or type &quot;Remote&quot; for
              remote-only roles.
            </p>
          </div>
        </div>

        <form onSubmit={handleLocationSave} className="flex flex-col gap-2">
          <div className="flex gap-3">
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="e.g. Durban, South Africa"
              className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
              disabled={savingLocation}
            />
            <Button
              type="submit"
              disabled={
                savingLocation ||
                !locationInput.trim() ||
                locationInput.trim() === user?.location
              }
            >
              {savingLocation ? "Saving..." : "Save"}
            </Button>
          </div>
          <p className="text-xs text-white/50">
            One location only — don&apos;t combine a place and
            &quot;Remote&quot; with &quot;or&quot;.
          </p>
        </form>
      </div>

      {/* Section */}
      <div className="p-6 rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm shadow-sm mb-6">
        <h2 className="text-base font-semibold text-white mb-1">
          Game Board Background
        </h2>
        <p className="text-sm text-white/70 mb-5">
          Hover to preview · click to select · saved automatically
        </p>

        {/* Live preview strip */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden mb-6 border border-white/30">
          {/* Actual background --- img tag is most reliable */}
          {activeBg.animated ? (
            <CyberVoidBackground />
          ) : activeBg.src ? (
            <img
              src={activeBg.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: activeBg.gradient ?? FALLBACK_GRADIENT,
              }}
            />
          )}
          {activeBg.overlay && (
            <div
              className="absolute inset-0"
              style={{ background: activeBg.overlay }}
            />
          )}
          {/* Preview label */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold z-10">
            {activeBg.label}
          </div>
          {/* Mini demo cards */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-40 pointer-events-none z-10">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-12 rounded-lg bg-white/20 border border-white/30"
                style={{ transform: `rotate(${(i - 1.5) * 5}deg)` }}
              />
            ))}
          </div>
        </div>

        {/* Grid of options */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BACKGROUNDS.map((bg) => {
            const isSelected = selected.id === bg.id;
            return (
              <motion.button
                key={bg.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setPreviewId(bg.id)}
                onMouseLeave={() => setPreviewId(null)}
                onClick={() => setBackground(bg.id)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all focus:outline-none group"
                style={{
                  borderColor: isSelected ? "#ffffff" : "transparent",
                  boxShadow: isSelected
                    ? "0 0 0 1px #ffffff, 0 0 16px rgba(255,255,255,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Thumbnail, animated scene, or CSS fallback */}
                {bg.animated ? (
                  <CyberVoidBackground />
                ) : bg.thumbnail ? (
                  <img
                    src={bg.thumbnail}
                    alt={bg.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: bg.gradient ?? FALLBACK_GRADIENT,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                        backgroundSize: "100px 100px",
                      }}
                    />
                  </div>
                )}
                {/* Overlay tint */}
                {bg.overlay && (
                  <div
                    className="absolute inset-0"
                    style={{ background: bg.overlay }}
                  />
                )}
                {/* Hover glass tint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                {/* No thumbnail placeholder */}
                {!bg.animated && !bg.thumbnail && !bg.gradient && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff size={16} className="text-white/50" />
                  </div>
                )}
                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 backdrop-blur-sm z-10">
                  <p className="text-white text-[9px] font-semibold text-center truncate">
                    {bg.label}
                  </p>
                </div>
                {/* Selected checkmark */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black flex items-center justify-center border border-white/50 z-10"
                    >
                      <Check size={11} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
