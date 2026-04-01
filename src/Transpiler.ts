export default class Transpiler {
    private readonly SIZE = 32;
    private readonly DEFAULT = "FFFFFF";

    ToTranspile(untranspiled: string): string {
        if (!untranspiled) return "";

        const rows = untranspiled
            .split("\n")
            .map((r) => r.trim())
            .filter((r) => r.length > 0);

        const grid = rows.map((r) => r.split(";").filter((c) => c.length > 0));

        const visited = Array.from({ length: this.SIZE }, () =>
            Array(this.SIZE).fill(false),
        );

        const result: string[] = [];

        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const value = grid[r]?.[c] || this.DEFAULT;

                if (visited[r][c]) continue;

                // Expand width
                let width = 1;
                while (
                    c + width < this.SIZE &&
                    !visited[r][c + width] &&
                    (grid[r]?.[c + width] || this.DEFAULT) === value
                ) {
                    width++;
                }

                // Expand height
                let height = 1;
                outer: while (r + height < this.SIZE) {
                    for (let x = 0; x < width; x++) {
                        if (
                            visited[r + height][c + x] ||
                            (grid[r + height]?.[c + x] || this.DEFAULT) !==
                                value
                        ) {
                            break outer;
                        }
                    }
                    height++;
                }

                // Mark visited
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        visited[r + y][c + x] = true;
                    }
                }

                const wHex = width.toString(16).toUpperCase();
                const hHex = height.toString(16).toUpperCase();

                result.push(`:${wHex}.${hHex}:${value};`);
            }
        }

        return ";" + result.join("");
    }

    FromTranspile(transpiled: string): string {
        if (!transpiled) return "";

        const regex = /:([0-9A-F]+)\.([0-9A-F]+):([^;]+);/gi;

        const grid = Array.from({ length: this.SIZE }, () =>
            Array(this.SIZE).fill(this.DEFAULT),
        );

        let r = 0;
        let c = 0;

        let match: RegExpExecArray | null;

        while ((match = regex.exec(transpiled)) !== null) {
            const width = parseInt(match[1], 16);
            const height = parseInt(match[2], 16);
            const value = match[3];

            // Fill block
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    if (r + y < this.SIZE && c + x < this.SIZE) {
                        grid[r + y][c + x] = value;
                    }
                }
            }

            // Move cursor (row-major packing)
            c += width;
            if (c >= this.SIZE) {
                c = 0;
                r++;
            }
        }

        return grid.map((row) => ";" + row.join(";") + ";").join("\n");
    }
}
