'use client'
import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
export default function About() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden p-6">
      {/* Background floating circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 animate-pulse"></div>

      <div className="z-10 text-center max-w-3xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 drop-shadow-xl text-indigo-300">
          🗺️ About Fantasy Map Builder
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 mb-6">
          Fantasy Map Builder is a modern tool for creating, editing, and exporting rich, interactive fantasy maps. 
          Design your own world with custom regions, cities, and markers, then export a standalone viewer component with JSON data to embed in other projects.
        </p>

        <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-3 text-indigo-400">Project Info</h2>
          <ul className="text-gray-200 text-left space-y-2">
            <li><strong>Version:</strong> 1.0.0</li>
            <li><strong>Author:</strong> Athanasios Prountzos</li>
            <li><strong>Website:</strong> <Link href="/" className="text-indigo-400 hover:underline">Home / Editor</Link></li>
            <li className="flex items-center gap-2">
              <strong>GitHub:</strong>
              <Link href="https://github.com/aprountzos/fantasy-map-builder" target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1 ml-1">
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                Repository
              </Link>
            </li>
            <li><strong>License:</strong> MIT</li>
          </ul>
        </div>

        <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-indigo-400">Why Fantasy Map Builder?</h2>
          <p className="text-gray-200 text-left">
            This tool is perfect for writers, and hobbyists who want to visualize their fantasy worlds. 
            Quickly create regions, place markers, assign lore, and export everything in a format ready to integrate into your web projects.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-6">
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
        </div>
      </div>
    </main>
  )
}
