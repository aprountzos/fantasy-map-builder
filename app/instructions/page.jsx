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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold text-indigo-300 mb-4 drop-shadow-lg">
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
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Example Exported JSON</h2>
        <pre className="bg-black/50 p-4 rounded-xl overflow-auto text-sm text-green-300">
          <code>{exampleJSON}</code>
        </pre>
      </div>

      {/* Example Usage */}
      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Usage in Your Project</h2>
        <pre className="bg-black/50 p-4 rounded-xl overflow-auto text-sm text-green-300">
          <code>{exampleCode}</code>
        </pre>
      </div>

      <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm rounded-3xl p-6 shadow-2xl space-y-6">
        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Steps</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-200">
          <li>Use the editor to create your map and export JSON using the <code>Export JSON</code> button.</li>
          <li>Save the JSON file somewhere in your project, e.g. <code>maps/fantasy-map-export.json</code>.</li>
          <li>Import both the viewer component and JSON into your page.</li>
          <li>Pass the JSON data as props to <code>ExportedFantasyMapViewer</code> as shown above.</li>
          <li>All coordinates are in percentages for responsive scaling.</li>
        </ol>
      </div>
    </div>
  )
}
