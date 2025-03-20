#version 300 es

layout (location = 0) in vec3 aPos;

uniform float centerx;
uniform float centery;

void main() {
    gl_Position = vec4(aPos[0] + centerx, aPos[1] + centery, aPos[2], 1.0);
} 