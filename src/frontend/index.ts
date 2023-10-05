/// <reference lib="dom" />

const ws = new WebSocket(`ws://${location.host}`)
ws.onopen = () => setInterval(() => ws.send("ping"), 5000)
ws.onmessage = (event: MessageEvent) => {
    console.log(event.data);
    if (event.data === "reload") {
        location.reload()
    }
}

const bgColor = "#777"
const thinLineColor = "#AAA"
const boldLineColor = "#000000"

const canvas = document.getElementById("SudokuCanvas") as HTMLCanvasElement
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D
const width = canvas.width
const height = canvas.height
const cellSize =  Math.round(Math.min(width / height) / 9)

function clearCanvas() {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)
}

function drawCell(
    i: number, 
    j: number, 
    cellSize: number, 
    borderColor: string,
    fillColor?: string,
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
    drawCell(groupI * 3, groupJ * 3, cellSize * 3, boldLineColor, fillColor)
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++){
            drawCell(groupI * 3 + i, groupJ * 3 + j, cellSize, thinLineColor)
        }
    }
}


function drawDomain(i: number, j: number) {
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#000'
    ctx.textAlign = "start"
    ctx.font = "16px Arial"
    const domain = [1,2,3,4,5,6,7,8,9]

    const areaSize = Math.max(cellSize - 2, Math.floor(cellSize * 0.8))

    const valueStep = Math.floor(areaSize / 3)

    const cellPadding = Math.max(1, Math.floor(cellSize * 0.1))

    const x = i * cellSize + cellPadding
    const y = j * cellSize + cellPadding

    for (let k = 1; k < 9; k++) {
        const vk = domain.includes(k) ? k : null

        const vi = (k - 1) % 3

        const vj = Math.floor((k-1) / 3)

        const vx = x + valueStep * vi
        const vy = y + valueStep * vj

        ctx.fillText(vk != null ? vk.toString() : "", vx, vy)
    }
}

function drawDomains() {
    ctx.fillStyle = "#000"
    ctx.font = "16px Arial"
    ctx.textBaseline = "top"
    ctx.textAlign = "start"
    for (let j = 0; j < 9; j++) {
        for (let i = 0; i < 9; i++) {
            drawDomain(i, j)
        }
    }
}


const cellDomains: number[][][] = []
const cellValues: (number | null)[][] = []

for (let j = 0; j < 9; j++) {
    cellDomains.push([])
    cellValues.push([])
    for (let i = 0; i <9; i++) {
        cellDomains[j].push([1,2,3,4,5,6,7,8,9])
        cellValues[j].push(null)
    }
}

function drawEmptyGrid() {
    clearCanvas()
    // for (let j = 0; j < 9; j++) {
    //     for (let i = 0; i < 9; i++) {
    //         drawCell(i, j, cellSize, thinLineColor, bgColor)
    //     }
    // }
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
            drawGroup(i, j)
        }
    }
}

drawEmptyGrid()
drawDomains()

let selectedCell: [number, number] | null = null

canvas.addEventListener("mousemove", (event: MouseEvent) => {
    // event.stopPropagation()
    const x = event.offsetX
    const y = event.offsetY
    const i = Math.min(Math.floor(x / cellSize), 8)
    const j = Math.min(Math.floor(y / cellSize), 8)
    if (selectedCell == null || selectedCell[0] != i || selectedCell[i] != j) {
        selectedCell = [i, j]
        console.log("Celulle sélectionnée:", selectedCell)
    }
})

canvas.addEventListener("mouseout", (event: MouseEvent) => {
    event.stopPropagation()
    selectedCell = null
    console.log("Celulle sélectionnée:", selectedCell)
    
})

console.log("Frontend chargé");
