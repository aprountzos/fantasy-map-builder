'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group } from 'react-konva'
import Konva from 'konva'
import useImage from 'use-image'

export default function ExportedFantasyMapViewer({ mapImage, locations = [], regions = [] }) {
  // Use same base dimensions as editor for perfect consistency
  const BASE_W = 1000
  const BASE_H = 600

  const [img] = useImage(mapImage, 'anonymous')
  const [scale, setScale] = useState(1)
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  const [showModal, setShowModal] = useState(false)
  const [modalItem, setModalItem] = useState(null)
  const [legendVisible, setLegendVisible] = useState(true)
  const [hoverItem, setHoverItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [legendPosition, setLegendPosition] = useState('left') // 'left', 'right', 'bottom'
  const hoverTimeoutRef = useRef(null)

  // Responsive stage size
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const [stageSize, setStageSize] = useState({ width: BASE_W, height: BASE_H })

  // Check for mobile and calculate responsive sizing
  useEffect(() => {
    function updateSize() {
      const parent = containerRef.current
      if (!parent) return
      
      const parentWidth = parent.clientWidth
      const parentHeight = parent.clientHeight
      const isMobileView = parentWidth < 768
      setIsMobile(isMobileView)
      
      let available, height
      
      if (isFullscreen) {
        // Fullscreen: use entire viewport
        available = window.innerWidth - 16
        height = window.innerHeight - 16
        
        // Maintain aspect ratio but fill screen
        const aspectRatio = BASE_W / BASE_H
        if (available / height > aspectRatio) {
          available = height * aspectRatio
        } else {
          height = available / aspectRatio
        }
      } else {
        // Normal mode: use container width, maintain aspect ratio
        available = parentWidth - 16
        height = Math.round((available * BASE_H) / BASE_W)
        
        // Max dimensions
        available = Math.min(available, BASE_W)
        height = Math.min(height, BASE_H)
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
  }, [isFullscreen])

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
        // Fallback to CSS fullscreen if browser fullscreen fails
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

  // Zoom and pan handlers
  let lastDist = 0

  function handleTouchMove(e) {
    if (e.evt.touches.length === 2) {
      e.evt.preventDefault()
      const stage = stageRef.current
      const t1 = e.evt.touches[0]
      const t2 = e.evt.touches[1]
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)

      if (lastDist) {
        const scaleBy = dist / lastDist
        const oldScale = stage.scaleX()
        const newScale = Math.max(0.5, Math.min(4, oldScale * scaleBy))

        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        }
        const mousePointTo = {
          x: center.x / oldScale - stage.x() / oldScale,
          y: center.y / oldScale - stage.y() / oldScale,
        }

        stage.scale({ x: newScale, y: newScale })
        setScale(newScale)

        const newPos = {
          x: -(mousePointTo.x - center.x / newScale) * newScale,
          y: -(mousePointTo.y - center.y / newScale) * newScale,
        }
        stage.position(newPos)
        setStagePos(newPos)
        stage.batchDraw()
      }

      lastDist = dist
    }
  }

  function handleTouchEnd(e) {
    if (e.evt.touches.length < 2) lastDist = 0
  }

  function handleWheel(e) {
    e.evt.preventDefault()
    const scaleBy = 1.05
    const stage = stageRef.current
    if (!stage) return

    const oldScale = stage.scaleX()
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    }

    const newScale = Math.max(0.5, Math.min(4, e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy))
    setScale(newScale)

    stage.scale({ x: newScale, y: newScale })

    const newPos = {
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    }
    stage.position(newPos)
    setStagePos(newPos)
    stage.batchDraw()
  }

  // Coordinate helpers
  function percentToAbsolute(pointsPercent) {
    return pointsPercent.flatMap(([px, py]) => [
      (px / 100) * stageSize.width,
      (py / 100) * stageSize.height
    ])
  }

  function getCircleRadius(baseRadius = 8) {
    return Math.max(4, (stageSize.width / BASE_W) * baseRadius / scale)
  }

  // Center on location/region with smooth animation and zoom
  function centerOn(xPercent, yPercent, targetScale = 1.5) {
    const stage = stageRef.current
    if (!stage) return

    const x = (xPercent / 100) * stageSize.width
    const y = (yPercent / 100) * stageSize.height

    const newPos = {
      x: stageSize.width / 2 - x * targetScale,
      y: stageSize.height / 2 - y * targetScale,
    }

    stage.to({
      x: newPos.x,
      y: newPos.y,
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 0.5,
      easing: Konva.Easings.EaseInOut,
      onUpdate: () => {
        setScale(stage.scaleX())
      },
      onFinish: () => {
        setScale(targetScale)
        setStagePos(newPos)
      }
    })
  }

  function centerRegion(region, targetScale = 1.2) {
    const pts = region.pointsPercent
    const avgX = pts.reduce((sum, p) => sum + p[0], 0) / pts.length
    const avgY = pts.reduce((sum, p) => sum + p[1], 0) / pts.length
    centerOn(avgX, avgY, targetScale)
  }

  // Point in polygon for legend organization
  function pointInPolygon(x, y, polygonPointsPercent) {
    const pts = polygonPointsPercent.map(p => [(p[0] / 100) * stageSize.width, (p[1] / 100) * stageSize.height])
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1]
      const xj = pts[j][0], yj = pts[j][1]
      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }

  // Organize locations by regions
  const locationsByRegion = regions.map(r => ({
    ...r,
    locations: locations.filter(l => {
      const xPx = (l.x / 100) * stageSize.width
      const yPx = (l.y / 100) * stageSize.height
      return pointInPolygon(xPx, yPx, r.pointsPercent)
    })
  }))

  const unassignedLocations = locations.filter(l => {
    const xPx = (l.x / 100) * stageSize.width
    const yPx = (l.y / 100) * stageSize.height
    return !regions.some(r => pointInPolygon(xPx, yPx, r.pointsPercent))
  })

  // UI helpers with debounced hover to prevent flickering
  function enterPointer() { document.body.style.cursor = 'pointer' }
  function leavePointer() { document.body.style.cursor = '' }

  function setHoverWithDelay(item) {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoverItem(item)
  }

  function clearHoverWithDelay() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverItem(null)
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  function openRegion(r) { 
    setModalItem(r)
    setShowModal(true)
  }
  
  function openLocation(l) { 
    setModalItem(l)
    setShowModal(true)
  }

  function centerAndOpenModal(item, xPercent, yPercent, targetScale, isRegion = false) {
    setSelectedItem({ 
      type: isRegion ? 'region' : 'location', 
      id: item.id,
      name: item.name,
      ...(isRegion ? { pointsPercent: item.pointsPercent } : { xPercent, yPercent })
    })
    
    if (isRegion) {
      centerRegion(item, targetScale)
    } else {
      centerOn(xPercent, yPercent, targetScale)
    }
    
    setTimeout(() => {
      if (isRegion) {
        openRegion(item)
      } else {
        openLocation(item)
      }
    }, 600)
  }

  function handleLegendItemClick(item, isRegion = false) {
    const id = item.id;
    const type = isRegion ? 'region' : 'location';

    if (selectedItem?.id === id && selectedItem?.type === type) {
      setSelectedItem(null);
      return;
    }

    if (isRegion) {
      setSelectedItem({ type: 'region', id, name: item.name, pointsPercent: item.pointsPercent });
      centerRegion(item, 1.3);
    } else {
      setSelectedItem({ type: 'location', id, name: item.name, xPercent: item.x, yPercent: item.y });
      centerOn(item.x, item.y, 2.0);
    }
  }

  // Legend positioning based on screen size and fullscreen
  const getLegendPosition = () => {
    if (isMobile) return 'below' // Force below on mobile, not floating
    if (isFullscreen) return legendPosition // In fullscreen, allow user choice
    return legendPosition
  }

  const getLegendStyles = () => {
    const position = getLegendPosition()
    
    if (position === 'below') {
      // Not floating - this will be handled in JSX layout
      return null
    }

    // Floating styles for desktop
    const baseStyles = {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      color: 'white',
      zIndex: 40,
      maxHeight: isFullscreen ? '80vh' : '60vh',
      overflowY: 'auto'
    }

    switch (position) {
      case 'left':
        return {
          ...baseStyles,
          left: '16px',
          top: '60px',
          width: '280px',
          maxWidth: '280px'
        }
      case 'right':
        return {
          ...baseStyles,
          right: '16px',
          top: '60px',
          width: '280px',
          maxWidth: '280px'
        }
      case 'bottom':
        return {
          ...baseStyles,
          left: '50%',
          bottom: '16px',
          transform: 'translateX(-50%)',
          width: '400px',
          maxWidth: '400px',
          maxHeight: '200px'
        }
      default:
        return baseStyles
    }
  }

  // Legend Content Component
  const LegendContent = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-bold text-lg text-white">Legend</div>
        {!isMobile && (
          <div className="flex gap-1">
            <button
              onClick={() => setLegendPosition('left')}
              className={`w-6 h-6 rounded text-xs transition-all ${
                legendPosition === 'left' ? 'bg-blue-500' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Position Left"
            >
              ←
            </button>
            <button
              onClick={() => setLegendPosition('right')}
              className={`w-6 h-6 rounded text-xs transition-all ${
                legendPosition === 'right' ? 'bg-blue-500' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Position Right"
            >
              →
            </button>
            <button
              onClick={() => setLegendPosition('bottom')}
              className={`w-6 h-6 rounded text-xs transition-all ${
                legendPosition === 'bottom' ? 'bg-blue-500' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Position Bottom"
            >
              ↓
            </button>
          </div>
        )}
      </div>
      
      {locationsByRegion.map(r => (
        <div key={r.id} className="space-y-1">
          <div
            className={`flex items-center gap-2 cursor-pointer hover:bg-white/10 p-2 rounded transition-all duration-200 ${
              selectedItem?.type === 'region' && selectedItem.id === r.id 
                ? 'bg-cyan-500/20 border border-cyan-500/40' 
                : ''
            }`}
            onClick={() => handleLegendItemClick(r, true)}
          >
            <div 
              className="w-4 h-4 rounded-full border border-white flex-shrink-0" 
              style={{ background: r.color }} 
            />
            <div className="truncate font-medium text-white">{r.name}</div>
          </div>

          {r.locations.length > 0 && (
            <div className="ml-4 space-y-1">
              {r.locations.map(loc => (
                <div
                  key={loc.id}
                  className={`flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 rounded transition-all duration-200 ${
                    selectedItem?.type === 'location' && selectedItem.id === loc.id 
                      ? 'bg-cyan-500/20 border border-cyan-500/40' 
                      : ''
                  }`}
                  onClick={() => handleLegendItemClick(loc, false)}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full border border-white flex-shrink-0" />
                  <div className="truncate text-xs text-gray-300">{loc.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {unassignedLocations.length > 0 && (
        <div className="space-y-1">
          <div className="font-semibold text-white">Other Locations</div>
          <div className="ml-4 space-y-1">
            {unassignedLocations.map(loc => (
              <div
                key={loc.id}
                className={`flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 rounded transition-all duration-200 ${
                  selectedItem?.type === 'location' && selectedItem.id === loc.id 
                    ? 'bg-cyan-500/20 border border-cyan-500/40' 
                    : ''
                }`}
                onClick={() => handleLegendItemClick(loc, false)}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full border border-white flex-shrink-0" />
                <div className="truncate text-xs text-gray-300">{loc.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-white/20 text-xs text-gray-400 space-y-1">
        <div>• Scroll to zoom</div>
        <div>• Drag to pan</div>
        <div>• Click items to view details</div>
        {isFullscreen && <div>• Press ESC to exit fullscreen</div>}
      </div>
    </div>
  )

  const containerClasses = isFullscreen 
    ? "fixed inset-0 bg-gray-900 flex flex-col"
    : "relative bg-gray-900/20 rounded-lg p-2 overflow-hidden shadow-inner"

  const shouldShowFloatingLegend = legendVisible && getLegendPosition() !== 'below'
  const shouldShowBelowLegend = legendVisible && getLegendPosition() === 'below'

  return (
    <div 
      ref={containerRef} 
      className={containerClasses}
      style={isFullscreen ? { zIndex: 9999 } : {}}
    >
      {/* Control Panel */}
      <div className="absolute top-2 left-2 z-50 flex gap-2">
        <button
          onClick={() => setLegendVisible(v => !v)}
          className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded text-xs hover:bg-white/30 transition"
        >
          {legendVisible ? 'Hide Legend' : 'Show Legend'}
        </button>
        <button
          onClick={toggleFullscreen}
          className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded text-xs hover:bg-white/30 transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5M15 15l5.5 5.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`${isFullscreen ? 'flex-1 flex flex-col' : 'w-full h-full'}`}>
        
        {/* Map Container */}
        <div className={`${isFullscreen ? 'flex-1' : 'w-full h-full'} flex items-center justify-center ${shouldShowBelowLegend ? 'mb-4' : ''}`}>
          <div className="bg-gray-800/50 rounded-lg shadow-inner" style={{ width: stageSize.width, height: stageSize.height }}>
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              ref={stageRef}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
              draggable={true}
              style={{ cursor: "grab" }}
              onMouseDown={() => { if (stageRef.current) stageRef.current.container().style.cursor = "grabbing" }}
              onMouseUp={() => { if (stageRef.current) stageRef.current.container().style.cursor = "grab" }}
            >
              <Layer>
                {/* Background image */}
                {img && <KonvaImage image={img} x={0} y={0} width={stageSize.width} height={stageSize.height} />}

                {/* Regions */}
                {regions.map((r) => (
                  <Group key={r.id}>
                    <Line
                      points={percentToAbsolute(r.pointsPercent)}
                      closed
                      fill={r.color}
                      opacity={0.35}
                      stroke={r.color}
                      strokeWidth={2 / scale}
                      onClick={(e) => { 
                        e.cancelBubble = true
                        centerAndOpenModal(r, null, null, 1.3, true)
                      }}
                      onMouseEnter={(e) => {
                        enterPointer()
                        setHoverWithDelay({ type: 'region', name: r.name, pointsPercent: r.pointsPercent })
                      }}
                      onMouseLeave={() => {
                        leavePointer()
                        clearHoverWithDelay()
                      }}
                      hitStrokeWidth={10 / scale}
                    />
                  </Group>
                ))}

                {/* Locations */}
                {locations.map((loc) => {
                  const ax = (loc.x / 100) * stageSize.width
                  const ay = (loc.y / 100) * stageSize.height
                  return (
                    <Group key={loc.id}>
                      <Circle
                        x={ax}
                        y={ay}
                        radius={getCircleRadius(16)}
                        fill="transparent"
                        onClick={(e) => { 
                          e.cancelBubble = true
                          centerAndOpenModal(loc, loc.x, loc.y, 2.0, false)
                        }}
                        onMouseEnter={() => {
                          enterPointer()
                          setHoverWithDelay({ type: 'location', name: loc.name, xPercent: loc.x, yPercent: loc.y })
                        }}
                        onMouseLeave={() => {
                          leavePointer()
                          clearHoverWithDelay()
                        }}
                      />
                      <Circle
                        x={ax}
                        y={ay}
                        radius={getCircleRadius(8)}
                        fill="red"
                        stroke="white"
                        strokeWidth={getCircleRadius(8) * 0.25}
                        shadowBlur={5}
                        listening={false}
                      />
                    </Group>
                  )
                })}

                {/* Selection indicators */}
                {((hoverItem && hoverItem.type === 'location') || (selectedItem && selectedItem.type === 'location')) && (
                  <Circle
                    x={hoverItem?.type === 'location' ? (hoverItem.xPercent / 100) * stageSize.width : (selectedItem.xPercent / 100) * stageSize.width}
                    y={hoverItem?.type === 'location' ? (hoverItem.yPercent / 100) * stageSize.height : (selectedItem.yPercent / 100) * stageSize.height}
                    radius={getCircleRadius(14)}
                    stroke={selectedItem?.type === 'location' ? "cyan" : "yellow"}
                    strokeWidth={selectedItem?.type === 'location' ? 4 / scale : 3 / scale}
                    fill="transparent"
                    listening={false}
                    shadowBlur={8}
                    shadowColor={selectedItem?.type === 'location' ? "cyan" : "yellow"}
                    opacity={selectedItem?.type === 'location' ? 1.0 : 0.8}
                  />
                )}

                {((hoverItem && hoverItem.type === 'region') || (selectedItem && selectedItem.type === 'region')) && (
                  <Line
                    points={percentToAbsolute(hoverItem?.type === 'region' ? hoverItem.pointsPercent : selectedItem.pointsPercent)}
                    closed
                    stroke={selectedItem?.type === 'region' ? "cyan" : "yellow"}
                    strokeWidth={selectedItem?.type === 'region' ? 5 / scale : 4 / scale}
                    fill="transparent"
                    listening={false}
                    shadowBlur={8}
                    shadowColor={selectedItem?.type === 'region' ? "cyan" : "yellow"}
                    opacity={selectedItem?.type === 'region' ? 1.0 : 0.6}
                  />
                )}
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Legend Below Map (Mobile/Small Screens) */}
        {shouldShowBelowLegend && (
          <div className={`w-full bg-black/70 backdrop-blur-md p-4 rounded-lg shadow-md text-sm max-h-64 overflow-y-auto border border-gray-700/30 ${isFullscreen ? 'z-[10000]' : ''}`}>
            <LegendContent />
          </div>
        )}
      </div>

      {/* Floating Legend (Desktop) - Higher z-index for fullscreen */}
      {shouldShowFloatingLegend && (
        <div style={{
          ...getLegendStyles(),
          zIndex: isFullscreen ? 10000 : 30
        }}>
          <LegendContent />
        </div>
      )}

      {/* Hover Tooltip - Desktop only */}
      {!isMobile && !isFullscreen && hoverItem && (
        <div 
          className="absolute bg-gray-900/95 text-white px-3 py-2 rounded-lg text-sm shadow-xl pointer-events-none z-50 max-w-xs border border-gray-700"
          style={{
            top: '1rem',
            right: '1rem',
          }}
        >
          <div className="font-semibold text-indigo-300">{hoverItem.name}</div>
          <div className="text-xs text-gray-400 mt-1">
            {hoverItem.type === 'region' ? '🏛️ Region' : '📍 Location'} • Click for details
          </div>
        </div>
      )}

      {/* Enhanced Modal - Highest z-index for fullscreen */}
      {showModal && modalItem && (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 ${isFullscreen ? 'z-[10002]' : 'z-50'}`}>
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md p-6 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-700/50 animate-in slide-in-from-bottom-4 duration-300">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {modalItem.color && (
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg flex-shrink-0"
                    style={{ background: modalItem.color }}
                  />
                )}
                <div>
                  <h3 className="font-bold text-2xl text-white mb-1">{modalItem.name}</h3>
                  <div className="text-sm text-gray-400">
                    {modalItem.color ? '🏛️ Region' : '📍 Location'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedItem(null)
                }}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              {modalItem.lore && (
                <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/30">
                  <h4 className="font-semibold text-indigo-300 mb-2">Description</h4>
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {modalItem.lore}
                  </p>
                </div>
              )}
              
              {!modalItem.lore && (
                <div className="bg-black/20 rounded-2xl p-4 border border-gray-700/30 text-center">
                  <p className="text-gray-400 italic">No description available for this {modalItem.color ? 'region' : 'location'}.</p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-700/30">
              {modalItem.link && (
                <a 
                  href={modalItem.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  <span>Learn More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedItem(null)
                }}
                className="px-6 py-2 rounded-xl bg-gray-700/80 text-white hover:bg-gray-600 transition-all duration-200 font-medium border border-gray-600/50 hover:border-gray-500/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}