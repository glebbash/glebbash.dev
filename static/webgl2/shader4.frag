#version 300 es

precision highp float;

#define v v_vertex
in vec2 v_vertex;
out vec4 o_color;

const float EPS = 0.005;
const vec4 RED = vec4(1.0, 0.0, 0.0, 1.0);
const vec4 YELLOW = vec4(1.0, 1.0, 0.0, 1.0);

float fn(float x) {
  return x * x * 2.0 - 0.5;
}

void main() {
  if (v.y < fn(v.x)) {
    o_color = YELLOW;
  }

  if (v.y < fn(v.x) - 0.1) {
    o_color = RED;
  }

  o_color /= pow(length(v), 2.0);
}
