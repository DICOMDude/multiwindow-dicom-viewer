const multiWindowMax = 8;
const HFmin = -1024;
const HFmax = 3071;
let points = [{ x: HFmin, y: 0 },
            { x: -400, y: 70 },
            { x: -130, y: 0 },
            { x: 275, y: 210 },
            { x: 800, y: 255 },
            { x: HFmax, y: 255 },
];

// Current point being modified
let draggingPoint = null;

function printPoints(){
    console.log(points);
}

function pointsToWindows() {
    var windows = new Array();
    for (let i = 1; i < points.length; i++) {
        var low = points[i-1].x;
        var high = points[i].x;
        var slope = (points[i].y - points[i-1].y) / (high - low);
        if (slope == 0) {
            var intercept = points[i-1].y;
        } else {
            var intercept = points[i-1].y - (low * slope);
        }
        
        windows.push({low :low, high: high, slope: slope, intercept: intercept});
    }
    return windows;
}

function HFToDisplayValue(hounsfieldUnits, multiWindows){
    for (const window of multiWindows){
        if (hounsfieldUnits >= window.low && hounsfieldUnits < window.high) {
            return hounsfieldUnits * window.slope + window.intercept;
        }
    }
}

function multiWindowLevel(canvas) {

    const ctx = canvas.getContext('2d');

    function pointToCanvas(point){
        var x = (point.x - HFmin) * canvas.width / (HFmax - HFmin);
        var y = canvas.height - (point.y * canvas.height / 255);
        return {x: x, y: y}
    }

    function canvasToPoint(canvasX, canvasY){
        var x = canvasX * (HFmax - HFmin) / canvas.width + HFmin;
        var y = (canvas.height - canvasY) * 255 / canvas.height;
        return {x: x, y: y}
    }

    // Draw the curve based on the points
    function drawCurve() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(pointToCanvas(points[0]).x, pointToCanvas(points[0]).y);
        
        points.forEach(point => {
            // Draw the point
            ctx.strokeStyle = 'red';
            ctx.strokeRect(pointToCanvas(point).x-2, pointToCanvas(point).y-2, 4, 4);

            // Draw the line
            ctx.strokeStyle = 'black';
            ctx.lineTo(pointToCanvas(point).x, pointToCanvas(point).y);
            ctx.stroke();
        });
    }

    // Check if a point is clicked
    function isPointClicked(x, y, point) {
        return Math.abs(x - pointToCanvas(point).x) < 10 && Math.abs(y - pointToCanvas(point).y) < 10;
    }

    // Mouse events to handle dragging
    canvas.addEventListener('mousedown', (e) => {
        const { offsetX, offsetY } = e;
        
        // Check if a point is clicked
        for (let i = 0; i < points.length; i++) {
            if (isPointClicked(offsetX, offsetY, points[i])) {
                draggingPoint = points[i];
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const { offsetX, offsetY } = e;
    
        if (draggingPoint) {
            draggingPoint.x = canvasToPoint(offsetX, offsetY).x;
            draggingPoint.y = canvasToPoint(offsetX, offsetY).y;
            drawCurve();
        } else {
            drawCurve();
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggingPoint = null;  // Stop dragging
    });

    // Initialize the drawing
    drawCurve();
}