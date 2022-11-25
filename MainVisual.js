(function() {

  var sample = window.sample || {};
  window.sample = sample;

  /**
   * Main visual class
   * @param { number } numVertices - number of characters (number of squares)
   * @param { number } charWidth - Character width [px]
   * @param { number } numTextureGridCols - single line string of textures [px]
   * @param { number } textureGridSize - Texture width for one character [px]
   */
  sample.MainVisual = function(numVertices, charWidth, numTextureGridCols, textureGridSize, fontFamily) {

    // number of characters = number of squares
    this.numVertices = numVertices || 10000;

    // character width [px] (1 character width of geometry)
    this.charWidth = charWidth || 4;

    // texture single line string
    this.numTextureGridCols = numTextureGridCols || 16;

    // width of texture for one character
    this.textureGridSize = textureGridSize || 128;

    // font name to use
    this.fontFamily = fontFamily || 'Cabin Sketch'

    // animation applicability
    // There are 3 animations defined in the vertex shader
    // value to switch between them
    this.animationValue1 = 1;
    this.animationValue2 = 0;
    this.animationValue3 = 0;
    this.animationValue4 = 0;
    this.animationValue5 = 0;
    this.animationValue6 = 0;
    this.animationValue7 = 0;
    this.animationValue8 = 0;

    // initialize
    this.init();
  }

  /**
   * Initialize
   */
  sample.MainVisual.prototype.init = function() {
    var self = this;

    this.$window = $(window);

    // get div#main
    this.$mainVisual = $('#main');

    // webGL renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas : this . $mainVisual . find ( 'canvas' ) . get ( 0 ) ,   // #contents on HTML > #main > specify HTMLElement of canvas
      alpha: true,
      antialias : true
    });

    // High resolution display support (2x is max)
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(pixelRatio);

    // scene
    this.scene = new THREE.Scene();

    // camera
    this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 10, 1000);
    this.camera.position.set(0, 0, 100);

    // controls
    // Unless this.renderer.domElement is specified as the second argument, dat.gui's GUI cannot be operated properly
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);

    // window resize event
    this.$window.on('resize', function(e) {
      // execute resize method
      self.resize();
    });

    // Initialize FloatingChars that extends THREE.Mesh
    // When the asynchronous processing ends, fire the resize event and start the animation
    this.initFloatingChars().then(function() {
      // Resize the canvas size by firing the resize event
      self.$window.trigger('resize');

      // start animation
      self.start();
    });
  }

  /**
   * Initialize floatingChars
   */
  sample.MainVisual.prototype.initFloatingChars = function() {
    var self = this;

    return new Promise(function(resolve) {
      // webfont load event
      WebFont.load({
        // use Google Fonts
        google: {
          families : [  self . fontFamily  ]   // specify the font name
        },
        active: function(fontFamily, fontDescription) {
          // load complete
          console.log('webfonts loaded');

          // FloatingChars instantiation
          self.floatingChars = new sample.FloatingChars(
            self.numVertices,
            self.charWidth,
            self.numTextureGridCols,
            self.textureGridSize
          );

          // initialize the texture
          // first argument is the character to use (unique)
          // second argument is the font name to use
          self.floatingChars.createTxtTexture('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|:;?<>,.', self.fontFamily);

          // add to scene
          self.scene.add(self.floatingChars);

          // Generate GUI for dat.gui
          self.createDatGUIBox();

          // completion
          resolve();
        }
      });
    });
  }


  /**
   * start animation
   */
  sample.MainVisual.prototype.start = function() {
    var self = this;

    var enterFrameHandler = function() {
      requestAnimationFrame(enterFrameHandler);
      self.update();
    };

    enterFrameHandler();
  }


  /**
   * Runs inside the animation loop
   */
  sample.MainVisual.prototype.update = function() {
    this.controls.update();
    this.floatingChars.update(this.camera);
    this.renderer.render(this.scene, this.camera);
  }


  /**
   * Resize processing
   * @param { jQuery.Event } e - jQuery event object
   */
  sample.MainVisual.prototype.resize = function() {
    this.width = this.$window.width();
    this.height = this.$window.height();

    // Perform resizing of TrackballControls
    this.controls.handleResize();

    // update camera settings
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    // Update WebGLRenderer settings
    this.renderer.setSize(this.width, this.height);
  }


  /**
   * dat.gui
   * define controller for dat.gui
   */
  sample.MainVisual.prototype.createDatGUIBox = function() {
    var self = this;

    // dat.gui
    var gui = new dat.GUI()

    // add slider GUI
    var controler1 = gui.add(this, 'animationValue1', 0, 1).listen();
    var controler2 = gui.add(this, 'animationValue2', 0, 1).listen();
    var controler3 = gui.add(this, 'animationValue3', 0, 1).listen();
    var controler4 = gui.add(this, 'animationValue4', 0, 1).listen();
    var controler5 = gui.add(this, 'animationValue5', 0, 1).listen();
    var controler6 = gui.add(this, 'animationValue6', 0, 1).listen();
    var controler7 = gui.add(this, 'animationValue7', 0, 1).listen();
    var controler8 = gui.add(this, 'animationValue8', 0, 1).listen();


    // Place a button to animate the value
    // Clicking each will call the animation1, animation2, animation3 methods
    gui.add(this, 'animation1');
    gui.add(this, 'animation2');
    gui.add(this, 'animation3');
    gui.add(this, 'animation4');
    gui.add(this, 'animation5');
    gui.add(this, 'animation6');
    gui.add(this, 'animation7');
    gui.add(this, 'animation8');

    // Change the value of the uniform variable when the value changes
    controler1.onChange(function(value) {
      self.floatingChars.setUniform('animationValue1', value);
    });
    controler2.onChange(function(value) {
      self.floatingChars.setUniform('animationValue2', value);
    });
    controler3.onChange(function(value) {
      self.floatingChars.setUniform('animationValue3', value);
    });
    controler4.onChange(function(value) {
      self.floatingChars.setUniform('animationValue4', value);
    });
    controler5.onChange(function(value) {
      self.floatingChars.setUniform('animationValue5', value);
    });
    controler6.onChange(function(value) {
      self.floatingChars.setUniform('animationValue6', value);
    });
    controler7.onChange(function(value) {
      self.floatingChars.setUniform('animationValue7', value);
    });
    controler8.onChange(function(value) {
      self.floatingChars.setUniform('animationValue8', value);
    });
  }


  /**
   * Change animationValue
   * @param {number} index - 1 | 2 | 3 | 4 (animationValue)
   */
  sample.MainVisual.prototype.animate = function(index) {
    if(this.animateTween) {
      this.animateTween.kill();
    }

    var self = this;

    this.animateTween = TweenMax.to(this, 1, {
      ease: Expo.easeOut,
      animationValue1: (index == 1)? 1: 0,
      animationValue2: (index == 2)? 1: 0,
      animationValue3: (index == 3)? 1: 0,
      animationValue4: (index == 4)? 1: 0,
      animationValue5: (index == 5)? 1: 0,
      animationValue6: (index == 6)? 1: 0,
      animationValue7: (index == 7)? 1: 0,
      animationValue8: (index == 8)? 1: 0,
      onUpdate: function() {
        self.floatingChars.setUniform('animationValue1', self.animationValue1);
        self.floatingChars.setUniform('animationValue2', self.animationValue2);
        self.floatingChars.setUniform('animationValue3', self.animationValue3);
        self.floatingChars.setUniform('animationValue4', self.animationValue4);
        self.floatingChars.setUniform('animationValue5', self.animationValue5);
        self.floatingChars.setUniform('animationValue6', self.animationValue6);
        self.floatingChars.setUniform('animationValue7', self.animationValue7);
        self.floatingChars.setUniform('animationValue8', self.animationValue8);
      }
    });
  }

  sample.MainVisual.prototype.animation1 = function() {
    this.animate(1);
  }
  sample.MainVisual.prototype.animation2 = function() {
    this.animate(2);
  }
  sample.MainVisual.prototype.animation3 = function() {
    this.animate(3);
  }
  sample.MainVisual.prototype.animation4 = function() {
    this.animate(4);
  }
  sample.MainVisual.prototype.animation5 = function() {
    this.animate(5);
  }
  sample.MainVisual.prototype.animation6 = function() {
    this.animate(6);
  }
  sample.MainVisual.prototype.animation7 = function() {
    this.animate(7);
  }
  sample.MainVisual.prototype.animation8 = function() {
    this.animate(8);
  }


})();