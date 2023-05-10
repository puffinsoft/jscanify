/*
  run tests with: npm test
*/

console.log("RUNNING JSCANIFY TESTS");
console.log("Warning: This may take a bit");

const { loadImage, createCanvas } = require("canvas");
const { mkdirSync, writeFileSync, unlinkSync, existsSync } = require("fs");
const assert = require("assert");

const jscanify = require("../src/jscanify-node");
const path = require("path");

const outputPaths = {
  highlight: __dirname + "/output/highlighted.jpg",
  extracted: __dirname + "/output/extracted.jpg",
  cornerPoints: __dirname + "/output/corner_points.jpg",
};

const baseFolder = __dirname.replaceAll("\\", "/") + "/output/";

const TEST_IMAGE_PATH = path.join(
  __dirname,
  "..",
  "docs",
  "images",
  "test",
  "test.png"
);

function setup() {
  console.log("=== setting up tests ===");
  console.log("Deleting previously generated images");
  Object.values(outputPaths).forEach((path) => {
    if (existsSync(path)) {
      unlinkSync(path);
    }
  });

  if (!existsSync(baseFolder)) {
    mkdirSync(baseFolder);
  }
}

function test() {
  const scanner = new jscanify();

  console.log("=== beginning  tests ===");
  console.log("loading OpenCV.js...");
  scanner.loadOpenCV(function (cv) {
    console.log("Finished loading OpenCV.js");
    console.log("Writing test images to: " + baseFolder);
    describe("feature tests", function () {
      it("should highlight paper", function (done) {
        const highlighted = scanner.highlightPaper(testImage);
        writeFileSync(
          outputPaths.highlight,
          highlighted.toBuffer("image/jpeg")
        );

        assert.ok(existsSync(outputPaths.highlight));
        done();
      });

      it("should extract paper", function (done) {
        const extracted = scanner.extractPaper(testImage, 386, 500);
        writeFileSync(
          outputPaths.extracted,
          extracted.toBuffer("image/jpeg")
        );

        assert.ok(existsSync(outputPaths.extracted));
        done();
      });

      it("should label corner points", function (done) {
        const parsedImage = cv.imread(testImage);
        const paperContour = scanner.findPaperContour(parsedImage);
        const {
          topLeftCorner,
          topRightCorner,
          bottomLeftCorner,
          bottomRightCorner,
        } = scanner.getCornerPoints(paperContour, testImage);

        const canvas = createCanvas();

        cv.imshow(canvas, parsedImage);
        const ctx = canvas.getContext("2d");
        const points = [
          { p: topLeftCorner, text: "top left corner" },
          { p: topRightCorner, text: "top right corner" },
          { p: bottomLeftCorner, text: "bottom left corner" },
          { p: bottomRightCorner, text: "bottom right corner" },
        ];
        ctx.fillStyle = "cyan";
        ctx.font = "25px serif";
        points.forEach(({ p: point, text }) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 15, 0, 2 * Math.PI, false);
          ctx.fillText(text, point.x + 30, point.y)
          ctx.fill();
        });

        writeFileSync(outputPaths.cornerPoints, canvas.toBuffer("image/jpeg"));

        assert.ok(existsSync(outputPaths.cornerPoints));
        done();
      });
    });
  });
}

let testImage;
loadImage(TEST_IMAGE_PATH).then(function (image) {
  testImage = image;
  setup();
  test();
});
