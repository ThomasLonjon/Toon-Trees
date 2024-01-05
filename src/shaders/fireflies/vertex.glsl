uniform float uTime;
uniform float uPixelRatio;
uniform float uSize;


attribute float aScale;
varying float vAlpha;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += tan(uTime + modelPosition.x * 100.0 * aScale) ;

    vec4 viewPosition =  viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize*aScale*uPixelRatio;
    gl_PointSize *= (1.0/ -viewPosition.z) ;

    vAlpha = (modelPosition.y > modelPosition.x * 2.5 || modelPosition.y < 0.0 ) ? 0.0 : 1.0;
}