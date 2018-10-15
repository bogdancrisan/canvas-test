/**
 * Manages a canvas using fabric.js
*/
const View = {};


View.init = function(containerId, width, height) {
  this.stage = new Konva.Stage({
    container: containerId,
    width,
    height
  });

  this.layer = new Konva.Layer();
  this.stage.add(this.layer);
}

View.getCanvasWidth = function() {
  return this.stage.width();
}

View.getCanvasHeight = function() {
  return this.stage.height();
}

View.getCanvasObjects = function() {
  return this.layer.getChildren();
}

View.getCanvas = function() {
  return this.layer.getCanvas();
}

View.isReady = function() {
  return !!this.stage && !!this.layer;
}

View.render = function() {
  this.layer.draw();
}

View.destroy = function() {
  this.stage.destroy();
}

View.isImage = function(el) {
  return el.getClassName() === 'Image';
}

View.isText = function(el) {
  return el.getClassName() === 'Text';
}

View.isRect = function(el) {
  return el.getClassName() === 'Rect';
}

View.type = function(el) {
  return el.getClassName();
}

View.clone = function(el) {
  return el.clone();
}

View.setElemAttr = function(el, attr, value) {
  if (!attr) {
    throw Error('Undefined or null attr parameter.');
  }
  if (value === undefined) {
    throw Error('Undefined value parameter.');
  }
  el.setAttr(attr, value);
}

View.setElemAttrs = function(el, attrs) {
  el.setAttrs(attrs);
}

View.getElemAttr = function(el, attr) {
  return el.getAttr(attr);
}

View.getElemAttrs = function(el) {
  return el.getAttrs();
}

View.Rect = function (args) {
  const rect = new Konva.Rect(args);  

  args.left && rect.x(args.left);
  args.top && rect.y(args.top);

  rect.draggable(true);

  return rect;
}

View.Text = function(title, args) {
  const text = new Konva.Text({
    ...args,
    text: title,
  });

  args.left && text.x(args.left);
  args.top && text.y(args.top);

  text.draggable(true);

  return text;
} 

View.Image = function (args) {
  const _this = this;
  return new Promise(function(resolve, reject) {
    const imageObj = new Image();
    imageObj.onload = function() {
      const image = _this.fromImage(args, imageObj);
      image.draggable(true);
      resolve(image);
    }
    imageObj.src = args.src;
  });
}

View.fromImage = function(args, image) {
  return new Konva.Image({
    ...args,
    x: args.left,
    y: args.top,
    image
  });
}

View.add = function(element) {
  this.layer.add(element);
}

/**
 * Can only be used for synchronous elements
 * @param {any[]} arr 
 */
View.addElements = function (arr) {
  arr.forEach(el => this.add(el));
}

View.rotateElement = function (element, degree) {
  element.rotate(degree);
}

/**
 * Used because images are loaded async
 * @param {Promise[]} arr 
 */
View.addImages = function (arr) {
  return Promise.resolve(Promise.all(arr).then(res => this.addElements(res)));
}

View.toJSON = function () {
  return this.stage.toJSON();
}

View.toDataURL = function(args) {
  return this.getCanvas().toDataURL();
}

View.loadFromJSON = function (json, cb) {
  this.canvas.loadFromJSON(json, (cb || this.render.bind(this)));
}

/**
 * @param {string} str - hex, rgb, rgba or just a color name
 */
View.setBackgroundColor = function (str) {
  this.canvas.setBackgroundColor(str);
}

View.onClick = function (cb) {
  this.stage.on('click', cb);
}

View.onObjectSelect = function (cb) {
  this.canvas.on('before:transform', this.eventCallback(cb));
}

View.onObjectMoved = function (cb) {
  this.canvas.on('object:moved', this.eventCallback(cb));
}

View.onObjectModified = function (cb) {
  this.canvas.on('object:modified', this.eventCallback(cb));
}

View.onAllElementsLoaded = function (cb) {
  this.allElementsLoadedCallback = this.eventCallback(cb);
}

/**
 * Call this after all the elements have been added to the canvas for the first time
 * to dispatch a store event that will save the state of the view.
 */
View.allElementsAdded = function () {
  if (this.allElementsLoadedCallback) {
    this.allElementsLoadedCallback();
  }
}

View.eventCallback = function (cb) {
  if (typeof cb !== 'function') {
    throw new Error('Expected function as callback.');
  }
  const _this = this;
  return function () {
    return cb(_this.toJSON());
  }
}

View.SIZE_PROPS = {
  'Text': ['x', 'y', 'fontSize'],
  'Rect': ['width', 'height', 'x', 'y'],
  'Image': ['width', 'height', 'x', 'y'],
};

View.convertPixelSizesToPercentages = function(el) {
  const cWidth = this.getCanvasWidth();
  const cHeight = this.getCanvasHeight();
  const elementSizes = U.select(...View.SIZE_PROPS[this.type(el)])(this.getElemAttrs(el));
  const percentages =  {
    pwidth: (elementSizes.width && U.toPercent(elementSizes.width, cWidth)),
    pheight: (elementSizes.height && U.toPercent(elementSizes.height, cHeight)),
    py: (elementSizes.y && U.toPercent(elementSizes.y, cHeight)),
    px: (elementSizes.x && U.toPercent(elementSizes.x, cWidth)),
    pfontSize: (elementSizes.fontSize && U.toPercent(elementSizes.fontSize, cHeight)),
  };
  this.setElemAttrs(el, U.filterUndefined(percentages));
}

View.PERCENTAGE_PROPS = {
  'Text': ['px', 'py', 'pfontSize'],
  'Rect': ['pwidth', 'pheight', 'px', 'py'],
  'Image': ['pwidth', 'pheight', 'px', 'py'],
};

View.convertPercentSizesToPixels = function(el) {
  const cWidth = this.getCanvasWidth();
  const cHeight = this.getCanvasHeight();
  const elementPercentages = U.select(...View.PERCENTAGE_PROPS[this.type(el)])(this.getElemAttrs(el));

  const sizes = {
    width: (elementPercentages.pwidth && U.fromPercent(elementPercentages.pwidth, cWidth)),
    height: (elementPercentages.pheight && U.fromPercent(elementPercentages.pheight, cHeight)),
    y: (elementPercentages.py && U.fromPercent(elementPercentages.py, cHeight)),
    x: (elementPercentages.px && U.fromPercent(elementPercentages.px, cWidth)),
    fontSize: (elementPercentages.pfontSize && U.fromPercent(elementPercentages.pfontSize, cHeight)),
  };

  this.setElemAttrs(el, U.filterUndefined(sizes));
}


/**
 * Canvas Coordinate System
 * - - - - - - - - > X
 * |
 * |
 * |
 * |
 * |
 * \/ Y
 */
