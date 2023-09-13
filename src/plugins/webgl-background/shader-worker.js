import fragmentShader from './fragment.glsl?raw';
import vertexShader from './vertex.glsl?raw';

const FPS = 30;
const FRAME_DELAY = 1000
const FRAME_TIME = FRAME_DELAY / FPS;

class Renderer {
    constructor(canvas, texture, width, height, vertexShader, fragmentShader) {
        // State
        this.paused = false;
        this.lastTime = 0;

        // WebGL2
        this.canvas = canvas;

        const gl = canvas.getContext('webgl2');
        if (!gl) throw new Error('WebGL2 not supported. Please use a modern browser.');
        this.gl = gl

        const program = this.createProgram(vertexShader, fragmentShader);
        this.program = program;
        gl.useProgram(program);

        // Uniforms
        this.resolution = gl.getUniformLocation(program, "iResolution");
        this.time = gl.getUniformLocation(program, "iTime");
        this.speed = gl.getUniformLocation(program, "speed");
        this.skyColor = gl.getUniformLocation(program, "skyColor");
        this.cloudColor = gl.getUniformLocation(program, "cloudColor");
        this.lightColor = gl.getUniformLocation(program, "lightColor");

        // Setup
        this.setPosition();
        this.setSize(width, height);
        this.setTexture(texture);
        this.setUniforms();
        this.render();
    }

    setSize(width, height) {
        const { gl, resolution } = this;

        gl.uniform2f(resolution, width / 2, height / 2);
        gl.viewport(0, 0, width, height);
        gl.canvas.width = width;
        gl.canvas.height = height;
    }

    setPosition() {
        const { gl, program } = this;

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        const positions = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ]);

        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    }

    setTexture(image) {
        const { gl } = this;

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    setUniforms() {
        const { gl, time, speed, skyColor, cloudColor, lightColor } = this;

        gl.uniform1f(time, 0); gl.uniform1f(speed, 3.33);
        gl.uniform3f(skyColor, 0.17, 0.35, 0.50);
        gl.uniform3f(cloudColor, 0.05, 0.12, 0.30);
        gl.uniform3f(lightColor, 1.00, 1.00, 1.00);
    }

    createProgram(vertexShaderSource, fragmentShaderSource) {
        const { gl } = this;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return;
        }

        return program;
    }

    compileShader(type, source) {
        const { gl } = this;

        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return;
        }

        return shader;
    }

    render() {
        requestAnimationFrame(() => { this.render() });

        if (this.paused) return;

        const time = new Date().getTime();
        if(time - this.lastTime < FRAME_TIME) return;
        this.lastTime = time;

        this.gl.uniform1f(this.time, performance.now() / FRAME_DELAY);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}

self.addEventListener('message', ({ data }) => {
    const { message } = data;

    switch (message) {
        case 'initialize': {
            const { canvas, texture, width, height } = data;
            self.renderer = new Renderer(canvas, texture, width, height, vertexShader, fragmentShader);
            break;
        }
        case 'resize': {
            const { width, height } = data;
            self.renderer.setSize(width, height);
            break;
        }
        case 'visibilitychange:hidden': {
            self.renderer.paused = true;
            break;
        }
        case 'visibilitychange:visible': {
            self.renderer.paused = false;
            break;
        }
    }
});
