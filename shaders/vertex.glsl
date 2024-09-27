varying vec2 uv;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.);
  gl_PointSize = 50. * (1. / - mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}