import React from 'react';
import { cn } from "@/lib/utils";

const RingLoader = ({ className, size = "5em" }) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        className="pl"
        style={{ width: size, height: size }}
        viewBox="0 0 128 128"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="pl__ring2"
          cx="64"
          cy="64"
          r="52.5"
          fill="none"
          stroke="hsl(210,90%,55%)"
          strokeWidth="12"
          transform="rotate(-90,64,64)"
          strokeLinecap="round"
          strokeDasharray="329.9 329.9"
          strokeDashoffset="-329.3"
        ></circle>
        <circle
          className="pl__ring4"
          cx="64"
          cy="64"
          r="37.5"
          fill="none"
          stroke="hsl(200,90%,55%)"
          strokeWidth="9"
          transform="rotate(-90,64,64)"
          strokeLinecap="round"
          strokeDasharray="254.5 254.5"
          strokeDashoffset="-254"
        ></circle>
        <circle
          className="pl__ring6"
          cx="64"
          cy="64"
          r="22.5"
          fill="none"
          stroke="hsl(190,90%,55%)"
          strokeWidth="9"
          transform="rotate(-90,64,64)"
          strokeLinecap="round"
          strokeDasharray="204.2 204.2"
          strokeDashoffset="-203.9"
        ></circle>
      </svg>
    </div>
  );
};

export default RingLoader;
