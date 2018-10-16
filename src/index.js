const IMAGES = 1;

const IMAGE_URL = './4kx3k.JPG';

const TEXTS = 5;

const RECTS = 5;

const CANVAS_WIDTH = 800;

const CANVAS_HEIGHT = 600;

const EXPORT_WIDTH = 4000;

const EXPORT_HEIGHT = 3000;

let imagesCache = [];

const genId = () => Math.random().toString().slice(2);

const randomSizeOf = num => Math.floor(Math.random() * num);

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

const randomColor = () => COLORS[randomSizeOf(COLORS.length)];

const randomPercentage = () => randomSizeOf(100);

const PERCENTAGE_PROPS = ['px', 'px', 'pwidth', 'pheight'];

const randomPercentSizes = () => ({
  pwidth: randomPercentage(),
  pheight: randomPercentage(),
  py: randomPercentage(),
  px: randomPercentage(),
  pfontSize: randomPercentage(),
});

const testImage = (view, img) => {
  const percentSizes = {
    px: 0,
    py: 0,
    pheight: 100,
    pwidth: 100
  };
  view.setElemAttrs(img, percentSizes);
  view.convertPercentSizesToPixels(img);
  return img;
}

const viewImage = (view, args) => view.Image(args);

const testText = view => {
  const text = view.Text(genId(), {
    fill: randomColor(),
  });
  view.setElemAttrs(text, U.select('pfontSize', 'px', 'py')(randomPercentSizes()));  
  view.convertPercentSizesToPixels(text);
  return text;
};

const testRect = view => {
  const rect = view.Rect({
    fill: randomColor(),  
  });
  const percentSizes = randomPercentSizes();
  view.setElemAttrs(rect, percentSizes);
  view.convertPercentSizesToPixels(rect);

  return rect;
};

const generateElements = (num, fn) => {
  const elements = Array(num);
  for (let i = 0; i < num; i++) {
    elements[i] = fn();
  }
  return elements;
}

const overwritePropsIfDefined = (o, ...objs) => {
  objs.forEach(obj =>
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        o[key] = obj[key];
      }
    })    
  );
}

const cloneCanvasObj = obj => obj.clone();

const cloneFabricObjAsImg = obj => new Promise((res, rej) => {
  obj.cloneAsImage(clonedObj => res(clonedObj), PERCENTAGE_PROPS);
});

const view = Object.create(View);
window.onload = function() {
  
  view.init('konva-container', CANVAS_WIDTH, CANVAS_HEIGHT);

  // view.canvas.on('mouse:down', e => (console.log('x:', e.pointer.x, 'y:', e.pointer.y), console.log('texts', view.canvas.getObjects().filter(el => el.type === 'i-text'))));
  // view.onClick(e => (console.log(e), console.log(view.getCanvasObjects().filter(o => view.isText(o)))));

  document.querySelector('#save-btn').addEventListener('click', exportAs.bind(null, 'png', EXPORT_WIDTH, EXPORT_HEIGHT, view));

  Promise.all(generateElements(IMAGES, viewImage.bind(null, view, {src: IMAGE_URL, height: CANVAS_HEIGHT, width: CANVAS_WIDTH})))
  .then(images => {
    imagesCache = images.map(img => img.getImage());
    return Promise.all(images.map(img => view.clone(img)));
  })
  .then(clonedImgs => {
    view.addElements(clonedImgs.map(img => testImage(view, img)));
    view.addElements(generateElements(RECTS, testRect.bind(null, view)));
    view.addElements(generateElements(TEXTS, testText.bind(null, view)));
    view.render();

    const canvObjects = view.getCanvasObjects();
    view.setTransformerOnElements(canvObjects);
    view.setElementsDraggable(canvObjects);

    console.log(canvObjects);
    view.render();
  })
}

function download(el, name) {
  var link = document.createElement("a");
  link.download = name;
  el.layer.toCanvas().toBlob((blob) => {
    var url = window.URL.createObjectURL(blob, {type: 'image/png'}, name);
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  });
}

function exportAs(type, width, height, view) {
  const div = document.createElement('div');
  const id = 'save-div';
  div.id = id;
  document.body.appendChild(div);

  const saveView = Object.create(View);
  saveView.init(id, width, height);

  const exportCanvObjects = view.getCanvasObjects().filter(U.neg(view.isTransformer.bind(view)));;

  // clone elements
  Promise.all(exportCanvObjects.map(obj => View.clone(obj)))
  .then(clones => {
    
    // update clone sizes relative to the exported png size
    clones.forEach(el => {
      view.convertPixelSizesToPercentages(el);      
      saveView.convertPercentSizesToPixels(el);
    });

    return clones;
  })
  // create new unscaled images
  .then(clones => {
    return Promise.all(clones.map(obj => (View.isImage(obj) ? saveView.fromImage(findInImageCache(obj.getImage().src, View.getElemAttrs(obj))) : obj)));
  })
  .then(clones => {
    // render elements
    saveView.addElements(clones);
    saveView.render();

    // download png and remove canvas from DOM  
    download(saveView, 'export');
    saveView.destroy();
    document.body.removeChild(div);
  });
}

const findInImageCache = src => imagesCache.find(img => img.src.endsWith(src));
