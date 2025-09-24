'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden pt-24">
      {/* Background floating elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/10 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-ping"></div>

      <div className="z-10 text-center px-6 max-w-5xl">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-6xl sm:text-7xl font-extrabold mb-6 drop-shadow-xl text-indigo-300"
        >
          🗺️ Fantasy Map Builder
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-3xl mx-auto mb-10 text-lg sm:text-xl text-gray-300"
        >
          Create, edit, and export stunning fantasy maps. Paint custom regions,
          add cities and markers, and export a standalone viewer component with
          JSON data to embed in other apps.
        </motion.p>

        {/* Call-to-action buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-wrap gap-6 justify-center mb-16"
        >
          <Link
            href="/editor"
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 transition-all text-lg font-semibold shadow-2xl backdrop-blur-sm"
          >
            Open Editor
          </Link>
          <Link
            href="/example"
            className="px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 transition-all text-lg font-semibold shadow-2xl backdrop-blur-sm"
          >
            Open Example
          </Link>
        </motion.div>

        {/* Features / Highlights section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-200 mb-16"
        >
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2 text-indigo-400">🎨 Custom Regions</h3>
            <p>Create and color your own regions with ease, adding lore and names.</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2 text-indigo-400">🏙️ Cities & Markers</h3>
            <p>Place markers for cities, landmarks, or magical locations anywhere on the map.</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2 text-indigo-400">💾 Export JSON</h3>
            <p>Save your map as JSON for use with the viewer or other projects.</p>
          </div>
          <div className="bg-black/50 backdrop-blur-md rounded-xl p-5 shadow-lg hover:scale-105 transition-transform">
            <h3 className="text-xl font-semibold mb-2 text-indigo-400">🔍 Viewer Integration</h3>
            <p>Embed a standalone map viewer component in any web app with your data.</p>
          </div>
        </motion.div>

        {/* Navigation links */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="mt-12 text-sm text-gray-400 flex justify-center gap-4"
        >
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <span>|</span>
          <Link href="/instructions" className="hover:text-white transition-colors">
            Instructions
          </Link>
          <span>|</span>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
