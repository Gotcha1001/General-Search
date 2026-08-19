// "use client";

// import { useBackground } from "@/app/context/BackgroundContext";

// export function AppBackground({ children }: { children: React.ReactNode }) {
//   const { selected } = useBackground();

//   return (
//     <div className="relative min-h-full w-full isolate">
//       {/* Background sits behind content, still inside this stacking context */}
//       <div
//         aria-hidden
//         className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
//       >
//         {selected.src ? (
//           <img
//             src={selected.src}
//             alt=""
//             className="absolute inset-0 h-full w-full object-cover"
//           />
//         ) : (
//           <div
//             className="absolute inset-0"
//             style={{
//               background:
//                 "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
//             }}
//           />
//         )}
//         {selected.overlay && (
//           <div
//             className="absolute inset-0"
//             style={{ background: selected.overlay }}
//           />
//         )}
//       </div>

//       {/* Content above the background */}
//       <div className="relative z-10 min-h-full">{children}</div>
//     </div>
//   );
// }

"use client";

import { useBackground } from "@/app/context/BackgroundContext";
import { CyberVoidBackground } from "@/app/components/background/Cybervoidbackground";

const FALLBACK_GRADIENT =
  "radial-gradient(ellipse at center, #180f05 0%, #0a0603 68%)";

export function AppBackground({ children }: { children: React.ReactNode }) {
  const { selected } = useBackground();

  return (
    <div className="relative min-h-full w-full isolate">
      {/* Background sits behind content, still inside this stacking context */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {selected.animated ? (
          <CyberVoidBackground />
        ) : selected.src ? (
          <img
            src={selected.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: selected.gradient ?? FALLBACK_GRADIENT,
            }}
          />
        )}
        {selected.overlay && (
          <div
            className="absolute inset-0"
            style={{ background: selected.overlay }}
          />
        )}
      </div>

      {/* Content above the background */}
      <div className="relative z-10 min-h-full">{children}</div>
    </div>
  );
}
