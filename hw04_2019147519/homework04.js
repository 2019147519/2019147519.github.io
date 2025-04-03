import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axesXVAO;
let axesYVAO;
let cubeVAO;
let sunTransform;
let earthTransform;
let moonTransform;
let rotationAngle = 0;
let isAnimating = true;
let lastTime = 0;
//let textOverlay; 

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

function setupXAxesBuffers(shader) {
    axesXVAO = gl.createVertexArray();
    gl.bindVertexArray(axesXVAO);

    const axesVertices = new Float32Array([
        -1.0, 0.0, 0.0, 
         1.0, 0.0, 0.0, // x축
    ]);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupYAxesBuffers(shader) {
    axesYVAO = gl.createVertexArray();
    gl.bindVertexArray(axesYVAO);

    const axesVertices = new Float32Array([
        0.0, -1.0, 0.0, 
        0.0, 1.0, 0.0,   // y축
    ]);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupBuffers() {
    const vertices = new Float32Array([
        0.0,  0.0, 0.0,  // Center
        -0.5, -0.5, 0.0,  // Bottom left
         0.5, -0.5, 0.0,  // Bottom right
         0.5,  0.5, 0.0,   // Top right
        -0.5,  0.5, 0.0,  // Top left
        -0.5, -0.5, 0.0,  // Bottom left
    ]);

    cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    shader.setAttribPointer('a_position', 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function applyTransform() {
    sunTransform = mat4.create();
    earthTransform = mat4.create();
    moonTransform = mat4.create();

    // 태양
    mat4.rotate(sunTransform, sunTransform, rotationAngle / 4.0, [0, 0, 1]); // 자전 45 degree/sec
    mat4.scale(sunTransform, sunTransform, [0.2, 0.2, 1]);

    // 지구
    mat4.rotate(earthTransform, earthTransform, rotationAngle / 6.0, [0, 0, 1]); // 공전 30 degree/sec
    mat4.translate(earthTransform, earthTransform, [0.7, 0, 0]);
    mat4.rotate(earthTransform, earthTransform, rotationAngle, [0, 0, 1]); // 자전 180 degree/sec
    mat4.scale(earthTransform, earthTransform, [0.1, 0.1, 1]);
    
    // 달
    mat4.rotate(moonTransform, moonTransform, rotationAngle / 6.0, [0, 0, 1]);
    mat4.translate(moonTransform, moonTransform, [0.7, 0, 0]);
    mat4.rotate(moonTransform, moonTransform, rotationAngle * 2.0, [0, 0, 1]); // 공전 360 degree/sec
    mat4.translate(moonTransform, moonTransform, [0.2, 0, 0]);
    mat4.rotate(moonTransform, moonTransform, rotationAngle, [0, 0, 1]); // 자전 180 degree/sec
    mat4.scale(moonTransform, moonTransform, [0.05, 0.05, 1]);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    let color;

    shader.use();

    // 축 그리기
    color = [1.0, 0.3, 0.0, 1.0]; // x축 색상
    shader.setVec4("u_color", color);
    shader.setMat4("u_model", mat4.create());
    gl.bindVertexArray(axesXVAO);
    gl.drawArrays(gl.LINES, 0, 2);

    color = [0.0, 1.0, 0.5, 1.0]; // y축 색상
    shader.setVec4("u_color", color);
    shader.setMat4("u_model", mat4.create());
    gl.bindVertexArray(axesYVAO);
    gl.drawArrays(gl.LINES, 0, 2);

    // 태양 그리기
    color = [1.0, 0.0, 0.0, 1.0]; // red
    shader.setVec4("u_color", color);
    shader.setMat4("u_model", sunTransform);
    gl.bindVertexArray(cubeVAO);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);

    // 지구 그리기
    color = [0.0, 1.0, 1.0, 1.0]; // cyan
    shader.setVec4("u_color", color);
    shader.setMat4("u_model", earthTransform);
    gl.bindVertexArray(cubeVAO);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);

    // 달 그리기
    color = [1.0, 1.0, 0.0, 1.0]; // yellow
    shader.setVec4("u_color", color);
    shader.setMat4("u_model", moonTransform);
    gl.bindVertexArray(cubeVAO);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 6);
}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    if (isAnimating) {
        rotationAngle += Math.PI * deltaTime;
        applyTransform();
    }
    render();
    requestAnimationFrame(animate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        sunTransform = mat4.create();
        earthTransform = mat4.create();
        moonTransform = mat4.create();
        
        shader = await initShader();
        setupXAxesBuffers(shader);
        setupYAxesBuffers(shader);
        setupBuffers(shader);
        shader.use();
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
