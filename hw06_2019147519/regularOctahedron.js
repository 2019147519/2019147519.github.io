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
    The vertex normal vector is the same as the face normal vector
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
        -  color: array of 4 floats (default: [0.8, 0.8, 0.8, 1.0 ])
           in this case, all vertices have the same given color
           ex) const cube = new Cube(gl, {color: [1.0, 0.0, 0.0, 1.0]}); (all red)

7) Vertex shader: the location (0: position attrib (vec3), 1: normal attrib (vec3),
                            2: color attrib (vec4), and 3: texture coordinate attrib (vec2))
8) Fragment shader: should catch the vertex color from the vertex shader

-----------------------------------------------------------------------------*/
/*-----------------------------------------------------------------------------
class RegularOctahedron


         v4

      v2------v1
     /       /
    v3------v0

         v5


-----------------------------------------------------------------------------*/

export class RegularOctahedron {
    constructor(gl, options = {}) {
        this.gl = gl;
        
        // Creating VAO and buffers
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // y index of top vertex
        const h = Math.sqrt(2) / 2;

        // Initializing data
        this.vertices = new Float32Array([
            // upper front face (v0,v4,v3)
             0.5,  0,  0.5,   0,  h,  0,  -0.5,  0,  0.5,
            // upper right face (v1,v4,v0)
             0.5,  0, -0.5,   0,  h,  0,   0.5,  0,  0.5,
            // upper back face (v2,v4,v1)
            -0.5,  0, -0.5,   0,  h,  0,   0.5,  0, -0.5,
            // upper left face (v3,v4,v2)
            -0.5,  0,  0.5,   0,  h,  0,  -0.5,  0, -0.5,
            // lower front face (v3,v5,v0)
            -0.5,  0,  0.5,   0, -h,  0,   0.5,  0,  0.5,
            // lower right face (v0,v5,v1)
             0.5,  0,  0.5,   0, -h,  0,   0.5,  0, -0.5,
            // lower back face (v1,v5,v2)
             0.5,  0, -0.5,   0, -h,  0,  -0.5,  0, -0.5,
            // lower left face (v2,v5,v3)
            -0.5,  0, -0.5,   0, -h,  0,  -0.5,  0,  0.5,
        ]);

        // values of normal vectors
        const a = 1 / Math.sqrt(3);
        const b = Math.sqrt(2) / Math.sqrt(3);

        this.normals = new Float32Array([
            // upper front face (v0,v4,v3)
             0,  a,  b,   0,  a,  b,   0,  a,  b,
            // upper right face (v1,v4,v0)
             b,  a,  0,   b,  a,  0,   b,  a,  0,
            // upper back face (v2,v4,v1)
             0,  a, -b,   0,  a, -b,   0,  a, -b,
            // upper left face (v3,v4,v2)
            -b,  a,  0,  -b,  a,  0,  -b,  a,  0,
            // lower front face (v3,v5,v0)
            0, -a,  b,   0, -a,  b,   0, -a,  b,
            // lower right face (v0,v5,v1)
            b, -a,  0,   b, -a,  0,   b, -a,  0,
            // lower back face (v1,v5,v2)
            0, -a, -b,   0, -a, -b,   0, -a, -b,
            // lower left face (v2,v5,v3)
            -b, -a,  0,  -b, -a,  0,  -b, -a,  0
        ]);

        // if color is provided, set all vertices' color to the given color
        if (options.color) {
            for (let i = 0; i < 24 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i+1] = options.color[1];
                this.colors[i+2] = options.color[2];
                this.colors[i+3] = options.color[3];
            }
        }
        else {
            this.colors = new Float32Array([
                // upper front face (v0,v4,v3) - red
                1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,
                // upper right face (v1,v4,v0) - yellow
                1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,
                // upper back face (v2,v4,v1) - green
                0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,
                // upper left face (v3,v4,v2) - cyan
                0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,
                // lower front face (v3,v5,v0) - blue
                0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
                // lower right face (v0,v5,v1) - magenta
                1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,
                // lower back face (v1,v5,v2) - white
                1, 1, 1, 1,   1, 1, 1, 1,   1, 1, 1, 1,
                // lower left face (v2,v5,v3) - black
                0, 0, 0, 1,   0, 0, 0, 1,   0, 0, 0, 1,
            ]);
        }

        this.texCoords = new Float32Array([
            // upper front face (v0,v4,v3)
            0.25, 0.5,   0.5, 1,   0, 0.5,
            // upper right face (v1,v4,v0)
            0.5, 0.5,   0.5, 1,   0.25, 0.5,
            // upper back face (v2,v4,v1)
            0.75, 0.5,   0.5, 1,   0.5, 0.5,
            // upper left face (v3,v4,v2)
            1, 0.5,   0.5, 1,   0.75, 0.5,
            // lower front face (v3,v5,v0)
            0, 0.5,   0.5, 0,   0.25, 0.5,
            // lower right face (v0,v5,v1)
            0.25, 0.5,   0.5, 0,   0.5, 0.5,
            // lower back face (v1,v5,v2)
            0.5, 0.5,   0.5, 0,   0.75, 0.55,
            // lower left face (v2,v5,v3)
            0.75, 0.55,   0.5, 0,   1, 0.5
        ]);

        this.indices = new Uint16Array([
            // upper front face
            0, 1, 2,
            // upper right face
            3, 4, 5,
            // upper back face
            6, 7, 8,
            // upper left face
            9, 10, 11,
            // lower front face
            12, 13, 14,
            // lower right face
            15, 16, 17,
            // lower back face
            18, 19, 20,
            // lower left face
            21, 22, 23
        ]);

        this.sameVertices = new Uint16Array([
            0, 4, 8,    // indices of the same vertices as v0
            1, 11, 12,  // indices of the same vertices as v1
            2, 15, 19,  // indices of the same vertices as v2
            3, 5, 18,   // indices of the same vertices as v3
            6, 17, 20,  // indices of the same vertices as v4
            7, 9, 23,   // indices of the same vertices as v5
            10, 13, 22, // indices of the same vertices as v6
            14, 16, 21  // indices of the same vertices as v7
        ]);

        this.vertexNormals = new Float32Array(72);
        this.faceNormals = new Float32Array(72);
        this.faceNormals.set(this.normals);

        // compute vertex normals (by averaging face normals)

        for (let i = 0; i < 24; i += 3) {

            let vn_x = (this.normals[this.sameVertices[i]*3] + 
                       this.normals[this.sameVertices[i+1]*3] + 
                       this.normals[this.sameVertices[i+2]*3]) / 3; 
            let vn_y = (this.normals[this.sameVertices[i]*3 + 1] + 
                       this.normals[this.sameVertices[i+1]*3 + 1] + 
                       this.normals[this.sameVertices[i+2]*3 + 1]) / 3; 
            let vn_z = (this.normals[this.sameVertices[i]*3 + 2] + 
                       this.normals[this.sameVertices[i+1]*3 + 2] + 
                       this.normals[this.sameVertices[i+2]*3 + 2]) / 3; 

            this.vertexNormals[this.sameVertices[i]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+1]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i+2]*3] = vn_x;
            this.vertexNormals[this.sameVertices[i]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+1]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i+2]*3 + 1] = vn_y;
            this.vertexNormals[this.sameVertices[i]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+1]*3 + 2] = vn_z;
            this.vertexNormals[this.sameVertices[i+2]*3 + 2] = vn_z;
        }

        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
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
        // gl.bufferSubData(target, offset, data): target buffer의 
        //     offset 위치부터 data를 copy (즉, data를 buffer의 일부에만 copy)
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

    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        
        // normals 데이터만 업데이트
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {

        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
} 