uniform float uTime;
uniform float uScale;

varying vec2 vUv;

void main()
{
    vec4 scaledPosition = vec4(position * uScale, 1.0);
    vec4 modelPosition = modelMatrix * scaledPosition;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    vUv = uv;
}