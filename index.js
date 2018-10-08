const IMAGES = 1;

const IMAGE_URL = '4kx3k.jpg';

const TEXTS = 5;

const RECTS = 5;

const CANVAS_WIDTH = 4000;

const CANVAS_HEIGHT = 3000;


const genId = () => Math.random().toString().slice(2);

const randomSizeOf = num => Math.floor(Math.random() * num);

const COLORS = ['white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

const randomColor = () => COLORS[randomSizeOf(COLORS.length)];

const randomOfWidth = view => randomSizeOf(view.getCanvasWidth());

const randomOfHeight = view => randomSizeOf(view.getCanvasHeight());

const testImage = (view, args) => view.Image({...args, url: IMAGE_URL});//, top: randomOfHeight(view), left: randomOfWidth(view)});

const testText = view => view.Text(genId(), {fill: randomColor(), top: randomOfHeight(view), left: randomOfWidth(view)});

const testRect = view => view.Rect({
  fill: randomColor(),
  top: randomOfHeight(view),
  left: randomOfWidth(view),
  height: randomOfHeight(view),
  width: randomOfWidth(view),
});

const generateElements = (num, fn) => {
  const texts = Array(num);
  for (let i = 0; i < num; i++) {
    texts[i] = fn();
  }
  return texts;
}



window.onload = function() {
  const view = Object.create(View);

  const canvas = document.querySelector('#canvas');

  canvas.setAttribute('width', CANVAS_WIDTH);
  canvas.setAttribute('height', CANVAS_HEIGHT);

  view.init('canvas');

  Promise.all(generateElements(IMAGES, testImage.bind(null, view)))
  .then(images => {
    view.addElements(images);
    view.addElements(generateElements(RECTS, testRect.bind(null, view)));
    view.addElements(generateElements(TEXTS, testText.bind(null, view)));
    view.render();
    console.log(view.toJSON());
  })
}
