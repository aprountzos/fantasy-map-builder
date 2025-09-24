'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Circle, Group } from 'react-konva'
import useImage from 'use-image'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import ExportedFantasyMapViewer from '../../components/ExportedFantasyMapViewer'

export default function EditorPage() {
  const [mapSrc, setMapSrc] = useState(`${process.env.NEXT_PUBLIC_BASE_PATH || '/'}fantasy-map.png`);
  const [img] = useImage(mapSrc, 'anonymous')
  const stageRef = useRef(null)
  const imageRef = useRef(null)
  const [mode, setMode] = useState(null)
  const [currentPoints, setCurrentPoints] = useState([])
  const [regions, setRegions] = useState([])
  const [locations, setLocations] = useState([])
  const idRef = useRef(1)
  const [selectedRegionId, setSelectedRegionId] = useState(null)
  const [selectedLocId, setSelectedLocId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', lore: '', color: '#f59e0b', link: '' })
  const [mapScale, setMapScale] = useState(1)

  // Initial example
  useEffect(() => {
    setRegions([{
      id: idRef.current++,
      name: 'Mystwood',
      lore: 'Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.Ancient forest filled with magical creatures.',
      color: '#16a34a',
      pointsPercent: [[20, 20], [40, 25], [30, 45]],
      link: 'https://example.com/mystwood'
    }])
    setLocations([{
      id: idRef.current++,
      name: 'Dragonspire',
      lore: 'A bustling city of dragons',
      x: 60,
      y: 40,
      link: 'https://example.com/dragonspire'
    }])
  }, [])

  async function handleMapUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setMapSrc(reader.result)
    reader.readAsDataURL(file)
  }

  function getImageRect() {
    if (!imageRef.current) return null
    try { return imageRef.current.getClientRect() } catch { return null }
  }

  function stageMouseDown(e) {
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    const rect = getImageRect()
    if (!rect) return
    if (pos.x < rect.x || pos.y < rect.y || pos.x > rect.x + rect.width || pos.y > rect.y + rect.height) return

    const x = pos.x - rect.x
    const y = pos.y - rect.y

    if (mode === 'draw') setCurrentPoints(p => [...p, [x, y]])
    else if (mode === 'marker') {
      const pct = [(x / rect.width) * 100, (y / rect.height) * 100]
      setLocations(ls => [...ls, { id: idRef.current++, name: 'New Location', lore: '', x: pct[0], y: pct[1], link: '' }])
      setMode(null)
    }
  }

  function finishDrawing() {
    if (currentPoints.length < 3) return alert('Need at least 3 points to create a region.')
    const rect = getImageRect()
    if (!rect) return alert('Image not ready')
    const percent = currentPoints.map(p => [(p[0] / rect.width) * 100, (p[1] / rect.height) * 100])
    setRegions(r => [...r, {
      id: idRef.current++,
      name: formData.name || 'Region',
      lore: formData.lore,
      color: formData.color,
      pointsPercent: percent,
      link: formData.link || ''
    }])
    setCurrentPoints([])
    setMode(null)
    setShowForm(false)
    setFormData({ name: '', lore: '', color: '#f59e0b', link: '' })
  }

  function startDrawing() { setMode('draw'); setCurrentPoints([]); setShowForm(false) }
  function startAddMarker() { setMode('marker') }

  function percentToAbsolute(pointsPercent) {
    const rect = getImageRect(); if (!rect) return []
    return pointsPercent.flatMap(p => [(p[0]/100)*rect.width + rect.x, (p[1]/100)*rect.height + rect.y])
  }

  function updateVertex(regionId, vertexIndex, abs) {
    const rect = getImageRect(); if (!rect) return
    const newPercent = [((abs[0]-rect.x)/rect.width)*100, ((abs[1]-rect.y)/rect.height)*100]
    setRegions(prev => prev.map(r => r.id === regionId ? { ...r, pointsPercent: r.pointsPercent.map((pt,i)=>i===vertexIndex?newPercent:pt)} : r))
  }

  function onMarkerDragEnd(e, locId) {
    const pos = e.target.position()
    const rect = getImageRect(); if (!rect) return
    const px = ((pos.x-rect.x)/rect.width)*100
    const py = ((pos.y-rect.y)/rect.height)*100
    setLocations(prev => prev.map(l => l.id === locId ? { ...l, x: Math.max(0, Math.min(100, px)), y: Math.max(0, Math.min(100, py)) } : l))
  }

  function exportJSON() {
    const data = { mapImage: mapSrc, locations, regions }
    const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' })
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
      } catch { alert('Invalid JSON file') }
    }
    reader.readAsText(file)
  }

  function undoLastPoint() { if(currentPoints.length>0) setCurrentPoints(pts=>pts.slice(0,-1)) }
  function undoLastRegion() { setRegions(r=>r.slice(0,-1)) }

  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 bg-black/50 backdrop-blur-md rounded-lg shadow-md">
        <label className="bg-indigo-600 hover:bg-indigo-500 transition px-3 py-1 rounded text-white cursor-pointer">
          Upload Map
          <input type="file" accept="image/*" className="hidden" onChange={handleMapUpload} />
        </label>
        <button onClick={startDrawing} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white transition">Draw Region</button>
        <button onClick={() => { if(mode==='draw' && currentPoints.length>=3) setShowForm(true); else alert('Draw at least 3 points first.') }} className="px-3 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white transition">Finish Region</button>
        <button onClick={startAddMarker} className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white transition">Add Marker</button>
        <button onClick={()=>setMode(null)} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white transition">Cancel Mode</button>
        <button onClick={undoLastPoint} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white transition">Undo Last Point</button>
        <button onClick={undoLastRegion} className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white transition">Undo Last Region</button>
        <button onClick={exportJSON} className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white transition">Export JSON</button>
        <label className="bg-indigo-600 hover:bg-indigo-500 transition px-3 py-1 rounded text-white cursor-pointer">
          Import JSON
          <input type="file" accept=".json" className="hidden" onChange={(e)=>importJSON(e.target.files[0])} />
        </label>
      </div>

      {/* Stage */}
      <div className="bg-gray-900 p-4 rounded-lg shadow-inner relative">
        <TransformWrapper>
          <TransformComponent>
            <div style={{ width: 1000*mapScale, margin: '0 auto' }}>
              <Stage width={1000*mapScale} height={600*mapScale} onMouseDown={stageMouseDown} ref={stageRef}>
                <Layer>
                  <KonvaImage image={img} x={0} y={0} width={1000*mapScale} height={600*mapScale} ref={imageRef} />
                  {regions.map(r => (
                    <Group key={r.id}>
                      <Line
                        points={percentToAbsolute(r.pointsPercent)}
                        closed stroke={r.color} fill={r.color} opacity={0.35} strokeWidth={2}
                        onClick={e=>{e.cancelBubble=true; setSelectedRegionId(r.id); setSelectedLocId(null)}}
                        className="transition-all"
                      />
                      {selectedRegionId===r.id && r.pointsPercent.map((pt,idx)=>{
                        const rect = getImageRect(); if(!rect) return null
                        const ax=(pt[0]/100)*rect.width+rect.x; const ay=(pt[1]/100)*rect.height+rect.y
                        return <Circle key={idx} x={ax} y={ay} radius={6} fill="#facc15" stroke="#fbbf24" draggable onDragMove={e=>updateVertex(r.id,idx,[e.target.x(),e.target.y()])}/>
                      })}
                    </Group>
                  ))}
                  {currentPoints.length>0 && <Line points={currentPoints.flat()} stroke="#f59e0b" strokeWidth={2}/>}
                  {currentPoints.map((p,i)=><Circle key={i} x={p[0]} y={p[1]} radius={4} fill="#fff" stroke="#000"/>)}
                  {locations.map(loc=>{
                    const rect = getImageRect(); if(!rect) return null
                    const ax=(loc.x/100)*rect.width+rect.x; const ay=(loc.y/100)*rect.height+rect.y
                    return <Circle key={loc.id} x={ax} y={ay} radius={8} fill="red" stroke="white" draggable onDragEnd={e=>onMarkerDragEnd(e,loc.id)} onClick={e=>{e.cancelBubble=true; setSelectedLocId(loc.id); setSelectedRegionId(null)}} className="shadow-lg transition-transform hover:scale-125"/>
                  })}
                </Layer>
              </Stage>
            </div>
          </TransformComponent>
        </TransformWrapper>

        {/* Sidebar */}
        <div className="absolute right-4 top-6 w-80 bg-black/50 backdrop-blur-md p-3 rounded-lg shadow-lg z-30 text-white text-sm">
          <h4 className="font-semibold mb-2">Items</h4>
          <div className="space-y-2">
            <div className="font-medium">Regions</div>
            {regions.map(r=><div key={r.id} className="flex justify-between items-center p-1 hover:bg-white/10 rounded cursor-pointer" onClick={()=>setSelectedRegionId(r.id)}>
              <div>{r.name}</div>
              <div style={{width:14,height:14,background:r.color}} className="rounded-full border"/>
            </div>)}
            <div className="font-medium mt-2">Markers</div>
            {locations.map(l=><div key={l.id} className="flex justify-between items-center p-1 hover:bg-white/10 rounded cursor-pointer" onClick={()=>setSelectedLocId(l.id)}>{l.name}</div>)}
          </div>

          {(selectedRegionId || selectedLocId) && <div className="mt-3 pt-2 border-t border-white/20">
            <h5 className="font-semibold mb-2">Edit Item</h5>
            {selectedRegionId && (()=>{ const r=regions.find(rr=>rr.id===selectedRegionId); if(!r)return null
              return <div className="space-y-1">
                <input className="w-full p-2 rounded bg-gray-800 text-sm" value={r.name} onChange={e=>setRegions(prev=>prev.map(rr=>rr.id===r.id?{...rr,name:e.target.value}:rr))}/>
                <textarea className="w-full p-2 rounded bg-gray-800 text-sm" value={r.lore} onChange={e=>setRegions(prev=>prev.map(rr=>rr.id===r.id?{...rr,lore:e.target.value}:rr))}/>
                <input type="color" className="w-full p-1 rounded bg-gray-800" value={r.color} onChange={e=>setRegions(prev=>prev.map(rr=>rr.id===r.id?{...rr,color:e.target.value}:rr))}/>
                <input type="url" className="w-full p-2 rounded bg-gray-800 text-sm" value={r.link || ''} onChange={e=>setRegions(prev=>prev.map(rr=>rr.id===r.id?{...rr,link:e.target.value}:rr))} placeholder="https://example.com"/>
                <div className="flex gap-2">
                  <button onClick={()=>setSelectedRegionId(null)} className="px-3 py-1 rounded bg-gray-700">Done</button>
                  <button onClick={()=>setRegions(prev=>prev.filter(x=>x.id!==r.id))} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
                </div>
              </div>
            })()}
            {selectedLocId && (()=>{ const l=locations.find(ll=>ll.id===selectedLocId); if(!l)return null
              return <div className="space-y-1">
                <input className="w-full p-2 rounded bg-gray-800 text-sm" value={l.name} onChange={e=>setLocations(prev=>prev.map(ll=>ll.id===l.id?{...ll,name:e.target.value}:ll))}/>
                <textarea className="w-full p-2 rounded bg-gray-800 text-sm" value={l.lore} onChange={e=>setLocations(prev=>prev.map(ll=>ll.id===l.id?{...ll,lore:e.target.value}:ll))}/>
                <input type="url" className="w-full p-2 rounded bg-gray-800 text-sm" value={l.link || ''} onChange={e=>setLocations(prev=>prev.map(ll=>ll.id===l.id?{...ll,link:e.target.value}:ll))} placeholder="https://example.com"/>
                <div className="flex gap-2">
                  <button onClick={()=>setSelectedLocId(null)} className="px-3 py-1 rounded bg-gray-700">Done</button>
                  <button onClick={()=>setLocations(prev=>prev.filter(x=>x.id!==l.id))} className="px-3 py-1 rounded bg-red-500 text-white">Delete</button>
                </div>
              </div>
            })()}
          </div>}
        </div>
      </div>

      {/* Viewer preview */}
      <div className="bg-gray-900 p-4 rounded-lg shadow-md">
        <h3 className="font-semibold mb-2 text-indigo-400">Viewer Preview</h3>
        <ExportedFantasyMapViewer mapImage={mapSrc} locations={locations} regions={regions} />
      </div>

      {/* Region creation modal */}
      {showForm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
        <div className="bg-gray-900/90 backdrop-blur-md p-5 rounded-2xl w-96 shadow-2xl text-white">
          <h3 className="font-semibold mb-2 text-indigo-300">Region Details</h3>
          <label className="block mb-1 text-sm">Name</label>
          <input className="w-full p-2 mb-2 rounded bg-gray-800 text-sm" value={formData.name} onChange={e=>setFormData(fd=>({...fd,name:e.target.value}))}/>
          <label className="block mb-1 text-sm">Lore</label>
          <textarea className="w-full p-2 mb-2 rounded bg-gray-800 text-sm" value={formData.lore} onChange={e=>setFormData(fd=>({...fd,lore:e.target.value}))} rows={4}/>
          <label className="block mb-1 text-sm">Link</label>
          <input type="url" className="w-full p-2 mb-2 rounded bg-gray-800 text-sm" placeholder="https://example.com" value={formData.link} onChange={e=>setFormData(fd=>({...fd,link:e.target.value}))}/>
          <label className="block mb-1 text-sm">Color</label>
          <input type="color" className="w-full p-2 mb-3 rounded bg-gray-800" value={formData.color} onChange={e=>setFormData(fd=>({...fd,color:e.target.value}))}/>
          <div className="flex gap-2 justify-end">
            <button className="px-3 py-1 rounded bg-gray-700" onClick={()=>{setShowForm(false); setCurrentPoints([])}}>Cancel</button>
            <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={finishDrawing}>Save Region</button>
          </div>
        </div>
      </div>}
    </div>
  )
}
