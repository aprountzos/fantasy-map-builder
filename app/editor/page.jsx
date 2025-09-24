'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group } from 'react-konva'
import useImage from 'use-image'
import ExportedFantasyMapViewer from '../../components/ExportedFantasyMapViewer'

export default function EditorPage() {
  // base logical map size (we render responsively but keep percentages)
  const BASE_W = 1000
  const BASE_H = 600

  // -- state
  const [mapSrc, setMapSrc] = useState(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}fantasy-map.png`)
  const [img] = useImage(mapSrc, 'anonymous')

  const [regions, setRegions] = useState([])
  const [locations, setLocations] = useState([])

  const [mode, setMode] = useState(null) // 'draw' | 'marker' | null
  const [currentPoints, setCurrentPoints] = useState([]) // stage coordinates
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', lore: '', color: '#f59e0b', link: '' })

  const [selectedRegionId, setSelectedRegionId] = useState(null)
  const [selectedLocId, setSelectedLocId] = useState(null)

  // responsive stage size (in pixels)
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [stageSize, setStageSize] = useState({ width: BASE_W, height: BASE_H })

  const idRef = useRef(1)

  // seed example content (keeps compatibility with your previous state)
  useEffect(() => {
    setRegions([
      {
        id: idRef.current++,
        name: 'Mystwood',
        lore: 'Ancient forest filled with magical creatures.',
        color: '#16a34a',
        pointsPercent: [
          [20, 20],
          [40, 25],
          [30, 45]
        ],
        link: 'https://example.com/mystwood'
      }
    ])
    setLocations([
      {
        id: idRef.current++,
        name: 'Dragonspire',
        lore: 'A bustling city of dragons',
        x: 60,
        y: 40,
        link: 'https://example.com/dragonspire'
      }
    ])
  }, [])

  // measure container width & compute stage height so stage fits responsively
  useEffect(() => {
    function updateSize() {
      const parent = containerRef.current
      if (!parent) return
      // keep max width = BASE_W so polygons remain reasonable
      const available = Math.min(parent.clientWidth, BASE_W)
      const h = Math.round((available * BASE_H) / BASE_W)
      setStageSize({ width: available, height: h })
    }

    updateSize()
    const ro = new ResizeObserver(updateSize)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // helpers: percent <-> absolute (stage) coords
  function percentToAbsolute(pointsPercent) {
    return pointsPercent.flatMap(([px, py]) => [(px / 100) * stageSize.width, (py / 100) * stageSize.height])
  }

  function absoluteToPercent([ax, ay]) {
    return [(ax / stageSize.width) * 100, (ay / stageSize.height) * 100]
  }

  // stage click handler for draw/marker
  function stageMouseDown(e) {
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    // ensure click inside stage bounds (0..width / 0..height)
    const { x, y } = pos
    if (x < 0 || y < 0 || x > stageSize.width || y > stageSize.height) return

    if (mode === 'draw') {
      // add a vertex
      setCurrentPoints((p) => [...p, [x, y]])
    } else if (mode === 'marker') {
      const pct = absoluteToPercent([x, y])
      setLocations((ls) => [...ls, { id: idRef.current++, name: 'New Location', lore: '', x: pct[0], y: pct[1], link: '' }])
      setMode(null)
    }
  }

  // finish drawing region: require >=3 points, convert to percent coords
  function finishDrawing() {
    if (currentPoints.length < 3) return alert('Need at least 3 points to create a region.')
    const percent = currentPoints.map((p) => absoluteToPercent(p))
    setRegions((rs) => [
      ...rs,
      { id: idRef.current++, name: formData.name || 'Region', lore: formData.lore, color: formData.color, pointsPercent: percent, link: formData.link || '' }
    ])
    setCurrentPoints([])
    setMode(null)
    setShowForm(false)
    setFormData({ name: '', lore: '', color: '#f59e0b', link: '' })
  }

  function startDrawing() {
    setMode('draw')
    setCurrentPoints([])
    setShowForm(true)
    setSelectedLocId(null)
    setSelectedRegionId(null)
  }
  function startAddMarker() {
    setMode('marker')
    setSelectedLocId(null)
    setSelectedRegionId(null)
  }

  // update a vertex while dragging
  function updateVertex(regionId, vertexIndex, absXY) {
    const newPct = absoluteToPercent(absXY)
    setRegions((prev) => prev.map((r) => (r.id === regionId ? { ...r, pointsPercent: r.pointsPercent.map((pt, i) => (i === vertexIndex ? newPct : pt)) } : r)))
  }

  // marker drag end -> update location percent coords
  function onMarkerDragEnd(e, locId) {
    const { x, y } = e.target.position()
    const pct = absoluteToPercent([x, y])
    setLocations((prev) => prev.map((l) => (l.id === locId ? { ...l, x: Math.max(0, Math.min(100, pct[0])), y: Math.max(0, Math.min(100, pct[1])) } : l)))
  }

  // undo helpers
  function undoLastPoint() {
    if (currentPoints.length > 0) setCurrentPoints((pts) => pts.slice(0, -1))
  }
  function undoLastRegion() {
    setRegions((r) => r.slice(0, -1))
  }

  // export / import
  function exportJSON() {
    const data = { mapImage: mapSrc, locations, regions }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fantasy-map-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJSON(file) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (parsed.mapImage) setMapSrc(parsed.mapImage)
        if (Array.isArray(parsed.locations)) setLocations(parsed.locations)
        if (Array.isArray(parsed.regions)) setRegions(parsed.regions)
        alert('Imported successfully')
      } catch {
        alert('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }

  // small UI helpers for cursor on hover (Konva doesn't apply CSS cursor)
  function enterPointer() { document.body.style.cursor = 'pointer' }
  function leavePointer() { document.body.style.cursor = '' }

  // sidebar maxHeight same as stage (keeps them equal)
  const sidebarMaxHeight = stageSize.height || BASE_H

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white p-4">
      {/* top toolbar (buttons remain here as requested) */}
      <div className="flex flex-wrap gap-2 mb-4">
        <label className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white cursor-pointer">
          Upload Map
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return
            const r = new FileReader(); r.onload = () => setMapSrc(r.result); r.readAsDataURL(f)
          }} />
        </label>

        <button onClick={startDrawing} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600">Draw Region</button>
        <button onClick={() => { if (mode === 'draw' && currentPoints.length >= 3) setShowForm(true); else alert('Draw at least 3 points first.') }} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600">Finish Region</button>
        <button onClick={startAddMarker} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500">Add Marker</button>
        <button onClick={() => setMode(null)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Cancel Mode</button>

        <button onClick={undoLastPoint} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Undo Last Point</button>
        <button onClick={undoLastRegion} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">Undo Last Region</button>

        <button onClick={exportJSON} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500">Export JSON</button>
        <label className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white cursor-pointer">
          Import JSON
          <input type="file" accept=".json" className="hidden" onChange={(e) => importJSON(e.target.files?.[0])} />
        </label>
      </div>

      {/* main editor row: stage (left) + sidebar (right on desktop) */}
      <div ref={containerRef} className="w-full flex flex-col lg:flex-row gap-4 items-start">
        {/* Stage container (responsive) */}
        <div className="flex-1 flex justify-center">
          <div className="bg-gray-900 rounded-lg shadow-inner" style={{ width: '100%', maxWidth: BASE_W }}>
            <div style={{ width: stageSize.width, height: stageSize.height }}>
              <Stage
                width={stageSize.width}
                height={stageSize.height}
                ref={stageRef}
                onMouseDown={stageMouseDown}
                style={{ display: 'block', touchAction: 'none' }} // prevent mobile dragscroll
              >
                <Layer>
                  {/* background image as KonvaImage */}
                  {img && <KonvaImage image={img} x={0} y={0} width={stageSize.width} height={stageSize.height} />}

                  {/* render regions */}
                  {regions.map((r) => (
                    <Group key={r.id}>
                      <Line
                        points={percentToAbsolute(r.pointsPercent)}
                        closed
                        fill={r.color}
                        opacity={0.35}
                        stroke={r.color}
                        strokeWidth={2}
                        onClick={(e) => { e.cancelBubble = true; setSelectedRegionId(r.id); setSelectedLocId(null) }}
                        onMouseEnter={enterPointer}
                        onMouseLeave={leavePointer}
                      />
                      {/* show draggable vertices for selected region */}
                      {selectedRegionId === r.id && r.pointsPercent.map((pt, idx) => {
                        const ax = (pt[0] / 100) * stageSize.width
                        const ay = (pt[1] / 100) * stageSize.height
                        return (
                          <Circle
                            key={idx}
                            x={ax}
                            y={ay}
                            radius={6}
                            fill="#facc15"
                            stroke="#f59e0b"
                            draggable
                            onDragMove={(e) => updateVertex(r.id, idx, [e.target.x(), e.target.y()])}
                            onMouseEnter={enterPointer}
                            onMouseLeave={leavePointer}
                          />
                        )
                      })}
                    </Group>
                  ))}

                  {/* drawing preview */}
                  {currentPoints.length > 0 && (
                    <>
                      <Line points={currentPoints.flat()} stroke="#f59e0b" strokeWidth={2} />
                      {currentPoints.map((p, i) => <Circle key={i} x={p[0]} y={p[1]} radius={4} fill="#fff" stroke="#000" />)}
                    </>
                  )}

                  {/* markers */}
                  {locations.map((loc) => {
                    const ax = (loc.x / 100) * stageSize.width
                    const ay = (loc.y / 100) * stageSize.height
                    const isSelected = selectedLocId === loc.id
                    return (
                      <Circle
                        key={loc.id}
                        x={ax}
                        y={ay}
                        radius={isSelected ? 10.5 : 8}
                        fill="red"
                        stroke={isSelected ? 'yellow' : 'white'}
                        draggable
                        onDragEnd={(e) => onMarkerDragEnd(e, loc.id)}
                        onClick={(e) => { e.cancelBubble = true; setSelectedLocId(loc.id); setSelectedRegionId(null) }}
                        onMouseEnter={enterPointer}
                        onMouseLeave={leavePointer}
                        shadowBlur={isSelected ? 10 : 3}
                      />
                    )
                  })}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>

        {/* Sidebar (right on desktop) */}
        <aside className="lg:w-96 w-full bg-black/50 backdrop-blur-md p-3 rounded-lg shadow-lg flex flex-col" style={{ maxHeight: sidebarMaxHeight }}>
          {/* edit item on top (single item) */}
          <div>
            <h4 className="text-lg font-semibold text-indigo-300 mb-2">Edit Item</h4>

            {selectedRegionId && (() => {
              const r = regions.find(rr => rr.id === selectedRegionId)
              if (!r) return <div className="text-sm text-gray-400">Select a region to edit</div>
              return (
                <div className="space-y-2 mb-3">
                  <input className="w-full p-2 rounded bg-gray-800 text-sm" value={r.name} onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, name: e.target.value } : rr))} />
                  <textarea className="w-full p-2 rounded bg-gray-800 text-sm" value={r.lore} onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, lore: e.target.value } : rr))} />
                  <input type="color" className="w-full p-1 rounded bg-gray-800" value={r.color} onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, color: e.target.value } : rr))} />
                  <input type="url" className="w-full p-2 rounded bg-gray-800 text-sm" value={r.link || ''} onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, link: e.target.value } : rr))} placeholder="https://example.com" />
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedRegionId(null)} className="px-3 py-1 rounded bg-gray-700">Done</button>
                    <button onClick={() => setRegions(prev => prev.filter(x => x.id !== r.id))} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
                  </div>
                </div>
              )
            })()}

            {selectedLocId && (() => {
              const l = locations.find(ll => ll.id === selectedLocId)
              if (!l) return <div className="text-sm text-gray-400">Select a marker to edit</div>
              return (
                <div className="space-y-2 mb-3">
                  <input className="w-full p-2 rounded bg-gray-800 text-sm" value={l.name} onChange={e => setLocations(prev => prev.map(ll => ll.id === l.id ? { ...ll, name: e.target.value } : ll))} />
                  <textarea className="w-full p-2 rounded bg-gray-800 text-sm" value={l.lore} onChange={e => setLocations(prev => prev.map(ll => ll.id === l.id ? { ...ll, lore: e.target.value } : ll))} />
                  <input type="url" className="w-full p-2 rounded bg-gray-800 text-sm" value={l.link || ''} onChange={e => setLocations(prev => prev.map(ll => ll.id === l.id ? { ...ll, link: e.target.value } : ll))} placeholder="https://example.com" />
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedLocId(null)} className="px-3 py-1 rounded bg-gray-700">Done</button>
                    <button onClick={() => setLocations(prev => prev.filter(x => x.id !== l.id))} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* list (scrollable) */}
          <div className="flex-1 overflow-y-auto">
            <div className="font-medium mb-1">Regions</div>
            {regions.map(r => (
              <div key={r.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { setSelectedRegionId(r.id); setSelectedLocId(null) }}>
                <div>{r.name}</div>
                <div style={{ width: 18, height: 18, background: r.color }} className="rounded-full border" />
              </div>
            ))}

            <div className="font-medium mt-3 mb-1">Markers</div>
            {locations.map(l => (
              <div key={l.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded cursor-pointer" onClick={() => { setSelectedLocId(l.id); setSelectedRegionId(null) }}>
                <div>{l.name}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* viewer preview ALWAYS below editor */}
      <div className="mt-6 bg-gray-900 p-4 rounded-lg shadow-md">
        <h3 className="font-semibold mb-2 text-indigo-400">Viewer Preview</h3>
        <ExportedFantasyMapViewer mapImage={mapSrc} locations={locations} regions={regions} />
      </div>

      {/* region creation modal (same UX) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 p-5 rounded-2xl w-96 shadow-2xl">
            <h3 className="font-semibold text-indigo-300 mb-3">Region Details</h3>
            <label className="block mb-1 text-sm">Name</label>
            <input className="w-full p-2 mb-2 rounded bg-gray-800" value={formData.name} onChange={(e) => setFormData(fd => ({ ...fd, name: e.target.value }))} />
            <label className="block mb-1 text-sm">Lore</label>
            <textarea className="w-full p-2 mb-2 rounded bg-gray-800" value={formData.lore} onChange={(e) => setFormData(fd => ({ ...fd, lore: e.target.value }))} rows={4} />
            <label className="block mb-1 text-sm">Color</label>
            <input type="color" className="w-full p-2 mb-3 rounded bg-gray-800" value={formData.color} onChange={(e) => setFormData(fd => ({ ...fd, color: e.target.value }))} />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setShowForm(false); setCurrentPoints([]) }} className="px-3 py-1 rounded bg-gray-700">Cancel</button>
              <button onClick={finishDrawing} className="px-3 py-1 rounded bg-indigo-600 text-white">Save Region</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
