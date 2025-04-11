/*-----------------------------------------------------------------------------
class Cube

1) Vertex positions
    A cube has 6 faces and each face has 4 vertices
    The total number of vertices is 24 (6 faces * 4 verts)
    So, vertices need 72 floats (24 * 3 (x, y, z)) in the vertices array

2) Vertex indices
    Vertex indices of the unit cube is as follows:
     v6----- v5
     /|      /|
    v1------v0|
    | |     | |
    | v7----|-v4
    |/      |/
    v2------v3

    The order of faces and their vertex indices is as follows:
        front (0,1,2,3), right (0,3,4,5), top (0,5,6,1), 
        left (1,6,7,2), bottom (7,4,3,2), back (4,7,6,5)
    Note that each face has two triangles, 
    so the total number of triangles is 12 (6 faces * 2 triangles)
    And, we need to maintain the order of vertices for each triangle as 
    counterclockwise (when we see the face from the outside of the cube):
        front [(0,1,2), (2,3,0)]
        right [(0,3,4), (4,5,0)]
        top [(0,5,6), (6,1,0)]
        left [(1,6,7), (7,2,1)]
        bottom [(7,4,3), (3,2,7)]
        back [(4,7,6), (6,5,4)]

3) Vertex normals
    Each vertex in the same face has the same normal vector (flat shading)
    The normal vector is the same as the face normal vector
    front face: (0,0,1), right face: (1,0,0), top face: (0,1,0), 
    left face: (-1,0,0), bottom face: (0,-1,0), back face: (0,0,-1) 

4) Vertex colors
    Each vertex in the same face has the same color (flat shading)
    The color is the same as the face color
    front face: red (1,0,0,1), right face: yellow (1,1,0,1), top face: green (0,1,0,1), 
    left face: cyan (0,1,1,1), bottom face: blue (0,0,1,1), back face: magenta (1,0,1,1) 

5) Vertex texture coordinates
    Each vertex in the same face has the same texture coordinates (flat shading)
    The texture coordinates are the same as the face texture coordinates
    front face: v0(1,1), v1(0,1), v2(0,0), v3(1,0)
    right face: v0(0,1), v3(0,0), v4(1,0), v5(1,1)
    top face: v0(1,0), v5(0,0), v6(0,1), v1(1,1)
    left face: v1(1,0), v6(0,0), v7(0,1), v2(1,1)
    bottom face: v7(0,0), v4(0,1), v3(1,1), v2(1,0)
    back face: v4(0,0), v7(0,1), v6(1,1), v5(1,0)

6) Parameters:
    1] gl: WebGLRenderingContext
    2] options:
        1> color: array of 4 floats (default: [0.8, 0.8, 0.8, 1.0 ])
           in this case, all vertices have the same given color

7) Vertex shader: the location (0: position attrib (vec3), 1: normal attrib (vec3),
                            2: color attrib (vec4), and 3: texture coordinate attrib (vec2))
8) Fragment shader: should catch the vertex color from the vertex shader
-----------------------------------------------------------------------------*/

export class squarePyramid {
    constructor(gl, options = {}) {
        this.gl = gl;

        const sqrt2_inv = 1 / Math.sqrt(2);

        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // Initializing data
        this.vertices = new Float32Array([
            // Bottom face (2 triangles)
            -0.5, 0.0,  0.5,  // 0
             0.5, 0.0,  0.5,  // 1
             0.5, 0.0, -0.5,  // 2

             0.5, 0.0, -0.5,  // 3
            -0.5, 0.0, -0.5,  // 4
            -0.5, 0.0,  0.5,  // 5

            // Front face
            -0.5, 0.0,  0.5,  // 6
             0.5, 0.0,  0.5,  // 7
             0.0, 1.0,  0.0,  // 8

            // Right face
             0.5, 0.0,  0.5,  // 9
             0.5, 0.0, -0.5,  //10
             0.0, 1.0,  0.0,  //11

            // Back face
             0.5, 0.0, -0.5,  //12
            -0.5, 0.0, -0.5,  //13
             0.0, 1.0,  0.0,  //14

            // Left face
            -0.5, 0.0, -0.5,  //15
            -0.5, 0.0,  0.5,  //16
             0.0, 1.0,  0.0   //17
        ]);

        this.normals = new Float32Array([
            // Bottom face (0-5)
             0, -1, 0,   0, -1, 0,   0, -1, 0,
             0, -1, 0,   0, -1, 0,   0, -1, 0,

            // Front face (6-8)
             0, sqrt2_inv, sqrt2_inv,
             0, sqrt2_inv, sqrt2_inv,
             0, sqrt2_inv, sqrt2_inv,

            // Right face (9-11)
             sqrt2_inv, sqrt2_inv, 0,
             sqrt2_inv, sqrt2_inv, 0,
             sqrt2_inv, sqrt2_inv, 0,

            // Back face (12-14)
             0, sqrt2_inv, -sqrt2_inv,
             0, sqrt2_inv, -sqrt2_inv,
             0, sqrt2_inv, -sqrt2_inv,

            // Left face (15-17)
            -sqrt2_inv, sqrt2_inv, 0,
            -sqrt2_inv, sqrt2_inv, 0,
            -sqrt2_inv, sqrt2_inv, 0
        ]);

        this.colors = new Float32Array([
            // Bottom face - blue
            0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
            0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,

            // Front face - red
            1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

            // Right face - yellow
            1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,

            // Back face - green
            0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,

            // Left face - magenta
            1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1
        ]);

        this.texCoords = new Float32Array([
            // Bottom face
            0, 0,   1, 0,   1, 1,
            1, 1,   0, 1,   0, 0,

            // Front face
            0, 0,   1, 0,   0.5, 1,

            // Right face
            0, 0,   1, 0,   0.5, 1,

            // Back face
            0, 0,   1, 0,   0.5, 1,

            // Left face
            0, 0,   1, 0,   0.5, 1
        ]);

        this.indices = new Uint16Array([
            0, 1, 2,
            3, 4, 5,
            6, 7, 8,
            9,10,11,
           12,13,14,
           15,16,17
        ]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;
        
        // 버퍼 크기 계산
        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        // VBO에 데이터 복사
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        // EBO에 인덱스 데이터 복사
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // vertex attributes 설정
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // position
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // normal
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // color
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // texCoord

        // vertex attributes 활성화
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        // 버퍼 바인딩 해제
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
