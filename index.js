const IMAGES = 1;

const IMAGE_URL = './4kx3k.JPG';

const TEXTS = 5;

const RECTS = 5;

const EXPORT_WIDTH = 4000;

const EXPORT_HEIGHT = 3000;

let imagesCache = [];

const genId = () => Math.random().toString().slice(2);

const randomSizeOf = num => Math.floor(Math.random() * num);

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

const randomColor = () => COLORS[randomSizeOf(COLORS.length)];

const fromPercent = (percent, num) => Math.floor((percent / 100) * num);

const toPercent = (val1, val2) => Math.floor((val1 / val2) * 100);

const randomPercentage = () => randomSizeOf(100);

const PERCENTAGE_PROPS = ['ptop', 'pleft', 'pwidth', 'pheight'];

const randomPercentSizes = () => ({
  pwidth: randomPercentage(),
  pheight: randomPercentage(),
  ptop: randomPercentage(),
  pleft: randomPercentage(),
  pfontSize: randomPercentage(),
});

const convertPercentSizesToPixels = (sizes, view) => ({
  width: (sizes.pwidth && fromPercent(sizes.pwidth, view.getCanvasWidth())),
  height: (sizes.pheight && fromPercent(sizes.pheight, view.getCanvasHeight())),
  top: (sizes.ptop && fromPercent(sizes.ptop, view.getCanvasHeight())),
  left: (sizes.pleft && fromPercent(sizes.pleft, view.getCanvasWidth())),
  fontSize: (sizes.pfontSize && fromPercent(sizes.pfontSize, view.getCanvasHeight())),
});

const convertPixelSizesToPercentages = (sizes, view) => ({
  pwidth: (sizes.width && toPercent(sizes.width, view.getCanvasWidth())),
  pheight: (sizes.height && toPercent(sizes.height, view.getCanvasHeight())),
  ptop: (sizes.top && toPercent(sizes.top, view.getCanvasHeight())),
  pleft: (sizes.left && toPercent(sizes.left, view.getCanvasWidth())),
  pfontSize: (sizes.fontSize && toPercent(sizes.fontSize, view.getCanvasHeight())),
});

const testImage = (view, img) => {
  const percentSizes = {
    ptop: 0,
    pleft: 0,
    pheight: 100,
    pwidth: 100
  };
  const sizes = convertPercentSizesToPixels(percentSizes, view);
  overWritePropsIfDefined(img, percentSizes);
  view.formatImage(img, sizes);
  return img;
}

const viewImage = (view, args) => view.Image(args);

const testText = view => {
  const percentSizes = randomPercentSizes();
  const sizes = convertPercentSizesToPixels(percentSizes, view);
  return view.Text(genId(), {
    fill: randomColor(),
    ...percentSizes,
    ...sizes
  });
};

const testRect = view => {
  const percentSizes = randomPercentSizes();
  const sizes = convertPercentSizesToPixels(percentSizes, view);
  return view.Rect({
    fill: randomColor(),
    ...percentSizes,
    ...sizes
  });
};

const generateElements = (num, fn) => {
  const elements = Array(num);
  for (let i = 0; i < num; i++) {
    elements[i] = fn();
  }
  return elements;
}

const overWritePropsIfDefined = (o, ...objs) => {
  objs.forEach(obj =>
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        o[key] = obj[key];
      }
    })    
  );
}

const cloneFabricObj = obj => new Promise((res, rej) => {
  obj.clone(clonedObj => res(clonedObj), PERCENTAGE_PROPS);
});

window.onload = function() {
  const view = Object.create(View);
  
  view.init('main-canvas');

  document.querySelector('#save-btn').onclick = exportAs.bind(null, 'png', EXPORT_WIDTH, EXPORT_HEIGHT, view);

  Promise.all(generateElements(IMAGES, viewImage.bind(null, view, {url: IMAGE_URL})))
  .then(images => {
    imagesCache = [...imagesCache, ...images];
    return Promise.all(images.map(img => cloneFabricObj(img)));
  })
  .then(clonedImgs => {
    view.setBackgroundColor('grey');
    view.addElements(clonedImgs.map(img => testImage(view, img)));
    view.addElements(generateElements(RECTS, testRect.bind(null, view)));
    view.addElements(generateElements(TEXTS, testText.bind(null, view)));
    view.render();
  })
}

function download(src, name) {
  const a = document.createElement('a');
  
  a.href = src;
  a.textContent = name;
  a.download = name;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportAs(type, width, height, view) {
  const canvas = document.createElement('canvas');
  const canvasId = 'save-canvas';
  canvas.id = canvasId;
  document.body.appendChild(canvas);

  const saveView = Object.create(View);
  saveView.init(canvasId);  
  setCanvasDimensions(saveView, width, height);

  const canvObjects = view.canvas.getObjects();

  let oldImages = null;

  Promise.all(canvObjects.map(obj => cloneFabricObj(obj)))
  .then(clones => {
    oldImages = clones.filter(o => o.type === 'image');
    return Promise.all(clones.map(obj => (obj.type === 'image' ? cloneFabricObj(findInImageCache(obj.src)) : obj)));
  })
  .then(clones => {
    clones.forEach(el => {
      let currPercentages;
      if (el.type === 'image') {
        currPercentages = select(PERCENTAGE_PROPS)(oldImages.find(img => img.src === el.src));
      }
      else {
        currPercentages = convertPixelSizesToPercentages(el, view);
      }
      overWritePropsIfDefined(el, convertPercentSizesToPixels(currPercentages, saveView));
    });

    return clones;
  })
  .then(clones => {
    saveView.addElements(clones);
    saveView.render();
    download(saveView.toDataURL({ format: type }), 'export');
    saveView.canvas.dispose();
    document.body.removeChild(canvas);
  })
}

function setCanvasDimensions(view, width, height) {
  view.canvas.setDimensions({width, height});
}

function findInImageCache(src) {
  return imagesCache.find(img => img._originalElement.src === src);
}

const select = (...props) => obj => props.reduce((acc, prop) => ({ ...acc, [prop]: obj[prop]}), {});
