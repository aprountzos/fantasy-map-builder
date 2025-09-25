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
  const [img] = useImage(mapSrc, 'anonymous');
  const [regions, setRegions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isMiddlePanning, setIsMiddlePanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  const [mode, setMode] = useState('Select'); // 'draw' | 'marker' | null
  const [currentPoints, setCurrentPoints] = useState([]); // percentage coordinates
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', lore: '', color: '#f59e0b', link: '' });

  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedLocId, setSelectedLocId] = useState(null);

  // responsive stage size (in pixels)
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ width: BASE_W, height: BASE_H });

  const idRef = useRef(1);

  // seed example content
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

  // Fullscreen handlers
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        const element = containerRef.current
        if (element?.requestFullscreen) {
          await element.requestFullscreen()
        } else if (element?.webkitRequestFullscreen) {
          await element.webkitRequestFullscreen()
        } else if (element?.mozRequestFullScreen) {
          await element.mozRequestFullScreen()
        } else if (element?.msRequestFullscreen) {
          await element.msRequestFullscreen()
        }
        setIsFullscreen(true)
      } catch (err) {
        setIsFullscreen(true)
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen()
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen()
        }
        setIsFullscreen(false)
      } catch (err) {
        setIsFullscreen(false)
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      )
      if (!isCurrentlyFullscreen && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [isFullscreen])

  // ESC key to exit fullscreen
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isFullscreen])

  // measure container width & compute stage height so stage fits responsively
  useEffect(() => {
    function updateSize() {
      const parent = containerRef.current
      if (!parent) return
      
      let available, height
      
      if (isFullscreen) {
        // Fullscreen: use entire viewport minus space for UI elements
        available = window.innerWidth - 64 // Account for padding and sidebar
        height = window.innerHeight - 180 // Space for control panel, toolbar, and status bar
        
        // If sidebar is showing, reduce available width
        if (showSidebar) {
          available -= 340 // Sidebar width + gap
        }
        
        // Maintain aspect ratio
        const aspectRatio = BASE_W / BASE_H
        if (available / height > aspectRatio) {
          available = height * aspectRatio
        } else {
          height = available / aspectRatio
        }
      } else {
        // Normal mode: responsive to container, account for sidebar
        const sidebarWidth = showSidebar ? 400 : 0
        available = Math.min(parent.clientWidth - sidebarWidth - 32, BASE_W)
        available = Math.max(available, 300) // Minimum width
        height = Math.round((available * BASE_H) / BASE_W)
      }
      
      setStageSize({ width: available, height })
    }

    updateSize()
    const ro = new ResizeObserver(updateSize)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', updateSize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [isFullscreen, showSidebar])

  let lastDist = 0;

  function handleTouchMove(e) {
    if (e.evt.touches.length === 2) {
      e.evt.preventDefault();
      const stage = stageRef.current;
      const t1 = e.evt.touches[0];
      const t2 = e.evt.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

      if (lastDist) {
        const scaleBy = dist / lastDist;
        const oldScale = stage.scaleX();
        const newScale = Math.max(0.5, Math.min(4, oldScale * scaleBy));

        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
        const mousePointTo = {
          x: center.x / oldScale - stage.x() / oldScale,
          y: center.y / oldScale - stage.y() / oldScale,
        };

        stage.scale({ x: newScale, y: newScale });
        setScale(newScale);

        const newPos = {
          x: -(mousePointTo.x - center.x / newScale) * newScale,
          y: -(mousePointTo.y - center.y / newScale) * newScale,
        };
        stage.position(newPos);
        setStagePos(newPos);
        stage.batchDraw();
      }

      lastDist = dist;
    }
  }

  function handleTouchEnd(e) {
    if (e.evt.touches.length < 2) lastDist = 0;
  }

  function stageTouchStart(e) {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const touch = e.evt.touches[0];
    if (!touch) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    stageMouseDown({ ...e, target: stage, getPointerPosition: () => pointer });
  }

  function handleWheel(e) {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = Math.max(0.5, Math.min(4, e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy));
    setScale(newScale);

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    };
    stage.position(newPos);
    setStagePos(newPos);
    stage.batchDraw();
  }

  // helpers: percent <-> absolute (stage) coords
  function percentToAbsolute(pointsPercent) {
    return pointsPercent.flatMap(([px, py]) => [
      (px / 100) * stageSize.width,
      (py / 100) * stageSize.height
    ]);
  }

  function getCircleRadius(baseRadius = 8) {
    return Math.max(3, (stageSize.width / BASE_W) * baseRadius / scale);
  }

  function absoluteToPercent([ax, ay]) {
    return [(ax / stageSize.width) * 100, (ay / stageSize.height) * 100]
  }

  // stage click handler for draw/marker
  function stageMouseDown(e) {
    const stage = stageRef.current;
    if (!stage) return;

    // Middle mouse panning
    if (e.evt.button === 1) {
      e.evt.preventDefault();
      e.evt.stopPropagation();
      setIsMiddlePanning(true);
      stage.draggable(true);
      stage.container().style.cursor = "grabbing";
      return;
    }

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scale = stage.scaleX();
    const x = (pointer.x - stage.x()) / scale;
    const y = (pointer.y - stage.y()) / scale;

    if (mode === 'draw') {
      const pctX = (x / stageSize.width) * 100;
      const pctY = (y / stageSize.height) * 100;
      setCurrentPoints((pts) => [...pts, [pctX, pctY]]);
    } else if (mode === 'marker') {
      const pctX = (x / stageSize.width) * 100;
      const pctY = (y / stageSize.height) * 100;
      setLocations((ls) => [
        ...ls,
        { id: idRef.current++, name: 'New Location', lore: '', x: pctX, y: pctY, link: '' }
      ]);
      setMode('Select');
    }
  }

  function stageMouseUp(e) {
    if (isMiddlePanning && e.evt.button === 1) {
      const stage = stageRef.current;
      if (!stage) return;

      stage.draggable(false);
      stage.container().style.cursor = "default";
      setIsMiddlePanning(false);
    }
  }

  // finish drawing region
  function finishDrawing() {
    if (currentPoints.length < 3) return alert('Need at least 3 points to create a region.')
    setRegions((rs) => [
      ...rs,
      { id: idRef.current++, name: formData.name || 'Region', lore: formData.lore, color: formData.color, pointsPercent: currentPoints, link: formData.link || '' }
    ])
    setCurrentPoints([])
    setMode('Select')
    setShowForm(false)
    setFormData({ name: '', lore: '', color: '#f59e0b', link: '' })
  }

  function startDrawing() {
    setMode('draw')
    setCurrentPoints([])
    setSelectedLocId(null)
    setSelectedRegionId(null)
  }

  function startAddMarker() {
    setMode('marker')
    setSelectedLocId(null)
    setSelectedRegionId(null)
  }

  function updateVertex(regionId, vertexIndex, absXY) {
    const newPct = absoluteToPercent(absXY);
    setRegions((prev) =>
      prev.map((r) =>
        r.id === regionId
          ? { ...r, pointsPercent: r.pointsPercent.map((pt, i) => (i === vertexIndex ? newPct : pt)) }
          : r
      )
    );
  }

  function onMarkerDragEnd(e, locId) {
    const stage = stageRef.current;
    if (!stage) return;

    const absX = e.target.x();
    const absY = e.target.y();
    const pct = absoluteToPercent([absX, absY]);

    setLocations((prev) =>
      prev.map((l) =>
        l.id === locId
          ? { ...l, x: Math.max(0, Math.min(100, pct[0])), y: Math.max(0, Math.min(100, pct[1])) }
          : l
      )
    );
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

  function enterPointer() { document.body.style.cursor = 'pointer' }
  function leavePointer() { document.body.style.cursor = '' }

  const containerClasses = isFullscreen 
    ? "fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex flex-col"
    : "min-h-screen w-full bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white"

  // Toolbar Component
  const ToolbarContent = () => (
    <div className="flex flex-wrap gap-2 items-center">
      <label className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded text-white cursor-pointer text-sm transition-colors">
        📁 Upload Map
        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0]; if (!f) return
          const r = new FileReader(); r.onload = () => setMapSrc(r.result); r.readAsDataURL(f)
        }} />
      </label>

      <div className="h-6 w-px bg-white/20"></div>

      <button 
        onClick={startDrawing} 
        className={`px-3 py-2 rounded text-sm transition-all ${mode === 'draw' ? 'bg-purple-500 shadow-lg' : 'bg-purple-700 hover:bg-purple-600'}`}
      >
        ✏️ Draw Region
      </button>
      
      <button 
        onClick={() => { if (mode === 'draw' && currentPoints.length >= 3) setShowForm(true); else alert('Draw at least 3 points first.') }} 
        className={`px-3 py-2 rounded text-sm transition-all ${mode === 'draw' && currentPoints.length >= 3 ? 'bg-purple-600 hover:bg-purple-500' : 'bg-gray-600 cursor-not-allowed'}`}
        disabled={mode !== 'draw' || currentPoints.length < 3}
      >
        ✅ Finish Region
      </button>
      
      <button 
        onClick={startAddMarker} 
        className={`px-3 py-2 rounded text-sm transition-all ${mode === 'marker' ? 'bg-green-500 shadow-lg' : 'bg-green-600 hover:bg-green-500'}`}
      >
        📍 Add Location
      </button>
      
      <button 
        onClick={() => setMode('Select')} 
        className={`px-3 py-2 rounded text-sm transition-all ${mode === 'Select' ? 'bg-blue-500 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        👆 Select
      </button>

      <div className="h-6 w-px bg-white/20"></div>

      <button 
        onClick={undoLastPoint} 
        className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={currentPoints.length === 0}
      >
        ↶ Undo Point
      </button>
      
      <button 
        onClick={undoLastRegion} 
        className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={regions.length === 0}
      >
        ↶ Undo Region
      </button>

      <div className="h-6 w-px bg-white/20"></div>

      <button onClick={exportJSON} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm transition-all">
        💾 Export
      </button>
      
      <label className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded text-white cursor-pointer text-sm transition-all">
        📤 Import
        <input type="file" accept=".json" className="hidden" onChange={(e) => importJSON(e.target.files?.[0])} />
      </label>
    </div>
  )

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      style={isFullscreen ? { zIndex: 9999 } : {}}
    >
      {/* Smart Control Panel - Top Level */}
      <div className={`${isFullscreen ? 'absolute' : 'relative'} top-4 left-4 z-30 flex gap-2`}>
        <button
          onClick={() => setShowToolbar(v => !v)}
          className="bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg text-sm hover:bg-white/30 transition-all shadow-lg border border-white/10"
        >
          {showToolbar ? '🔧 Hide Tools' : '🔧 Show Tools'}
        </button>
        
        <button
          onClick={() => setShowSidebar(v => !v)}
          className="bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg text-sm hover:bg-white/30 transition-all shadow-lg border border-white/10"
        >
          {showSidebar ? '📋 Hide Panel' : '📋 Show Panel'}
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-lg text-sm hover:bg-white/30 transition-all shadow-lg border border-white/10"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? '🪟 Exit Fullscreen' : '⛶ Fullscreen'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`${isFullscreen ? 'flex-1 flex flex-col pt-16 pb-4' : 'pt-12 p-4'}`}>
        
        {/* Floating Toolbar - Above Map */}
        {showToolbar && (
          <div className={`${isFullscreen ? 'mx-4 mb-4' : 'mb-4'}  backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/10 z-40`}>
            <ToolbarContent />
          </div>
        )}

        {/* Editor Layout */}
        <div className={`${isFullscreen ? 'flex-1 flex gap-4 mx-4 min-h-0 -m-3' : 'flex flex-col md:justify-center lg:flex-row gap-4 lg:items-start'}`}>
          
          {/* Stage Container with Status Bar */}
          <div className="flex-1 flex flex-col items-center min-h-0">
            <div className="bg-gray-900/80 rounded-xl border border-gray-700/50 p-1  flex items-center justify-center" style={{ width: stageSize.width + 4, height: stageSize.height + 4 }}>
              <div className="bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center" style={{ width: stageSize.width, height: stageSize.height }}>
                <Stage
                  width={stageSize.width}
                  height={stageSize.height}
                  ref={stageRef}
                  onMouseDown={stageMouseDown}
                  onMouseUp={stageMouseUp}
                  onTouchStart={stageTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  draggable={false}
                  style={{ 
                    cursor: isMiddlePanning ? "grabbing" : (mode === 'draw' ? "crosshair" : mode === 'marker' ? "crosshair" : "default")
                  }}
                >
                  <Layer>
                    {/* background image */}
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
                          strokeWidth={selectedRegionId === r.id ? 2 / scale : 1 / scale}
                          onClick={(e) => { e.cancelBubble = true; setSelectedRegionId(r.id); setSelectedLocId(null) }}
                          onMouseEnter={enterPointer}
                          onMouseLeave={leavePointer}
                        />
                        {/* draggable vertices for selected region */}
                        {selectedRegionId === r.id && r.pointsPercent.map((pt, idx) => {
                          const ax = (pt[0] / 100) * stageSize.width
                          const ay = (pt[1] / 100) * stageSize.height
                          return (
                            <Circle
                              key={idx}
                              x={ax}
                              y={ay}
                              radius={getCircleRadius(6)}
                              fill="#facc15"
                              stroke="#f59e0b"
                              strokeWidth={getCircleRadius(2) * 0.25}
                              draggable
                              onDragMove={(e) => updateVertex(r.id, idx, [e.target.x(), e.target.y()])}
                              onMouseEnter={enterPointer}
                              onMouseLeave={leavePointer}
                              shadowBlur={5}
                              shadowColor="#f59e0b"
                            />
                          )
                        })}
                      </Group>
                    ))}

                    {/* drawing preview */}
                    {currentPoints.length > 0 && (
                      <>
                        <Line points={percentToAbsolute(currentPoints)} stroke="#f59e0b" strokeWidth={3} dash={[5, 5]} />
                        {currentPoints.map((p, i) => {
                          const [ax, ay] = [(p[0] / 100) * stageSize.width, (p[1] / 100) * stageSize.height];
                          return (
                            <Circle 
                              key={i} 
                              x={ax} 
                              y={ay} 
                              radius={getCircleRadius(5)} 
                              fill="#fff" 
                              stroke="#f59e0b" 
                              strokeWidth={getCircleRadius(2) * 0.25}
                              shadowBlur={3}
                              shadowColor="#f59e0b"
                            />
                          )
                        })}
                      </>
                    )}

                    {/* location markers */}
                    {locations.map((loc) => {
                      const ax = (loc.x / 100) * stageSize.width
                      const ay = (loc.y / 100) * stageSize.height
                      const isSelected = selectedLocId === loc.id
                      return (
                        <Circle
                          key={loc.id}
                          x={ax}
                          y={ay}
                          radius={isSelected ? getCircleRadius(12) : getCircleRadius(9)}
                          fill="red"
                          stroke={isSelected ? '#facc15' : 'white'}
                          strokeWidth={isSelected ? getCircleRadius(3) * 0.25 : getCircleRadius(2) * 0.25}
                          draggable
                          onDragEnd={(e) => onMarkerDragEnd(e, loc.id)}
                          onClick={(e) => { e.cancelBubble = true; setSelectedLocId(loc.id); setSelectedRegionId(null) }}
                          onMouseEnter={enterPointer}
                          onMouseLeave={leavePointer}
                          shadowBlur={isSelected ? 10 : 5}
                          shadowColor={isSelected ? '#facc15' : '#000000'}
                        />
                      )
                    })}
                  </Layer>
                </Stage>
              </div>
            </div>
            
            {/* Status Bar - Always Visible Below Map */}
            <div className={`${isFullscreen ? 'mt-1' : 'mt-4'} bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-sm text-white border border-white/10 shadow-lg`}>
              <div className="flex items-center gap-4 text-center flex-wrap justify-center">
                <span className="font-medium">Mode: <span className="text-indigo-300">{mode}</span></span>
                <span>•</span>
                <span>Points: <span className="text-green-300">{currentPoints.length}</span></span>
                <span>•</span>
                <span>Regions: <span className="text-purple-300">{regions.length}</span></span>
                <span>•</span>
                <span>Locations: <span className="text-red-300">{locations.length}</span></span>
                {isFullscreen && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-300">Press ESC to exit fullscreen</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {showSidebar && (
            <div 
              className={`${
                isFullscreen 
                  ? 'w-80 bg-black/90 backdrop-blur-md border border-white/10 flex-shrink-0' 
                  : 'lg:w-96 w-full bg-black/60 backdrop-blur-md border border-white/10'
              } p-4 rounded-xl shadow-lg flex flex-col`}
              style={{ 
                maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px',
                minHeight: isFullscreen ? 'calc(100vh - 200px)' : 'auto'
              }}
            >
              {/* Edit Section */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                  ⚙️ Edit Properties
                </h4>

                {selectedRegionId && (() => {
                  const r = regions.find(rr => rr.id === selectedRegionId)
                  if (!r) return <div className="text-sm text-gray-400">Select a region to edit</div>
                  return (
                    <div className="space-y-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
                        🏛️ Region Properties
                      </div>
                      <input 
                        className="w-full p-2 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-purple-400 focus:outline-none transition-colors text-sm" 
                        placeholder="Region name..."
                        value={r.name} 
                        onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, name: e.target.value } : rr))} 
                      />
                      <textarea 
                        className="w-full p-2 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-purple-400 focus:outline-none transition-colors text-sm resize-none" 
                        placeholder="Region description..."
                        rows={3}
                        value={r.lore} 
                        onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, lore: e.target.value } : rr))} 
                      />
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          className="w-12 h-10 rounded-lg bg-gray-800 border border-gray-600 cursor-pointer" 
                          value={r.color} 
                          onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, color: e.target.value } : rr))} 
                        />
                        <input 
                          type="url" 
                          className="flex-1 p-2 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-purple-400 focus:outline-none transition-colors text-sm" 
                          placeholder="https://example.com"
                          value={r.link || ''} 
                          onChange={e => setRegions(prev => prev.map(rr => rr.id === r.id ? { ...rr, link: e.target.value } : rr))} 
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedRegionId(null)} 
                          className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                        >
                          Done
                        </button>
                        <button 
                          onClick={() => setRegions(prev => prev.filter(x => x.id !== r.id))} 
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {selectedLocId && (() => {
                  const l = locations.find(ll => ll.id === selectedLocId)
                  if (!l) return <div className="text-sm text-gray-400">Select a location to edit</div>
                  return (
                    <div className="space-y-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="flex items-center gap-2 text-sm font-medium text-red-300">
                        Location Properties
                      </div>
                      <input 
                        className="w-full p-2 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-red-400 focus:outline-none transition-colors text-sm" 
                        placeholder="Location name..."
                        value={l.name} 
                        onChange={e => setLocations(prev => prev.map(ll => ll.id === l.id ? { ...ll, name: e.target.value } : ll))} 
                      />
                      <textarea 
                        className="w-full p-2 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-red-400 focus:outline-none transition-colors text-sm resize-none" 
                        placeholder="Location description..."
                        rows={3}
                        value={l.lore} 
                        onChange={e => setLocations(prev => prev.map(ll => ll.id === l.id ? { ...ll, lore: e.target.value } : ll))} 
                      />
                      <input 
                        type="url" 
                        className="w-full p-2 rounded-lg bg-gray-800/80 text-white border border-gray-600 focus:border-red-400 focus:outline-none transition-colors text-sm" 
                        placeholder="https://example.com"
                        value={l.link || ''} 
                        onChange={e => setLocations(prev => prev.map(ll => ll.id === l.id ? { ...ll, link: e.target.value } : ll))} 
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedLocId(null)} 
                          className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors"
                        >
                          Done
                        </button>
                        <button 
                          onClick={() => setLocations(prev => prev.filter(x => x.id !== l.id))} 
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })()}

                {!selectedRegionId && !selectedLocId && (
                  <div className="text-sm text-gray-400 p-3 bg-gray-800/20 rounded-lg border border-gray-600/30 text-center">
                    Click on a region or location to edit its properties
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {/* Regions List */}
                  <div>
                    <div className="font-medium mb-2 text-white flex items-center gap-2">
                      Regions ({regions.length})
                    </div>
                    <div className="space-y-1">
                      {regions.map(r => (
                        <div 
                          key={r.id} 
                          className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                            selectedRegionId === r.id 
                              ? 'bg-purple-500/20 border border-purple-500/40' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                          onClick={() => { setSelectedRegionId(r.id); setSelectedLocId(null) }}
                        >
                          <div className="text-white text-sm truncate flex-1 mr-2">{r.name}</div>
                          <div 
                            style={{ backgroundColor: r.color }} 
                            className="w-5 h-5 rounded-full border-2 border-white/30 flex-shrink-0" 
                          />
                        </div>
                      ))}
                      {regions.length === 0 && (
                        <div className="text-sm text-gray-500 italic p-2">No regions created yet</div>
                      )}
                    </div>
                  </div>

                  {/* Locations List */}
                  <div>
                    <div className="font-medium mb-2 text-white flex items-center gap-2">
                      Locations ({locations.length})
                    </div>
                    <div className="space-y-1">
                      {locations.map(l => (
                        <div 
                          key={l.id} 
                          className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                            selectedLocId === l.id 
                              ? 'bg-red-500/20 border border-red-500/40' 
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                          onClick={() => { setSelectedLocId(l.id); setSelectedRegionId(null) }}
                        >
                          <div className="text-white text-sm truncate flex-1 mr-2">{l.name}</div>
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-white flex-shrink-0" />
                        </div>
                      ))}
                      {locations.length === 0 && (
                        <div className="text-sm text-gray-500 italic p-2">No locations added yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Viewer preview - only show when not in fullscreen */}
      {!isFullscreen && (
        <div className="mt-6 mx-4 bg-gray-900/80 p-4 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="font-semibold mb-3 text-indigo-400 flex items-center gap-2">
            Viewer Preview
          </h3>
          <ExportedFantasyMapViewer mapImage={mapSrc} locations={locations} regions={regions} />
        </div>
      )}

      {/* Region Creation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md p-6 rounded-2xl w-96 shadow-2xl border border-gray-700/50">
            <h3 className="font-semibold text-indigo-300 mb-4 text-lg">Region Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm text-white">Name</label>
                <input 
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-indigo-400 focus:outline-none transition-colors" 
                  placeholder="Enter region name..."
                  value={formData.name} 
                  onChange={(e) => setFormData(fd => ({ ...fd, name: e.target.value }))} 
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-white">Description</label>
                <textarea 
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-indigo-400 focus:outline-none transition-colors resize-none" 
                  placeholder="Describe this region..."
                  rows={4}
                  value={formData.lore} 
                  onChange={(e) => setFormData(fd => ({ ...fd, lore: e.target.value }))} 
                />
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block mb-1 text-sm text-white">Color</label>
                  <input 
                    type="color" 
                    className="w-full h-12 rounded-lg bg-gray-800 border border-gray-600 cursor-pointer" 
                    value={formData.color} 
                    onChange={(e) => setFormData(fd => ({ ...fd, color: e.target.value }))} 
                  />
                </div>
                <div className="flex-2">
                  <label className="block mb-1 text-sm text-white">Link (optional)</label>
                  <input 
                    type="url" 
                    className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-indigo-400 focus:outline-none transition-colors" 
                    placeholder="https://example.com"
                    value={formData.link} 
                    onChange={(e) => setFormData(fd => ({ ...fd, link: e.target.value }))} 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={() => { setShowForm(false); setCurrentPoints([]) }} 
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={finishDrawing} 
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Create Region
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}