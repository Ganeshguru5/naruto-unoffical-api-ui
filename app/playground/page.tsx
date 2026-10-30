import type { Metadata } from "next";
import { Suspense } from "react";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground",
  description: "Send live requests to every Naruto Unofficial API endpoint and inspect the results.",
};

export default function PlaygroundPage() {
  return (
    <Suspense fallback={<PlaygroundFallback />}>
      <Playground />
    </Suspense>
  );
}

function PlaygroundFallback() {
  return (
    <div className="mx-auto grid w-full max-w-7xl place-items-center px-4 py-24">
      <div className="rasengan" />
    </div>
  );
}
