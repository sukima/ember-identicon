/* Original code licenced under The MIT License was derived from
 * https://github.com/Ajido/node-identicon/raw/refs/heads/master/identicon.js
 *
 * Original Copyright (c) 2007-2012 Don Park <donpark@docuverse.com>
 * Adaptation Copyright (c) 2025 Devin Weaver <suki@tritarget.org>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

type PatchType = ReadonlyArray<number>;
type RGBColor = `rgb(${number},${number},${number})`;

const centerPatchType = [0, 4, 8, 15] as PatchType;
const patchTypes = [
  [0, 4, 24, 20],
  [0, 4, 20],
  [2, 24, 20],
  [0, 2, 20, 22],
  [2, 14, 22, 10],
  [0, 14, 24, 22],
  [2, 24, 22, 13, 11, 22, 20],
  [0, 14, 22],
  [6, 8, 18, 16],
  [4, 20, 10, 12, 2],
  [0, 2, 12, 10],
  [10, 14, 22],
  [20, 12, 24],
  [10, 2, 12],
  [0, 2, 10],
  [0, 4, 24, 20],
] as ReadonlyArray<PatchType>;

function renderIdenticonPatch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  patch: number,
  turn: number,
  invert: boolean,
  foreColor: RGBColor,
  backColor: RGBColor,
): void {
  const { PI, floor } = Math;
  const adjustedX = (vertex: number) => (vertex % 5) * scale - offset;
  const adjustedY = (vertex: number) => floor(vertex / 5) * scale - offset;

  patch %= patchTypes.length;
  turn %= 4;
  if (patch == 15) invert = !invert;

  const patchType = patchTypes[patch];
  const offset = size / 2;
  const scale = size / 4;

  if (!patchType) throw new Error('patchTypes lookup resulted in undefined');
  if (patchType.length === 0)
    throw new Error('patchType must have at least one vertex');

  const vertices = patchType.values();

  ctx.save();

  // paint background
  ctx.fillStyle = invert ? foreColor : backColor;
  ctx.fillRect(x, y, size, size);

  // build patch path
  ctx.translate(x + offset, y + offset);
  ctx.rotate((turn * PI) / 2);
  ctx.beginPath();

  const startVertex = vertices.next().value;
  ctx.moveTo(adjustedX(startVertex), adjustedY(startVertex));
  for (const vertex of vertices)
    ctx.lineTo(adjustedX(vertex), adjustedY(vertex));

  ctx.closePath();

  // offset and rotate coordinate space by patch position (x, y) and
  // 'turn' before rendering patch shape
  // render rotated patch using fore color (back color if inverted)
  ctx.fillStyle = invert ? backColor : foreColor;
  ctx.fill();

  // restore rotation
  ctx.restore();
}

function renderIdenticon(
  ctx: CanvasRenderingContext2D,
  code: number,
  size: number,
): void {
  const patchSize = size / 3;
  const middleType = centerPatchType[code & 3];
  const middleInvert = ((code >> 2) & 1) != 0;

  const cornerType = (code >> 3) & 15;
  const cornerInvert = ((code >> 7) & 1) != 0;
  let cornerTurn = (code >> 8) & 3;

  const sideType = (code >> 10) & 15;
  const sideInvert = ((code >> 14) & 1) != 0;
  let sideTurn = (code >> 15) & 3;

  const blue = (code >> 16) & 31;
  const green = (code >> 21) & 31;
  const red = (code >> 27) & 31;
  const foreColor =
    `rgb(${red << 3},${green << 3},${blue << 3})` satisfies RGBColor;
  const backColor = 'rgb(255,255,255)' satisfies RGBColor;

  if (!middleType)
    throw new Error('centerPatchType lookup resulted in undefined');

  // middle patch
  renderIdenticonPatch(
    ctx,
    patchSize,
    patchSize,
    patchSize,
    middleType,
    0,
    middleInvert,
    foreColor,
    backColor,
  );

  // side patchs, starting from top and moving clock-wise
  renderIdenticonPatch(
    ctx,
    patchSize,
    0,
    patchSize,
    sideType,
    sideTurn++,
    sideInvert,
    foreColor,
    backColor,
  );
  renderIdenticonPatch(
    ctx,
    patchSize * 2,
    patchSize,
    patchSize,
    sideType,
    sideTurn++,
    sideInvert,
    foreColor,
    backColor,
  );
  renderIdenticonPatch(
    ctx,
    patchSize,
    patchSize * 2,
    patchSize,
    sideType,
    sideTurn++,
    sideInvert,
    foreColor,
    backColor,
  );
  renderIdenticonPatch(
    ctx,
    0,
    patchSize,
    patchSize,
    sideType,
    sideTurn++,
    sideInvert,
    foreColor,
    backColor,
  );

  // corner patchs, starting from top left and moving clock-wise
  renderIdenticonPatch(
    ctx,
    0,
    0,
    patchSize,
    cornerType,
    cornerTurn++,
    cornerInvert,
    foreColor,
    backColor,
  );
  renderIdenticonPatch(
    ctx,
    patchSize * 2,
    0,
    patchSize,
    cornerType,
    cornerTurn++,
    cornerInvert,
    foreColor,
    backColor,
  );
  renderIdenticonPatch(
    ctx,
    patchSize * 2,
    patchSize * 2,
    patchSize,
    cornerType,
    cornerTurn++,
    cornerInvert,
    foreColor,
    backColor,
  );
  renderIdenticonPatch(
    ctx,
    0,
    patchSize * 2,
    patchSize,
    cornerType,
    cornerTurn++,
    cornerInvert,
    foreColor,
    backColor,
  );
}

async function blobOf(
  canvas: HTMLCanvasElement,
  type?: string,
  quality?: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality),
  );
  if (blob) return blob;
  throw new Error('unable to generate blob from canvas');
}

function createCanvas(size: number, doc = document): HTMLCanvasElement {
  const canvas = doc.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

export async function identicon(
  indetifier: string,
  size: number,
): Promise<Blob> {
  const digestData = new TextEncoder().encode(indetifier);
  const hashBuf = await crypto.subtle.digest('SHA-1', digestData);
  const hash = new Uint8Array(hashBuf);
  const code =
    (Number(hash[0]) << 24) |
    (Number(hash[1]) << 16) |
    (Number(hash[2]) << 8) |
    Number(hash[3]);

  const canvas = createCanvas(size);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Unable to get canvas 2D context');
  renderIdenticon(ctx, code, size);
  return await blobOf(canvas, 'image/png');
}
