"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function EditorInstructionsWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Open Button */}
      {!open && (
        <motion.button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-2xl animate-bounce"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <InformationCircleIcon className="w-6 h-6" />
          Editor Help
        </motion.button>
      )}

      {/* Instructions Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="w-72 h-96 bg-black/85 backdrop-blur-md rounded-2xl shadow-2xl text-white border border-white/10 flex flex-col"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-indigo-400">
                Editor Guide
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-indigo-300 mb-2">1. Setup</h4>
                <p className="text-gray-300 leading-relaxed">
                  Click "Upload Map" to load your fantasy map image. Supported
                  formats: PNG, JPG, WebP.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-purple-300 mb-2">
                  2. Drawing Regions
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Click "Draw Region", then click points on the map to outline a
                  region (minimum 3 points). Click "Finish Region" and fill in
                  details.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-green-300 mb-2">
                  3. Adding Locations
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Click "Add Location" then click anywhere on the map to place a
                  marker. Edit details in the sidebar.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-blue-300 mb-2">
                  4. Editing Items
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Click any region or location to select it. Selected regions
                  show draggable vertex points. Use sidebar to edit properties.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">
                  5. Navigation
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  Scroll to zoom, middle-click drag to pan. Use "Select" mode
                  for editing. "Fullscreen" provides maximum workspace.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-orange-300 mb-2">
                  6. Undo Controls
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  "Undo Point" removes last drawing point. "Undo Region" removes
                  last created region. Toggle UI visibility for clean workspace.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-300 mb-2">
                  7. Export/Import
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  "Export" downloads JSON with all data. "Import" loads
                  previously saved files, restoring everything including the map
                  image.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-pink-300 mb-2">
                  8. Integration
                </h4>
                <div className="text-gray-300 leading-relaxed">
                  <p className="mb-2">Import and use the exported data:</p>
                  <pre className="bg-gray-900/50 p-2 rounded text-xs overflow-x-auto border border-gray-700">
                    {`import Viewer from './Viewer'
import data from './map.json'

<Viewer 
  mapImage={data.mapImage}
  locations={data.locations}
  regions={data.regions}
/>`}
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-cyan-300 mb-2">
                  9. Pro Tips
                </h4>
                <ul className="text-gray-300 leading-relaxed space-y-1 text-xs">
                  <li>• Use contrasting colors for regions</li>
                  <li>• Keep names concise but descriptive</li>
                  <li>• Add detailed lore for immersion</li>
                  <li>• Links can point to wikis or docs</li>
                  <li>• Upload map first for proper scaling</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10 text-xs text-gray-400 italic">
              Need help? Each tool has hover tooltips for quick guidance.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
