"use client";

import React from "react";
import { AlertCircle, PawPrint } from "lucide-react";
import happyDog from "@/assets/animations/happydog.json";
import { Lottie } from "lottie-react";

type EmptySightingProps = {
  error?: string;
};

export const EmptySighting = ({ error }: EmptySightingProps) => {
  return (
    <div className="flex grow flex-col items-center justify-center pt-5">
      <Lottie
        src={happyDog}
        autoplay
        loop={false}
        aria-hidden="true"
        style={{ width: 250, height: 250 }}
      />
      {error ? (
        <div
          className="flex flex-row flex-wrap items-center gap-2 px-2 py-1"
          role="alert"
        >
          <AlertCircle
            className="size-8 shrink-0 text-red-600"
            aria-hidden="true"
          />
          <p className="m-0 flex-1 text-base text-red-600 [overflow-wrap:anywhere]">
            {error}
          </p>
        </div>
      ) : (
        <div
          className="flex flex-row flex-wrap items-center gap-2 px-2 py-1"
          role="status"
        >
          <PawPrint
            className="size-8 shrink-0 text-green-600"
            aria-hidden="true"
          />
          <p className="m-0 flex-1 text-base text-green-600 [overflow-wrap:anywhere]">
            No pet sightings to display in your area
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptySighting;
