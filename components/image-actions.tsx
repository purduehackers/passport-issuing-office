"use client";

import { Passport } from "@/types/types";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import LaunchConfetti from "@/lib/confetti";

export function ImageActions({
  generatedImageUrl,
  userId,
  latestPassport,
  firstName,
  surname,
  sendToDb,
}: {
  generatedImageUrl: string;
  userId: string | undefined;
  latestPassport: Passport | null | undefined;
  firstName: string;
  surname: string;
  sendToDb?: boolean;
}) {
  function generateDownloadName() {
    function processName(name: string) {
      return name.replace(" ", "_").toLowerCase();
    }
    return `passport_${processName(firstName)}_${processName(surname)}`;
  }

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  return (
    // todo: these buttons look awful, make them better
    <div className="flex flex-row items-center gap-2 w-full">
      <a
        href={generatedImageUrl}
        download={generateDownloadName()}
        className="w-full"
      >
        <Button className="w-full amberButton" type="button">
          Download
        </Button>
        <LaunchConfetti />
      </a>
      {userId && (latestPassport || sendToDb) ? (
        <div>
          <Button
            className="amberButton"
            type="button"
            onClick={() => {
              navigator.clipboard
                .writeText(
                  `https://passports.purduehackers.com/passport/${userId}`
                )
                .then(() => setCopied(true))
                .catch((err) => {
                  console.error("Failed to copy text: ", err);
                });
            }}
          >
            {copied ? "Copied link to clipboard!" : "Share"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
