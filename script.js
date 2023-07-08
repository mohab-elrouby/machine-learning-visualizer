// Get the canvas element and its context
const canvas = document.getElementById('visualization-canvas');
const ctx = canvas.getContext('2d');

// Define the canvas dimensions
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const numPointsInput = document.getElementById('num-points');
const scatterBtn = document.getElementById('scatter-btn');

// Array to store the positions of the points
let points = [];
let centers = [];
let colors = ["#eb34c9", "#7734eb", "#ebdc34", "#80eb34", "#eb3434"];
let oldCenters = [];
// Define the number of random points to scatter
const numPoints = 50;
points.length = 0; // Clear the points array



// Function to scatter random points on the canvas
function reinitialize() {
    points = [];
    centers = [];
    colors = ["#eb34c9", "#7734eb", "#ebdc34", "#80eb34", "#eb3434"];
    oldCenters = [];
}
function drawGrid() {
    // Draw the X and Y axes

    ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas

    ctx.beginPath();
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);
    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();

    // Draw the grid lines
    const gridSpacing = 50;
    ctx.strokeStyle = '#eee';

    // Vertical grid lines
    for (let x = gridSpacing; x < canvasWidth; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = gridSpacing; y < canvasHeight; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }

}
function generateClusteredPoints(numClusters, pointsPerCluster) {
    const clusters = [];

    // Generate random cluster centers
    for (let i = 0; i < numClusters; i++) {
        const center = {
            x: Math.random() * (canvasWidth - 600) + 300,
            y: Math.random() * (canvasHeight - 600) + 300
        };
        clusters.push(center);
    }

    // Generate points around each cluster center
    for (let i = 0; i < numClusters; i++) {
        const cluster = clusters[i];

        for (let j = 0; j < pointsPerCluster; j++) {
            const radius = Math.random() * 300;
            const angle = Math.random() * 2 * Math.PI;
            const x = cluster.x + radius * Math.cos(angle);
            const y = cluster.y + radius * Math.sin(angle);
            if (x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight) {
                points.push({ x, y });
            }
        }
    }

    return points;
}
function scatterRandomPoints() {
    reinitialize();
    const numPoints = parseInt(numPointsInput.value);
    const numOfClusters = Math.floor(Math.random() * (5 - 2) + 2);
    const numOfPointsPerCluster = Math.floor(numPoints / numOfClusters);
    points.length = 0;
    drawGrid();
    generateClusteredPoints(numOfClusters, numOfPointsPerCluster);



    // Scatter random points on the canvas

    for (const point of points) {
        drawPoint(point.x, point.y, 'blue')
    }
}

function drawPoint(x, y, style) {
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
}

canvas.addEventListener('click', function (event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    if (centers.length < 5) {
        // Draw the point on the canvas
        let color = colors.pop();
        drawPoint(x, y, color);
        // Save the coordinates in the points array
        centers.push({ x, y, color, points: [] });
    }
});

function calcDistance(point, center) {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(center.x, center.y);
    ctx.strokeStyle = '#000';
    ctx.stroke();
    return Math.sqrt(Math.pow((point.x - center.x), 2) + Math.pow((point.y - center.y), 2));
}

function drawCenter(x, y, color){
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x-10, y-10);
    ctx.lineTo(x+10, y+10);
    ctx.moveTo(x+10, y-10);
    ctx.lineTo(x-10, y+10);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.lineWidth = 1;
}



function kmeans() {
    let hasConverged = false;
    let i = 0;
    const delay = 2; // Delay between iterations in milliseconds
    function processNextPoint(index) {
        if (index >= points.length) {
            // All points processed, now recalculate the centers

            centers.forEach((cent) => {

                oldCenters.push({x: cent.x, y: cent.y, color:cent.color});
                let oldX = cent.x;
                let oldY = cent.y;
                let count = cent.points.length;
                let sumX = 0;
                let sumY = 0;
                cent.points.forEach((point) => {
                    sumX += point.x;
                    sumY += point.y;
                });
                cent.points = [];
                if(count!=0){
                    cent.x = sumX / count;
                    cent.y = sumY / count;
                }
                hasConverged = cent.x === oldX && cent.y === oldY;
            });
            

            i++;

            if (!hasConverged) {
                setTimeout(() => processNextPoint(0), delay); // Start next iteration
            }
            return;
        }

        const point = points[index];
        let color = "#000000";
        let minDistance = 99999999999;
        let chosenCenter;
        centers.forEach((cent) => {
            if (calcDistance(point, cent) < minDistance) {
                minDistance = calcDistance(point, cent);
                chosenCenter = cent;
                color = cent.color;
            }
        });
        chosenCenter.points.push(point);
        setTimeout(() => {
            drawGrid();
            oldCenters.forEach(c => drawCenter(c.x, c.y, c.color));
            points.forEach((point) => drawPoint(point.x, point.y, "blue"));
            centers.forEach((c) => {
                drawCenter(c.x, c.y, "#000");
                c.points.forEach((p) => drawPoint(p.x, p.y, c.color));
            });
            processNextPoint(index + 1);
        }, delay); // Process next point
    }

    processNextPoint(0); // Start processing points

}




// Call the function to scatter random points initially
// scatterRandomPoints();
drawGrid();