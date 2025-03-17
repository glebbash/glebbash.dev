// @ts-check

/** @type {HTMLCanvasElement} */
let canvas;

/** @type {WebGL2RenderingContext} */
let gl;

/** @type {WebGLUniformLocation | null} */
let pointerUniformLoc;

/** @type {WebGLUniformLocation | null} */
let resolutionUniformLoc;

const pointerPos = { x: 0.0, y: 0.0 };

main().catch(alert);

async function main() {
  canvas = document.querySelector("#canvas") ?? panic("no #canvas");
  gl = canvas.getContext("webgl2") ?? panic("WebGL2 not supported");

  window.addEventListener("pointermove", (e) => {
    const rect = canvas.getBoundingClientRect();
    pointerPos.x = e.clientX - rect.left;
    pointerPos.y = canvas.height - (e.clientY - rect.top);
  });

  resize();
  window.addEventListener("resize", resize);

  const vertShader = await loadShader(gl.VERTEX_SHADER, "./shader.vert");
  const fragShader = await loadShader(gl.FRAGMENT_SHADER, "./shader.frag");
  const program = linkShaderProgram([vertShader, fragShader]);

  resolutionUniformLoc = gl.getUniformLocation(program, "u_resolution");
  pointerUniformLoc = gl.getUniformLocation(program, "u_pointer");

  gl.useProgram(program);

  const positionAttrLoc = gl.getAttribLocation(program, "a_position");
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      ...[...[-1, -1], ...[1, -1], ...[1, 1]],
      ...[...[1, 1], ...[-1, 1], ...[-1, -1]],
    ]),
    gl.STATIC_DRAW
  );
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttrLoc);
  gl.vertexAttribPointer(positionAttrLoc, 2, gl.FLOAT, false, 0, 0);

  render();
}

function render() {
  window.requestAnimationFrame(render);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(resolutionUniformLoc, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(pointerUniformLoc, pointerPos.x, pointerPos.y);

  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

// utils

/**
 * @param {WebGLShader[]} shaders
 */
function linkShaderProgram(shaders) {
  const program = gl.createProgram();
  for (const shader of shaders) {
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    const errMessage =
      gl.getProgramInfoLog(program) ?? "unknown error linking program";
    gl.deleteProgram(program);
    throw new Error(errMessage);
  }

  return program;
}

/**
 * @param {GLenum} type
 * @param {string} filePath
 */
async function loadShader(type, filePath) {
  const source = await fetch(filePath).then((r) => r.text());

  const shader = gl.createShader(type) ?? panic("can't create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    const errMessage =
      gl.getShaderInfoLog(shader) ?? "unknown error compiling shader";
    gl.deleteShader(shader);
    throw new Error(errMessage);
  }

  return shader;
}

/**
 * @param {string} message
 * @returns {never}
 */
function panic(message) {
  throw new Error(message);
}
