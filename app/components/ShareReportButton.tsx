// "use client";

// import { useState } from "react";
// import { Share2, Check } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export function ShareReportButton({ searchId }: { searchId: string }) {
//   const [copied, setCopied] = useState(false);

//   async function share() {
//     const url = `${window.location.origin}/report/${searchId}`;
//     if (navigator.share) {
//       try {
//         await navigator.share({ title: "Family history report", url });
//         return;
//       } catch {
//         /* user cancelled */
//       }
//     }
//     await navigator.clipboard.writeText(url);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   }

//   return (
//     <Button
//       size="sm"
//       variant="outline"
//       onClick={share}
//       className="border-indigo-400/30 text-indigo-600 dark:text-indigo-300"
//     >
//       {copied ? (
//         <>
//           <Check className="mr-1.5 h-3.5 w-3.5" /> Link copied
//         </>
//       ) : (
//         <>
//           <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share
//         </>
//       )}
//     </Button>
//   );
// }

"use client";

import { useState } from "react";
import { Share2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareReportButton({ searchId }: { searchId: string }) {
  const [copied, setCopied] = useState(false);

  const reportUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/report/${searchId}`
      : `/report/${searchId}`;

  function openReport() {
    window.open(reportUrl, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={openReport}
        className="border-indigo-400/30 text-indigo-700 dark:text-indigo-300"
      >
        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
        Open share page
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={copyLink}
        className="text-indigo-600 dark:text-indigo-300"
      >
        {copied ? (
          <>
            <Check className="mr-1.5 h-3.5 w-3.5" /> Copied
          </>
        ) : (
          <>
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> Copy link
          </>
        )}
      </Button>
    </div>
  );
}
