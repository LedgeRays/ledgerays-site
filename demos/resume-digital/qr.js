/* Small QR encoder (byte mode, level L, versions 2 to 5). Made for this demo page. */
(function (g) {
  var EXP = [], LOG = [], x = 1, i;
  for (i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  function mul(a, b) { return a && b ? EXP[LOG[a] + LOG[b]] : 0; }
  function rem(data, n) {
    var gen = [1], k, j;
    for (k = 0; k < n; k++) {
      var ng = new Array(gen.length + 1).fill(0);
      for (j = 0; j < gen.length; j++) { ng[j] ^= gen[j]; ng[j + 1] ^= mul(gen[j], EXP[k]); }
      gen = ng;
    }
    var r = data.concat(new Array(n).fill(0));
    for (k = 0; k < data.length; k++) {
      var c = r[k];
      if (c) for (j = 0; j < gen.length; j++) r[k + j] ^= mul(gen[j], c);
    }
    return r.slice(data.length);
  }
  // version: [data codewords, ec codewords, alignment position]
  var VER = { 2: [34, 10, 18], 3: [55, 15, 22], 4: [80, 20, 26], 5: [108, 26, 30] };
  function make(text) {
    var bytes = Array.from(new TextEncoder().encode(text)), v, V;
    for (v = 2; v <= 5; v++) if (bytes.length + 2 <= VER[v][0]) { V = v; break; }
    if (!V) throw new Error('Text too long for QR');
    var D = VER[V][0], E = VER[V][1], A = VER[V][2], size = 17 + 4 * V, bits = [];
    function put(val, n) { for (var q = n - 1; q >= 0; q--) bits.push((val >> q) & 1); }
    put(4, 4); put(bytes.length, 8); bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, D * 8 - bits.length));
    while (bits.length % 8) bits.push(0);
    var data = [];
    for (i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
    for (i = 0; data.length < D; i++) data.push(i % 2 ? 0x11 : 0xEC);
    var all = data.concat(rem(data, E));
    var M = [], F = [], y, xx;
    for (y = 0; y < size; y++) { M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    function set(cx, cy, val) { M[cy][cx] = val; F[cy][cx] = true; }
    for (i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var px = cx + dx, py = cy + dy;
        if (px >= 0 && px < size && py >= 0 && py < size) { var d = Math.max(Math.abs(dx), Math.abs(dy)); set(px, py, d !== 2 && d !== 4); }
      }
    }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    for (var ay = -2; ay <= 2; ay++) for (var ax = -2; ax <= 2; ax++) set(A + ax, A + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
    var fd = (1 << 3) | 0, r = fd;
    for (i = 0; i < 10; i++) r = (r << 1) ^ ((r >> 9) * 0x537);
    var fb = ((fd << 10) | r) ^ 0x5412;
    function gb(n) { return ((fb >> n) & 1) === 1; }
    for (i = 0; i < 6; i++) set(8, i, gb(i));
    set(8, 7, gb(6)); set(8, 8, gb(7)); set(7, 8, gb(8));
    for (i = 9; i < 15; i++) set(14 - i, 8, gb(i));
    for (i = 0; i < 8; i++) set(size - 1 - i, 8, gb(i));
    for (i = 8; i < 15; i++) set(8, size - 15 + i, gb(i));
    set(8, size - 8, true);
    var bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var j = 0; j < 2; j++) {
        xx = right - j; var up = ((right + 1) & 2) === 0; y = up ? size - 1 - vert : vert;
        if (!F[y][xx] && bi < all.length * 8) { M[y][xx] = ((all[bi >> 3] >> (7 - (bi & 7))) & 1) === 1; bi++; }
      }
    }
    for (y = 0; y < size; y++) for (xx = 0; xx < size; xx++) if (!F[y][xx] && (xx + y) % 2 === 0) M[y][xx] = !M[y][xx];
    return M;
  }
  function svg(text, color) {
    var M = make(text), n = M.length, d = '';
    for (var yy = 0; yy < n; yy++) for (var x2 = 0; x2 < n; x2++) if (M[yy][x2]) d += 'M' + x2 + ' ' + yy + 'h1v1h-1z';
    return '<svg viewBox="-3 -3 ' + (n + 6) + ' ' + (n + 6) + '" shape-rendering="crispEdges" role="img" aria-label="QR code that opens this page"><rect x="-3" y="-3" width="' + (n + 6) + '" height="' + (n + 6) + '" fill="#fff"/><path d="' + d + '" fill="' + (color || '#000') + '"/></svg>';
  }
  g.MiniQR = { make: make, svg: svg };
})(typeof window !== 'undefined' ? window : globalThis);
