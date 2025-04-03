const multiWindowMax = 8;
let points = [{ x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 20 },
    { x: 40, y: 40 },
];

// Current point being modified
let draggingPoint = null;

function multiWindowLevel(canvas) {

    const ctx = canvas.getContext('2d');

    // Draw the curve based on the points
    function drawCurve() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        // Draw the points
        points.forEach(point => {
            ctx.strokeStyle = 'black';
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
            ctx.strokeStyle = 'red';
            ctx.strokeRect(point.x, point.y, 4, 4);
        });
    }

    // Check if a point is clicked
    function isPointClicked(x, y, point) {
        return Math.abs(x - point.x) < 10 && Math.abs(y - point.y) < 10;
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
            draggingPoint.x = offsetX;
            draggingPoint.y = offsetY;
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