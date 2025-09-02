import { OutputGallery } from "@/components/output-gallery"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Choose Output - Lighthouse AI",
  description: "Select what you want to create and we'll get you the perfect data",
}

export default function OutputPage() {
  return (
    <div className="container mx-auto py-8">
      <OutputGallery />
    </div>
  )
}