import { Suspense } from "react"
import BrowseContent from "./BrowseContent"

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <BrowseContent />
    </Suspense>
  )
}