uniform float outlineThickness;

void main() {
  vec3 inflatedPosition = position + normal * outlineThickness;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(inflatedPosition, 1.0);
}