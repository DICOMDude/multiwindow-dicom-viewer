const multiWindowMax = 8;
const HFmin = -1024;
const HFmax = 3071;
const canvasBorder = 5;
let points = [{ x: HFmin, y: 0 },
            { x: -400, y: 70 },
            { x: -130, y: 0 },
            { x: 275, y: 210 },
            { x: 800, y: 255 },
            { x: HFmax, y: 255 },
];

const defaultPoints = [{ x: HFmin, y: 0 },
    { x: -400, y: 70 },
    { x: -130, y: 0 },
    { x: 275, y: 210 },
    { x: 800, y: 255 },
    { x: HFmax, y: 255 },
];

// Current point being modified
let draggingPointIndex = null;

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

function resetMultiWindow () {
    points = Array.from(defaultPoints);
}

function multiWindowLevel(canvas) {

    const ctx = canvas.getContext('2d');
    var width = canvas.width - 2 * canvasBorder;
    var height = canvas.height - 2 * canvasBorder;

    function pointToCanvas(point){
        var x = (point.x - HFmin) * width / (HFmax - HFmin) + canvasBorder;
        var y = canvas.height - (point.y * height / 255 + canvasBorder);
        return {x: x, y: y}
    }

    function canvasToPoint(canvasX, canvasY){
        var x = (canvasX - canvasBorder) * (HFmax - HFmin) / width + HFmin;
        var y = (canvas.height - canvasY - canvasBorder) * 255 / height;
        if (x < HFmin) x = HFmin;
        if (x > HFmax) x = HFmax;
        if (y < 0) y = 0;
        if (y > 255) y = 255;
        return {x: x, y: y}
    }

    function insertNewPoint(point) {
        if (locationOf(point) != -1){
            points.splice(locationOf(point), 0, point);
        }
        return 0;

        function locationOf(point){
            for (let i = 0; i < points.length; i++){
                if (point.x < points[i].x){
                    return i;
                }
                if (point.x == points[i].x){
                    return -1; // Do not allow 2 points to have the same X
                }
            }
            return -1;
        }
    }

    // Draw the curve based on the points
    function drawCurve() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAxes();

        ctx.beginPath();
        ctx.moveTo(pointToCanvas(points[0]).x, pointToCanvas(points[0]).y);

        points.forEach(point => {
            // Draw the point
            ctx.strokeStyle = "rgb(255, 0, 0)";
            ctx.strokeRect(pointToCanvas(point).x-2, pointToCanvas(point).y-2, 4, 4);

            // Draw the line
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineTo(pointToCanvas(point).x, pointToCanvas(point).y);
            ctx.stroke();
        });
    }

    function drawVerticalLine (x, color = "rgb(255, 255, 255)") {
        var startX = pointToCanvas({x: x, y: 0});
        var endX = pointToCanvas({x: x, y: 255});
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(startX.x, startX.y);
        ctx.lineTo(endX.x, endX.y);
        ctx.stroke();
    }

    function drawHorizontalLine (y, color = "rgb(255, 255, 255)") {
        var startY = pointToCanvas({x: HFmin, y: y});
        var endY = pointToCanvas({x: HFmax, y: y});
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(startY.x, startY.y);
        ctx.lineTo(endY.x, endY.y);
        ctx.stroke();
    }

    function drawAxes () {
        drawVerticalLine(0);
        drawHorizontalLine(0);
        var gridColor = "rgba(46, 46, 46, 0.62)"
        drawVerticalLine(HFmax, gridColor);
        drawVerticalLine(HFmax/3, gridColor);
        drawVerticalLine(HFmax/3 * 2, gridColor);
        drawVerticalLine(HFmin, gridColor);
        for (let i = 0; i <= 4; i++) {
            drawHorizontalLine(255 / 4 * i, gridColor);
        }
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
                if (e.button == 0){
                    draggingPointIndex = i;
                } else if (e.button == 2) { // Delete point on right click
                    points.splice(i, 1);
                }
                return;
            }
        }
        if (e.button == 0){
            insertNewPoint(canvasToPoint(offsetX, offsetY));
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const { offsetX, offsetY } = e;
    
        if (draggingPointIndex != null) {
            var point = points[draggingPointIndex];
            if (draggingPointIndex == 0) {
                point.x = HFmin;
            } else if (draggingPointIndex == points.length - 1) {
                point.x = HFmax;
            } else {
                var newX = canvasToPoint(offsetX, offsetY).x;
                if (newX < points[draggingPointIndex - 1].x){
                    newX = points[draggingPointIndex - 1].x + 1;
                } else if (newX > points[draggingPointIndex + 1].x){
                    newX = points[draggingPointIndex + 1].x - 1;
                } else {   
                    point.x = canvasToPoint(offsetX, offsetY).x;
                }
            }
            point.y = canvasToPoint(offsetX, offsetY).y;
            drawCurve();
        } else {
            drawCurve();
        }
    });

    canvas.addEventListener('mouseup', () => {
        draggingPointIndex = null;  // Stop dragging
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Initialize the drawing
    drawCurve();
}