<p align="center">
    <img src="docs/images/logo-full.png" height="100">
</p>

<p align="center">
Open-source pure Javascript implemented mobile document scanner. Powered with <a href="https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html">opencv.js</a><br/><br/>
Available on <a href="https://www.npmjs.com/package/jscanify">npm</a> or via <a href="https://www.jsdelivr.com/package/gh/ColonelParrot/jscanify">cdn</a>
</p>

**Features**:

- paper detection & highlighting
- paper scanning with distortion correction

| Image Highlighting                                | Scanned Result                                  |
| ------------------------------------------------- | ----------------------------------------------- |
| <img src="docs/images/highlight-paper1.png"> | <img src="docs/images/scanned-paper1.png"> |
| <img src="docs/images/highlight-paper2.png"> | <img src="docs/images/scanned-paper2.png"> |

## Quickstart

### Import

npm:

```js
$ npm i jscanify
import jscanify from 'jscanify'
```

cdn:

```html
<script src="https://docs.opencv.org/4.7.0/opencv.js" async></script>
<!-- warning: loading OpenCV can take some time. Load asynchronously -->
<script src="https://cdn.jsdelivr.net/gh/ColonelParrot/jscanify@master/src/jscanify.min.js"></script>
```

### Highlight Paper in Image

```html
<img src="/path/to/your/image.png" id="image" />
```

```js
const scanner = new jscanify();
image.onload = function () {
  const highlightedCanvas = scanner.highlightPaper(image);
  document.body.appendChild(highlightedCanvas);
};
```

### Extract Paper

```js
const scanner = new jscanify();
const paperWidth = 500;
const paperHeight = 1000;
image.onload = function () {
  scanner.extractPaper(image, paperWidth, paperHeight, (resultCanvas) => {
    document.body.appendChild(resultCanvas);
  });
};
```

### Highlighting Paper in User Camera

The following code continuously reads from the user's camera and highlights the paper:

```html
<video id="video"></video>
<canvas id="canvas"></canvas>  <!-- original video -->
<canvas id="result"></canvas>  <!-- highlighted video -->
```

```js
const scanner = new jscanify();
const canvasCtx = canvas.getContext("2d");
const resultCtx = result.getContext("2d");
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();

    setInterval(() => {
      canvasCtx.drawImage(video, 0, 0);
      const resultCanvas = scanner.highlightPaper(canvas);
      resultCtx.drawImage(resultCanvas, 0, 0);
    }, 10);
  };
});
```

To export the paper to a PDF, see [here](https://stackoverflow.com/questions/23681325/convert-canvas-to-pdf)
### Notes
- for optimal paper detection, the paper should be placed on a flat surface with a solid background color
- we recommend wrapping your code using `jscanify` in a window `load` event listener to ensure OpenCV is loaded