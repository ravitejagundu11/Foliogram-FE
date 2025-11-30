import * as React from "react";

export function Card({ className = "", children }: any) {
  return (
    <div className={`rounded-xl border bg-white shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ className = "", children }: any) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}
