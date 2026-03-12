#!/usr/bin/env node

const sharp = require("sharp");

const args = process.argv.slice(2);

if (args.length < 2) {
    console.error("Usage: node resize-crop.js <input.png> <output.png>");
    process.exit(1);
}

const input = args[0];
const output = args[1];

// App Store output dimensions
const WIDTH = 1242;
const HEIGHT = 2688;

sharp(input)
    .resize(WIDTH, HEIGHT, {
        fit: "cover",
        position: "centre"
    })
    .toFile(output)
    .then(() => {
        console.log(`Image resized and cropped to ${WIDTH}x${HEIGHT}: ${output}`);
    })
    .catch(err => {
        console.error("Error processing image:", err);
        process.exit(1);
    });
