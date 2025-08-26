"use client"

import Image from "next/image"
import Link from "next/link"

export function AppNavigation() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 h-14 flex items-center">
        {/* Arconic Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/arconic-logo.svg" 
            alt="Arconic" 
            width={120} 
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-gray-400 mx-2">|</span>
          <h1 className="text-xl font-semibold text-black">AI DataEnrich</h1>
        </Link>
      </div>
    </div>
  )
}