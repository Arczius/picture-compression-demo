import { useState } from "react";
import Transpiler from "./Transpiler";

const SIZE = 32;
const DEFAULT = "FFFFFF";
const transpiler = new Transpiler();

const createEmptyGrid = () =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(DEFAULT));

// --- Presets ---
const presets: Record<string, string[][]> = {
    Mario: (() => {
        const g = createEmptyGrid();
        const red = "FF0000";
        const skin = "FFD1A4";
        const brown = "8B4513";

        // hat
        for (let i = 10; i < 22; i++) g[6][i] = red;
        for (let i = 9; i < 23; i++) g[7][i] = red;

        // face
        for (let r = 8; r < 14; r++)
            for (let c = 10; c < 22; c++) g[r][c] = skin;

        // mustache
        for (let i = 11; i < 21; i++) g[11][i] = brown;

        return g;
    })(),

    Pikachu: (() => {
        const g = createEmptyGrid();
        const yellow = "FFD800";
        const black = "000000";
        const red = "FF0000";

        for (let r = 8; r < 20; r++)
            for (let c = 10; c < 22; c++) g[r][c] = yellow;

        // eyes
        g[11][13] = black;
        g[11][18] = black;

        // cheeks
        g[14][12] = red;
        g[14][19] = red;

        return g;
    })(),
};

export default function App() {
    const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
    const [color, setColor] = useState("#ff0000");

    const handleClick = (r: number, c: number) => {
        const newGrid = grid.map((row) => [...row]);
        newGrid[r][c] = color.replace("#", "").toUpperCase();
        setGrid(newGrid);
    };

    const buildUntranspiled = () => {
        return grid.map((row) => ";" + row.join(";") + ";").join("\n");
    };

    const untranspiled = buildUntranspiled();
    const transpiled = transpiler.ToTranspile(untranspiled);

    const loadPreset = (name: string) => {
        const preset = presets[name];
        if (!preset) return;
        setGrid(preset.map((row) => [...row]));
    };

    const clearGrid = () => setGrid(createEmptyGrid());

    return (
        <div className="p-4">
            <h1 className="text-3xl pb-4">32×32 Grid Transpiler</h1>
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <h3>Uncompiled</h3>
                    <textarea
                        value={untranspiled}
                        readOnly
                        rows={32}
                        style={{ width: "100%" }}
                        className="border-2 rounded p-1 overflow-scroll"
                    />
                </div>

                <div>
                    <h3>Compiled</h3>
                    <textarea
                        value={transpiled}
                        readOnly
                        rows={32}
                        style={{ width: "100%" }}
                        className="border-2 rounded p-1 overflow-scroll"
                    />
                </div>

                <div className="col-span-2">
                    <div
                        style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                        }}
                    >
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />

                        <button onClick={() => loadPreset("Mario")}>
                            Mario
                        </button>
                        <button onClick={() => loadPreset("Pikachu")}>
                            Pikachu
                        </button>
                        <button onClick={clearGrid}>Clear</button>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${SIZE}, 16px)`,
                            marginTop: 10,
                        }}
                    >
                        {grid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => handleClick(r, c)}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        backgroundColor: `#${cell}`,
                                        border: "1px solid #ccc",
                                        cursor: "pointer",
                                    }}
                                />
                            )),
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
