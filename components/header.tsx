"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"

type NavLink = {
  name: string
  href: string
}

const mainNavLinks: NavLink[] = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Categories", href: "/categories" },
  { name: "Artisans", href: "/artisans" },
  { name: "About", href: "/about" },
]

export function Header({ user }: { user: any }) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { items } = useCart()

  const cartItemsCount = items.length

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif font-bold text-xl">
            Virasat
          </Link>
          <nav className="hidden md:flex gap-6">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium hover:underline underline-offset-4",
                  pathname === link.href && "font-bold",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden md:flex relative">
            <Input
              type="search"
              placeholder="Search sarees..."
              className="w-64 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>

          {user ? (
            <Link href="/account" className="flex items-center gap-1 text-sm font-medium">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-1 text-sm font-medium">
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}

          <Link href="/wishlist" className="relative">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Wishlist</span>
          </Link>

          <Link href="/cart" className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {cartItemsCount}
              </span>
            )}
            <span className="sr-only">Cart</span>
          </Link>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="font-serif font-bold text-xl">
              Virasat
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="container grid gap-6 py-6">
            <form onSubmit={handleSearch} className="flex relative">
              <Input
                type="search"
                placeholder="Search sarees..."
                className="w-full pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>

            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn("text-lg font-medium", pathname === link.href && "font-bold")}
                onClick={toggleMenu}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t pt-6 mt-6">
              {user ? (
                <Link href="/account" className="flex items-center gap-2 text-lg font-medium">
                  <User className="h-5 w-5" />
                  My Account
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex items-center gap-2 text-lg font-medium mb-4">
                    <User className="h-5 w-5" />
                    Login
                  </Link>
                  <Link href="/register" className="flex items-center gap-2 text-lg font-medium">
                    <User className="h-5 w-5" />
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
