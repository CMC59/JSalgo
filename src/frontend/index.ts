/// <reference lib="dom" />

// Constants and WebSocket setup
const ws = new WebSocket(`ws://${location.host}`);
const bgColor = "#DDD";
const thinLineColor = "#AAA";
const boldLineColor = "#000";
const canvas = document.getElementById("sudokuCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const width = canvas.width;
const height = canvas.height;
const cellSize = Math.round(Math.min(width, height) / 9);

ws.onopen = () => setInterval(() => ws.send("ping"), 5000);
ws.onmessage = (event: MessageEvent) => {
    if (event.data !== "Well received") {
        console.log(event.data);
    }
    if (event.data === "reload") {
        location.reload();
    }
}

// Data structures
const cellDomains: number[][][] = [];
const cellValues: (number | null)[][] = [];
const originalValues: (number | null)[][] = [];

for (let j = 0; j < 9; j++) {
    cellDomains[j] = Array(9).fill([]).map(() => [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    cellValues[j] = Array(9).fill(null);
    originalValues[j] = Array(9).fill(null);
}

function clearCanvas() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
}

function drawCell(
	i: number,
	j: number,
	cellSize: number,
	borderColor: string,
	fillColor?: string
) {
	const x = i * cellSize
	const y = j * cellSize
	if (fillColor) {
		ctx.fillStyle = fillColor
		ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
	}
	ctx.strokeStyle = borderColor
	ctx.strokeRect(x, y, cellSize, cellSize)
}

function drawGroup(groupI: number, groupJ: number, fillColor?: string) {
  drawCell(groupI, groupJ, cellSize * 3, boldLineColor, fillColor)
	for (let j = 0; j < 3; j++) {
		for (let i = 0; i < 3; i++) {
			drawCell(groupI * 3 + i, groupJ * 3 + j, cellSize, thinLineColor)
		}
	}
}

function drawDomain(i: number, j: number) {
	if (cellValues[j][i] !== null) {
		ctx!.font = "bold 60px Arial"
		ctx!.textBaseline = "middle"
		ctx!.textAlign = "center"
		const x = i * cellSize + Math.floor(cellSize * 0.5)
		const y = j * cellSize + Math.floor(cellSize * 0.575)
		ctx.fillText(cellValues[j][i]!.toString(), x, y)
	} else {
		ctx.fillStyle = "#000"
		ctx.font = "16px Arial"
		ctx.textBaseline = "top"
		ctx.textAlign = "start"
		const domain = cellDomains[j][i]
		const areaSize = Math.max(cellSize - 2, Math.floor(cellSize * 0.8))
		const valueStep = Math.floor(areaSize / 3)
		const cellPadding = Math.max(1, Math.floor(cellSize * 0.1))
		const x = i * cellSize + cellPadding
		const y = j * cellSize + cellPadding
		for (let k = 1; k <= 9; k++) {
			const vk = domain.includes(k) ? k : null
			const vi = (k - 1) % 3
			const vj = Math.floor((k - 1) / 3)
			const vx = x + valueStep * vi
			const vy = y + valueStep * vj
			ctx.fillText(vk !== null ? vk.toString() : "", vx, vy)
		}
	}
}


function drawDomains() {
    for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            drawDomain(i, j);
        }
    }
}

function drawEmptyGrid() {
	clearCanvas()
	/*for (let j = 0; j < 9; j++) {
		for (let i = 0; i < 9; i++) {
			drawCell(i, j, cellSize, thinLineColor, bgColor)
		}
	}*/
	for (let j = 0; j < 3; j++) {
		for (let i = 0; i < 3; i++) {
			drawGroup(i, j)
		}
	}
}

function removeValueFromDomain(i: number, j: number, v: number) {
    const index = cellDomains[j][i].indexOf(v);
    if (index !== -1) {
        cellDomains[j][i].splice(index, 1);
    }
}

function canRestoreValue(i: number, j: number, v: number): boolean {
    const startI = Math.floor(i / 3) * 3;
    const startJ = Math.floor(j / 3) * 3;

    for (let k = 0; k < 9; k++) {
        if (cellValues[k][j] === v || cellValues[i][k] === v) {
            return false;
        }
    }

    for (let x = startI; x < startI + 3; x++) {
        for (let y = startJ; y < startJ + 3; y++) {
            if (cellValues[x][y] === v) return false;
        }
    }
    return true;
}

function restoreValueToDomain(i: number, j: number, v: number) {
    if (!cellDomains[j][i].includes(v) && canRestoreValue(i, j, v)) {
        cellDomains[j][i].push(v);
    }
}

function removeValueFromAffectedDomains(i: number, j: number, v: number) {
    for (let k = 0; k < 9; k++) {
        removeValueFromDomain(k, j, v); // Same row
        removeValueFromDomain(i, k, v); // Same column
    }

    const startI = Math.floor(i / 3) * 3;
    const startJ = Math.floor(j / 3) * 3;

    for (let x = startI; x < startI + 3; x++) {
        for (let y = startJ; y < startJ + 3; y++) {
            removeValueFromDomain(x, y, v); // Same box
        }
    }
}

function restoreValueInAffectedDomains(i: number, j: number, v: number) {
    for (let k = 0; k < 9; k++) {
        restoreValueToDomain(k, j, v); // Same row
        restoreValueToDomain(i, k, v); // Same column
    }

    const startI = Math.floor(i / 3) * 3;
    const startJ = Math.floor(j / 3) * 3;

    for (let x = startI; x < startI + 3; x++) {
        for (let y = startJ; y < startJ + 3; y++) {
            restoreValueToDomain(x, y, v); // Same box
        }
    }
}

function updateDomains(i: number, j: number, v: number, action: "add" | "remove") {
    if (action === "add") {
        removeValueFromAffectedDomains(i, j, v);
    } else {
        restoreValueInAffectedDomains(i, j, v);
    }
}

function highlightCell(i: number, j: number) {
    clearCanvas();          // Clear the entire canvas
    drawEmptyGrid();        // Redraw the entire grid
    drawDomains();          // Draw all cell values/domains
    drawCell(i, j, cellSize, boldLineColor, "#FFD700");  // Highlight the selected cell
}

function toggle(v: number) {
    if (!selectedCell) return;
    const [i, j] = selectedCell;
	if (originalValues[j][i] !== null) return;

    if (cellValues[j][i] === v) {
        cellValues[j][i] = null;
        updateDomains(i, j, v, "remove");
    } else if (cellValues[j][i] !== null && v !== null) { 
		return;
	} else if (cellDomains[j][i].includes(v)) {
        cellValues[j][i] = v;
        updateDomains(i, j, v, "add");
    }

    drawDomains(); // Redraw to reflect changes3
	drawDomain(i, j);  // Redraw the changed cell
}

let selectedCell: [number, number] | null = null

canvas.addEventListener("mousemove", (event: MouseEvent) => {
    event.stopPropagation();
    const x = event.offsetX;
    const y = event.offsetY;
    const i = Math.min(Math.floor(x / cellSize), 8);
    const j = Math.min(Math.floor(y / cellSize), 8);
    if (selectedCell === null || selectedCell[0] !== i || selectedCell[1] !== j) {
        selectedCell = [i, j];
        highlightCell(i, j);  // Add this line
    }
});

canvas.addEventListener("click", (event: MouseEvent) => {
    const x = event.offsetX;
    const y = event.offsetY;
    const i = Math.min(Math.floor(x / cellSize), 8);
    const j = Math.min(Math.floor(y / cellSize), 8);
    selectedCell = [i, j];
    highlightCell(i, j);
});

canvas.addEventListener("mouseout", (event: MouseEvent) => {
	event.stopPropagation()
	selectedCell = null
	drawEmptyGrid();
    drawDomains();
	console.log("Cellule sélectionnée:", selectedCell)
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
	if (event.key === "Backspace" && selectedCell) {
		const [i, j] = selectedCell;
		if (originalValues[j][i] !== null) return;
        if (cellValues[j][i] !== null) {
            // Add a type guard here
            const value = cellValues[j][i];
            if (typeof value === "number") {
                updateDomains(i, j, value, "remove");
            }
            cellValues[j][i] = null;
            drawDomain(i, j);
        }
        return;
    }

    const key = Number(event.key);
    if (key >= 1 && key <= 9) {
        toggle(key);
    }
});

drawEmptyGrid()
drawDomains()

console.log("Frontend chargé")
