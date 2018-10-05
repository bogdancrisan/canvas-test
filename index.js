

const genId = () => Math.random().toString().slice(2);

const randomSizeOf = num => Math.floor(Math.random() * num);

const COLORS = ['white', 'black', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];

const randomColor = () => COLORS[randomSizeOf(COLORS.length)];

const randomOfWidth = view => randomSizeOf(view.getCanvasWidth());

const randomOfHeight = view => randomSizeOf(view.getCanvasHeight());

const testImage = (view, args) => view.Image({...args, url: 'hero@2x.jpg', top: randomOfHeight(view), left: randomOfWidth(view)});

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

function createLink(src, name) {
  const a = document.createElement('a');
  
  a.href = src;
  a.textContent = name;
  a.download = name;
  
  document.body.appendChild(a);
}


window.onload = function() {
  const view = Object.create(View);

  const canvas = document.querySelector('#canvas');

  canvas.setAttribute('width', 12000);
  canvas.setAttribute('height', 12000);

  view.init('canvas');

  Promise.all(generateElements(4, testImage.bind(null, view)))
  .then((images) => {
    view.addElements(generateElements(100, testRect.bind(null, view)));
    view.addElements(generateElements(100, testText.bind(null, view)));
    view.addElements(images);
    view.render();
    console.log(view.toJSON());
  })
  
}
