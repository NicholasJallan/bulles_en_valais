#version 300 es
// Bulles en Valais, hero surface (E1): one triangle covering the screen.

in vec2 position;
in vec2 uv;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
