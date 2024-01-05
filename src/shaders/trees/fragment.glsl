uniform vec3 lightDirection;
uniform vec3 color;
varying vec3 vNormal;

void main() {
  vec3 normal = normalize(vNormal); 
  float intensity = dot(normal, lightDirection);

  // Quantize intensity
  if (intensity > 0.6) intensity = 0.7;
  else intensity = 0.8;

  gl_FragColor = vec4(color * intensity, 1.0);
}