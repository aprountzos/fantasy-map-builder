'use client'
import { useState } from 'react'
import Link from 'next/link'
// ⬇️ Import your package.json
import pkg from '../package.json' // adjust path if needed

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Editor', href: '/editor' },
    { name: 'Example', href: '/example' },
    { name: 'Instructions', href: '/instructions' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/70 border-b border-gray-700 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Logo / Brand */}
        <div className="text-2xl font-extrabold text-white drop-shadow-lg flex items-center gap-2">
          🗺️ Fantasy Map
          <span className="text-sm text-gray-400">v{pkg.version}</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-1 rounded-lg hover:bg-gray-800/50"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Hamburger Button */}
        <button
          className="md:hidden flex flex-col gap-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-all ${
              isOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-all ${
              isOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900/80 backdrop-blur-md overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 py-4' : 'max-h-0'
        }`}
      >
        <div className="flex flex-col gap-2 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
