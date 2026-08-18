import { createContext, useContext } from "react";
import type { Doc } from "@/convex/_generated/dataModel";

export const UserContext = createContext<Doc<"users"> | null>(null);

export function useUserContext() {
  return useContext(UserContext);
}
