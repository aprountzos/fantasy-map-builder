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
          Editor Instructions
        </motion.button>
      )}

      {/* Instructions Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="w-80 bg-black/80 backdrop-blur-md rounded-2xl shadow-2xl p-5 mb-4 text-white"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-400">
                Editor Instructions
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Instructions Content */}
            <ul className="text-gray-200 text-sm space-y-2">
              <li>
                1. Upload a map image in the editor. This is required before
                drawing regions.
              </li>
              <li>2. Draw regions and assign colors to them.</li>
              <li>
                3. Place locations inside regions or outside for unassigned
                locations.
              </li>
              <li>4. Export the JSON file from the editor.</li>
              <li>
                5. Use the exported JSON in your project as <code>regions</code>{" "}
                and <code>locations</code> props.
              </li>
              <li>
                6. Import <code>ExportedFantasyMapViewer</code> and render it
                with the JSON data.
              </li>
            </ul>

            {/* Footer */}
            <div className="mt-4 text-gray-400 text-xs italic">
              Tip: Providing a map image first ensures your regions and
              locations match the correct scale. Using the editor saves time and
              prevents manual coordinate errors.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
