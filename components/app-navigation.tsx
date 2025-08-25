"use client"

import { FileSpreadsheet } from "lucide-react"
import Link from "next/link"

export function AppNavigation() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 h-14 flex items-center">
        {/* Logo Only */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-black">AI DataEnrich</h1>
        </Link>
      </div>
    </div>
  )
}