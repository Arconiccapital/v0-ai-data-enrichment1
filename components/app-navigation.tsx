"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, HelpCircle, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppNavigation() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 h-14 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image 
            src="/arconic-logo.svg" 
            alt="Arconic" 
            width={120} 
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-gray-400 mx-2">|</span>
          <h1 className="text-xl font-semibold text-black">Lighthouse AI</h1>
        </Link>

        {/* Right Section - Settings and User Menu */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}