// import { fabric } from 'fabric';
// import U from '../utils';
/**
 * Manages a canvas using fabric.js
 */
const View = {};

/**
 * Non-default properties to include in fabric.js JSON output
 */
View.propertiesToIncludeInJSON = [
  'hasControls', 'hasRotatingPoint', 'selectable', 'lockMovementX', 'lockMovementY', 'editable', 'dirty'
];

View.init = function (canvasId) {
  if (!canvasId) {
    throw new Error('No canvas id provided.');
  }
  this.canvas = new fabric.Canvas(canvasId);
  this.canvas.renderOnAddRemove = false;
}

View.getCanvasWidth = function () {
  return this.canvas.getWidth();
}

View.getCanvasHeight = function () {
  return this.canvas.getHeight();
}

View.isReady = function () {
  return !!this.canvas;
}

View.render = function() {
  this.canvas.requestRenderAll();
}

View.update = function(json) {
  this.restoreTexts(json);
  this.render();
}

View.restoreTexts = function(json) {
  const isText = canvasObj => canvasObj.type === 'text';
  let texts = json.objects.filter(isText);
  const rest = json.objects.filter(canvasObj => !isText(canvasObj));

  const _this = this;
  texts = texts.map(txt =>_this.Text(txt.text, txt));
  
  this.loadFromJSON({...json, objects: rest});
  this.addElements(texts);
}

View.getUpdateMethod = function () {
  return this.update;
}

View.Rect = function (args) {
  return new fabric.Rect(args);
}

View.Image = function (args) {
  return new Promise(function (resolve, reject) {
    fabric.Image.fromURL(args.url, function (img) {
      args.top && (img.top = args.top);
      args.left && (img.left = args.left);
      resolve(img);
    });
  });
}

View.formatImage = function(img, args) {
  return {
    ...img,
    top: args.top,
    left: args.left,
    scaleX: args.width / img.width,
    scaleY: args.height / img.height,
  }
}

View.Text = function(title, args) {
  return new fabric.IText(title, args);
} 

View.add = function (element) {
  this.canvas.add(element);
}

/**
 * Can only be used for synchronous elements
 * @param {any[]} arr 
 */
View.addElements = function (arr) {
  arr.forEach(el => this.add(el));
}

View.rotateElement = function (element, degree) {
  return { ...element, angle: degree };
}

/**
 * Used because images are loaded async
 * @param {Promise[]} arr 
 */
View.addImages = function (arr) {
  return Promise.resolve(Promise.all(arr).then(res => this.addElements(res)));
}

View.toJSON = function () {
  return this.canvas.toJSON(this.propertiesToIncludeInJSON);
}

View.toDataURL = function(args) {
  return this.canvas.toDataURL(args);
}

View.loadFromJSON = function (json) {
  this.canvas.loadFromJSON(json, this.canvas.renderAll.bind(this.canvas));
}

/**
 * @param {string} str - hex, 'rgb($,$,$)', 'rgba($,$,$,$)' or just a color name
 */
View.setBackgroundColor = function (str) {
  this.canvas.setBackgroundColor(str);
}

/**
 * Disables the ability to scale, rotate, move text
 * @param {fabric.js object} element 
 */
View.disableTextTransform = function(element) {
  return { ...element, hasControls: false, hasRotatingPoint: false, lockMovementX: true, lockMovementY: true};
}

View.addStroke = function (element, stroke) {
  return { ...element, stroke };
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

/**
 * @param {number} amount 
 */
View.zoomIn = function(amount) {
  const center = this.canvas.getCenter(),
  point = {
     x: center.left,
     y: center.top
  };
  this.canvas.zoomToPoint(point, this.canvas.getZoom() * amount ) ;
}

/**
 * @param {number} amount 
 */
View.zoomOut = function(amount) {
  const center = this.canvas.getCenter(),
  point = {
     x: center.left,
     y: center.top
  };
  this.canvas.zoomToPoint(point, this.canvas.getZoom() / amount ) ;
}

View.removeAll = function() {
  this.canvas.forEachObject(el => this.canvas.remove(el))
}

// export default View;
