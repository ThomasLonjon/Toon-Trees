varying vec3 vNormal;



void main() {


    gl_Position = projectionMatrix * modelViewMatrix * vec4(inflatedPosition, 1.0);

    vNormal = normal;
}
