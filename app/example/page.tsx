"use client";
import React, { useEffect, useState } from "react";
import ExportedFantasyMapViewer from "../../components/ExportedFantasyMapViewer";

function randomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

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

  for (let i = 0; i < numLocations; i++) {
    const region = regions[Math.floor(Math.random() * regions.length)];
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
  const mapImage = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}fantasy-map.png`;

  useEffect(() => {
    setData(generateRandomData());
  }, []);

  if (!data.regions.length)
    return <div className="text-white p-4">Loading...</div>;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden pt-24 px-4">
      {/* Background floating elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-white/10 rounded-full animate-ping"></div>
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-ping"></div>

      {/* Header */}
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 text-indigo-300 drop-shadow-lg">
        Fantasy Map Viewer Example
      </h1>
      <p className="mb-6 text-gray-300 max-w-2xl text-center">
        Randomly generated regions and locations on a fantasy map. Hover over
        markers and regions to see details.
      </p>

      {/* Viewer */}
      <div className="w-full max-w-6xl p-4 bg-black/40 backdrop-blur-md rounded-3xl shadow-2xl mb-8">
        <ExportedFantasyMapViewer
          mapImage={mapImage}
          regions={data.regions}
          locations={data.locations}
        />
      </div>
    </main>
  );
}
