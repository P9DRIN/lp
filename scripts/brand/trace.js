/**
 * Stage 2: trace one black-on-white mask into SVG path data.
 *
 * The masks are strictly two-tone, so the tracer runs with a fixed 2-colour
 * palette instead of quantising. That matters: colour-sampled tracing of the
 * mark's smooth gradient produced ~1300 slivered paths, while shape tracing
 * against a fixed palette produces one.
 */
const fs = require('fs');
const { PNG } = require('pngjs');
const ImageTracer = require('imagetracerjs');

const [, , input, output, pathomit = '200', res = '1.6'] = process.argv;

const png = PNG.sync.read(fs.readFileSync(input));
const svg = ImageTracer.imagedataToSVG(
  { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) },
  {
    ltres: Number(res),
    qtres: Number(res),
    pathomit: Number(pathomit),
    rightangleenhance: false,
    colorsampling: 0,
    palette: [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
    ],
    strokewidth: 0,
    linefilter: true,
    blurradius: 0,
    roundcoords: 1,
    viewbox: true,
    desc: false,
  }
);

const paths = [...svg.matchAll(/<path fill="rgb\((\d+),(\d+),(\d+)\)"[^>]*?d="([^"]+)"/g)]
  .filter((m) => Number(m[1]) < 128) // keep the black shape, drop the white ground
  .map((m) => m[4]);

fs.writeFileSync(output, JSON.stringify(paths));
console.log(`  ${input.split('/').pop()} -> ${paths.length} path(s)`);
