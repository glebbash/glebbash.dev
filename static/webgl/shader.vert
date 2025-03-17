#version 300 es

uniform vec2 u_resolution;
uniform vec2 u_pointer;

in vec2 a_position;
out vec2 v;

void main() {
  v = a_position;
  gl_Position = vec4(a_position, 0, 1);
}
