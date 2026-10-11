import React from "react";

export default function Loader({ full = false }) {
  return (
    <div className={full ? "flex min-h-[60vh] items-center justify-center" : "flex items-center justify-center py-8"}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
    </div>
  );
}
