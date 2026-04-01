import React, { useState } from "react";
import Transpiler from "./Transpiler";
const SIZE = 32;
const transpiler = new Transpiler();
export default function App() {
    const [grid, setGrid] = useState<string[][]>(
        Array.from({ length: SIZE }, () => Array(SIZE).fill("FFFFFF")),
    );
    const [color, setColor] = useState("#ff0000");
    const [transpiledInput, setTranspiledInput] = useState("");
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
    const importTranspiled = () => {
        const result = transpiler.FromTranspile(transpiledInput);
        const rows = result
            .split("\n")
            .map((r) => r.split(";").filter((c) => c.length > 0));
        const newGrid = Array.from({ length: SIZE }, (_, r) =>
            Array.from({ length: SIZE }, (_, c) => rows[r]?.[c] || "FFFFFF"),
        );
        setGrid(newGrid);
    };
    return (
        <div style={{ padding: 20 }}>
            {" "}
            <h1>32×32 Grid Transpiler</h1>{" "}
            <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
            />{" "}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${SIZE}, 16px)`,
                    marginTop: 10,
                }}
            >
                {" "}
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
                )}{" "}
            </div>{" "}
            <h3>Untranspiled</h3>{" "}
            <textarea
                value={untranspiled}
                readOnly
                rows={6}
                style={{ width: "100%" }}
            />{" "}
            <h3>Transpiled</h3>{" "}
            <textarea
                value={transpiled}
                readOnly
                rows={6}
                style={{ width: "100%" }}
            />{" "}
            <h3>Import Transpiled</h3>{" "}
            <textarea
                value={transpiledInput}
                onChange={(e) => setTranspiledInput(e.target.value)}
                rows={4}
                style={{ width: "100%" }}
            />{" "}
            <button onClick={importTranspiled}>Load</button>{" "}
        </div>
    );
}
