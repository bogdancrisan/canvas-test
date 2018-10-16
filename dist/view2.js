'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Manages a canvas using fabric.js
*/
var View = {};

View.init = function (containerId, width, height) {
  this.stage = new Konva.Stage({
    container: containerId,
    width: width,
    height: height
  });

  this.layer = new Konva.Layer();
  this.stage.add(this.layer);
};

View.getCanvasWidth = function () {
  return this.stage.width();
};

View.getCanvasHeight = function () {
  return this.stage.height();
};

View.getCanvasObjects = function () {
  return this.layer.getChildren();
};

View.getCanvas = function () {
  return this.layer.getCanvas();
};

View.isReady = function () {
  return !!this.stage && !!this.layer;
};

View.render = function () {
  this.layer.draw();
};

View.destroy = function () {
  this.stage.destroy();
};

View.isImage = function (el) {
  return this._type(el) === 'Image';
};

View.isText = function (el) {
  return this._type(el) === 'Text';
};

View.isRect = function (el) {
  return this._type(el) === 'Rect';
};

View.isTransformer = function (el) {
  return this._type(el) === 'Transformer';
};

View._type = function (el) {
  return el.getClassName();
};

View.clone = function (el) {
  return el.clone();
};

View.setElemAttr = function (el, attr, value) {
  if (!attr) {
    throw Error('Undefined or null attr parameter.');
  }
  if (value === undefined) {
    throw Error('Undefined value parameter.');
  }
  el.setAttr(attr, value);
};

View.setElemAttrs = function (el, attrs) {
  el.setAttrs(attrs);
};

View.getElemAttr = function (el, attr) {
  return el.getAttr(attr);
};

View.getElemAttrs = function (el) {
  return el.getAttrs();
};

View.setTransformerOnElements = function (els) {
  var _this2 = this;

  els.forEach(function (el) {
    var tr = _this2.Transformer();
    _this2.add(tr);
    _this2._attachTransformer(el, tr);
    _this2._transformerOnClick(el);
    _this2._toggleTransformerVisibility(tr, false);
  });
};

View.setElementsDraggable = function (els) {
  els.forEach(function (el) {
    return el.draggable(true);
  });
};

View._transformerOnClick = function (el) {
  var _this3 = this;

  el.on('mousedown.transformer tap.transformer touchstart.transformer', function () {
    _this3._hideAllTransformers();
    _this3._toggleTransformerVisibility(_this3.getElemAttr(el, 'transformer'), true);
  });
};

View._hideAllTransformers = function () {
  var _this4 = this;

  this.getCanvasObjects().forEach(function (el) {
    var tr = _this4.getElemAttr(el, 'transformer');

    if (!tr) {
      return;
    }

    _this4._toggleTransformerVisibility(tr, false);
  });
};

View.TRANSFORMER_STROKE_COLOR = 'black';
View.TRANSFORMER_STROKE_SIZE = 1;

View.Transformer = function () {
  return new Konva.Transformer({
    anchorSize: 30,
    anchorStroke: View.TRANSFORMER_STROKE_COLOR,
    anchorStrokeWidth: View.TRANSFORMER_STROKE_SIZE,
    borderStroke: View.TRANSFORMER_STROKE_COLOR,
    borderStrokeWidth: View.TRANSFORMER_STROKE_SIZE
  });
};

View._attachTransformer = function (el, transformer) {
  transformer.attachTo(el);
  el.setAttrs({
    transformer: transformer
  });
};

View._toggleTransformerVisibility = function (transformer, flag) {
  if (flag) {
    transformer.show();
  } else {
    transformer.hide();
  }
};

View.detachTransformer = function () {
  if (!this.transformer) {
    return;
  }
  this.transformer.detach();
  this.transformer = null;
};

View.Rect = function (args) {
  var rect = new Konva.Rect(args);

  if (!args) {
    return rect;
  }

  args.left && rect.x(args.left);
  args.top && rect.y(args.top);

  return rect;
};

View.Text = function (title, args) {
  var text = new Konva.Text(_extends({}, args, {
    text: title
  }));

  if (!args) {
    return text;
  }

  args.left && text.x(args.left);
  args.top && text.y(args.top);

  return text;
};

View.Image = function (args) {
  var _this = this;
  return new Promise(function (resolve, reject) {
    var imageObj = new Image();
    imageObj.onload = function () {
      resolve(_this.fromImage(imageObj, args));
    };
    imageObj.src = args.src;
  });
};

View.fromImage = function (image, args) {
  var img = new Konva.Image(_extends({}, args, {
    image: image
  }));

  if (!args) {
    return img;
  }

  args.left && text.x(args.left);
  args.top && text.y(args.top);

  return img;
};

View.add = function (element) {
  this.layer.add(element);
};

/**
 * Can only be used for synchronous elements
 * @param {any[]} arr 
 */
View.addElements = function (arr) {
  var _this5 = this;

  arr.forEach(function (el) {
    return _this5.add(el);
  });
};

View.rotateElement = function (element, degree) {
  element.rotate(degree);
};

/**
 * Used because images are loaded async
 * @param {Promise[]} arr 
 */
View.addImages = function (arr) {
  var _this6 = this;

  return Promise.resolve(Promise.all(arr).then(function (res) {
    return _this6.addElements(res);
  }));
};

View.toJSON = function () {
  return this.stage.toJSON();
};

View.toDataURL = function (args) {
  return this.getCanvas().toDataURL();
};

View.loadFromJSON = function (json, cb) {
  this.canvas.loadFromJSON(json, cb || this.render.bind(this));
};

/**
 * @param {string} str - hex, rgb, rgba or just a color name
 */
View.setBackgroundColor = function (str) {
  this.canvas.setBackgroundColor(str);
};

View.onClick = function (cb) {
  this.stage.on('click', cb);
};

View.onObjectSelect = function (cb) {
  this.canvas.on('before:transform', this.eventCallback(cb));
};

View.onObjectMoved = function (cb) {
  this.canvas.on('object:moved', this.eventCallback(cb));
};

View.onObjectModified = function (cb) {
  this.canvas.on('object:modified', this.eventCallback(cb));
};

View.onAllElementsLoaded = function (cb) {
  this.allElementsLoadedCallback = this.eventCallback(cb);
};

/**
 * Call this after all the elements have been added to the canvas for the first time
 * to dispatch a store event that will save the state of the view.
 */
View.allElementsAdded = function () {
  if (this.allElementsLoadedCallback) {
    this.allElementsLoadedCallback();
  }
};

View.eventCallback = function (cb) {
  if (typeof cb !== 'function') {
    throw new Error('Expected function as callback.');
  }
  return function () {
    return cb(this.toJSON.bind(this));
  };
};

View.SIZE_PROPS = {
  'Text': ['x', 'y', 'fontSize'],
  'Rect': ['width', 'height', 'x', 'y'],
  'Image': ['width', 'height', 'x', 'y']
};

View.convertPixelSizesToPercentages = function (el) {
  var _U;

  var cWidth = this.getCanvasWidth();
  var cHeight = this.getCanvasHeight();
  var elementSizes = (_U = U).select.apply(_U, _toConsumableArray(View.SIZE_PROPS[this._type(el)]))(this.getElemAttrs(el));
  var percentages = {
    pwidth: elementSizes.width && U.toPercent(elementSizes.width, cWidth),
    pheight: elementSizes.height && U.toPercent(elementSizes.height, cHeight),
    py: elementSizes.y && U.toPercent(elementSizes.y, cHeight),
    px: elementSizes.x && U.toPercent(elementSizes.x, cWidth),
    pfontSize: elementSizes.fontSize && U.toPercent(elementSizes.fontSize, cHeight)
  };
  this.setElemAttrs(el, U.filterUndefined(percentages));
};

View.PERCENTAGE_PROPS = {
  'Text': ['px', 'py', 'pfontSize'],
  'Rect': ['pwidth', 'pheight', 'px', 'py'],
  'Image': ['pwidth', 'pheight', 'px', 'py']
};

View.convertPercentSizesToPixels = function (el) {
  var _U2;

  var cWidth = this.getCanvasWidth();
  var cHeight = this.getCanvasHeight();
  var elementPercentages = (_U2 = U).select.apply(_U2, _toConsumableArray(View.PERCENTAGE_PROPS[this._type(el)]))(this.getElemAttrs(el));

  var sizes = {
    width: elementPercentages.pwidth && U.fromPercent(elementPercentages.pwidth, cWidth),
    height: elementPercentages.pheight && U.fromPercent(elementPercentages.pheight, cHeight),
    y: elementPercentages.py && U.fromPercent(elementPercentages.py, cHeight),
    x: elementPercentages.px && U.fromPercent(elementPercentages.px, cWidth),
    fontSize: elementPercentages.pfontSize && U.fromPercent(elementPercentages.pfontSize, cHeight)
  };

  this.setElemAttrs(el, U.filterUndefined(sizes));
};

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