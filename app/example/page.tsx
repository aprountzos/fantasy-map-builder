"use client";
import React, { useEffect, useState } from "react";
import ExportedFantasyMapViewer from "../../components/ExportedFantasyMapViewer";

// Helper to generate random color
function randomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

// Random name generator
const fantasyNames = [
  "Mystwood",
  "Dragonspire",
  "Elvenhold",
  "Stonehelm",
  "Shadowfen",
  "Frostvale",
  "Goldcrest",
  "Windspire",
];
const lores = [
  "Ancient forest full of mysteries.",
  "A bustling city with markets and taverns.",
  "Home to the elves, hidden in mountains.",
  "Stronghold of dwarves, rich with minerals.",
  "Dark swamp, rumored to be cursed.",
  "Snowy valley with frozen rivers.",
  "Town famous for its gold mines.",
  "Tower of mages overlooking the plains.",
];

// Generate random regions with guaranteed polygons
function generateRandomData(numRegions = 3, numLocations = 5) {
  const regions = [];
  const locations = [];
  const usedNames = new Set();

  function randomName() {
    let name;
    do {
      name = fantasyNames[Math.floor(Math.random() * fantasyNames.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
  }

  // Regions
  for (let i = 0; i < numRegions; i++) {
    const name = randomName();
    const lore = lores[Math.floor(Math.random() * lores.length)];
    const centerX = Math.random() * 60 + 20;
    const centerY = Math.random() * 60 + 20;
    const radius = Math.random() * 10 + 8;
    const pointsPercent = [];
    const numPoints = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < numPoints; j++) {
      const angle = (j / numPoints) * 2 * Math.PI;
      pointsPercent.push([
        Math.min(95, Math.max(5, centerX + radius * Math.cos(angle))),
        Math.min(85, Math.max(5, centerY + radius * Math.sin(angle))),
      ]);
    }
    regions.push({
      id: i + 1,
      name,
      lore,
      color: randomColor(),
      pointsPercent,
    });
  }

  // Locations (inside random region)
  for (let i = 0; i < numLocations; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
    // pick a random point near the first polygon vertex
    const vertex =
      region.pointsPercent[
        Math.floor(Math.random() * region.pointsPercent.length)
      ];
    const x = Math.min(95, Math.max(5, vertex[0] + Math.random() * 5 - 2.5));
    const y = Math.min(85, Math.max(5, vertex[1] + Math.random() * 5 - 2.5));
    locations.push({
      id: i + 100,
      name: randomName(),
      lore: lores[Math.floor(Math.random() * lores.length)],
      x,
      y,
    });
  }

  return { regions, locations };
}

export default function ExamplePage() {
  const [data, setData] = useState({ regions: [], locations: [] });
  const mapImage = "/fantasy-map.png"; // must exist in /public

  useEffect(() => {
    const randomData = generateRandomData();
    setData(randomData);
  }, []);

  if (!data.regions.length)
    return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-400">
        Fantasy Map Viewer Example
      </h1>
      <p className="mb-4 text-gray-300">
        Randomly generated regions and locations on a fantasy map.
      </p>
      <ExportedFantasyMapViewer
        mapImage={mapImage}
        regions={data.regions}
        locations={data.locations}
      />
    </div>
  );
}
