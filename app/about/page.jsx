'use client'

import Link from 'next/link'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState, useEffect } from 'react'

export default function About() {
  const [patchNotesData, setpatchNotesDatas] = useState([]);

  useEffect(() => {
    const path = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/patch_notes/patch_notes.json`
    fetch(path)
      .then(res => res.json())
      .then(data => setpatchNotesDatas(data))
      .catch(err => console.error('Failed to load patch notes:', err))
  }, []);

  const patchNotes = [...patchNotesData].sort((a, b) => {
    const parse = v => v.version.split('.').map(n => parseInt(n))
    const [a1, a2, a3] = parse(a)
    const [b1, b2, b3] = parse(b)
    if (a1 !== b1) return b1 - a1
    if (a2 !== b2) return b2 - a2
    return b3 - a3
  })

  const [expandedVersion, setExpandedVersion] = useState(patchNotes[0]?.version || null)

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden pt-24">
      {/* Background floating elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/10 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-ping"></div>

      <div className="z-10 text-center max-w-3xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 drop-shadow-xl text-indigo-300">
          🗺️ About Fantasy Map Builder
        </h1>
      <p className="text-lg sm:text-xl text-gray-300 mb-6">
          Fantasy Map Builder is a modern tool for creating, editing, and exporting rich, interactive fantasy maps. 
          Design your own world with custom regions, cities, and markers, then export a standalone viewer component with JSON data to embed in other projects.
        </p>

        {/* Project Info */}
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
        {/* Patch Notes */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-6 shadow-lg mb-6 w-full max-h-96 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-3 text-indigo-400">Patch Notes</h2>
          <ul className="text-gray-200 text-left space-y-3">
            {patchNotes.map((p) => {
              const isExpanded = expandedVersion === p.version
              return (
                <li key={p.version} className="border-l-4 border-indigo-600 pl-3">
                  <div
                    className="flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setExpandedVersion(isExpanded ? null : p.version)}
                  >
                    <span className="font-semibold">{p.version}</span>
                    <span className="text-xs text-gray-400">{p.date}</span>
                  </div>
                  {isExpanded && (
                    <div className="prose prose-invert text-gray-300 text-sm mt-2">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h2: ({ node, ...props }) => <h2 className="text-indigo-400 font-semibold" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-indigo-300 font-semibold" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-4 list-disc" {...props} />,
                        }}
                      >
                        {p.notes}
                      </ReactMarkdown>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Action Buttons */}
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
