(function() {

  var sample = window.sample || {};
  window.sample = sample;

  /**
   * Proprietary 3D object class that extends THREE.Mesh
   * @param {number} numVertices - number of characters (number of squares)
   */
  sample.Triangles = function(numVertices) {
    this.numVertices = numVertices;

    // instantiate a custom geometry object
    geometry = new sample.TriangleGeometry(this.numVertices);

    // RawShaderMaterial generated
    material = new THREE.RawShaderMaterial({
      // Non-character parts are transparent
      transparent: true,

      // draw both sides of the square
      side: THREE.DoubleSide,

      // define uniform variables to pass to shaders
      uniforms: {

        // Elapsed time Add each frame in the update method
        time: { type: '1f', value: 0 },

        // number of characters = number of squares
        numVertices: { type: '1f', value: this.numVertices },

        // animation applicability
        animationValue1: { type: '1f', value: 1 },
        animationValue2: { type: '1f', value: 0 },
        animationValue3: { type: '1f', value: 0 },
        animationValue4: { type: '1f', value: 0 },
        animationValue5: { type: '1f', value: 0 },
        animationValue6: { type: '1f', value: 0 },
        animationValue7: { type: '1f', value: 0 },
        animationValue8: { type: '1f', value: 0 },
      },

      // how the triangles operate
      vertexShader: `
        // uniforms
        uniform mat4 modelMatrix; 
        uniform mat4 viewMatrix;  
        uniform mat4 projectionMatrix;  
        uniform vec3 cameraPosition;  
        uniform mat4 modelViewMatrix;

        // uniforms
        uniform float time;  
        uniform float numVertices; 
        uniform float animationValue1;  
        uniform float animationValue2;  
        uniform float animationValue3;  
        uniform float animationValue4;  
        uniform float animationValue5;  
        uniform float animationValue6;  
        uniform float animationValue7;  
        uniform float animationValue8;  

        // TriangleGeometry attributes
        attribute vec3 position;  
        attribute vec3 randomValues;  
        attribute vec3 normal;
        attribute float ringVIndex;  
        attribute float vIndex;

        varying vec4 vColor; 

        // doesn't exist, must be defined
        const float PI = 3.1415926535897932384626433832795;

        // rotate vec3
        vec3 rotateVec3(vec3 p, float angle, vec3 axis){
          vec3 a = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float r = 1.0 - c;
          mat3 m = mat3(
            a.x * a.x * r + c,
            a.y * a.x * r + a.z * s,
            a.z * a.x * r - a.y * s,
            a.x * a.y * r - a.z * s,
            a.y * a.y * r + c,
            a.z * a.y * r + a.x * s,
            a.x * a.z * r + a.y * s,
            a.y * a.z * r - a.x * s,
            a.z * a.z * r + c
          );
          return m * p;
        }

        // must write your own map function 
        float map(float value, float inputMin, float inputMax, float outputMin, float outputMax, bool clamp) {
          if(clamp == true) {
            if(value < inputMin) return outputMin;
            if(value > inputMax) return outputMax;
          }

          float p = (outputMax - outputMin) / (inputMax - inputMin);
          return ((value - inputMin) * p) + outputMin;
        }

        // hsv to rgb
        vec3 hsv2rgb(vec3 c) {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        //
        float getAlpha(float distance) {
          float da = abs(distance - 400.0) / 500.0;
          return clamp(1.0 - da, 0.0, 1.0);
        }

        // time, scale, offset
        float getRad(float scale, float offset) {
          return map(mod(time * scale + offset, PI * 2.0), 0.0, PI * 2.0, -PI, PI, true);
        }

        float exponentialInOut_6_4(float t) {
          return t == 0.0 || t == 1.0
            ? t
            : t < 0.5
              ? +0.5 * pow(2.0, (20.0 * t) - 10.0)
              : -0.5 * pow(2.0, 10.0 - (t * 20.0)) + 1.0;
        }

        vec3 mod289_5_5(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec2 mod289_5_5(vec2 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec3 permute_5_6(vec3 x) {
          return mod289_5_5(((x*34.0)+1.0)*x);
        }
        
        float getanimationValue(float animationValue, float randomValue) {
          float p = clamp(-map(randomValue, -1.0, 1.0, 0.0, 0.6, true) + animationValue * 1.5, 0.0, 1.0);
          p = exponentialInOut_6_4(p);
          return p;
        }

        // main processing
        void main() {
          vec3 pos = position;
          float theta;
          vec3 n = normal;
          float rad1, rad2;

          float radius = 30.0;

          //
          // animation1 - billboard
          // 
          //

          float p = getanimationValue(animationValue1, randomValues.x);
          if(p > 0.0) {
            pos -= position;
            theta = getRad(4.0, (randomValues.x + randomValues.y + randomValues.z) * 200.0);
            pos.z += radius + radius * map(sin(theta), -1.0, 1.0, 0.0, 1.0, true);
            theta = getRad(4.0, randomValues.x * 20.0 );
            pos = rotateVec3(pos, theta, vec3(0.0, 1.0, 0.0));
            theta = getRad(4.0, randomValues.y * 20.0);
            pos = rotateVec3(pos, theta, vec3(0.0,0.0,1.0));
            theta = getRad(4.0, randomValues.z * 20.0);
            pos = rotateVec3(pos, theta, vec3(1.0, 0.0, 0.0));
          }

          //
          // animation2 - cylinder
          // 
          //

          p = getanimationValue(animationValue2, randomValues.x);
          if(p > 0.0) {
            if (mod(ringVIndex, 3.0) >= 0.0) {
              float numRings = 8.0;  
              float ringIndex = mod(ringVIndex, numRings);  
              float numVerticesPerRing = numVertices / numRings; 

              pos.y += map(ringIndex, 0.0, numRings - 1.0, -2.0 * radius, 2.0 * radius, true);
              pos.z += 1.5 * radius; 
          
              theta = getRad(10.0, PI * 2.0 / numVerticesPerRing * mod((ringVIndex - ringIndex) / numRings, numVerticesPerRing));
              pos = rotateVec3(pos, theta, vec3(0.0, 1.0, 0.0));
            }
          }

          //
          // animation3 -- sphere (small particles)
          // 
          //

          p = getanimationValue(animationValue3, randomValues.x);
          if(p > 0.0) {
            pos.z +=  radius;
            theta = getRad(6.0, randomValues.x * 10.0);
            pos = rotateVec3(pos, theta, vec3(0.0, 1.0, 0.0));
            theta = getRad(6.0, randomValues.y * 10.0);
            pos = rotateVec3(pos, theta, vec3(1.0, 0.0, 0.0));
            theta = getRad(6.0, randomValues.z * 10.0);
            pos = rotateVec3(pos, theta, vec3(0.0, 0.0, 1.0));
          }

          //
          // animation4 - vibrating shards
          // credit @ takumi hasegawa #4
          //

          p = getanimationValue(animationValue4, randomValues.x);
          if(p > 0.0) {
            pos = pos - pos.z * p;
            if (mod(vIndex, 3.0) > 0.0) { 
              pos.z += (p * (8.0 * randomValues.z * sin(randomValues.z * 100.0))); // (p * initial size of the quill)
              pos = rotateVec3(pos, p * getRad(10.0, randomValues.x * 10.0), vec3(1.0, 0, 0));
              pos = rotateVec3(pos, p * getRad(10.0, randomValues.y * 10.0), vec3(0, 1.0, 0));
              pos += (p * sin(getRad(60.0, randomValues.z * 60.0)) * randomValues.z * 16.0 * normalize(pos)); // (p *  speed of size change * maximum height *)
            }
          }

          //
          // animation 5 - sphere (tangential particles)
          // credit @ takumi hasegawa #5
          // 

          p = getanimationValue(animationValue5, randomValues.x);
          if(p > 0.0) {
            pos.z *= 10.0;
            pos = 1.0*pos - (pos - normalize(pos) * 3.0) * p; // 3.0 makes everything bigger
            rad1 = getRad(10.0, randomValues.x * 10.0);
            rad2 = getRad(10.0, randomValues.y * 10.0); // rad relates to the speed of the rotation
            pos = rotateVec3(pos, p * rad1, vec3(1.0, 0, 0));
            pos = rotateVec3(pos, p * rad2, vec3(0, 1.0, 0));
            n = rotateVec3(n, p * rad1, vec3(1.0, 0, 0));
            n = rotateVec3(n, p * rad2, vec3(0, 1.0, 0));
            pos = (p * sin(getRad(10.0, randomValues.z * 10.0)) * 30.0 * normalize(pos)); // 30.0 makes everything bigger, first 10 increases speed of oscillation
          }

          //
          // animation 6 - cube within a cube within a cube (cube cubed)
          // credit @ takumi hasegawa #6
          //

          // animation6
          p = getanimationValue(animationValue6, randomValues.x);
          if(p > 0.0) {
            pos *= vec3(1.0, 1.0, 0.0);
            rad1 = getRad(30.0, randomValues.x * 10.0);
            rad2 = getRad(30.0, randomValues.y * 10.0);
            pos = rotateVec3(pos, p * rad1, vec3(1.0, 0, 0));
            pos = rotateVec3(pos, p * rad2, vec3(0, 1.0, 0));
            float triangleIndex = floor(vIndex / 3.0);
            float cubeIndex = mod(mod(triangleIndex, 41.0), 3.0);
            float size = 8.0 + cubeIndex * 8.0;
            float t = mod(time * 10.0 + randomValues.z * 10.0, 4.0);
            pos.x += (map(t, 0.0, 1.0, -1.0, 1.0, true) * size * p - size * p);
            pos.y += (map(t, 1.0, 2.0, -1.0, 1.0, true) * size * p - size * p);
            pos.x -= map(t, 2.0, 3.0, -1.0, 1.0, true) * size * p;
            pos.y -= map(t, 3.0, 4.0, -1.0, 1.0, true) * size * p;
            pos.z -= size * p;
            pos = rotateVec3(pos, p * PI * mod(triangleIndex, 2.0), vec3(0.0, 0.0, 1.0));
            pos = rotateVec3(pos, p * PI / 2.0 * mod(triangleIndex, 3.0), vec3(1.0, 0.0, 0.0));
            pos = rotateVec3(pos, p * PI / 2.0 * mod(triangleIndex, 4.0), vec3(0.0, 1.0, 0.0));
            pos = rotateVec3(pos, p * time * 2.0 * (cubeIndex + 1.0), vec3(0.0, 0.0, 1.0));
            pos = rotateVec3(pos, p * time * 2.0 * (cubeIndex + 1.0), vec3(1.0, 0.0, 0.0));
          }

          //
          // animation 7 - spiral
          // credit @ takumi animation # 3
          //

          p = getanimationValue(animationValue7, randomValues.x);
          if(p > 0.0) {
            pos *= vec3(1.0, 1.0, 0.0);
            pos = pos - randomValues.x * p; // spiral creation
            rad1 = getRad(40.0, randomValues.x * 5.0); 
            rad2 = getRad(40.0, randomValues.y * 5.0);
            pos = rotateVec3(pos, p * rad1, vec3(1.0, 0, 0)); // rotation speed of the triangles 
            pos = rotateVec3(pos, p * rad2, vec3(0, 1.0, 0));
            n = rotateVec3(n, p * rad1, vec3(1.0, 0, 0)); // rotate normals
            n = rotateVec3(n, p * rad2, vec3(0, 1.0, 0));
            float radius = 120.0 * map(randomValues.y, -1.0, 1.0, 0.02, 1.0, true); //randomValues.y, -.25, 0.25, -.75, 1.0, false); 
            // (inward radius feed, outward radius feed, inward radius limit, outward radius limit)
            float anim2CircleRad = getRad(6.0, randomValues.x * 60.0);
            pos += vec3(
              p * 2.0 * radius * cos(anim2CircleRad),
              p * 6.0 * sin(getRad(3.0, randomValues.y) * 10.0), // (p * amplitutde * sin(getRad(speed of oscillation, randomValues.y) * number of waves))
              p * 2.0 * radius * sin(anim2CircleRad)
            );
            pos = rotateVec3(pos, p * getRad(4.0, 0.0), vec3(0.3, 1.0, .5 * sin(time)));
            n = rotateVec3(n, p * getRad(4.0, 0.0), vec3(0.3, 1.0, sin(time)));
          }


          //
          // animation 8 something with a cube
          // credit @ takumi hasegawa animation 2
          //

          p = getanimationValue(animationValue8, randomValues.x);
          if(p > 0.0) {
            pos = pos - pos.x * p;
            pos *= (1.0 + p);
            rad1 = PI * 2.0 * sin(getRad(1.0, pos.x));
            rad2 = PI * 2.0 * sin(getRad(1.0, pos.y));
            pos = rotateVec3(pos, p * rad1, vec3(1.0, 0, 0));
            pos = rotateVec3(pos, p * rad2, vec3(0, 1.0, 0));
            n = rotateVec3(n, p * rad1, vec3(1.0, 0, 0));
            n = rotateVec3(n, p * rad2, vec3(0, 1.0, 0));
            vec3 cubeCenterTo = randomValues * 20.0;
            pos += (p * cubeCenterTo);
            pos = rotateVec3(pos, p * getRad(1.0, 0.0), vec3(0.3, 1.0, 0.2));
            pos += (p * sin(getRad(160.0, 160.0)) * 0.3 * normalize(cubeCenterTo - pos)); 
          }



          //
          // 
          //

          // model conversion
          vec4  modelPos  =  modelMatrix  *  vec4 ( pos ,  1.0 ) ;
        
          // view transform
          vec4  modelViewPos  =  viewMatrix  *  modelPos ;
          modelViewPos += vec4(position, 0.0) * animationValue1;

          // processing for billboard (animation1)
          pos -= animationValue1 * position;


          modelViewPos += vec4(position, 0.0) * animationValue1;

          // Assign projection-transformed coordinates to gl_Position
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

          float len = length(pos);
          vColor = vec4(hsv2rgb(vec3(
            map(sin(getRad(2.0,  0.6 + len * (animationValue5 * 0.2 * 0.2 + animationValue6 * 0.2 * 0.5))), -1.0, 1.0, 0.0, 1.0, true),
            map(cos(getRad(3.0,  2.0 + len * (animationValue8 * 2.0 + animationValue7 * 3.0))), -1.0, 1.0, 0.3, 0.5, true),
            map(cos(getRad(1.0,  0.3)), -1.0, 1.0, 1.6, 2.0, true) + animationValue4 * 0.2
          )), 1.0);

          // light
          float diffuse = clamp(dot(n, normalize(vec3(1.0, 1.0, 1.0))) , 0.5, 1.0);
          vColor *= vec4(vec3(diffuse), 1.0);
        }`,

      // fragment shader
      fragmentShader: `
        precision mediump float;

        varying vec4 vColor;  // color

        // main processing
        void main(){
          gl_FragColor = vColor;
        }`
    });

    // Execute constructor of inherited THREE.Mesh
    THREE.Mesh.call(this, geometry, material);
  }

  sample.Triangles.prototype = Object.create(THREE.Mesh.prototype, { value: { constructor: THREE.Mesh }});

  /**
   * renew
   */
  sample.Triangles.prototype.update = function() {
    // update the elapsed time and pass it to the shader
    this.material.uniforms.time.value += 0.001;
  }

  /**
   * set uniform value
   */
  sample.Triangles.prototype.setUniform = function(uniformKey, value) {
    this.material.uniforms[uniformKey].value = value;
  }

})();