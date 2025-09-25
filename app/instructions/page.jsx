'use client'
import React from 'react'
import { ArrowDownIcon } from '@heroicons/react/24/outline'

export default function EditorInstructions() {
  const exampleJSON = `{
  "mapImage": "/maps/fantasy-map.jpg",
  "regions": [
    {
      "id": 1,
      "name": "Elven Forest",
      "color": "#34D399",
      "pointsPercent": [[10,10],[40,10],[40,40],[10,40]]
    }
  ],
  "locations": [
    {
      "id": 1,
      "name": "Silver Lake",
      "x": 25,
      "y": 25
    }
  ]
}`

  const exampleCode = `import ExportedFantasyMapViewer from './components/ExportedFantasyMapViewer';
import mapData from './maps/fantasy-map-export.json';

export default function MyMapPage() {
  return (
    <ExportedFantasyMapViewer 
      mapImage={mapData.mapImage} 
      regions={mapData.regions} 
      locations={mapData.locations} 
    />
  );
}`

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden pt-12 sm:pt-16 md:pt-24">
      {/* Background floating elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse -z-10"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 animate-pulse -z-10"></div>
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/10 rounded-full animate-ping -z-10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-ping -z-10"></div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-300 mb-4 drop-shadow-lg text-center">
        ExportedFantasyMapViewer Instructions
      </h1>
      <p className="text-gray-300 text-center max-w-3xl mb-8">
        You can export your map from the editor as JSON and use it directly in your project.
      </p>

      {/* Download component */}
      <a
        href={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}downloads/ExportedFantasyMapViewer.jsx`}
        download
        className="mb-8 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl shadow-xl transition-all hover:scale-105"
      >
        <ArrowDownIcon className="w-5 h-5" />
        Download Component
      </a>

      {/* Example JSON */}
      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-4 text-center">Example Exported JSON</h2>
        <pre className="bg-black/50 p-4 rounded-xl overflow-auto text-sm text-green-300">
          <code>{exampleJSON}</code>
        </pre>
      </div>

      {/* Example Usage */}
      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-4 text-center">Usage in Your Project</h2>
        <pre className="bg-black/50 p-4 rounded-xl overflow-auto text-sm text-green-300">
          <code>{exampleCode}</code>
        </pre>
      </div>

      {/* Steps */}
      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl space-y-6 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-4 text-center">Steps</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-200">
          <li>Use the editor to create your map and export JSON using the <code>Export JSON</code> button.</li>
          <li>Save the JSON file somewhere in your project, e.g. <code>maps/fantasy-map-export.json</code>.</li>
          <li>Import both the viewer component and JSON into your page.</li>
          <li>Pass the JSON data as props to <code>ExportedFantasyMapViewer</code> as shown above.</li>
          <li>All coordinates are in percentages for responsive scaling.</li>
        </ol>
      </div>

      {/* Styling Instructions */}
      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 mb-4 text-center">Styling Instructions</h2>
        <p className="text-gray-200">
          You can customize the look of your interactive map by modifying the following CSS classes or Tailwind utilities:
        </p>
        <ul className="list-disc list-inside space-y-3 text-gray-200">
          <li>
            <strong>Regions:</strong> Change fill color, opacity, stroke, and hover effects. Example: <code>fill-opacity-40 hover:opacity-60 stroke-2</code>.
          </li>
          <li>
            <strong>Locations:</strong> Adjust size, color, border, and animation. Example: <code>w-4 h-4 bg-red-500 border-2 border-white animate-pulse hover:scale-125</code>.
          </li>
          <li>
            <strong>Legend:</strong> Customize background, text color, padding, rounded corners, and scrollbar using <code>overflow-auto</code> and <code>::-webkit-scrollbar</code> for a modern fantasy look.
          </li>
          <li>
            <strong>Hover Tooltip:</strong> Change position, background, text color, shadow, and transition. Example: <code>bg-black/70 text-white px-2 py-1 rounded text-xs shadow-lg</code>.
          </li>
          <li>
            <strong>Modal:</strong> Adjust modal background, blur, border radius, shadow, padding, and transition effects for lore display.
          </li>
          <li>
            <strong>Container:</strong> Overall padding, background gradient, rounded corners, and shadow can be tweaked to fit your theme.
          </li>
        </ul>
        <p className="text-gray-200 mt-4">
          By combining Tailwind utilities with custom CSS, you can create a unique fantasy map style that fits your project perfectly.
        </p>
      </div>
    </main>
  )
}
