(function() {

  var sample = window.sample || {};
  window.sample = sample;

  /**
   * Unique Geoemtry class that extends THREE.BufferGeometry
   * @param { number } numVertices - number of vertices (number of triangles)
   */
  sample.TriangleGeometry = function(numVertices) {
    THREE.BufferGeometry.call(this);
    this.numVertices = numVertices;
    this.init();
  }

  function map(value, inputMin, inputMax, outputMin, outputMax, clamp = false) {
    if(clamp == true) {
        if(value < inputMin) return outputMin;
        if(value > inputMax) return outputMax;
    }

    p = (outputMax - outputMin) / (inputMax - inputMin);
    return ((value - inputMin) * p) + outputMin;
  }

  sample.TriangleGeometry.prototype = Object.create(THREE.BufferGeometry.prototype, { value: { constructor: THREE.BufferGeometry }});

  /**
   * Initialize
   */
  sample.TriangleGeometry.prototype.init = function() {
    // create an array for attributes
    var  vertices = [] ;       // vertices
    var  ringIndices = [] ;    // ring indices
    var  randomValues = [] ;   // Random values ​​used for vertex calculation etc.
    var  indices = [] ;        // indices


    // generate squares as many as this.numVertices
    for(var i = 0; i < this.numVertices; i++) {
      

      // random value for use with GLSL
      var  randomValue  =  [
        map(Math.random(), 0, 1, -1, 1),
        map(Math.random(), 0, 1, -1, 1),
        map(Math.random(), 0, 1, -1, 1),
      ];

      // generate vertex data
      vertices.push(0);
      vertices.push(0);
      vertices.push(1 + .5*Math.random());

      vertices.push(1.5 + Math.random() - .5);  // x (direction they go up)
      vertices.push(0);  // y (direction they go right)
      vertices.push(1 + .5*Math.random());

      vertices.push(0);
      vertices.push(1.5 + Math.random() - .5);
      vertices.push(1 + .5*Math.random());

      ringIndices.push(i); // need for ring generation for animation 2

      randomValues.push(randomValue [0]);   // Random values ​​used in GLSL (three because vec3)
      randomValues.push(randomValue [1]);   // Random values ​​used in GLSL (three because vec3)
      randomValues.push(randomValue [2]);   // Random values ​​used in GLSL (three because vec3)
      
      ringIndices.push(i); // need for ring generation for animation 2

      randomValues.push(randomValue[0]);
      randomValues.push(randomValue[1]);
      randomValues.push(randomValue[2]);

      ringIndices.push(i); // need for ring generation for animation 2

      randomValues.push(randomValue[0]);
      randomValues.push(randomValue[1]);
      randomValues.push(randomValue[2]);

      // Push the index to generate polygons 
      var indexOffset = i * 3; // * 2;

      indices.push(indexOffset + 0); // top left　na
      indices.push(indexOffset + 1); // bottom left　na
      indices.push(indexOffset + 2); // upper right　na
    }

    // attributes
    this.addAttribute('position',     new THREE.BufferAttribute(new Float32Array(vertices),     3));  // vec3 // the shape of the instanced buffer geometry
    this.addAttribute('randomValues', new THREE.BufferAttribute(new Float32Array(randomValues), 3));  // vec3 // the random places it goes
    this.addAttribute('vIndex',       new THREE.BufferAttribute(new Uint16Array(indices),       1));  // index
    this.addAttribute('ringVIndex',   new THREE.BufferAttribute(new Float32Array(ringIndices),  1));  // float
    // normals (also an attribute)
    this.computeVertexNormals();
  }
})();