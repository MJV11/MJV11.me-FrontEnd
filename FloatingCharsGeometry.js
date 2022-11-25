(function() {

  var sample = window.sample || {};
  window.sample = sample;

  /**
   * Unique Geoemtry class that extends THREE.BufferGeometry
   * @param { number } numVertices - number of characters (number of squares)
   */
  sample.FloatingCharsGeometry = function(numVertices) {
    THREE.BufferGeometry.call(this);
    this.numVertices = numVertices;
    this.init();
  }

  sample.FloatingCharsGeometry.prototype = Object.create(THREE.BufferGeometry.prototype, { value: { constructor: THREE.BufferGeometry }});

  /**
   * Initialize
   */
  sample.FloatingCharsGeometry.prototype.init = function() {
    // create an array for attributes
    var  vertices = [] ;       // vertices
    var  ringIndices = [] ;    // character (square) indices
    var  randomValues = [] ;   // Random values ​​used for vertex calculation etc.
    var  indices = [] ;        // indices
    var  ringIndices = [] ;        // indices


    // generate squares as many as this.numVertices
    for(var i = 0; i < this.numVertices; i++) {
      

      // random value for use with GLSL
      var  randomValue  =  [
        Math.random(),
        Math.random(),
        Math.random()
      ];

      // bottom left
      vertices.push(1);
      vertices.push(-1);
      vertices.push(-1);

      ringIndices.push(i); // need for ring generation for animation 2

      randomValues.push(randomValue[0]);
      randomValues.push(randomValue[1]);
      randomValues.push(randomValue[2]);


      // generate vertex data

      // upper left
      vertices.push(-1 );  // x (direction they go up)
      vertices.push(1);  // y (direction they go right)
      vertices.push(1);   // z (direction they go out)

      ringIndices.push(i); // need for ring generation for animation 2

      randomValues.push(randomValue [0]) ;   // Random values ​​used in GLSL (three because vec3)
      randomValues.push(randomValue [1]) ;   // Random values ​​used in GLSL (three because vec3)
      randomValues.push(randomValue [2]) ;   // Random values ​​used in GLSL (three because vec3)


      // upper right
      vertices.push(0);
      vertices.push(0);
      vertices.push(1);

      ringIndices.push(i); // need for ring generation for animation 2

      randomValues.push(randomValue[0]);
      randomValues.push(randomValue[1]);
      randomValues.push(randomValue[2]);




      // // bottom right
      // vertices.push(0);
      // vertices.push(0);
      // vertices.push(0);

      // uvs.push(0);
      // uvs.push(1);

      // ringIndices.push(i);

      // randomValues.push(randomValue[0]);
      // randomValues.push(randomValue[1]);
      // randomValues.push(randomValue[2]);


      // Push the index to generate polygons (6 because there are 2 triangle polygons)
      var indexOffset = i * 3; // * 2;

      indices.push( indexOffset  +  0 ) ; // top left　na
      indices.push( indexOffset  +  1 ) ; // bottom left　na
      indices.push( indexOffset  +  2 ) ; // upper right　na

      // indices.push( indexOffset  +  2 ) ; // bottom left　
      // indices.push( indexOffset  +  3 ) ; // bottom right　
      // indices.push( indexOffset  +  1 ) ; // upper right　
    }

    // attributes
    this.addAttribute('position',     new THREE.BufferAttribute(new Float32Array(vertices),     3));  // vec3 // the shape of the instanced buffer geometry
    this.addAttribute('randomValues', new THREE.BufferAttribute(new Float32Array(randomValues), 3));  // vec3 // the random places it goes
    this.addAttribute('vIndex',       new THREE.BufferAttribute(new Uint16Array(indices),       1));  // index
    this.addAttribute('ringVIndex',   new THREE.BufferAttribute(new Float32Array(ringIndices),  1));  // float

    // index
    // this.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

    this.computeVertexNormals();
  }

})();