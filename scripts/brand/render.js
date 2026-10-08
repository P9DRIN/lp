/** Stage 4: rasterise an SVG at a given pixel width. */
const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

const [, , svgPath, out, width] = process.argv;
const r = new Resvg(fs.readFileSync(svgPath, 'utf8'), {
  fitTo: { mode: 'width', value: Number(width) },
});
fs.writeFileSync(out, r.render().asPng());
