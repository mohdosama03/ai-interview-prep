import React from "react";

export default function BrandMark({ className = "h-8 w-8" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-[0.7rem] bg-gradient-to-br from-accent-500 via-accent-600 to-brandblue-500 text-white shadow-md shadow-accent-600/20 ${className}`}
    >
      <svg viewBox="0 0 40 40" fill="none" className="h-[72%] w-[72%]" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11 12.5A4.5 4.5 0 0 1 15.5 8h17a4.5 4.5 0 0 1 4.5 4.5v10a4.5 4.5 0 0 1-4.5 4.5H23l-6.5 5v-5h-1a4.5 4.5 0 0 1-4.5-4.5v-10Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M18 20v-2m5 4v-6m5 4v-2"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M7 11.5 8.2 9l2.5-1.2-2.5-1.2L7 4l-1.2 2.6L3.2 7.8 5.8 9 7 11.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
