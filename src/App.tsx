import { useState } from "react";
import Transpiler from "./Transpiler";

const SIZE = 32;
const DEFAULT = "FFFFFF";
const transpiler = new Transpiler();

const createEmptyGrid = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(DEFAULT));

// helper to blend between two hex colors
const lerpColor = (a: string, b: string, t: number) => {
    const ar = parseInt(a.slice(0, 2), 16);
    const ag = parseInt(a.slice(2, 4), 16);
    const ab = parseInt(a.slice(4, 6), 16);

    const br = parseInt(b.slice(0, 2), 16);
    const bg = parseInt(b.slice(2, 4), 16);
    const bb = parseInt(b.slice(4, 6), 16);

    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab + (bb - ab) * t);

    return (
        rr.toString(16).padStart(2, "0") +
        rg.toString(16).padStart(2, "0") +
        rb.toString(16).padStart(2, "0")
    ).toUpperCase();
};

// random hex color
const randomColor = () =>
    Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase();

// --- Presets with gradients ---
const presets: Record<string, string[][]> = {
    Mario: (() => {
        const g = createEmptyGrid();

        const red1 = "FF4D4D";
        const red2 = "990000";
        const skin1 = "FFE0BD";
        const skin2 = "C68642";
        const blue1 = "4DA6FF";
        const blue2 = "003399";

        for (let r = 4; r <= 7; r++)
            for (let c = 10; c <= 21; c++) {
                const t = (c - 10) / 11;
                g[r][c] = lerpColor(red1, red2, t);
            }

        for (let r = 8; r <= 15; r++)
            for (let c = 11; c <= 20; c++) {
                const t = (r - 8) / 7;
                g[r][c] = lerpColor(skin1, skin2, t);
            }

        for (let r = 16; r <= 25; r++)
            for (let c = 11; c <= 20; c++) {
                const t = (r - 16) / 9;
                g[r][c] = lerpColor(blue1, blue2, t);
            }

        return g;
    })(),

    Pikachu: (() => {
        const g = createEmptyGrid();

        const y1 = "FFF066";
        const y2 = "E6B800";
        const red1 = "FF8080";
        const red2 = "CC0000";

        for (let r = 8; r <= 22; r++)
            for (let c = 10; c <= 21; c++) {
                const t = (r - 8) / 14;
                g[r][c] = lerpColor(y1, y2, t);
            }

        for (let c = 12; c <= 19; c++)
            g[15][c] = lerpColor(red1, red2, (c - 12) / 7);

        return g;
    })(),
};

// color distance helper
const colorDistance = (a: string, b: string) => {
    const ar = parseInt(a.substring(0, 2), 16);
    const ag = parseInt(a.substring(2, 4), 16);
    const ab = parseInt(a.substring(4, 6), 16);

    const br = parseInt(b.substring(0, 2), 16);
    const bg = parseInt(b.substring(2, 4), 16);
    const bb = parseInt(b.substring(4, 6), 16);

    return Math.abs(ar - br) + Math.abs(ag - bg) + Math.abs(ab - bb);
};

export default function App() {
    const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
    const [color, setColor] = useState("#ff0000");
    const [threshold, setThreshold] = useState(0);

    const handleClick = (r: number, c: number) => {
        const newGrid = grid.map((row) => [...row]);
        newGrid[r][c] = color.replace("#", "").toUpperCase();
        setGrid(newGrid);
    };

    const buildUntranspiled = (g: string[][]) =>
        g.map((row) => ";" + row.join(";") + ";").join("\n");

    const applyLossy = (g: string[][]) => {
        if (threshold === 0) return g;

        const newGrid = g.map((row) => [...row]);

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const base = g[r][c];
                const group: string[] = [];

                for (let y = -1; y <= 1; y++) {
                    for (let x = -1; x <= 1; x++) {
                        const nr = r + y;
                        const nc = c + x;

                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            const neighbor = g[nr][nc];
                            if (colorDistance(base, neighbor) <= threshold) {
                                group.push(neighbor);
                            }
                        }
                    }
                }

                if (group.length > 0) {
                    const counts: Record<string, number> = {};
                    for (const col of group)
                        counts[col] = (counts[col] || 0) + 1;

                    let best = base;
                    let max = 0;
                    for (const col in counts) {
                        if (counts[col] > max) {
                            max = counts[col];
                            best = col;
                        }
                    }

                    newGrid[r][c] = best;
                }
            }
        }

        return newGrid;
    };

    // NEW: random gradient generator
    const generateRandomGradient = () => {
        const c1 = randomColor();
        const c2 = randomColor();
        const c3 = randomColor();
        const c4 = randomColor();

        const newGrid = createEmptyGrid();

        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const tx = c / (SIZE - 1);
                const ty = r / (SIZE - 1);

                const top = lerpColor(c1, c2, tx);
                const bottom = lerpColor(c3, c4, tx);
                const final = lerpColor(top, bottom, ty);

                newGrid[r][c] = final;
            }
        }

        setGrid(newGrid);
    };

    const lossyGrid = applyLossy(grid);

    const untranspiled = buildUntranspiled(grid);
    const transpiled = transpiler.ToTranspile(untranspiled);
    const lossyTranspiled = transpiler.ToTranspile(
        buildUntranspiled(lossyGrid),
    );

    const loadPreset = (name: string) => {
        const preset = presets[name];
        if (!preset) return;
        setGrid(preset.map((row) => [...row]));
    };

    const clearGrid = () => setGrid(createEmptyGrid());

    return (
        <div style={{ padding: 20 }}>
            <h1 className="text-3xl font-bold pb-2">32×32 Grid Transpiler</h1>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                />

                <button onClick={() => loadPreset("Mario")}>Mario</button>
                <button onClick={() => loadPreset("Pikachu")}>Pikachu</button>
                <button onClick={generateRandomGradient}>
                    Random Gradient
                </button>
                <button onClick={clearGrid}>Clear</button>
            </div>

            <div style={{ marginTop: 10 }}>
                <label>Color Similarity Threshold: {threshold}</label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                />
            </div>

            <div className="flex gap-6 mt-4">
                <div>
                    <h3>Original Grid</h3>
                    <div
                        className="grid"
                        style={{ gridTemplateColumns: `repeat(${SIZE}, 12px)` }}
                    >
                        {grid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`orig-${r}-${c}`}
                                    onClick={() => handleClick(r, c)}
                                    style={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: `#${cell}`,
                                        border: "1px solid #ccc",
                                        cursor: "pointer",
                                    }}
                                />
                            )),
                        )}
                    </div>
                </div>

                <div>
                    <h3>Lossy Grid</h3>
                    <div
                        className="grid"
                        style={{ gridTemplateColumns: `repeat(${SIZE}, 12px)` }}
                    >
                        {lossyGrid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`lossy-${r}-${c}`}
                                    style={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: `#${cell}`,
                                        border: "1px solid #ccc",
                                    }}
                                />
                            )),
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mt-6">
                <div className="flex-1">
                    <h3>Uncompressed (Original Grid Text)</h3>
                    <textarea
                        value={untranspiled}
                        readOnly
                        rows={12}
                        className="w-full border border-black p-1"
                    />
                </div>

                <div className="flex-1">
                    <h3>Original Transpiled</h3>
                    <textarea
                        value={transpiled}
                        readOnly
                        rows={12}
                        className="w-full border border-black p-1"
                    />
                </div>

                <div className="flex-1">
                    <h3>Lossy Transpiled</h3>
                    <textarea
                        value={lossyTranspiled}
                        readOnly
                        rows={12}
                        className="w-full border border-black p-1"
                    />
                </div>
            </div>
        </div>
    );
}
