"use client";

import { useBackground } from "@/app/context/BackgroundContext";

export function AppBackground({ children }: { children: React.ReactNode }) {
  const { selected } = useBackground();

  return (
    <div className="relative min-h-full w-full isolate">
      {/* Background sits behind content, still inside this stacking context */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {selected.src ? (
          <img
            src={selected.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
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

// "use client";

// import { useBackground } from "@/app/context/BackgroundContext";

// export function AppBackground({ children }: { children: React.ReactNode }) {
//   const { selected } = useBackground();

//   return (
//     <div className="relative min-h-full w-full isolate">
//       <div
//         aria-hidden
//         className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
//       >
//         {selected.src ? (
//           <img
//             src={selected.src}
//             alt=""
//             className="absolute inset-0 h-full w-full object-cover opacity-40 dark:opacity-30"
//           />
//         ) : (
//           <div
//             className="absolute inset-0 opacity-50 dark:opacity-40"
//             style={{
//               background:
//                 "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
//             }}
//           />
//         )}

//         {/* Always mute color a bit so text stays readable */}
//         <div className="absolute inset-0 bg-background/55 dark:bg-background/65" />

//         {selected.overlay && (
//           <div
//             className="absolute inset-0 opacity-60"
//             style={{ background: selected.overlay }}
//           />
//         )}
//       </div>

//       <div className="relative z-10 min-h-full">{children}</div>
//     </div>
//   );
// }
