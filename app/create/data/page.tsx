import { DataSourceSelector } from "@/components/data-source-selector"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Start with Data - Lighthouse AI",
  description: "Find or upload data, then discover what you can create",
}

export default function DataPage() {
  return (
    <div className="container mx-auto py-8">
      <DataSourceSelector />
    </div>
  )
}