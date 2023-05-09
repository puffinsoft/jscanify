/*
  run tests with: npm test
*/

console.log("RUNNING JSCANIFY TESTS");
console.log("Warning: This may take a bit");

const { loadImage } = require("canvas");
const { mkdirSync, writeFileSync, unlinkSync, existsSync } = require("fs");
const assert = require("assert");

const jscanify = require("../src/jscanify-node");
const path = require("path");

const outputPaths = {
  highlight: __dirname + "/output/highlighted.jpg",
  extracted: __dirname + "/output/extracted.jpg",
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
    describe("feature tests", function (done) {
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
        scanner.extractPaper(testImage, 386, 500, function (extracted) {
          writeFileSync(
            outputPaths.extracted,
            extracted.toBuffer("image/jpeg")
          );

          assert.ok(existsSync(outputPaths.extracted));
          done();
        });
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
