(function() {

  var sample = window.sample || {};
  window.sample = sample;

  /**
   * Proprietary 3D object class that extends THREE.Mesh
   * @param {number} numVertices - number of characters (number of squares)
   * @param {number} numTextureGridCols - single line string of textures
   * @param {number} textureGridSize - width of texture for one character
   */
  sample.FloatingChars = function(numVertices, numTextureGridCols, textureGridSize) {
    this.numVertices = numVertices;
    this.numTextureGridCols = numTextureGridCols;
    this.textureGridSize = textureGridSize;

    // instantiate a custom geometry object
    geometry = new sample.FloatingCharsGeometry(this.numVertices);

    // RawShaderMaterial generated
    material = new THREE.RawShaderMaterial({
      // Non-character parts are transparent
      transparent: true,

      // draw both sides of the square
      side: THREE.DoubleSide,

      // define uniform variables to pass to shaders
      uniforms: {
        // Pass the texture created from the characters written on the canvas
        txtTexture: { type: 't' },

        // Elapsed time Add each frame in the update method
        time: { type: '1f', value: 0 },

        // number of characters = number of squares
        numVertices: { type: '1f', value: this.numVertices },

        // Number of characters in horizontal direction of Texture
        numTextureGridCols: { type: '1f', value: this.numTextureGridCols },

        // Number of vertical characters in Texture
        numTextureGridRows: { type: '1f', value: 1 },

        // number of characters to use as texture (how many types of characters to use)
        textureTxtLength: { type: '1f', value: 1 },

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

  sample.FloatingChars.prototype = Object.create(THREE.Mesh.prototype, { value: { constructor: THREE.Mesh }});


  /**
   * renew
   */
  sample.FloatingChars.prototype.update = function() {
    // update the elapsed time and pass it to the shader
    this.material.uniforms.time.value += 0.001;
  }


  /**
   * generate texture
   * @param { string } txt - the string you want to use as the texture
   * @param { string } fontFamily - font name
   */
  sample.FloatingChars.prototype.createTxtTexture = function(txt, fontFamily) {
    var textureTxtLength = txt.length;
    var numTextureGridRows = Math.ceil(textureTxtLength / this.numTextureGridCols);

    this.txtCanvas = document.createElement('canvas');
    this.txtCanvasCtx = this.txtCanvas.getContext('2d');
    this.txtCanvas.width = this.textureGridSize * this.numTextureGridCols;
    this.txtCanvas.height = this.textureGridSize * numTextureGridRows;


    // set canvas style (set fontSize to 80% of grid size)
    this.txtCanvasCtx.font = 'normal ' + (this.textureGridSize * 0.8) + 'px ' + fontFamily;

    // draw in the center of the grid
    this.txtCanvasCtx.textAlign = 'center';

    // font color is white
    this.txtCanvasCtx.fillStyle = '#ffffff';

    var colIndex;
    var rowIndex;

    for(var i  = 0, l = textureTxtLength; i < l; i++) {
      // horizontal index
      colIndex = i % this.numTextureGridCols;

      // vertical index
      rowIndex = Math.floor(i / this.numTextureGridCols);

      // draw text on canvas
      this . txtCanvasCtx . fillText (
        txt.charAt(i),

        // set textAlign to center
        // Since the reference position is the center of the string specified by the first argument
        // Specify the center coordinates of each grid in the horizontal direction
        colIndex * this.textureGridSize + this.textureGridSize / 2,

        // Specify the position of the baseline in the vertical direction
        rowIndex * this.textureGridSize + this.textureGridSize * 0.8,

        this.textureGridSize
      );
    }

    // generate three.js texture from canvas
    this.txtTexture = new THREE.Texture(this.txtCanvas);
    this.txtTexture.flipY = false ; // do not flip UVs (default for WebGL )    
    this . txtTexture . needsUpdate  =  true ;   // update texture

    // set the value to pass to the shader

    // texture
    this.material.uniforms.txtTexture.value = this.txtTexture;

    // number of vertical characters in the texture
    this.material.uniforms.numTextureGridRows.value = numTextureGridRows;

    // The type of characters used as textures (txt is assumed to be unique for each character)
    this.material.uniforms.textureTxtLength.value = textureTxtLength;

    // document.body.appendChild(this.txtCanvas);
    // $(this.txtCanvas).css('background-color', '#000');
    // $('#wrapper').remove();
  }


  /**
   * set uniform value
   */
  sample.FloatingChars.prototype.setUniform = function(uniformKey, value) {
    this.material.uniforms[uniformKey].value = value;
  }




})();