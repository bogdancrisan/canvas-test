'use strict';

var IMAGES = 1;

var IMAGE_URL = './4kx3k.JPG';

var TEXTS = 5;

var RECTS = 5;

var CANVAS_WIDTH = 800;

var CANVAS_HEIGHT = 600;

var EXPORT_WIDTH = 4000;

var EXPORT_HEIGHT = 3000;

var imagesCache = [];

var genId = function genId() {
  return Math.random().toString().slice(2);
};

var randomSizeOf = function randomSizeOf(num) {
  return Math.floor(Math.random() * num);
};

var COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

var randomColor = function randomColor() {
  return COLORS[randomSizeOf(COLORS.length)];
};

var randomPercentage = function randomPercentage() {
  return randomSizeOf(100);
};

var PERCENTAGE_PROPS = ['px', 'px', 'pwidth', 'pheight'];

var randomPercentSizes = function randomPercentSizes() {
  return {
    pwidth: randomPercentage(),
    pheight: randomPercentage(),
    py: randomPercentage(),
    px: randomPercentage(),
    pfontSize: randomPercentage()
  };
};

var testImage = function testImage(view, img) {
  var percentSizes = {
    px: 0,
    py: 0,
    pheight: 100,
    pwidth: 100
  };
  view.setElemAttrs(img, percentSizes);
  view.convertPercentSizesToPixels(img);
  return img;
};

var viewImage = function viewImage(view, args) {
  return view.Image(args);
};

var testText = function testText(view) {
  var text = view.Text(genId(), {
    fill: randomColor()
  });
  view.setElemAttrs(text, U.select('pfontSize', 'px', 'py')(randomPercentSizes()));
  view.convertPercentSizesToPixels(text);
  return text;
};

var testRect = function testRect(view) {
  var rect = view.Rect({
    fill: randomColor()
  });
  var percentSizes = randomPercentSizes();
  view.setElemAttrs(rect, percentSizes);
  view.convertPercentSizesToPixels(rect);

  return rect;
};

var generateElements = function generateElements(num, fn) {
  var elements = Array(num);
  for (var i = 0; i < num; i++) {
    elements[i] = fn();
  }
  return elements;
};

var overwritePropsIfDefined = function overwritePropsIfDefined(o) {
  for (var _len = arguments.length, objs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    objs[_key - 1] = arguments[_key];
  }

  objs.forEach(function (obj) {
    return Object.keys(obj).forEach(function (key) {
      if (obj[key] !== undefined) {
        o[key] = obj[key];
      }
    });
  });
};

var cloneCanvasObj = function cloneCanvasObj(obj) {
  return obj.clone();
};

var cloneFabricObjAsImg = function cloneFabricObjAsImg(obj) {
  return new Promise(function (res, rej) {
    obj.cloneAsImage(function (clonedObj) {
      return res(clonedObj);
    }, PERCENTAGE_PROPS);
  });
};

var view = Object.create(View);
window.onload = function () {

  view.init('konva-container', CANVAS_WIDTH, CANVAS_HEIGHT);

  // view.canvas.on('mouse:down', e => (console.log('x:', e.pointer.x, 'y:', e.pointer.y), console.log('texts', view.canvas.getObjects().filter(el => el.type === 'i-text'))));
  // view.onClick(e => (console.log(e), console.log(view.getCanvasObjects().filter(o => view.isText(o)))));

  document.querySelector('#save-btn').onclick = exportAs.bind(null, 'png', EXPORT_WIDTH, EXPORT_HEIGHT, view);

  Promise.all(generateElements(IMAGES, viewImage.bind(null, view, { src: IMAGE_URL, height: CANVAS_HEIGHT, width: CANVAS_WIDTH }))).then(function (images) {
    imagesCache = images.map(function (img) {
      return img.getImage();
    });
    return Promise.all(images.map(function (img) {
      return view.clone(img);
    }));
  }).then(function (clonedImgs) {
    view.addElements(clonedImgs.map(function (img) {
      return testImage(view, img);
    }));
    view.addElements(generateElements(RECTS, testRect.bind(null, view)));
    view.addElements(generateElements(TEXTS, testText.bind(null, view)));
    view.render();

    var canvObjects = view.getCanvasObjects();
    view.setTransformerOnElements(canvObjects);
    view.setElementsDraggable(canvObjects);

    console.log(canvObjects);
    view.render();
  });
};

function download(el, name) {

  var link = document.createElement("a");
  link.download = name;
  // window.open(el.layer.toDataURL());
  el.layer.toCanvas().toBlob(function (blob) {
    var url = window.URL.createObjectURL(blob, { type: 'image/png' }, name);
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
}

function exportAs(type, width, height, view) {
  var div = document.createElement('div');
  var id = 'save-div';
  div.id = id;
  document.body.appendChild(div);

  var saveView = Object.create(View);
  saveView.init(id, width, height);

  var exportCanvObjects = view.getCanvasObjects().filter(U.neg(view.isTransformer.bind(view)));;

  // clone elements
  Promise.all(exportCanvObjects.map(function (obj) {
    return View.clone(obj);
  })).then(function (clones) {

    // update clone sizes relative to the exported png size
    clones.forEach(function (el) {
      view.convertPixelSizesToPercentages(el);
      saveView.convertPercentSizesToPixels(el);
    });

    return clones;
  })
  // create new unscaled images
  .then(function (clones) {
    return Promise.all(clones.map(function (obj) {
      return View.isImage(obj) ? saveView.fromImage(findInImageCache(obj.getImage().src, View.getElemAttrs(obj))) : obj;
    }));
  }).then(function (clones) {
    // render elements
    saveView.addElements(clones);
    saveView.render();

    // download png and remove canvas from DOM  
    download(saveView, 'export');
    saveView.destroy();
    document.body.removeChild(div);
  });
}

var findInImageCache = function findInImageCache(src) {
  return imagesCache.find(function (img) {
    return img.src.endsWith(src);
  });
};