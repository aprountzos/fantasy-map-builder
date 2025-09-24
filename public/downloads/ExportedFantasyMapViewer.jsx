'use client'
import React, { useEffect, useRef, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { motion, AnimatePresence } from 'framer-motion'

// Utility: check if a point is inside a polygon
function pointInPolygon(x, y, polygonPointsPercent, imgSize) {
  // Convert percent points to pixel coords
  const pts = polygonPointsPercent.map(p => [(p[0] / 100) * imgSize.width, (p[1] / 100) * imgSize.height])
  let inside = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1]
    const xj = pts[j][0], yj = pts[j][1]
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export default function ExportedFantasyMapViewer({ mapImage, locations = [], regions = [] }) {
  const imgRef = useRef(null)
  const [imgSize, setImgSize] = useState({ width: 1000, height: 600 })
  const [showModal, setShowModal] = useState(false)
  const [modalItem, setModalItem] = useState(null)
  const [legendVisible, setLegendVisible] = useState(true)
  const [hoverItem, setHoverItem] = useState(null)
  const transformRef = useRef(null)

  useEffect(() => {
    function onResize() {
      if (imgRef.current) {
        setImgSize({ width: imgRef.current.clientWidth, height: imgRef.current.clientHeight })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  function onImgLoad(e) {
    setImgSize({ width: e.target.clientWidth, height: e.target.clientHeight })
  }

  function pointsToSvgPoints(pointsPercent) {
    return pointsPercent.map(p => `${(p[0] / 100) * imgSize.width} ${(p[1] / 100) * imgSize.height}`).join(' ')
  }

  function openRegion(r) { setModalItem(r); setShowModal(true) }
  function openLocation(l) { setModalItem(l); setShowModal(true) }

  function centerOn(xPercent, yPercent) {
    const x = (xPercent / 100) * imgSize.width
    const y = (yPercent / 100) * imgSize.height
    if (transformRef.current) {
      transformRef.current.setTransform(
        imgSize.width / 2 - x,
        imgSize.height / 2 - y,
        1
      )
    }
  }

  function centerRegion(region) {
    const pts = region.pointsPercent
    const avgX = pts.reduce((sum, p) => sum + p[0], 0) / pts.length
    const avgY = pts.reduce((sum, p) => sum + p[1], 0) / pts.length
    centerOn(avgX, avgY)
  }

    // Check if a pixel point is inside a polygon (in pixels)
  function pointInPolygon(x, y, polygonPointsPercent) {
    const pts = polygonPointsPercent.map(p => [(p[0] / 100) * imgSize.width, (p[1] / 100) * imgSize.height])
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1]
      const xj = pts[j][0], yj = pts[j][1]
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }

  // Assign locations to regions dynamically
  const locationsByRegion = regions.map(r => ({
    ...r,
    locations: locations.filter(l => {
      const xPx = (l.x / 100) * imgSize.width
      const yPx = (l.y / 100) * imgSize.height
      return pointInPolygon(xPx, yPx, r.pointsPercent)
    })
  }))

  const unassignedLocations = locations.filter(l => {
    const xPx = (l.x / 100) * imgSize.width
    const yPx = (l.y / 100) * imgSize.height
    return !regions.some(r => pointInPolygon(xPx, yPx, r.pointsPercent))
  })

  return (
    <div className="relative bg-gray-900/20 rounded-lg p-2 overflow-hidden shadow-inner">
      {/* Legend Toggle */}
      <div className="absolute top-2 left-2 z-40">
        <button
          onClick={() => setLegendVisible(v => !v)}
          className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded text-xs hover:bg-white/30 transition"
        >
          {legendVisible ? 'Hide Legend' : 'Show Legend'}
        </button>
      </div>

      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        ref={transformRef}
      >
        <TransformComponent>
          <div className="relative w-[1200px] max-w-[95vw] mx-auto">
            <img
              ref={imgRef}
              src={mapImage}
              onLoad={onImgLoad}
              alt="map"
              className="w-full rounded-md select-none shadow-lg"
            />

            {/* Regions */}
            <svg
              viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
              preserveAspectRatio="xMidYMid meet"
              style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
            >
              {regions.map(r => (
                <polygon
                  key={r.id}
                  points={pointsToSvgPoints(r.pointsPercent)}
                  fill={r.color}
                  opacity={hoverItem?.type === 'region' && hoverItem.name === r.name ? 0.7 : 0.35}
                  stroke={r.color}
                  strokeWidth="2"
                  className={`cursor-pointer transition-all ${hoverItem?.type === 'region' && hoverItem.name === r.name ? 'filter drop-shadow-lg' : 'hover:opacity-50 hover:filter hover:drop-shadow-lg'}`}
                  onClick={() => {
                    openRegion(r);
                    centerRegion(r);
                    setHoverItem({ type: 'region', name: r.name, pointsPercent: r.pointsPercent });
                  }}
                  onMouseEnter={() => setHoverItem({ type: 'region', name: r.name, pointsPercent: r.pointsPercent })}
                  onMouseLeave={() => setHoverItem(null)}
                />
              ))}
            </svg>

            {/* Locations */}
            {locations.map(loc => (
              <div
                key={loc.id}
                style={{
                  position: 'absolute',
                  left: `${loc.x}%`,
                  top: `${loc.y}%`,
                  transform: 'translate(-50%,-50%)',
                }}
                onMouseEnter={() => setHoverItem({ type: 'location', name: loc.name, xPercent: loc.x, yPercent: loc.y })}
                onMouseLeave={() => setHoverItem(null)}
              >
                <div
                  onClick={() => { openLocation(loc); centerOn(loc.x, loc.y) }}
                  className="w-4 h-4 bg-red-500 rounded-full border-2 border-white cursor-pointer shadow-lg hover:scale-125 transition-transform"
                />
              </div>
            ))}

            {/* Hover tooltip */}
            {hoverItem && (
              <div
                style={{
                  position: 'absolute',
                  left: hoverItem.xPercent !== undefined
                    ? `${hoverItem.xPercent}%`
                    : `${hoverItem.pointsPercent.reduce((sum, p) => sum + p[0], 0)/hoverItem.pointsPercent.length}%`,
                  top: hoverItem.yPercent !== undefined
                    ? `${hoverItem.yPercent}%`
                    : `${hoverItem.pointsPercent.reduce((sum, p) => sum + p[1], 0)/hoverItem.pointsPercent.length}%`,
                  transform: 'translate(-50%, -120%)',
                }}
                className="bg-black/70 text-white px-2 py-1 rounded text-xs shadow-lg pointer-events-none z-50"
              >
                {hoverItem.name}
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Legend */}
      {legendVisible && (
        <div className="absolute top-14 left-2 z-40 bg-black/50 backdrop-blur-md p-3 rounded-lg shadow-md max-h-64 overflow-auto text-sm text-white">
          <div className="font-bold mb-2 text-lg">Legend</div>
          {locationsByRegion.map(r => (
            <div key={r.id} className="mb-2">
              <div
                className="flex items-center gap-2 mb-1 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  centerRegion(r);
                  setHoverItem({ type: 'region', name: r.name, pointsPercent: r.pointsPercent });
                }}
              >
                <div className="w-4 h-4 rounded-full border border-white" style={{ background: r.color }} />
                <div>{r.name}</div>
              </div>

              {/* Locations inside this region */}
              <div className="ml-4 space-y-1">
                {r.locations.map(loc => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      centerOn(loc.x, loc.y);
                      setHoverItem({ type: 'location', name: loc.name, xPercent: loc.x, yPercent: loc.y });
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full border border-white" />
                    <div>{loc.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Unassigned locations */}
          {unassignedLocations.length > 0 && (
            <div className="mb-2">
              <div className="font-semibold mb-1">Other Locations</div>
              <div className="ml-4 space-y-1">
                {unassignedLocations.map(loc => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      centerOn(loc.x, loc.y);
                      setHoverItem({ type: 'location', name: loc.name, xPercent: loc.x, yPercent: loc.y });
                    }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full border border-white" />
                    <div>{loc.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && modalItem && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: -50, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 50, scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-gray-900/80 backdrop-blur-xl border border-indigo-500/30 p-6 rounded-3xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto overflow-x-hidden"
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 rounded-full bg-indigo-400/50 animate-pulse"></div>

              <h3 className="font-extrabold text-2xl text-indigo-400 mb-3 text-center drop-shadow-md">
                {modalItem.name}
              </h3>

              <p className="text-sm text-gray-200 whitespace-pre-wrap break-words mb-4 max-w-full">
                {modalItem.showFull
                  ? modalItem.lore || 'No description'
                  : (modalItem.lore?.slice(0, 140) + (modalItem.lore?.length > 140 ? '...' : '')) || 'No description'}
              </p>

              <div className="flex justify-center gap-3 flex-wrap">
                {/* Show More / Show Less */}
                {modalItem.lore?.length > 140 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setModalItem(prev => ({ ...prev, showFull: !prev.showFull }))}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-shadow shadow-md"
                  >
                    {modalItem.showFull ? 'Show Less' : 'Show More'}
                  </motion.button>
                )}

                {/* Open Link if exists */}
                {modalItem.link && (
                  <motion.a
                    href={modalItem.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-shadow shadow-md"
                  >
                    Open Link
                  </motion.a>
                )}

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-semibold transition-shadow shadow-md"
                >
                  Close
                </motion.button>
              </div>

              {/* Floating magical particles */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-2 h-2 bg-indigo-400 rounded-full absolute top-5 left-10 animate-pulse"></div>
                <div className="w-1 h-1 bg-purple-300 rounded-full absolute bottom-10 right-16 animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full absolute top-20 right-20 animate-ping"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
