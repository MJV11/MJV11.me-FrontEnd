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

      // get the vertex shader program from script#vertexShader in index.html
      vertexShader: $('#vertexShader').text(),

      // get fragment shader program from script#fragmentShader in index.html
      fragmentShader: $('#fragmentShader').text()
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