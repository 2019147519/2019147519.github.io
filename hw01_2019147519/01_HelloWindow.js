// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width/2, canvas.height/2);


// turn on scissor test
gl.enable(gl.SCISSOR_TEST);

// Start rendering
render();

// Render loop
function render() {
    // Draw something here
    // Define the four colors for each quadrant
    const colors = [
        [0.0, 1.0, 0.0, 1.0], // Green
        [1.0, 0.0, 0.0, 1.0], // Red
        [0.0, 0.0, 1.0, 1.0], // Blue
        [1.0, 1.0, 0.0, 1.0]  // Yellow
    ];

    // Divide canvas into four quadrants and fill with different colors
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    // Quadrant 1 - Top-right (Green)
    gl.viewport(halfWidth, halfHeight, halfWidth, halfHeight);
    gl.scissor(halfWidth, halfHeight, halfWidth, halfHeight);
    gl.clearColor(...colors[0]); // Green
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Quadrant 2 - Top-left (Red)
    gl.viewport(0, halfHeight, halfWidth, halfHeight);
    gl.scissor(0, halfHeight, halfWidth, halfHeight);
    gl.clearColor(...colors[1]); // Red
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Quadrant 3 - Bottom-left (Blue)
    gl.viewport(0, 0, halfWidth, halfHeight);
    gl.scissor(0, 0, halfWidth, halfHeight);
    gl.clearColor(...colors[2]); // Blue
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Quadrant 4 - Bottom-right (Yellow)
    gl.viewport(halfWidth, 0, halfWidth, halfHeight);
    gl.scissor(halfWidth, 0, halfWidth, halfHeight);
    gl.clearColor(...colors[3]); // Yellow
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// Resize viewport when window size changes
window.addEventListener('resize', () => {
    const size = Math.min(window.innerWidth, window.innerHeight);
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

