// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useSyncExternalStore,
// } from "react";

// export interface BackgroundOption {
//   id: string;
//   label: string;
//   thumbnail: string;
//   src: string;
//   overlay?: string;
//   /** CSS background value (color or gradient) used when there's no image `src`. */
//   gradient?: string;
//   /**
//    * When true, renders the full animated <CyberVoidBackground /> scene
//    * instead of the static `gradient`/`src`. Used for the "felt" default.
//    */
//   animated?: boolean;
// }

// export const BACKGROUNDS: BackgroundOption[] = [
//   {
//     id: "felt",
//     label: "Cyber Void",
//     thumbnail: "",
//     src: "",
//     overlay: undefined,
//     gradient:
//       "radial-gradient(ellipse at center, #180f05 0%, #0a0603 68%), radial-gradient(ellipse at center, transparent 32%, #0a0603 88%)",
//     animated: true,
//   },
//   {
//     id: "space",
//     label: "Deep Space",
//     thumbnail: "/backgrounds/space-thumb.jpg",
//     src: "/backgrounds/space-thumb.jpg",
//     overlay: "rgba(0,0,0,0.35)",
//   },
//   {
//     id: "forest",
//     label: "Dark Forest",
//     thumbnail: "/backgrounds/forest-thumb.jpg",
//     src: "/backgrounds/forest-thumb.jpg",
//     overlay: "rgba(0,0,0,0.4)",
//   },
//   {
//     id: "neon",
//     label: "Neon City",
//     thumbnail: "/backgrounds/neon-thumb.jpg",
//     src: "/backgrounds/neon-thumb.jpg",
//     overlay: "rgba(0,0,0,0.3)",
//   },
//   {
//     id: "ocean",
//     label: "Ocean Depths",
//     thumbnail: "/backgrounds/ocean-thumb.jpg",
//     src: "/backgrounds/ocean-thumb.jpg",
//     overlay: "rgba(0,10,30,0.45)",
//   },
//   {
//     id: "lava",
//     label: "Lava Flow",
//     thumbnail: "/backgrounds/lava-thumb.jpg",
//     src: "/backgrounds/lava-thumb.jpg",
//     overlay: "rgba(0,0,0,0.4)",
//   },
// ];

// const STORAGE_KEY = "uno-board-bg";
// const DEFAULT_ID = "felt";

// // Same-tab updates (storage event only fires across tabs)
// const listeners = new Set<() => void>();
// function emit() {
//   listeners.forEach((l) => l());
// }

// function subscribe(listener: () => void) {
//   listeners.add(listener);
//   if (typeof window !== "undefined") {
//     window.addEventListener("storage", listener);
//   }
//   return () => {
//     listeners.delete(listener);
//     if (typeof window !== "undefined") {
//       window.removeEventListener("storage", listener);
//     }
//   };
// }

// function getSnapshot() {
//   return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ID;
// }

// function getServerSnapshot() {
//   return DEFAULT_ID;
// }

// interface BackgroundContextValue {
//   selected: BackgroundOption;
//   setBackground: (id: string) => void;
// }

// const BackgroundContext = createContext<BackgroundContextValue>({
//   selected: BACKGROUNDS[0],
//   setBackground: () => {},
// });

// export function BackgroundProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const selectedId = useSyncExternalStore(
//     subscribe,
//     getSnapshot,
//     getServerSnapshot,
//   );

//   const setBackground = useCallback((id: string) => {
//     localStorage.setItem(STORAGE_KEY, id);
//     emit(); // notify this tab
//   }, []);

//   const selected =
//     BACKGROUNDS.find((b) => b.id === selectedId) ?? BACKGROUNDS[0];

//   return (
//     <BackgroundContext.Provider value={{ selected, setBackground }}>
//       {children}
//     </BackgroundContext.Provider>
//   );
// }

// export const useBackground = () => useContext(BackgroundContext);
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

/** Which animated scene component to render for this option, if any. */
export type AnimatedBackgroundVariant = "cyberVoid" | "matrixCore";

export interface BackgroundOption {
  id: string;
  label: string;
  thumbnail: string;
  src: string;
  overlay?: string;
  /** CSS background value (color or gradient) used when there's no image `src`. */
  gradient?: string;
  /**
   * When set, renders the matching animated scene component instead of the
   * static `gradient`/`src`. See AppBackground / SettingsPage for the
   * variant -> component mapping.
   */
  animated?: AnimatedBackgroundVariant;
}

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: "felt",
    label: "Cyber Void",
    thumbnail: "",
    src: "",
    overlay: undefined,
    gradient:
      "radial-gradient(ellipse at center, #180f05 0%, #0a0603 68%), radial-gradient(ellipse at center, transparent 32%, #0a0603 88%)",
    animated: "cyberVoid",
  },
  {
    id: "matrix",
    label: "Matrix Core",
    thumbnail: "",
    src: "",
    overlay: undefined,
    gradient:
      "radial-gradient(ellipse at center, #170a2e 0%, #050108 70%), radial-gradient(ellipse at center, transparent 30%, #050108 90%)",
    animated: "matrixCore",
  },
  {
    id: "space",
    label: "Deep Space",
    thumbnail: "/backgrounds/space-thumb.jpg",
    src: "/backgrounds/space-thumb.jpg",
    overlay: "rgba(0,0,0,0.35)",
  },
  {
    id: "forest",
    label: "Dark Forest",
    thumbnail: "/backgrounds/forest-thumb.jpg",
    src: "/backgrounds/forest-thumb.jpg",
    overlay: "rgba(0,0,0,0.4)",
  },
  {
    id: "neon",
    label: "Neon City",
    thumbnail: "/backgrounds/neon-thumb.jpg",
    src: "/backgrounds/neon-thumb.jpg",
    overlay: "rgba(0,0,0,0.3)",
  },
  {
    id: "ocean",
    label: "Ocean Depths",
    thumbnail: "/backgrounds/ocean-thumb.jpg",
    src: "/backgrounds/ocean-thumb.jpg",
    overlay: "rgba(0,10,30,0.45)",
  },
  {
    id: "lava",
    label: "Lava Flow",
    thumbnail: "/backgrounds/lava-thumb.jpg",
    src: "/backgrounds/lava-thumb.jpg",
    overlay: "rgba(0,0,0,0.4)",
  },
];

const STORAGE_KEY = "uno-board-bg";
const DEFAULT_ID = "felt";

// Same-tab updates (storage event only fires across tabs)
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_ID;
}

function getServerSnapshot() {
  return DEFAULT_ID;
}

interface BackgroundContextValue {
  selected: BackgroundOption;
  setBackground: (id: string) => void;
}

const BackgroundContext = createContext<BackgroundContextValue>({
  selected: BACKGROUNDS[0],
  setBackground: () => {},
});

export function BackgroundProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const selectedId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setBackground = useCallback((id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    emit(); // notify this tab
  }, []);

  const selected =
    BACKGROUNDS.find((b) => b.id === selectedId) ?? BACKGROUNDS[0];

  return (
    <BackgroundContext.Provider value={{ selected, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export const useBackground = () => useContext(BackgroundContext);
