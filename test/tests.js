/*
  run tests with: npm test
*/

console.log("RUNNING JSCANIFY TESTS");
console.log("Warning: This may take a bit");

const { loadImage, createCanvas } = require("canvas");
const { mkdirSync, writeFileSync, unlinkSync, existsSync, readdirSync } = require("fs");
const assert = require("assert");

const jscanify = require("../src/jscanify-node");
const path = require("path");


const OUTPUT_FOLDER = __dirname.replaceAll("\\", "/") + "/output/";

const TEST_IMAGE_DIRECTORY = path.join(
    __dirname,
    "..",
    "docs",
    "images",
    "test"
);

/**
 * delete previously generated output images
 */
function setup() {
    console.log("=== setting up tests ===");
    console.log("Deleting previously generated images");

    if (!existsSync(OUTPUT_FOLDER)) {
        mkdirSync(OUTPUT_FOLDER);
    }

    readdirSync(OUTPUT_FOLDER).forEach((file) => {
        unlinkSync(path.join(OUTPUT_FOLDER, file));
    })
}

let scanner;
let cv;

before(function (done) {
    console.log("=== beginning  tests ===");
    console.log("loading OpenCV.js...");

    scanner = new jscanify();
    scanner.loadOpenCV(function (loadedCv) {
        cv = loadedCv;

        console.log("Finished loading OpenCV.js");
        console.log("Writing test images to: " + OUTPUT_FOLDER);
        setup()
        done();
    });
});

/**
 * tests an individual image
 */
function test(testImage, imageCount) {
    describe("image #" + imageCount, function () {
        it("should highlight paper", function () {
            const highlighted = scanner.highlightPaper(testImage);
            const higlightedOutputPath = OUTPUT_FOLDER + "highlighted-" + imageCount + ".jpg";
            writeFileSync(
                higlightedOutputPath,
                highlighted.toBuffer("image/jpeg")
            );

            assert.ok(existsSync(higlightedOutputPath));
        });

        it("should extract paper", function () {
            const extracted = scanner.extractPaper(testImage, 386, 500);
            const extractedOutputPath = OUTPUT_FOLDER + "extracted-" + imageCount + ".jpg";

            writeFileSync(
                extractedOutputPath,
                extracted.toBuffer("image/jpeg")
            );

            assert.ok(existsSync(extractedOutputPath));
        });

        it("should label corner points", function () {
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

            const cornerPointsOutputPath = OUTPUT_FOLDER + "corner_points-" + imageCount + ".jpg";
            writeFileSync(cornerPointsOutputPath, canvas.toBuffer("image/jpeg"));

            assert.ok(existsSync(cornerPointsOutputPath));
        });
    });
}

let imageCount = 1;

/*
 * go through all images in test image directory
 */
readdirSync(TEST_IMAGE_DIRECTORY).forEach((file) => {
    const TEST_IMAGE_PATH = path.join(TEST_IMAGE_DIRECTORY, file);

    if (!file.endsWith("-sized.png")) { // these images are for the website, not testing
        let tempCount = imageCount++;

        loadImage(TEST_IMAGE_PATH).then(function (image) {
            test(image, tempCount);
        });
    }
})