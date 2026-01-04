"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/crystal/ui/dropdown-menu"
import { Button } from "@/components/crystal/ui/button"
import { User, Settings, HelpCircle, LogOut, UserCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface UserMenuProps {
  children: React.ReactNode
}

export function UserMenu({ children }: UserMenuProps) {
  const { user, logout, isLoading } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      // Redirect is handled by the auth context
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserCircle className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive"
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
