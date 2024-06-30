var It = Object.defineProperty;
var xt = (i, r, t) => r in i ? It(i, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[r] = t;
var m = (i, r, t) => (xt(i, typeof r != "symbol" ? r + "" : r, t), t);
import A from "stream";
import le from "tty";
import Z from "util";
import Ct from "os";
import Ge from "fs";
import He from "path";
import Mt from "events";
import Lt from "child_process";
function kt(i, r) {
  for (var t = 0; t < r.length; t++) {
    const e = r[t];
    if (typeof e != "string" && !Array.isArray(e)) {
      for (const o in e)
        if (o !== "default" && !(o in i)) {
          const u = Object.getOwnPropertyDescriptor(e, o);
          u && Object.defineProperty(i, o, u.get ? u : {
            enumerable: !0,
            get: () => e[o]
          });
        }
    }
  }
  return Object.freeze(Object.defineProperty(i, Symbol.toStringTag, { value: "Module" }));
}
var v = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, bt = {}, fe = {};
Object.defineProperty(fe, "__esModule", { value: !0 });
fe.ByteLengthParser = void 0;
const Ut = A;
class qt extends Ut.Transform {
  constructor(t) {
    super(t);
    m(this, "length");
    m(this, "position");
    m(this, "buffer");
    if (typeof t.length != "number")
      throw new TypeError('"length" is not a number');
    if (t.length < 1)
      throw new TypeError('"length" is not greater than 0');
    this.length = t.length, this.position = 0, this.buffer = Buffer.alloc(this.length);
  }
  _transform(t, e, o) {
    let u = 0;
    for (; u < t.length; )
      this.buffer[this.position] = t[u], u++, this.position++, this.position === this.length && (this.push(this.buffer), this.buffer = Buffer.alloc(this.length), this.position = 0);
    o();
  }
  _flush(t) {
    this.push(this.buffer.slice(0, this.position)), this.buffer = Buffer.alloc(this.length), t();
  }
}
fe.ByteLengthParser = qt;
var de = {};
Object.defineProperty(de, "__esModule", { value: !0 });
de.CCTalkParser = void 0;
const Wt = A;
class Vt extends Wt.Transform {
  constructor(t = 50) {
    super();
    m(this, "array");
    m(this, "cursor");
    m(this, "lastByteFetchTime");
    m(this, "maxDelayBetweenBytesMs");
    this.array = [], this.cursor = 0, this.lastByteFetchTime = 0, this.maxDelayBetweenBytesMs = t;
  }
  _transform(t, e, o) {
    if (this.maxDelayBetweenBytesMs > 0) {
      const u = Date.now();
      u - this.lastByteFetchTime > this.maxDelayBetweenBytesMs && (this.array = [], this.cursor = 0), this.lastByteFetchTime = u;
    }
    for (this.cursor += t.length, Array.from(t).map((u) => this.array.push(u)); this.cursor > 1 && this.cursor >= this.array[1] + 5; ) {
      const u = this.array[1] + 5, l = Buffer.from(this.array.slice(0, u));
      this.array = this.array.slice(l.length, this.array.length), this.cursor -= u, this.push(l);
    }
    o();
  }
}
de.CCTalkParser = Vt;
var Q = {};
Object.defineProperty(Q, "__esModule", { value: !0 });
Q.DelimiterParser = void 0;
const Gt = A;
let Ht = class extends Gt.Transform {
  constructor({ delimiter: t, includeDelimiter: e = !1, ...o }) {
    super(o);
    m(this, "includeDelimiter");
    m(this, "delimiter");
    m(this, "buffer");
    if (t === void 0)
      throw new TypeError('"delimiter" is not a bufferable object');
    if (t.length === 0)
      throw new TypeError('"delimiter" has a 0 or undefined length');
    this.includeDelimiter = e, this.delimiter = Buffer.from(t), this.buffer = Buffer.alloc(0);
  }
  _transform(t, e, o) {
    let u = Buffer.concat([this.buffer, t]), l;
    for (; (l = u.indexOf(this.delimiter)) !== -1; )
      this.push(u.slice(0, l + (this.includeDelimiter ? this.delimiter.length : 0))), u = u.slice(l + this.delimiter.length);
    this.buffer = u, o();
  }
  _flush(t) {
    this.push(this.buffer), this.buffer = Buffer.alloc(0), t();
  }
};
Q.DelimiterParser = Ht;
var pe = {};
Object.defineProperty(pe, "__esModule", { value: !0 });
pe.InterByteTimeoutParser = void 0;
const zt = A;
class Jt extends zt.Transform {
  constructor({ maxBufferSize: t = 65536, interval: e, ...o }) {
    super(o);
    m(this, "maxBufferSize");
    m(this, "currentPacket");
    m(this, "interval");
    m(this, "intervalID");
    if (!e)
      throw new TypeError('"interval" is required');
    if (typeof e != "number" || Number.isNaN(e))
      throw new TypeError('"interval" is not a number');
    if (e < 1)
      throw new TypeError('"interval" is not greater than 0');
    if (typeof t != "number" || Number.isNaN(t))
      throw new TypeError('"maxBufferSize" is not a number');
    if (t < 1)
      throw new TypeError('"maxBufferSize" is not greater than 0');
    this.maxBufferSize = t, this.currentPacket = [], this.interval = e;
  }
  _transform(t, e, o) {
    this.intervalID && clearTimeout(this.intervalID);
    for (let u = 0; u < t.length; u++)
      this.currentPacket.push(t[u]), this.currentPacket.length >= this.maxBufferSize && this.emitPacket();
    this.intervalID = setTimeout(this.emitPacket.bind(this), this.interval), o();
  }
  emitPacket() {
    this.intervalID && clearTimeout(this.intervalID), this.currentPacket.length > 0 && this.push(Buffer.from(this.currentPacket)), this.currentPacket = [];
  }
  _flush(t) {
    this.emitPacket(), t();
  }
}
pe.InterByteTimeoutParser = Jt;
var he = {};
Object.defineProperty(he, "__esModule", { value: !0 });
he.PacketLengthParser = void 0;
const Kt = A;
class Zt extends Kt.Transform {
  constructor(t = {}) {
    super(t);
    m(this, "buffer");
    m(this, "start");
    m(this, "opts");
    const { delimiter: e = 170, packetOverhead: o = 2, lengthBytes: u = 1, lengthOffset: l = 1, maxLen: p = 255 } = t;
    this.opts = {
      delimiter: e,
      packetOverhead: o,
      lengthBytes: u,
      lengthOffset: l,
      maxLen: p
    }, this.buffer = Buffer.alloc(0), this.start = !1;
  }
  _transform(t, e, o) {
    for (let u = 0; u < t.length; u++) {
      const l = t[u];
      if (l === this.opts.delimiter && (this.start = !0), this.start === !0 && (this.buffer = Buffer.concat([this.buffer, Buffer.from([l])]), this.buffer.length >= this.opts.lengthOffset + this.opts.lengthBytes)) {
        const p = this.buffer.readUIntLE(this.opts.lengthOffset, this.opts.lengthBytes);
        (this.buffer.length == p + this.opts.packetOverhead || p > this.opts.maxLen) && (this.push(this.buffer), this.buffer = Buffer.alloc(0), this.start = !1);
      }
    }
    o();
  }
  _flush(t) {
    this.push(this.buffer), this.buffer = Buffer.alloc(0), t();
  }
}
he.PacketLengthParser = Zt;
var ge = {};
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.ReadlineParser = void 0;
const Yt = Q;
let Qt = class extends Yt.DelimiterParser {
  constructor(r) {
    const t = {
      delimiter: Buffer.from(`
`, "utf8"),
      encoding: "utf8",
      ...r
    };
    typeof t.delimiter == "string" && (t.delimiter = Buffer.from(t.delimiter, t.encoding)), super(t);
  }
};
ge.ReadlineParser = Qt;
var we = {};
Object.defineProperty(we, "__esModule", { value: !0 });
we.ReadyParser = void 0;
const Xt = A;
class er extends Xt.Transform {
  constructor({ delimiter: t, ...e }) {
    if (t === void 0)
      throw new TypeError('"delimiter" is not a bufferable object');
    if (t.length === 0)
      throw new TypeError('"delimiter" has a 0 or undefined length');
    super(e);
    m(this, "delimiter");
    m(this, "readOffset");
    m(this, "ready");
    this.delimiter = Buffer.from(t), this.readOffset = 0, this.ready = !1;
  }
  _transform(t, e, o) {
    if (this.ready)
      return this.push(t), o();
    const u = this.delimiter;
    let l = 0;
    for (; this.readOffset < u.length && l < t.length; )
      u[this.readOffset] === t[l] ? this.readOffset++ : this.readOffset = 0, l++;
    if (this.readOffset === u.length) {
      this.ready = !0, this.emit("ready");
      const p = t.slice(l);
      p.length > 0 && this.push(p);
    }
    o();
  }
}
we.ReadyParser = er;
var ye = {};
Object.defineProperty(ye, "__esModule", { value: !0 });
ye.RegexParser = void 0;
const tr = A;
class rr extends tr.Transform {
  constructor({ regex: t, ...e }) {
    const o = {
      encoding: "utf8",
      ...e
    };
    if (t === void 0)
      throw new TypeError('"options.regex" must be a regular expression pattern or object');
    t instanceof RegExp || (t = new RegExp(t.toString()));
    super(o);
    m(this, "regex");
    m(this, "data");
    this.regex = t, this.data = "";
  }
  _transform(t, e, o) {
    const l = (this.data + t).split(this.regex);
    this.data = l.pop() || "", l.forEach((p) => {
      this.push(p);
    }), o();
  }
  _flush(t) {
    this.push(this.data), this.data = "", t();
  }
}
ye.RegexParser = rr;
var _t = {}, me = {};
Object.defineProperty(me, "__esModule", { value: !0 });
me.SlipDecoder = void 0;
const nr = A;
class ir extends nr.Transform {
  constructor(t = {}) {
    super(t);
    m(this, "opts");
    m(this, "buffer");
    m(this, "escape");
    m(this, "start");
    const { START: e, ESC: o = 219, END: u = 192, ESC_START: l, ESC_END: p = 220, ESC_ESC: a = 221 } = t;
    this.opts = {
      START: e,
      ESC: o,
      END: u,
      ESC_START: l,
      ESC_END: p,
      ESC_ESC: a
    }, this.buffer = Buffer.alloc(0), this.escape = !1, this.start = !1;
  }
  _transform(t, e, o) {
    for (let u = 0; u < t.length; u++) {
      let l = t[u];
      if (l === this.opts.START) {
        this.start = !0;
        continue;
      } else
        this.opts.START == null && (this.start = !0);
      if (this.escape)
        l === this.opts.ESC_START && this.opts.START ? l = this.opts.START : l === this.opts.ESC_ESC ? l = this.opts.ESC : l === this.opts.ESC_END ? l = this.opts.END : (this.escape = !1, this.push(this.buffer), this.buffer = Buffer.alloc(0));
      else {
        if (l === this.opts.ESC) {
          this.escape = !0;
          continue;
        }
        if (l === this.opts.END) {
          this.push(this.buffer), this.buffer = Buffer.alloc(0), this.escape = !1, this.start = !1;
          continue;
        }
      }
      this.escape = !1, this.start && (this.buffer = Buffer.concat([this.buffer, Buffer.from([l])]));
    }
    o();
  }
  _flush(t) {
    this.push(this.buffer), this.buffer = Buffer.alloc(0), t();
  }
}
me.SlipDecoder = ir;
var Ce = {};
Object.defineProperty(Ce, "__esModule", { value: !0 });
Ce.SlipEncoder = void 0;
const sr = A;
class or extends sr.Transform {
  constructor(t = {}) {
    super(t);
    m(this, "opts");
    const { START: e, ESC: o = 219, END: u = 192, ESC_START: l, ESC_END: p = 220, ESC_ESC: a = 221, bluetoothQuirk: d = !1 } = t;
    this.opts = {
      START: e,
      ESC: o,
      END: u,
      ESC_START: l,
      ESC_END: p,
      ESC_ESC: a,
      bluetoothQuirk: d
    };
  }
  _transform(t, e, o) {
    const u = t.length;
    if (this.opts.bluetoothQuirk && u === 0)
      return o();
    const l = Buffer.alloc(u * 2 + 2);
    let p = 0;
    this.opts.bluetoothQuirk == !0 && (l[p++] = this.opts.END), this.opts.START !== void 0 && (l[p++] = this.opts.START);
    for (let a = 0; a < u; a++) {
      let d = t[a];
      d === this.opts.START && this.opts.ESC_START ? (l[p++] = this.opts.ESC, d = this.opts.ESC_START) : d === this.opts.END ? (l[p++] = this.opts.ESC, d = this.opts.ESC_END) : d === this.opts.ESC && (l[p++] = this.opts.ESC, d = this.opts.ESC_ESC), l[p++] = d;
    }
    l[p++] = this.opts.END, o(null, l.slice(0, p));
  }
}
Ce.SlipEncoder = or;
(function(i) {
  var r = v && v.__createBinding || (Object.create ? function(e, o, u, l) {
    l === void 0 && (l = u);
    var p = Object.getOwnPropertyDescriptor(o, u);
    (!p || ("get" in p ? !o.__esModule : p.writable || p.configurable)) && (p = { enumerable: !0, get: function() {
      return o[u];
    } }), Object.defineProperty(e, l, p);
  } : function(e, o, u, l) {
    l === void 0 && (l = u), e[l] = o[u];
  }), t = v && v.__exportStar || function(e, o) {
    for (var u in e)
      u !== "default" && !Object.prototype.hasOwnProperty.call(o, u) && r(o, e, u);
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), t(me, i), t(Ce, i);
})(_t);
var be = {}, vt = {};
(function(i) {
  Object.defineProperty(i, "__esModule", { value: !0 }), i.convertHeaderBufferToObj = i.HEADER_LENGTH = void 0, i.HEADER_LENGTH = 6;
  const r = (e) => {
    let o = Number(e).toString(2);
    for (; o.length < 8; )
      o = `0${o}`;
    return o;
  }, t = (e) => {
    const o = Array.from(e.slice(0, i.HEADER_LENGTH)).reduce((c, h) => `${c}${r(h)}`, ""), l = o.slice(0, 3) === "000" ? 1 : "UNKNOWN_VERSION", p = Number(o[3]), a = Number(o[4]), d = parseInt(o.slice(5, 16), 2), f = parseInt(o.slice(16, 18), 2), s = parseInt(o.slice(18, 32), 2), n = parseInt(o.slice(-16), 2) + 1;
    return {
      versionNumber: l,
      identification: {
        apid: d,
        secondaryHeader: a,
        type: p
      },
      sequenceControl: {
        packetName: s,
        sequenceFlags: f
      },
      dataLength: n
    };
  };
  i.convertHeaderBufferToObj = t;
})(vt);
Object.defineProperty(be, "__esModule", { value: !0 });
be.SpacePacketParser = void 0;
const ar = A, te = vt;
class ur extends ar.Transform {
  /**
   * A Transform stream that accepts a stream of octet data and emits object representations of
   * CCSDS Space Packets once a packet has been completely received.
   * @param {Object} [options] Configuration options for the stream
   * @param {Number} options.timeCodeFieldLength The length of the time code field within the data
   * @param {Number} options.ancillaryDataFieldLength The length of the ancillary data field within the data
   */
  constructor(t = {}) {
    super({ ...t, objectMode: !0 });
    m(this, "timeCodeFieldLength");
    m(this, "ancillaryDataFieldLength");
    m(this, "dataBuffer");
    m(this, "headerBuffer");
    m(this, "dataLength");
    m(this, "expectingHeader");
    m(this, "dataSlice");
    m(this, "header");
    this.timeCodeFieldLength = t.timeCodeFieldLength || 0, this.ancillaryDataFieldLength = t.ancillaryDataFieldLength || 0, this.dataSlice = this.timeCodeFieldLength + this.ancillaryDataFieldLength, this.dataBuffer = Buffer.alloc(0), this.headerBuffer = Buffer.alloc(0), this.dataLength = 0, this.expectingHeader = !0;
  }
  /**
   * Bundle the header, secondary header if present, and the data into a JavaScript object to emit.
   * If more data has been received past the current packet, begin the process of parsing the next
   * packet(s).
   */
  pushCompletedPacket() {
    if (!this.header)
      throw new Error("Missing header");
    const t = Buffer.from(this.dataBuffer.slice(0, this.timeCodeFieldLength)), e = Buffer.from(this.dataBuffer.slice(this.timeCodeFieldLength, this.timeCodeFieldLength + this.ancillaryDataFieldLength)), o = Buffer.from(this.dataBuffer.slice(this.dataSlice, this.dataLength)), u = {
      header: { ...this.header },
      data: o.toString()
    };
    (t.length > 0 || e.length > 0) && (u.secondaryHeader = {}, t.length && (u.secondaryHeader.timeCode = t.toString()), e.length && (u.secondaryHeader.ancillaryData = e.toString())), this.push(u);
    const l = Buffer.from(this.dataBuffer.slice(this.dataLength));
    l.length >= te.HEADER_LENGTH ? this.extractHeader(l) : (this.headerBuffer = l, this.dataBuffer = Buffer.alloc(0), this.expectingHeader = !0, this.dataLength = 0, this.header = void 0);
  }
  /**
   * Build the Stream's headerBuffer property from the received Buffer chunk; extract data from it
   * if it's complete. If there's more to the chunk than just the header, initiate handling the
   * packet data.
   * @param chunk -  Build the Stream's headerBuffer property from
   */
  extractHeader(t) {
    const e = Buffer.concat([this.headerBuffer, t]), o = e.slice(te.HEADER_LENGTH);
    e.length >= te.HEADER_LENGTH ? (this.header = (0, te.convertHeaderBufferToObj)(e), this.dataLength = this.header.dataLength, this.headerBuffer = Buffer.alloc(0), this.expectingHeader = !1) : this.headerBuffer = e, o.length > 0 && (this.dataBuffer = Buffer.from(o), this.dataBuffer.length >= this.dataLength && this.pushCompletedPacket());
  }
  _transform(t, e, o) {
    this.expectingHeader ? this.extractHeader(t) : (this.dataBuffer = Buffer.concat([this.dataBuffer, t]), this.dataBuffer.length >= this.dataLength && this.pushCompletedPacket()), o();
  }
  _flush(t) {
    const e = Buffer.concat([this.headerBuffer, this.dataBuffer]), o = Array.from(e);
    this.push(o), t();
  }
}
be.SpacePacketParser = ur;
var _e = {}, G = {}, Me = { exports: {} }, re = { exports: {} }, Re, rt;
function ze() {
  if (rt)
    return Re;
  rt = 1;
  var i = 1e3, r = i * 60, t = r * 60, e = t * 24, o = e * 7, u = e * 365.25;
  Re = function(f, s) {
    s = s || {};
    var n = typeof f;
    if (n === "string" && f.length > 0)
      return l(f);
    if (n === "number" && isFinite(f))
      return s.long ? a(f) : p(f);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(f)
    );
  };
  function l(f) {
    if (f = String(f), !(f.length > 100)) {
      var s = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        f
      );
      if (s) {
        var n = parseFloat(s[1]), c = (s[2] || "ms").toLowerCase();
        switch (c) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return n * u;
          case "weeks":
          case "week":
          case "w":
            return n * o;
          case "days":
          case "day":
          case "d":
            return n * e;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return n * t;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return n * r;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return n * i;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return n;
          default:
            return;
        }
      }
    }
  }
  function p(f) {
    var s = Math.abs(f);
    return s >= e ? Math.round(f / e) + "d" : s >= t ? Math.round(f / t) + "h" : s >= r ? Math.round(f / r) + "m" : s >= i ? Math.round(f / i) + "s" : f + "ms";
  }
  function a(f) {
    var s = Math.abs(f);
    return s >= e ? d(f, s, e, "day") : s >= t ? d(f, s, t, "hour") : s >= r ? d(f, s, r, "minute") : s >= i ? d(f, s, i, "second") : f + " ms";
  }
  function d(f, s, n, c) {
    var h = s >= n * 1.5;
    return Math.round(f / n) + " " + c + (h ? "s" : "");
  }
  return Re;
}
var Ne, nt;
function Et() {
  if (nt)
    return Ne;
  nt = 1;
  function i(r) {
    e.debug = e, e.default = e, e.coerce = d, e.disable = l, e.enable = u, e.enabled = p, e.humanize = ze(), e.destroy = f, Object.keys(r).forEach((s) => {
      e[s] = r[s];
    }), e.names = [], e.skips = [], e.formatters = {};
    function t(s) {
      let n = 0;
      for (let c = 0; c < s.length; c++)
        n = (n << 5) - n + s.charCodeAt(c), n |= 0;
      return e.colors[Math.abs(n) % e.colors.length];
    }
    e.selectColor = t;
    function e(s) {
      let n, c = null, h, g;
      function y(...w) {
        if (!y.enabled)
          return;
        const E = y, R = Number(/* @__PURE__ */ new Date()), L = R - (n || R);
        E.diff = L, E.prev = n, E.curr = R, n = R, w[0] = e.coerce(w[0]), typeof w[0] != "string" && w.unshift("%O");
        let N = 0;
        w[0] = w[0].replace(/%([a-zA-Z%])/g, (S, q) => {
          if (S === "%%")
            return "%";
          N++;
          const x = e.formatters[q];
          if (typeof x == "function") {
            const W = w[N];
            S = x.call(E, W), w.splice(N, 1), N--;
          }
          return S;
        }), e.formatArgs.call(E, w), (E.log || e.log).apply(E, w);
      }
      return y.namespace = s, y.useColors = e.useColors(), y.color = e.selectColor(s), y.extend = o, y.destroy = e.destroy, Object.defineProperty(y, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => c !== null ? c : (h !== e.namespaces && (h = e.namespaces, g = e.enabled(s)), g),
        set: (w) => {
          c = w;
        }
      }), typeof e.init == "function" && e.init(y), y;
    }
    function o(s, n) {
      const c = e(this.namespace + (typeof n > "u" ? ":" : n) + s);
      return c.log = this.log, c;
    }
    function u(s) {
      e.save(s), e.namespaces = s, e.names = [], e.skips = [];
      let n;
      const c = (typeof s == "string" ? s : "").split(/[\s,]+/), h = c.length;
      for (n = 0; n < h; n++)
        c[n] && (s = c[n].replace(/\*/g, ".*?"), s[0] === "-" ? e.skips.push(new RegExp("^" + s.slice(1) + "$")) : e.names.push(new RegExp("^" + s + "$")));
    }
    function l() {
      const s = [
        ...e.names.map(a),
        ...e.skips.map(a).map((n) => "-" + n)
      ].join(",");
      return e.enable(""), s;
    }
    function p(s) {
      if (s[s.length - 1] === "*")
        return !0;
      let n, c;
      for (n = 0, c = e.skips.length; n < c; n++)
        if (e.skips[n].test(s))
          return !1;
      for (n = 0, c = e.names.length; n < c; n++)
        if (e.names[n].test(s))
          return !0;
      return !1;
    }
    function a(s) {
      return s.toString().substring(2, s.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function d(s) {
      return s instanceof Error ? s.stack || s.message : s;
    }
    function f() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return e.enable(e.load()), e;
  }
  return Ne = i, Ne;
}
var it;
function cr() {
  return it || (it = 1, function(i, r) {
    r.formatArgs = e, r.save = o, r.load = u, r.useColors = t, r.storage = l(), r.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), r.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function t() {
      return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function e(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + i.exports.humanize(this.diff), !this.useColors)
        return;
      const d = "color: " + this.color;
      a.splice(1, 0, d, "color: inherit");
      let f = 0, s = 0;
      a[0].replace(/%[a-zA-Z%]/g, (n) => {
        n !== "%%" && (f++, n === "%c" && (s = f));
      }), a.splice(s, 0, d);
    }
    r.log = console.debug || console.log || (() => {
    });
    function o(a) {
      try {
        a ? r.storage.setItem("debug", a) : r.storage.removeItem("debug");
      } catch {
      }
    }
    function u() {
      let a;
      try {
        a = r.storage.getItem("debug");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function l() {
      try {
        return localStorage;
      } catch {
      }
    }
    i.exports = Et()(r);
    const { formatters: p } = i.exports;
    p.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (d) {
        return "[UnexpectedJSONParseError]: " + d.message;
      }
    };
  }(re, re.exports)), re.exports;
}
var ne = { exports: {} }, Te, st;
function lr() {
  return st || (st = 1, Te = (i, r = process.argv) => {
    const t = i.startsWith("-") ? "" : i.length === 1 ? "-" : "--", e = r.indexOf(t + i), o = r.indexOf("--");
    return e !== -1 && (o === -1 || e < o);
  }), Te;
}
var De, ot;
function Je() {
  if (ot)
    return De;
  ot = 1;
  const i = Ct, r = le, t = lr(), { env: e } = process;
  let o;
  t("no-color") || t("no-colors") || t("color=false") || t("color=never") ? o = 0 : (t("color") || t("colors") || t("color=true") || t("color=always")) && (o = 1), "FORCE_COLOR" in e && (e.FORCE_COLOR === "true" ? o = 1 : e.FORCE_COLOR === "false" ? o = 0 : o = e.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(e.FORCE_COLOR, 10), 3));
  function u(a) {
    return a === 0 ? !1 : {
      level: a,
      hasBasic: !0,
      has256: a >= 2,
      has16m: a >= 3
    };
  }
  function l(a, d) {
    if (o === 0)
      return 0;
    if (t("color=16m") || t("color=full") || t("color=truecolor"))
      return 3;
    if (t("color=256"))
      return 2;
    if (a && !d && o === void 0)
      return 0;
    const f = o || 0;
    if (e.TERM === "dumb")
      return f;
    if (process.platform === "win32") {
      const s = i.release().split(".");
      return Number(s[0]) >= 10 && Number(s[2]) >= 10586 ? Number(s[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in e)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((s) => s in e) || e.CI_NAME === "codeship" ? 1 : f;
    if ("TEAMCITY_VERSION" in e)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(e.TEAMCITY_VERSION) ? 1 : 0;
    if (e.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in e) {
      const s = parseInt((e.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (e.TERM_PROGRAM) {
        case "iTerm.app":
          return s >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(e.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(e.TERM) || "COLORTERM" in e ? 1 : f;
  }
  function p(a) {
    const d = l(a, a && a.isTTY);
    return u(d);
  }
  return De = {
    supportsColor: p,
    stdout: u(l(!0, r.isatty(1))),
    stderr: u(l(!0, r.isatty(2)))
  }, De;
}
var at;
function fr() {
  return at || (at = 1, function(i, r) {
    const t = le, e = Z;
    r.init = f, r.log = p, r.formatArgs = u, r.save = a, r.load = d, r.useColors = o, r.destroy = e.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), r.colors = [6, 2, 3, 4, 5, 1];
    try {
      const n = Je();
      n && (n.stderr || n).level >= 2 && (r.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    r.inspectOpts = Object.keys(process.env).filter((n) => /^debug_/i.test(n)).reduce((n, c) => {
      const h = c.substring(6).toLowerCase().replace(/_([a-z])/g, (y, w) => w.toUpperCase());
      let g = process.env[c];
      return /^(yes|on|true|enabled)$/i.test(g) ? g = !0 : /^(no|off|false|disabled)$/i.test(g) ? g = !1 : g === "null" ? g = null : g = Number(g), n[h] = g, n;
    }, {});
    function o() {
      return "colors" in r.inspectOpts ? !!r.inspectOpts.colors : t.isatty(process.stderr.fd);
    }
    function u(n) {
      const { namespace: c, useColors: h } = this;
      if (h) {
        const g = this.color, y = "\x1B[3" + (g < 8 ? g : "8;5;" + g), w = `  ${y};1m${c} \x1B[0m`;
        n[0] = w + n[0].split(`
`).join(`
` + w), n.push(y + "m+" + i.exports.humanize(this.diff) + "\x1B[0m");
      } else
        n[0] = l() + c + " " + n[0];
    }
    function l() {
      return r.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function p(...n) {
      return process.stderr.write(e.format(...n) + `
`);
    }
    function a(n) {
      n ? process.env.DEBUG = n : delete process.env.DEBUG;
    }
    function d() {
      return process.env.DEBUG;
    }
    function f(n) {
      n.inspectOpts = {};
      const c = Object.keys(r.inspectOpts);
      for (let h = 0; h < c.length; h++)
        n.inspectOpts[c[h]] = r.inspectOpts[c[h]];
    }
    i.exports = Et()(r);
    const { formatters: s } = i.exports;
    s.o = function(n) {
      return this.inspectOpts.colors = this.useColors, e.inspect(n, this.inspectOpts).split(`
`).map((c) => c.trim()).join(" ");
    }, s.O = function(n) {
      return this.inspectOpts.colors = this.useColors, e.inspect(n, this.inspectOpts);
    };
  }(ne, ne.exports)), ne.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Me.exports = cr() : Me.exports = fr();
var dr = Me.exports, pr = v && v.__importDefault || function(i) {
  return i && i.__esModule ? i : { default: i };
};
Object.defineProperty(G, "__esModule", { value: !0 });
G.SerialPortStream = G.DisconnectedError = void 0;
const hr = A, gr = pr(dr), C = (0, gr.default)("serialport/stream");
class Ot extends Error {
  constructor(t) {
    super(t);
    m(this, "disconnected");
    this.disconnected = !0;
  }
}
G.DisconnectedError = Ot;
const wr = {
  brk: !1,
  cts: !1,
  dtr: !0,
  rts: !0
};
function ut(i) {
  const r = Buffer.allocUnsafe(i);
  return r.used = 0, r;
}
class yr extends hr.Duplex {
  /**
   * Create a new serial port object for the `path`. In the case of invalid arguments or invalid options, when constructing a new SerialPort it will throw an error. The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick. You can disable this by setting the option `autoOpen` to `false`.
   * @emits open
   * @emits data
   * @emits close
   * @emits error
   */
  constructor(t, e) {
    const o = {
      autoOpen: !0,
      endOnClose: !1,
      highWaterMark: 65536,
      ...t
    };
    super({
      highWaterMark: o.highWaterMark
    });
    m(this, "port");
    m(this, "_pool");
    m(this, "_kMinPoolSpace");
    m(this, "opening");
    m(this, "closing");
    m(this, "settings");
    if (!o.binding)
      throw new TypeError('"Bindings" is invalid pass it as `options.binding`');
    if (!o.path)
      throw new TypeError(`"path" is not defined: ${o.path}`);
    if (typeof o.baudRate != "number")
      throw new TypeError(`"baudRate" must be a number: ${o.baudRate}`);
    this.settings = o, this.opening = !1, this.closing = !1, this._pool = ut(this.settings.highWaterMark), this._kMinPoolSpace = 128, this.settings.autoOpen && this.open(e);
  }
  get path() {
    return this.settings.path;
  }
  get baudRate() {
    return this.settings.baudRate;
  }
  get isOpen() {
    var t;
    return (((t = this.port) == null ? void 0 : t.isOpen) ?? !1) && !this.closing;
  }
  _error(t, e) {
    e ? e.call(this, t) : this.emit("error", t);
  }
  _asyncError(t, e) {
    process.nextTick(() => this._error(t, e));
  }
  /**
   * Opens a connection to the given serial port.
   * @param {ErrorCallback=} openCallback - Called after a connection is opened. If this is not provided and an error occurs, it will be emitted on the port's `error` event.
   * @emits open
   */
  open(t) {
    if (this.isOpen)
      return this._asyncError(new Error("Port is already open"), t);
    if (this.opening)
      return this._asyncError(new Error("Port is opening"), t);
    const { highWaterMark: e, binding: o, autoOpen: u, endOnClose: l, ...p } = this.settings;
    this.opening = !0, C("opening", `path: ${this.path}`), this.settings.binding.open(p).then((a) => {
      C("opened", `path: ${this.path}`), this.port = a, this.opening = !1, this.emit("open"), t && t.call(this, null);
    }, (a) => {
      this.opening = !1, C("Binding #open had an error", a), this._error(a, t);
    });
  }
  /**
   * Changes the baud rate for an open port. Emits an error or calls the callback if the baud rate isn't supported.
   * @param {object=} options Only supports `baudRate`.
   * @param {number=} [options.baudRate] The baud rate of the port to be opened. This should match one of the commonly available baud rates, such as 110, 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, or 115200. Custom rates are supported best effort per platform. The device connected to the serial port is not guaranteed to support the requested baud rate, even if the port itself supports that baud rate.
   * @param {ErrorCallback=} [callback] Called once the port's baud rate changes. If `.update` is called without a callback, and there is an error, an error event is emitted.
   * @returns {undefined}
   */
  update(t, e) {
    if (!this.isOpen || !this.port)
      return C("update attempted, but port is not open"), this._asyncError(new Error("Port is not open"), e);
    C("update", `baudRate: ${t.baudRate}`), this.port.update(t).then(() => {
      C("binding.update", "finished"), this.settings.baudRate = t.baudRate, e && e.call(this, null);
    }, (o) => (C("binding.update", "error", o), this._error(o, e)));
  }
  write(t, e, o) {
    return Array.isArray(t) && (t = Buffer.from(t)), typeof e == "function" ? super.write(t, e) : super.write(t, e, o);
  }
  _write(t, e, o) {
    if (!this.isOpen || !this.port) {
      this.once("open", () => {
        this._write(t, e, o);
      });
      return;
    }
    C("_write", `${t.length} bytes of data`), this.port.write(t).then(() => {
      C("binding.write", "write finished"), o(null);
    }, (u) => {
      C("binding.write", "error", u), u.canceled || this._disconnected(u), o(u);
    });
  }
  _writev(t, e) {
    C("_writev", `${t.length} chunks of data`);
    const o = t.map((u) => u.chunk);
    this._write(Buffer.concat(o), void 0, e);
  }
  _read(t) {
    if (!this.isOpen || !this.port) {
      C("_read", "queueing _read for after open"), this.once("open", () => {
        this._read(t);
      });
      return;
    }
    (!this._pool || this._pool.length - this._pool.used < this._kMinPoolSpace) && (C("_read", "discarding the read buffer pool because it is below kMinPoolSpace"), this._pool = ut(this.settings.highWaterMark));
    const e = this._pool, o = Math.min(e.length - e.used, t), u = e.used;
    C("_read", "reading", { start: u, toRead: o }), this.port.read(e, u, o).then(({ bytesRead: l }) => {
      if (C("binding.read", "finished", { bytesRead: l }), l === 0) {
        C("binding.read", "Zero bytes read closing readable stream"), this.push(null);
        return;
      }
      e.used += l, this.push(e.slice(u, u + l));
    }, (l) => {
      C("binding.read", "error", l), l.canceled || this._disconnected(l), this._read(t);
    });
  }
  _disconnected(t) {
    if (!this.isOpen) {
      C("disconnected aborted because already closed", t);
      return;
    }
    C("disconnected", t), this.close(void 0, new Ot(t.message));
  }
  /**
   * Closes an open connection.
   *
   * If there are in progress writes when the port is closed the writes will error.
   * @param {ErrorCallback} callback Called once a connection is closed.
   * @param {Error} disconnectError used internally to propagate a disconnect error
   */
  close(t, e = null) {
    if (!this.isOpen || !this.port)
      return C("close attempted, but port is not open"), this._asyncError(new Error("Port is not open"), t);
    this.closing = !0, C("#close"), this.port.close().then(() => {
      this.closing = !1, C("binding.close", "finished"), this.emit("close", e), this.settings.endOnClose && this.emit("end"), t && t.call(this, e);
    }, (o) => (this.closing = !1, C("binding.close", "had an error", o), this._error(o, t)));
  }
  /**
   * Set control flags on an open port. Uses [`SetCommMask`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363257(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for OS X and Linux.
   *
   * All options are operating system default when the port is opened. Every flag is set on each call to the provided or default values. If options isn't provided default options is used.
   */
  set(t, e) {
    if (!this.isOpen || !this.port)
      return C("set attempted, but port is not open"), this._asyncError(new Error("Port is not open"), e);
    const o = { ...wr, ...t };
    C("#set", o), this.port.set(o).then(() => {
      C("binding.set", "finished"), e && e.call(this, null);
    }, (u) => (C("binding.set", "had an error", u), this._error(u, e)));
  }
  /**
   * Returns the control flags (CTS, DSR, DCD) on the open port.
   * Uses [`GetCommModemStatus`](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363258(v=vs.85).aspx) for Windows and [`ioctl`](http://linux.die.net/man/4/tty_ioctl) for mac and linux.
   */
  get(t) {
    if (!this.isOpen || !this.port)
      return C("get attempted, but port is not open"), this._asyncError(new Error("Port is not open"), t);
    C("#get"), this.port.get().then((e) => {
      C("binding.get", "finished"), t.call(this, null, e);
    }, (e) => (C("binding.get", "had an error", e), this._error(e, t)));
  }
  /**
   * Flush discards data received but not read, and written but not transmitted by the operating system. For more technical details, see [`tcflush(fd, TCIOFLUSH)`](http://linux.die.net/man/3/tcflush) for Mac/Linux and [`FlushFileBuffers`](http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439) for Windows.
   */
  flush(t) {
    if (!this.isOpen || !this.port)
      return C("flush attempted, but port is not open"), this._asyncError(new Error("Port is not open"), t);
    C("#flush"), this.port.flush().then(() => {
      C("binding.flush", "finished"), t && t.call(this, null);
    }, (e) => (C("binding.flush", "had an error", e), this._error(e, t)));
  }
  /**
     * Waits until all output data is transmitted to the serial port. After any pending write has completed it calls [`tcdrain()`](http://linux.die.net/man/3/tcdrain) or [FlushFileBuffers()](https://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx) to ensure it has been written to the device.
    * @example
    Write the `data` and wait until it has finished transmitting to the target serial port before calling the callback. This will queue until the port is open and writes are finished.
  
    ```js
    function writeAndDrain (data, callback) {
      port.write(data);
      port.drain(callback);
    }
    ```
    */
  drain(t) {
    if (C("drain"), !this.isOpen || !this.port) {
      C("drain queuing on port open"), this.once("open", () => {
        this.drain(t);
      });
      return;
    }
    this.port.drain().then(() => {
      C("binding.drain", "finished"), t && t.call(this, null);
    }, (e) => (C("binding.drain", "had an error", e), this._error(e, t)));
  }
}
G.SerialPortStream = yr;
var X = {}, Le = { exports: {} }, ie = { exports: {} }, Se, ct;
function Bt() {
  if (ct)
    return Se;
  ct = 1;
  function i(r) {
    e.debug = e, e.default = e, e.coerce = d, e.disable = l, e.enable = u, e.enabled = p, e.humanize = ze(), e.destroy = f, Object.keys(r).forEach((s) => {
      e[s] = r[s];
    }), e.names = [], e.skips = [], e.formatters = {};
    function t(s) {
      let n = 0;
      for (let c = 0; c < s.length; c++)
        n = (n << 5) - n + s.charCodeAt(c), n |= 0;
      return e.colors[Math.abs(n) % e.colors.length];
    }
    e.selectColor = t;
    function e(s) {
      let n, c = null, h, g;
      function y(...w) {
        if (!y.enabled)
          return;
        const E = y, R = Number(/* @__PURE__ */ new Date()), L = R - (n || R);
        E.diff = L, E.prev = n, E.curr = R, n = R, w[0] = e.coerce(w[0]), typeof w[0] != "string" && w.unshift("%O");
        let N = 0;
        w[0] = w[0].replace(/%([a-zA-Z%])/g, (S, q) => {
          if (S === "%%")
            return "%";
          N++;
          const x = e.formatters[q];
          if (typeof x == "function") {
            const W = w[N];
            S = x.call(E, W), w.splice(N, 1), N--;
          }
          return S;
        }), e.formatArgs.call(E, w), (E.log || e.log).apply(E, w);
      }
      return y.namespace = s, y.useColors = e.useColors(), y.color = e.selectColor(s), y.extend = o, y.destroy = e.destroy, Object.defineProperty(y, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => c !== null ? c : (h !== e.namespaces && (h = e.namespaces, g = e.enabled(s)), g),
        set: (w) => {
          c = w;
        }
      }), typeof e.init == "function" && e.init(y), y;
    }
    function o(s, n) {
      const c = e(this.namespace + (typeof n > "u" ? ":" : n) + s);
      return c.log = this.log, c;
    }
    function u(s) {
      e.save(s), e.namespaces = s, e.names = [], e.skips = [];
      let n;
      const c = (typeof s == "string" ? s : "").split(/[\s,]+/), h = c.length;
      for (n = 0; n < h; n++)
        c[n] && (s = c[n].replace(/\*/g, ".*?"), s[0] === "-" ? e.skips.push(new RegExp("^" + s.slice(1) + "$")) : e.names.push(new RegExp("^" + s + "$")));
    }
    function l() {
      const s = [
        ...e.names.map(a),
        ...e.skips.map(a).map((n) => "-" + n)
      ].join(",");
      return e.enable(""), s;
    }
    function p(s) {
      if (s[s.length - 1] === "*")
        return !0;
      let n, c;
      for (n = 0, c = e.skips.length; n < c; n++)
        if (e.skips[n].test(s))
          return !1;
      for (n = 0, c = e.names.length; n < c; n++)
        if (e.names[n].test(s))
          return !0;
      return !1;
    }
    function a(s) {
      return s.toString().substring(2, s.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function d(s) {
      return s instanceof Error ? s.stack || s.message : s;
    }
    function f() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return e.enable(e.load()), e;
  }
  return Se = i, Se;
}
var lt;
function mr() {
  return lt || (lt = 1, function(i, r) {
    r.formatArgs = e, r.save = o, r.load = u, r.useColors = t, r.storage = l(), r.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), r.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function t() {
      return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function e(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + i.exports.humanize(this.diff), !this.useColors)
        return;
      const d = "color: " + this.color;
      a.splice(1, 0, d, "color: inherit");
      let f = 0, s = 0;
      a[0].replace(/%[a-zA-Z%]/g, (n) => {
        n !== "%%" && (f++, n === "%c" && (s = f));
      }), a.splice(s, 0, d);
    }
    r.log = console.debug || console.log || (() => {
    });
    function o(a) {
      try {
        a ? r.storage.setItem("debug", a) : r.storage.removeItem("debug");
      } catch {
      }
    }
    function u() {
      let a;
      try {
        a = r.storage.getItem("debug");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function l() {
      try {
        return localStorage;
      } catch {
      }
    }
    i.exports = Bt()(r);
    const { formatters: p } = i.exports;
    p.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (d) {
        return "[UnexpectedJSONParseError]: " + d.message;
      }
    };
  }(ie, ie.exports)), ie.exports;
}
var se = { exports: {} }, ft;
function Cr() {
  return ft || (ft = 1, function(i, r) {
    const t = le, e = Z;
    r.init = f, r.log = p, r.formatArgs = u, r.save = a, r.load = d, r.useColors = o, r.destroy = e.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), r.colors = [6, 2, 3, 4, 5, 1];
    try {
      const n = Je();
      n && (n.stderr || n).level >= 2 && (r.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    r.inspectOpts = Object.keys(process.env).filter((n) => /^debug_/i.test(n)).reduce((n, c) => {
      const h = c.substring(6).toLowerCase().replace(/_([a-z])/g, (y, w) => w.toUpperCase());
      let g = process.env[c];
      return /^(yes|on|true|enabled)$/i.test(g) ? g = !0 : /^(no|off|false|disabled)$/i.test(g) ? g = !1 : g === "null" ? g = null : g = Number(g), n[h] = g, n;
    }, {});
    function o() {
      return "colors" in r.inspectOpts ? !!r.inspectOpts.colors : t.isatty(process.stderr.fd);
    }
    function u(n) {
      const { namespace: c, useColors: h } = this;
      if (h) {
        const g = this.color, y = "\x1B[3" + (g < 8 ? g : "8;5;" + g), w = `  ${y};1m${c} \x1B[0m`;
        n[0] = w + n[0].split(`
`).join(`
` + w), n.push(y + "m+" + i.exports.humanize(this.diff) + "\x1B[0m");
      } else
        n[0] = l() + c + " " + n[0];
    }
    function l() {
      return r.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function p(...n) {
      return process.stderr.write(e.formatWithOptions(r.inspectOpts, ...n) + `
`);
    }
    function a(n) {
      n ? process.env.DEBUG = n : delete process.env.DEBUG;
    }
    function d() {
      return process.env.DEBUG;
    }
    function f(n) {
      n.inspectOpts = {};
      const c = Object.keys(r.inspectOpts);
      for (let h = 0; h < c.length; h++)
        n.inspectOpts[c[h]] = r.inspectOpts[c[h]];
    }
    i.exports = Bt()(r);
    const { formatters: s } = i.exports;
    s.o = function(n) {
      return this.inspectOpts.colors = this.useColors, e.inspect(n, this.inspectOpts).split(`
`).map((c) => c.trim()).join(" ");
    }, s.O = function(n) {
      return this.inspectOpts.colors = this.useColors, e.inspect(n, this.inspectOpts);
    };
  }(se, se.exports)), se.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Le.exports = mr() : Le.exports = Cr();
var br = Le.exports;
Object.defineProperty(X, "__esModule", { value: !0 });
var _r = br;
function vr(i) {
  return i && typeof i == "object" && "default" in i ? i : { default: i };
}
var Er = /* @__PURE__ */ vr(_r);
const P = Er.default("serialport/binding-mock");
let oe = {}, ae = 0;
function M() {
  return new Promise((i) => process.nextTick(() => i()));
}
class ke extends Error {
  constructor(r) {
    super(r), this.canceled = !0;
  }
}
const Or = {
  reset() {
    oe = {}, ae = 0;
  },
  // Create a mock port
  createPort(i, r = {}) {
    ae++;
    const t = Object.assign({ echo: !1, record: !1, manufacturer: "The J5 Robotics Company", vendorId: void 0, productId: void 0, maxReadSize: 1024 }, r);
    oe[i] = {
      data: Buffer.alloc(0),
      echo: t.echo,
      record: t.record,
      readyData: t.readyData,
      maxReadSize: t.maxReadSize,
      info: {
        path: i,
        manufacturer: t.manufacturer,
        serialNumber: `${ae}`,
        pnpId: void 0,
        locationId: void 0,
        vendorId: t.vendorId,
        productId: t.productId
      }
    }, P(ae, "created port", JSON.stringify({ path: i, opt: r }));
  },
  async list() {
    return P(null, "list"), Object.values(oe).map((i) => i.info);
  },
  async open(i) {
    var r;
    if (!i || typeof i != "object" || Array.isArray(i))
      throw new TypeError('"options" is not an object');
    if (!i.path)
      throw new TypeError('"path" is not a valid port');
    if (!i.baudRate)
      throw new TypeError('"baudRate" is not a valid baudRate');
    const t = Object.assign({ dataBits: 8, lock: !0, stopBits: 1, parity: "none", rtscts: !1, xon: !1, xoff: !1, xany: !1, hupcl: !0 }, i), { path: e } = t;
    P(null, `open: opening path ${e}`);
    const o = oe[e];
    if (await M(), !o)
      throw new Error(`Port does not exist - please call MockBinding.createPort('${e}') first`);
    const u = o.info.serialNumber;
    if (!((r = o.openOpt) === null || r === void 0) && r.lock)
      throw P(u, "open: Port is locked cannot open"), new Error("Port is locked cannot open");
    return P(u, `open: opened path ${e}`), o.openOpt = Object.assign({}, t), new Ft(o, t);
  }
};
class Ft {
  constructor(r, t) {
    if (this.port = r, this.openOptions = t, this.pendingRead = null, this.isOpen = !0, this.lastWrite = null, this.recording = Buffer.alloc(0), this.writeOperation = null, this.serialNumber = r.info.serialNumber, r.readyData) {
      const e = r.readyData;
      process.nextTick(() => {
        this.isOpen && (P(this.serialNumber, "emitting ready data"), this.emitData(e));
      });
    }
  }
  // Emit data on a mock port
  emitData(r) {
    if (!this.isOpen || !this.port)
      throw new Error("Port must be open to pretend to receive data");
    const t = Buffer.isBuffer(r) ? r : Buffer.from(r);
    P(this.serialNumber, "emitting data - pending read:", !!this.pendingRead), this.port.data = Buffer.concat([this.port.data, t]), this.pendingRead && (process.nextTick(this.pendingRead), this.pendingRead = null);
  }
  async close() {
    if (P(this.serialNumber, "close"), !this.isOpen)
      throw new Error("Port is not open");
    const r = this.port;
    if (!r)
      throw new Error("already closed");
    r.openOpt = void 0, r.data = Buffer.alloc(0), P(this.serialNumber, "port is closed"), this.serialNumber = void 0, this.isOpen = !1, this.pendingRead && this.pendingRead(new ke("port is closed"));
  }
  async read(r, t, e) {
    if (!Buffer.isBuffer(r))
      throw new TypeError('"buffer" is not a Buffer');
    if (typeof t != "number" || isNaN(t))
      throw new TypeError(`"offset" is not an integer got "${isNaN(t) ? "NaN" : typeof t}"`);
    if (typeof e != "number" || isNaN(e))
      throw new TypeError(`"length" is not an integer got "${isNaN(e) ? "NaN" : typeof e}"`);
    if (r.length < t + e)
      throw new Error("buffer is too small");
    if (!this.isOpen)
      throw new Error("Port is not open");
    if (P(this.serialNumber, "read", e, "bytes"), await M(), !this.isOpen || !this.port)
      throw new ke("Read canceled");
    if (this.port.data.length <= 0)
      return new Promise((p, a) => {
        this.pendingRead = (d) => {
          if (d)
            return a(d);
          this.read(r, t, e).then(p, a);
        };
      });
    const o = this.port.maxReadSize > e ? e : this.port.maxReadSize, l = this.port.data.slice(0, o).copy(r, t);
    return this.port.data = this.port.data.slice(o), P(this.serialNumber, "read", l, "bytes"), { bytesRead: l, buffer: r };
  }
  async write(r) {
    if (!Buffer.isBuffer(r))
      throw new TypeError('"buffer" is not a Buffer');
    if (!this.isOpen || !this.port)
      throw P("write", "error port is not open"), new Error("Port is not open");
    if (P(this.serialNumber, "write", r.length, "bytes"), this.writeOperation)
      throw new Error("Overlapping writes are not supported and should be queued by the serialport object");
    return this.writeOperation = (async () => {
      if (await M(), !this.isOpen || !this.port)
        throw new Error("Write canceled");
      const t = this.lastWrite = Buffer.from(r);
      this.port.record && (this.recording = Buffer.concat([this.recording, t])), this.port.echo && process.nextTick(() => {
        this.isOpen && this.emitData(t);
      }), this.writeOperation = null, P(this.serialNumber, "writing finished");
    })(), this.writeOperation;
  }
  async update(r) {
    if (typeof r != "object")
      throw TypeError('"options" is not an object');
    if (typeof r.baudRate != "number")
      throw new TypeError('"options.baudRate" is not a number');
    if (P(this.serialNumber, "update"), !this.isOpen || !this.port)
      throw new Error("Port is not open");
    await M(), this.port.openOpt && (this.port.openOpt.baudRate = r.baudRate);
  }
  async set(r) {
    if (typeof r != "object")
      throw new TypeError('"options" is not an object');
    if (P(this.serialNumber, "set"), !this.isOpen)
      throw new Error("Port is not open");
    await M();
  }
  async get() {
    if (P(this.serialNumber, "get"), !this.isOpen)
      throw new Error("Port is not open");
    return await M(), {
      cts: !0,
      dsr: !1,
      dcd: !1
    };
  }
  async getBaudRate() {
    var r;
    if (P(this.serialNumber, "getBaudRate"), !this.isOpen || !this.port)
      throw new Error("Port is not open");
    if (await M(), !(!((r = this.port.openOpt) === null || r === void 0) && r.baudRate))
      throw new Error("Internal Error");
    return {
      baudRate: this.port.openOpt.baudRate
    };
  }
  async flush() {
    if (P(this.serialNumber, "flush"), !this.isOpen || !this.port)
      throw new Error("Port is not open");
    await M(), this.port.data = Buffer.alloc(0);
  }
  async drain() {
    if (P(this.serialNumber, "drain"), !this.isOpen)
      throw new Error("Port is not open");
    await this.writeOperation, await M();
  }
}
X.CanceledError = ke;
X.MockBinding = Or;
X.MockPortBinding = Ft;
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.SerialPortMock = void 0;
const Br = G, je = X;
class Ue extends Br.SerialPortStream {
  constructor(r, t) {
    const e = {
      binding: je.MockBinding,
      ...r
    };
    super(e, t);
  }
}
m(Ue, "list", je.MockBinding.list), m(Ue, "binding", je.MockBinding);
_e.SerialPortMock = Ue;
var ve = {}, $e = {}, qe = { exports: {} }, ue = { exports: {} }, Ae, dt;
function Pt() {
  if (dt)
    return Ae;
  dt = 1;
  function i(r) {
    e.debug = e, e.default = e, e.coerce = d, e.disable = l, e.enable = u, e.enabled = p, e.humanize = ze(), e.destroy = f, Object.keys(r).forEach((s) => {
      e[s] = r[s];
    }), e.names = [], e.skips = [], e.formatters = {};
    function t(s) {
      let n = 0;
      for (let c = 0; c < s.length; c++)
        n = (n << 5) - n + s.charCodeAt(c), n |= 0;
      return e.colors[Math.abs(n) % e.colors.length];
    }
    e.selectColor = t;
    function e(s) {
      let n, c = null, h, g;
      function y(...w) {
        if (!y.enabled)
          return;
        const E = y, R = Number(/* @__PURE__ */ new Date()), L = R - (n || R);
        E.diff = L, E.prev = n, E.curr = R, n = R, w[0] = e.coerce(w[0]), typeof w[0] != "string" && w.unshift("%O");
        let N = 0;
        w[0] = w[0].replace(/%([a-zA-Z%])/g, (S, q) => {
          if (S === "%%")
            return "%";
          N++;
          const x = e.formatters[q];
          if (typeof x == "function") {
            const W = w[N];
            S = x.call(E, W), w.splice(N, 1), N--;
          }
          return S;
        }), e.formatArgs.call(E, w), (E.log || e.log).apply(E, w);
      }
      return y.namespace = s, y.useColors = e.useColors(), y.color = e.selectColor(s), y.extend = o, y.destroy = e.destroy, Object.defineProperty(y, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => c !== null ? c : (h !== e.namespaces && (h = e.namespaces, g = e.enabled(s)), g),
        set: (w) => {
          c = w;
        }
      }), typeof e.init == "function" && e.init(y), y;
    }
    function o(s, n) {
      const c = e(this.namespace + (typeof n > "u" ? ":" : n) + s);
      return c.log = this.log, c;
    }
    function u(s) {
      e.save(s), e.namespaces = s, e.names = [], e.skips = [];
      let n;
      const c = (typeof s == "string" ? s : "").split(/[\s,]+/), h = c.length;
      for (n = 0; n < h; n++)
        c[n] && (s = c[n].replace(/\*/g, ".*?"), s[0] === "-" ? e.skips.push(new RegExp("^" + s.slice(1) + "$")) : e.names.push(new RegExp("^" + s + "$")));
    }
    function l() {
      const s = [
        ...e.names.map(a),
        ...e.skips.map(a).map((n) => "-" + n)
      ].join(",");
      return e.enable(""), s;
    }
    function p(s) {
      if (s[s.length - 1] === "*")
        return !0;
      let n, c;
      for (n = 0, c = e.skips.length; n < c; n++)
        if (e.skips[n].test(s))
          return !1;
      for (n = 0, c = e.names.length; n < c; n++)
        if (e.names[n].test(s))
          return !0;
      return !1;
    }
    function a(s) {
      return s.toString().substring(2, s.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function d(s) {
      return s instanceof Error ? s.stack || s.message : s;
    }
    function f() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return e.enable(e.load()), e;
  }
  return Ae = i, Ae;
}
var pt;
function Fr() {
  return pt || (pt = 1, function(i, r) {
    r.formatArgs = e, r.save = o, r.load = u, r.useColors = t, r.storage = l(), r.destroy = /* @__PURE__ */ (() => {
      let a = !1;
      return () => {
        a || (a = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), r.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function t() {
      return typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs) ? !0 : typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/) ? !1 : typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function e(a) {
      if (a[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + a[0] + (this.useColors ? "%c " : " ") + "+" + i.exports.humanize(this.diff), !this.useColors)
        return;
      const d = "color: " + this.color;
      a.splice(1, 0, d, "color: inherit");
      let f = 0, s = 0;
      a[0].replace(/%[a-zA-Z%]/g, (n) => {
        n !== "%%" && (f++, n === "%c" && (s = f));
      }), a.splice(s, 0, d);
    }
    r.log = console.debug || console.log || (() => {
    });
    function o(a) {
      try {
        a ? r.storage.setItem("debug", a) : r.storage.removeItem("debug");
      } catch {
      }
    }
    function u() {
      let a;
      try {
        a = r.storage.getItem("debug");
      } catch {
      }
      return !a && typeof process < "u" && "env" in process && (a = process.env.DEBUG), a;
    }
    function l() {
      try {
        return localStorage;
      } catch {
      }
    }
    i.exports = Pt()(r);
    const { formatters: p } = i.exports;
    p.j = function(a) {
      try {
        return JSON.stringify(a);
      } catch (d) {
        return "[UnexpectedJSONParseError]: " + d.message;
      }
    };
  }(ue, ue.exports)), ue.exports;
}
var ce = { exports: {} }, ht;
function Pr() {
  return ht || (ht = 1, function(i, r) {
    const t = le, e = Z;
    r.init = f, r.log = p, r.formatArgs = u, r.save = a, r.load = d, r.useColors = o, r.destroy = e.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), r.colors = [6, 2, 3, 4, 5, 1];
    try {
      const n = Je();
      n && (n.stderr || n).level >= 2 && (r.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    r.inspectOpts = Object.keys(process.env).filter((n) => /^debug_/i.test(n)).reduce((n, c) => {
      const h = c.substring(6).toLowerCase().replace(/_([a-z])/g, (y, w) => w.toUpperCase());
      let g = process.env[c];
      return /^(yes|on|true|enabled)$/i.test(g) ? g = !0 : /^(no|off|false|disabled)$/i.test(g) ? g = !1 : g === "null" ? g = null : g = Number(g), n[h] = g, n;
    }, {});
    function o() {
      return "colors" in r.inspectOpts ? !!r.inspectOpts.colors : t.isatty(process.stderr.fd);
    }
    function u(n) {
      const { namespace: c, useColors: h } = this;
      if (h) {
        const g = this.color, y = "\x1B[3" + (g < 8 ? g : "8;5;" + g), w = `  ${y};1m${c} \x1B[0m`;
        n[0] = w + n[0].split(`
`).join(`
` + w), n.push(y + "m+" + i.exports.humanize(this.diff) + "\x1B[0m");
      } else
        n[0] = l() + c + " " + n[0];
    }
    function l() {
      return r.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function p(...n) {
      return process.stderr.write(e.format(...n) + `
`);
    }
    function a(n) {
      n ? process.env.DEBUG = n : delete process.env.DEBUG;
    }
    function d() {
      return process.env.DEBUG;
    }
    function f(n) {
      n.inspectOpts = {};
      const c = Object.keys(r.inspectOpts);
      for (let h = 0; h < c.length; h++)
        n.inspectOpts[c[h]] = r.inspectOpts[c[h]];
    }
    i.exports = Pt()(r);
    const { formatters: s } = i.exports;
    s.o = function(n) {
      return this.inspectOpts.colors = this.useColors, e.inspect(n, this.inspectOpts).split(`
`).map((c) => c.trim()).join(" ");
    }, s.O = function(n) {
      return this.inspectOpts.colors = this.useColors, e.inspect(n, this.inspectOpts);
    };
  }(ce, ce.exports)), ce.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? qe.exports = Fr() : qe.exports = Pr();
var J = qe.exports, H = {}, B = {}, We = { exports: {} };
function Rr(i) {
  throw new Error('Could not dynamically require "' + i + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Ie, gt;
function Nr() {
  if (gt)
    return Ie;
  gt = 1;
  var i = Ge, r = He, t = Ct, e = typeof __webpack_require__ == "function" ? __non_webpack_require__ : Rr, o = process.config && process.config.variables || {}, u = !!process.env.PREBUILDS_ONLY, l = process.versions.modules, p = x() ? "electron" : q() ? "node-webkit" : "node", a = process.env.npm_config_arch || t.arch(), d = process.env.npm_config_platform || t.platform(), f = process.env.LIBC || (W(d) ? "musl" : "glibc"), s = process.env.ARM_VERSION || (a === "arm64" ? "8" : o.arm_version) || "", n = (process.versions.uv || "").split(".")[0];
  Ie = c;
  function c(b) {
    return e(c.resolve(b));
  }
  c.resolve = c.path = function(b) {
    b = r.resolve(b || ".");
    try {
      var O = e(r.join(b, "package.json")).name.toUpperCase().replace(/-/g, "_");
      process.env[O + "_PREBUILD"] && (b = process.env[O + "_PREBUILD"]);
    } catch {
    }
    if (!u) {
      var _ = g(r.join(b, "build/Release"), y);
      if (_)
        return _;
      var D = g(r.join(b, "build/Debug"), y);
      if (D)
        return D;
    }
    var K = Qe(b);
    if (K)
      return K;
    var T = Qe(r.dirname(process.execPath));
    if (T)
      return T;
    var St = [
      "platform=" + d,
      "arch=" + a,
      "runtime=" + p,
      "abi=" + l,
      "uv=" + n,
      s ? "armv=" + s : "",
      "libc=" + f,
      "node=" + process.versions.node,
      process.versions.electron ? "electron=" + process.versions.electron : "",
      typeof __webpack_require__ == "function" ? "webpack=true" : ""
      // eslint-disable-line
    ].filter(Boolean).join(" ");
    throw new Error("No native build was found for " + St + `
    loaded from: ` + b + `
`);
    function Qe(Pe) {
      var jt = h(r.join(Pe, "prebuilds")).map(w), Xe = jt.filter(E(d, a)).sort(R)[0];
      if (Xe) {
        var et = r.join(Pe, "prebuilds", Xe.name), $t = h(et).map(L), At = $t.filter(N(p, l)), tt = At.sort(S(p))[0];
        if (tt)
          return r.join(et, tt.file);
      }
    }
  };
  function h(b) {
    try {
      return i.readdirSync(b);
    } catch {
      return [];
    }
  }
  function g(b, O) {
    var _ = h(b).filter(O);
    return _[0] && r.join(b, _[0]);
  }
  function y(b) {
    return /\.node$/.test(b);
  }
  function w(b) {
    var O = b.split("-");
    if (O.length === 2) {
      var _ = O[0], D = O[1].split("+");
      if (_ && D.length && D.every(Boolean))
        return { name: b, platform: _, architectures: D };
    }
  }
  function E(b, O) {
    return function(_) {
      return _ == null || _.platform !== b ? !1 : _.architectures.includes(O);
    };
  }
  function R(b, O) {
    return b.architectures.length - O.architectures.length;
  }
  function L(b) {
    var O = b.split("."), _ = O.pop(), D = { file: b, specificity: 0 };
    if (_ === "node") {
      for (var K = 0; K < O.length; K++) {
        var T = O[K];
        if (T === "node" || T === "electron" || T === "node-webkit")
          D.runtime = T;
        else if (T === "napi")
          D.napi = !0;
        else if (T.slice(0, 3) === "abi")
          D.abi = T.slice(3);
        else if (T.slice(0, 2) === "uv")
          D.uv = T.slice(2);
        else if (T.slice(0, 4) === "armv")
          D.armv = T.slice(4);
        else if (T === "glibc" || T === "musl")
          D.libc = T;
        else
          continue;
        D.specificity++;
      }
      return D;
    }
  }
  function N(b, O) {
    return function(_) {
      return !(_ == null || _.runtime !== b && !ee(_) || _.abi !== O && !_.napi || _.uv && _.uv !== n || _.armv && _.armv !== s || _.libc && _.libc !== f);
    };
  }
  function ee(b) {
    return b.runtime === "node" && b.napi;
  }
  function S(b) {
    return function(O, _) {
      return O.runtime !== _.runtime ? O.runtime === b ? -1 : 1 : O.abi !== _.abi ? O.abi ? -1 : 1 : O.specificity !== _.specificity ? O.specificity > _.specificity ? -1 : 1 : 0;
    };
  }
  function q() {
    return !!(process.versions && process.versions.nw);
  }
  function x() {
    return process.versions && process.versions.electron || process.env.ELECTRON_RUN_AS_NODE ? !0 : typeof window < "u" && window.process && window.process.type === "renderer";
  }
  function W(b) {
    return b === "linux" && i.existsSync("/etc/alpine-release");
  }
  return c.parseTags = L, c.matchTags = N, c.compareTags = S, c.parseTuple = w, c.matchTuple = E, c.compareTuples = R, Ie;
}
typeof process.addon == "function" ? We.exports = process.addon.bind(process) : We.exports = Nr();
var Rt = We.exports, Tr = v && v.__importDefault || function(i) {
  return i && i.__esModule ? i : { default: i };
};
Object.defineProperty(B, "__esModule", { value: !0 });
B.asyncWrite = B.asyncRead = B.asyncUpdate = B.asyncSet = B.asyncOpen = B.asyncList = B.asyncGetBaudRate = B.asyncGet = B.asyncFlush = B.asyncDrain = B.asyncClose = void 0;
const Dr = Tr(Rt), I = Z, Sr = He, F = (0, Dr.default)((0, Sr.join)(__dirname, "../"));
B.asyncClose = F.close ? (0, I.promisify)(F.close) : async () => {
  throw new Error('"binding.close" Method not implemented');
};
B.asyncDrain = F.drain ? (0, I.promisify)(F.drain) : async () => {
  throw new Error('"binding.drain" Method not implemented');
};
B.asyncFlush = F.flush ? (0, I.promisify)(F.flush) : async () => {
  throw new Error('"binding.flush" Method not implemented');
};
B.asyncGet = F.get ? (0, I.promisify)(F.get) : async () => {
  throw new Error('"binding.get" Method not implemented');
};
B.asyncGetBaudRate = F.getBaudRate ? (0, I.promisify)(F.getBaudRate) : async () => {
  throw new Error('"binding.getBaudRate" Method not implemented');
};
B.asyncList = F.list ? (0, I.promisify)(F.list) : async () => {
  throw new Error('"binding.list" Method not implemented');
};
B.asyncOpen = F.open ? (0, I.promisify)(F.open) : async () => {
  throw new Error('"binding.open" Method not implemented');
};
B.asyncSet = F.set ? (0, I.promisify)(F.set) : async () => {
  throw new Error('"binding.set" Method not implemented');
};
B.asyncUpdate = F.update ? (0, I.promisify)(F.update) : async () => {
  throw new Error('"binding.update" Method not implemented');
};
B.asyncRead = F.read ? (0, I.promisify)(F.read) : async () => {
  throw new Error('"binding.read" Method not implemented');
};
B.asyncWrite = F.write ? (0, I.promisify)(F.write) : async () => {
  throw new Error('"binding.write" Method not implemented');
};
var Ke = {}, Y = {};
Object.defineProperty(Y, "__esModule", { value: !0 });
Y.BindingsError = void 0;
class jr extends Error {
  constructor(r, { canceled: t = !1 } = {}) {
    super(r), this.canceled = t;
  }
}
Y.BindingsError = jr;
(function(i) {
  var r = v && v.__importDefault || function(s) {
    return s && s.__esModule ? s : { default: s };
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), i.Poller = i.EVENTS = void 0;
  const t = r(J), e = Mt, o = He, u = r(Rt), l = Y, { Poller: p } = (0, u.default)((0, o.join)(__dirname, "../")), a = (0, t.default)("serialport/bindings-cpp/poller");
  i.EVENTS = {
    UV_READABLE: 1,
    UV_WRITABLE: 2,
    UV_DISCONNECT: 4
  };
  function d(s, n) {
    if (s) {
      a("error", s), this.emit("readable", s), this.emit("writable", s), this.emit("disconnect", s);
      return;
    }
    n & i.EVENTS.UV_READABLE && (a('received "readable"'), this.emit("readable", null)), n & i.EVENTS.UV_WRITABLE && (a('received "writable"'), this.emit("writable", null)), n & i.EVENTS.UV_DISCONNECT && (a('received "disconnect"'), this.emit("disconnect", null));
  }
  class f extends e.EventEmitter {
    constructor(n, c = p) {
      a("Creating poller"), super(), this.poller = new c(n, d.bind(this));
    }
    /**
     * Wait for the next event to occur
     * @param {string} event ('readable'|'writable'|'disconnect')
     * @returns {Poller} returns itself
     */
    once(n, c) {
      switch (n) {
        case "readable":
          this.poll(i.EVENTS.UV_READABLE);
          break;
        case "writable":
          this.poll(i.EVENTS.UV_WRITABLE);
          break;
        case "disconnect":
          this.poll(i.EVENTS.UV_DISCONNECT);
          break;
      }
      return super.once(n, c);
    }
    /**
     * Ask the bindings to listen for an event, it is recommend to use `.once()` for easy use
     * @param {EVENTS} eventFlag polls for an event or group of events based upon a flag.
     */
    poll(n = 0) {
      n & i.EVENTS.UV_READABLE && a('Polling for "readable"'), n & i.EVENTS.UV_WRITABLE && a('Polling for "writable"'), n & i.EVENTS.UV_DISCONNECT && a('Polling for "disconnect"'), this.poller.poll(n);
    }
    /**
     * Stop listening for events and cancel all outstanding listening with an error
     */
    stop() {
      a("Stopping poller"), this.poller.stop(), this.emitCanceled();
    }
    destroy() {
      a("Destroying poller"), this.poller.destroy(), this.emitCanceled();
    }
    emitCanceled() {
      const n = new l.BindingsError("Canceled", { canceled: !0 });
      this.emit("readable", n), this.emit("writable", n), this.emit("disconnect", n);
    }
  }
  i.Poller = f;
})(Ke);
var Ze = {};
(function(i) {
  var r = v && v.__importDefault || function(f) {
    return f && f.__esModule ? f : { default: f };
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), i.unixRead = void 0;
  const t = Z, e = Ge, o = Y, l = (0, r(J).default)("serialport/bindings-cpp/unixRead"), p = (0, t.promisify)(e.read), a = (f) => new Promise((s, n) => {
    if (!f.poller)
      throw new Error("No poller on bindings");
    f.poller.once("readable", (c) => c ? n(c) : s());
  }), d = async ({ binding: f, buffer: s, offset: n, length: c, fsReadAsync: h = p }) => {
    if (l("Starting read"), !f.isOpen || !f.fd)
      throw new o.BindingsError("Port is not open", { canceled: !0 });
    try {
      const { bytesRead: g } = await h(f.fd, s, n, c, null);
      return g === 0 ? (0, i.unixRead)({ binding: f, buffer: s, offset: n, length: c, fsReadAsync: h }) : (l("Finished read", g, "bytes"), { bytesRead: g, buffer: s });
    } catch (g) {
      if (l("read error", g), g.code === "EAGAIN" || g.code === "EWOULDBLOCK" || g.code === "EINTR") {
        if (!f.isOpen)
          throw new o.BindingsError("Port is not open", { canceled: !0 });
        return l("waiting for readable because of code:", g.code), await a(f), (0, i.unixRead)({ binding: f, buffer: s, offset: n, length: c, fsReadAsync: h });
      }
      throw (g.code === "EBADF" || // Bad file number means we got closed
      g.code === "ENXIO" || // No such device or address probably usb disconnect
      g.code === "UNKNOWN" || g.errno === -1) && (g.disconnect = !0, l("disconnecting", g)), g;
    }
  };
  i.unixRead = d;
})(Ze);
var Ye = {};
(function(i) {
  var r = v && v.__importDefault || function(d) {
    return d && d.__esModule ? d : { default: d };
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), i.unixWrite = void 0;
  const t = Ge, e = r(J), o = Z, u = (0, e.default)("serialport/bindings-cpp/unixWrite"), l = (0, o.promisify)(t.write), p = (d) => new Promise((f, s) => {
    d.poller.once("writable", (n) => n ? s(n) : f());
  }), a = async ({ binding: d, buffer: f, offset: s = 0, fsWriteAsync: n = l }) => {
    const c = f.length - s;
    if (u("Starting write", f.length, "bytes offset", s, "bytesToWrite", c), !d.isOpen || !d.fd)
      throw new Error("Port is not open");
    try {
      const { bytesWritten: h } = await n(d.fd, f, s, c);
      if (u("write returned: wrote", h, "bytes"), h + s < f.length) {
        if (!d.isOpen)
          throw new Error("Port is not open");
        return (0, i.unixWrite)({ binding: d, buffer: f, offset: h + s, fsWriteAsync: n });
      }
      u("Finished writing", h + s, "bytes");
    } catch (h) {
      if (u("write errored", h), h.code === "EAGAIN" || h.code === "EWOULDBLOCK" || h.code === "EINTR") {
        if (!d.isOpen)
          throw new Error("Port is not open");
        return u("waiting for writable because of code:", h.code), await p(d), (0, i.unixWrite)({ binding: d, buffer: f, offset: s, fsWriteAsync: n });
      }
      throw (h.code === "EBADF" || // Bad file number means we got closed
      h.code === "ENXIO" || // No such device or address probably usb disconnect
      h.code === "UNKNOWN" || h.errno === -1) && (h.disconnect = !0, u("disconnecting", h)), u("error", h), h;
    }
  };
  i.unixWrite = a;
})(Ye);
var $r = v && v.__importDefault || function(i) {
  return i && i.__esModule ? i : { default: i };
};
Object.defineProperty(H, "__esModule", { value: !0 });
H.DarwinPortBinding = H.DarwinBinding = void 0;
const Ar = $r(J), U = B, Ir = Ke, xr = Ze, Mr = Ye, j = (0, Ar.default)("serialport/bindings-cpp");
H.DarwinBinding = {
  list() {
    return j("list"), (0, U.asyncList)();
  },
  async open(i) {
    if (!i || typeof i != "object" || Array.isArray(i))
      throw new TypeError('"options" is not an object');
    if (!i.path)
      throw new TypeError('"path" is not a valid port');
    if (!i.baudRate)
      throw new TypeError('"baudRate" is not a valid baudRate');
    j("open");
    const r = Object.assign({ vmin: 1, vtime: 0, dataBits: 8, lock: !0, stopBits: 1, parity: "none", rtscts: !1, xon: !1, xoff: !1, xany: !1, hupcl: !0 }, i), t = await (0, U.asyncOpen)(r.path, r);
    return new Nt(t, r);
  }
};
class Nt {
  constructor(r, t) {
    this.fd = r, this.openOptions = t, this.poller = new Ir.Poller(r), this.writeOperation = null;
  }
  get isOpen() {
    return this.fd !== null;
  }
  async close() {
    if (j("close"), !this.isOpen)
      throw new Error("Port is not open");
    const r = this.fd;
    this.poller.stop(), this.poller.destroy(), this.fd = null, await (0, U.asyncClose)(r);
  }
  async read(r, t, e) {
    if (!Buffer.isBuffer(r))
      throw new TypeError('"buffer" is not a Buffer');
    if (typeof t != "number" || isNaN(t))
      throw new TypeError(`"offset" is not an integer got "${isNaN(t) ? "NaN" : typeof t}"`);
    if (typeof e != "number" || isNaN(e))
      throw new TypeError(`"length" is not an integer got "${isNaN(e) ? "NaN" : typeof e}"`);
    if (j("read"), r.length < t + e)
      throw new Error("buffer is too small");
    if (!this.isOpen)
      throw new Error("Port is not open");
    return (0, xr.unixRead)({ binding: this, buffer: r, offset: t, length: e });
  }
  async write(r) {
    if (!Buffer.isBuffer(r))
      throw new TypeError('"buffer" is not a Buffer');
    if (j("write", r.length, "bytes"), !this.isOpen)
      throw j("write", "error port is not open"), new Error("Port is not open");
    return this.writeOperation = (async () => {
      r.length !== 0 && (await (0, Mr.unixWrite)({ binding: this, buffer: r }), this.writeOperation = null);
    })(), this.writeOperation;
  }
  async update(r) {
    if (!r || typeof r != "object" || Array.isArray(r))
      throw TypeError('"options" is not an object');
    if (typeof r.baudRate != "number")
      throw new TypeError('"options.baudRate" is not a number');
    if (j("update"), !this.isOpen)
      throw new Error("Port is not open");
    await (0, U.asyncUpdate)(this.fd, r);
  }
  async set(r) {
    if (!r || typeof r != "object" || Array.isArray(r))
      throw new TypeError('"options" is not an object');
    if (j("set", r), !this.isOpen)
      throw new Error("Port is not open");
    await (0, U.asyncSet)(this.fd, r);
  }
  async get() {
    if (j("get"), !this.isOpen)
      throw new Error("Port is not open");
    return (0, U.asyncGet)(this.fd);
  }
  async getBaudRate() {
    throw j("getBaudRate"), this.isOpen ? new Error("getBaudRate is not implemented on darwin") : new Error("Port is not open");
  }
  async flush() {
    if (j("flush"), !this.isOpen)
      throw new Error("Port is not open");
    await (0, U.asyncFlush)(this.fd);
  }
  async drain() {
    if (j("drain"), !this.isOpen)
      throw new Error("Port is not open");
    await this.writeOperation, await (0, U.asyncDrain)(this.fd);
  }
}
H.DarwinPortBinding = Nt;
var z = {}, Ee = {}, Oe = {}, Be = {};
Object.defineProperty(Be, "__esModule", { value: !0 });
Be.DelimiterParser = void 0;
const Lr = A;
class kr extends Lr.Transform {
  constructor({ delimiter: r, includeDelimiter: t = !1, ...e }) {
    if (super(e), r === void 0)
      throw new TypeError('"delimiter" is not a bufferable object');
    if (r.length === 0)
      throw new TypeError('"delimiter" has a 0 or undefined length');
    this.includeDelimiter = t, this.delimiter = Buffer.from(r), this.buffer = Buffer.alloc(0);
  }
  _transform(r, t, e) {
    let o = Buffer.concat([this.buffer, r]), u;
    for (; (u = o.indexOf(this.delimiter)) !== -1; )
      this.push(o.slice(0, u + (this.includeDelimiter ? this.delimiter.length : 0))), o = o.slice(u + this.delimiter.length);
    this.buffer = o, e();
  }
  _flush(r) {
    this.push(this.buffer), this.buffer = Buffer.alloc(0), r();
  }
}
Be.DelimiterParser = kr;
Object.defineProperty(Oe, "__esModule", { value: !0 });
Oe.ReadlineParser = void 0;
const Ur = Be;
class qr extends Ur.DelimiterParser {
  constructor(r) {
    const t = {
      delimiter: Buffer.from(`
`, "utf8"),
      encoding: "utf8",
      ...r
    };
    typeof t.delimiter == "string" && (t.delimiter = Buffer.from(t.delimiter, t.encoding)), super(t);
  }
}
Oe.ReadlineParser = qr;
Object.defineProperty(Ee, "__esModule", { value: !0 });
Ee.linuxList = void 0;
const Wr = Lt, Vr = Oe;
function Gr(i) {
  return /(tty(S|WCH|ACM|USB|AMA|MFD|O|XRUSB)|rfcomm)/.test(i) && i;
}
function Hr(i) {
  return {
    DEVNAME: "path",
    ID_VENDOR_ENC: "manufacturer",
    ID_SERIAL_SHORT: "serialNumber",
    ID_VENDOR_ID: "vendorId",
    ID_MODEL_ID: "productId",
    DEVLINKS: "pnpId",
    /**
    * Workaround for systemd defect
    * see https://github.com/serialport/bindings-cpp/issues/115
    */
    ID_USB_VENDOR_ENC: "manufacturer",
    ID_USB_SERIAL_SHORT: "serialNumber",
    ID_USB_VENDOR_ID: "vendorId",
    ID_USB_MODEL_ID: "productId"
    // End of workaround
  }[i.toUpperCase()];
}
function zr(i) {
  return i.replace(/\\x([a-fA-F0-9]{2})/g, (r, t) => String.fromCharCode(parseInt(t, 16)));
}
function Jr(i, r) {
  if (i === "pnpId") {
    const t = r.match(/\/by-id\/([^\s]+)/);
    return (t == null ? void 0 : t[1]) || void 0;
  }
  return i === "manufacturer" ? zr(r) : /^0x/.test(r) ? r.substr(2) : r;
}
function Kr(i = Wr.spawn) {
  const r = [], t = i("udevadm", ["info", "-e"]), e = t.stdout.pipe(new Vr.ReadlineParser());
  let o = !1, u = {
    path: "",
    manufacturer: void 0,
    serialNumber: void 0,
    pnpId: void 0,
    locationId: void 0,
    vendorId: void 0,
    productId: void 0
  };
  return e.on("data", (l) => {
    const p = l.slice(0, 1), a = l.slice(3);
    if (p === "P") {
      u = {
        path: "",
        manufacturer: void 0,
        serialNumber: void 0,
        pnpId: void 0,
        locationId: void 0,
        vendorId: void 0,
        productId: void 0
      }, o = !1;
      return;
    }
    if (!o) {
      if (p === "N") {
        Gr(a) ? r.push(u) : o = !0;
        return;
      }
      if (p === "E") {
        const d = a.match(/^(.+)=(.*)/);
        if (!d)
          return;
        const f = Hr(d[1]);
        if (!f)
          return;
        u[f] = Jr(f, d[2]);
      }
    }
  }), new Promise((l, p) => {
    t.on("close", (a) => {
      a && p(new Error(`Error listing ports udevadm exited with error code: ${a}`));
    }), t.on("error", p), e.on("error", p), e.on("finish", () => l(r));
  });
}
Ee.linuxList = Kr;
var Zr = v && v.__importDefault || function(i) {
  return i && i.__esModule ? i : { default: i };
};
Object.defineProperty(z, "__esModule", { value: !0 });
z.LinuxPortBinding = z.LinuxBinding = void 0;
const Yr = Zr(J), Qr = Ee, Xr = Ke, en = Ze, tn = Ye, k = B, $ = (0, Yr.default)("serialport/bindings-cpp");
z.LinuxBinding = {
  list() {
    return $("list"), (0, Qr.linuxList)();
  },
  async open(i) {
    if (!i || typeof i != "object" || Array.isArray(i))
      throw new TypeError('"options" is not an object');
    if (!i.path)
      throw new TypeError('"path" is not a valid port');
    if (!i.baudRate)
      throw new TypeError('"baudRate" is not a valid baudRate');
    $("open");
    const r = Object.assign({ vmin: 1, vtime: 0, dataBits: 8, lock: !0, stopBits: 1, parity: "none", rtscts: !1, xon: !1, xoff: !1, xany: !1, hupcl: !0 }, i), t = await (0, k.asyncOpen)(r.path, r);
    return this.fd = t, new Tt(t, r);
  }
};
class Tt {
  constructor(r, t) {
    this.fd = r, this.openOptions = t, this.poller = new Xr.Poller(r), this.writeOperation = null;
  }
  get isOpen() {
    return this.fd !== null;
  }
  async close() {
    if ($("close"), !this.isOpen)
      throw new Error("Port is not open");
    const r = this.fd;
    this.poller.stop(), this.poller.destroy(), this.fd = null, await (0, k.asyncClose)(r);
  }
  async read(r, t, e) {
    if (!Buffer.isBuffer(r))
      throw new TypeError('"buffer" is not a Buffer');
    if (typeof t != "number" || isNaN(t))
      throw new TypeError(`"offset" is not an integer got "${isNaN(t) ? "NaN" : typeof t}"`);
    if (typeof e != "number" || isNaN(e))
      throw new TypeError(`"length" is not an integer got "${isNaN(e) ? "NaN" : typeof e}"`);
    if ($("read"), r.length < t + e)
      throw new Error("buffer is too small");
    if (!this.isOpen)
      throw new Error("Port is not open");
    return (0, en.unixRead)({ binding: this, buffer: r, offset: t, length: e });
  }
  async write(r) {
    if (!Buffer.isBuffer(r))
      throw new TypeError('"buffer" is not a Buffer');
    if ($("write", r.length, "bytes"), !this.isOpen)
      throw $("write", "error port is not open"), new Error("Port is not open");
    return this.writeOperation = (async () => {
      r.length !== 0 && (await (0, tn.unixWrite)({ binding: this, buffer: r }), this.writeOperation = null);
    })(), this.writeOperation;
  }
  async update(r) {
    if (!r || typeof r != "object" || Array.isArray(r))
      throw TypeError('"options" is not an object');
    if (typeof r.baudRate != "number")
      throw new TypeError('"options.baudRate" is not a number');
    if ($("update"), !this.isOpen)
      throw new Error("Port is not open");
    await (0, k.asyncUpdate)(this.fd, r);
  }
  async set(r) {
    if (!r || typeof r != "object" || Array.isArray(r))
      throw new TypeError('"options" is not an object');
    if ($("set"), !this.isOpen)
      throw new Error("Port is not open");
    await (0, k.asyncSet)(this.fd, r);
  }
  async get() {
    if ($("get"), !this.isOpen)
      throw new Error("Port is not open");
    return (0, k.asyncGet)(this.fd);
  }
  async getBaudRate() {
    if ($("getBaudRate"), !this.isOpen)
      throw new Error("Port is not open");
    return (0, k.asyncGetBaudRate)(this.fd);
  }
  async flush() {
    if ($("flush"), !this.isOpen)
      throw new Error("Port is not open");
    await (0, k.asyncFlush)(this.fd);
  }
  async drain() {
    if ($("drain"), !this.isOpen)
      throw new Error("Port is not open");
    await this.writeOperation, await (0, k.asyncDrain)(this.fd);
  }
}
z.LinuxPortBinding = Tt;
var V = {}, Fe = {};
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.serialNumParser = void 0;
const rn = [/USB\\(?:.+)\\(.+)/, /FTDIBUS\\(?:.+)\+(.+?)A?\\.+/], nn = (i) => {
  if (!i)
    return null;
  for (const r of rn) {
    const t = i.match(r);
    if (t)
      return t[1];
  }
  return null;
};
Fe.serialNumParser = nn;
var wt;
function yt() {
  if (wt)
    return V;
  wt = 1;
  var i = v && v.__importDefault || function(p) {
    return p && p.__esModule ? p : { default: p };
  };
  Object.defineProperty(V, "__esModule", { value: !0 }), V.WindowsPortBinding = V.WindowsBinding = void 0;
  const r = i(J), t = Dt(), e = B, o = Fe, u = (0, r.default)("serialport/bindings-cpp");
  V.WindowsBinding = {
    async list() {
      return (await (0, e.asyncList)()).map((a) => {
        if (a.pnpId && !a.serialNumber) {
          const d = (0, o.serialNumParser)(a.pnpId);
          if (d)
            return Object.assign(Object.assign({}, a), { serialNumber: d });
        }
        return a;
      });
    },
    async open(p) {
      if (!p || typeof p != "object" || Array.isArray(p))
        throw new TypeError('"options" is not an object');
      if (!p.path)
        throw new TypeError('"path" is not a valid port');
      if (!p.baudRate)
        throw new TypeError('"baudRate" is not a valid baudRate');
      u("open");
      const a = Object.assign({ dataBits: 8, lock: !0, stopBits: 1, parity: "none", rtscts: !1, rtsMode: "handshake", xon: !1, xoff: !1, xany: !1, hupcl: !0 }, p), d = await (0, e.asyncOpen)(a.path, a);
      return new l(d, a);
    }
  };
  class l {
    constructor(a, d) {
      this.fd = a, this.openOptions = d, this.writeOperation = null;
    }
    get isOpen() {
      return this.fd !== null;
    }
    async close() {
      if (u("close"), !this.isOpen)
        throw new Error("Port is not open");
      const a = this.fd;
      this.fd = null, await (0, e.asyncClose)(a);
    }
    async read(a, d, f) {
      if (!Buffer.isBuffer(a))
        throw new TypeError('"buffer" is not a Buffer');
      if (typeof d != "number" || isNaN(d))
        throw new TypeError(`"offset" is not an integer got "${isNaN(d) ? "NaN" : typeof d}"`);
      if (typeof f != "number" || isNaN(f))
        throw new TypeError(`"length" is not an integer got "${isNaN(f) ? "NaN" : typeof f}"`);
      if (u("read"), a.length < d + f)
        throw new Error("buffer is too small");
      if (!this.isOpen)
        throw new Error("Port is not open");
      try {
        return { bytesRead: await (0, e.asyncRead)(this.fd, a, d, f), buffer: a };
      } catch (s) {
        throw this.isOpen ? s : new t.BindingsError(s.message, { canceled: !0 });
      }
    }
    async write(a) {
      if (!Buffer.isBuffer(a))
        throw new TypeError('"buffer" is not a Buffer');
      if (u("write", a.length, "bytes"), !this.isOpen)
        throw u("write", "error port is not open"), new Error("Port is not open");
      return this.writeOperation = (async () => {
        a.length !== 0 && (await (0, e.asyncWrite)(this.fd, a), this.writeOperation = null);
      })(), this.writeOperation;
    }
    async update(a) {
      if (!a || typeof a != "object" || Array.isArray(a))
        throw TypeError('"options" is not an object');
      if (typeof a.baudRate != "number")
        throw new TypeError('"options.baudRate" is not a number');
      if (u("update"), !this.isOpen)
        throw new Error("Port is not open");
      await (0, e.asyncUpdate)(this.fd, a);
    }
    async set(a) {
      if (!a || typeof a != "object" || Array.isArray(a))
        throw new TypeError('"options" is not an object');
      if (u("set", a), !this.isOpen)
        throw new Error("Port is not open");
      await (0, e.asyncSet)(this.fd, a);
    }
    async get() {
      if (u("get"), !this.isOpen)
        throw new Error("Port is not open");
      return (0, e.asyncGet)(this.fd);
    }
    async getBaudRate() {
      if (u("getBaudRate"), !this.isOpen)
        throw new Error("Port is not open");
      return (0, e.asyncGetBaudRate)(this.fd);
    }
    async flush() {
      if (u("flush"), !this.isOpen)
        throw new Error("Port is not open");
      await (0, e.asyncFlush)(this.fd);
    }
    async drain() {
      if (u("drain"), !this.isOpen)
        throw new Error("Port is not open");
      await this.writeOperation, await (0, e.asyncDrain)(this.fd);
    }
  }
  return V.WindowsPortBinding = l, V;
}
var sn = {}, mt;
function Dt() {
  return mt || (mt = 1, function(i) {
    var r = v && v.__createBinding || (Object.create ? function(f, s, n, c) {
      c === void 0 && (c = n);
      var h = Object.getOwnPropertyDescriptor(s, n);
      (!h || ("get" in h ? !s.__esModule : h.writable || h.configurable)) && (h = { enumerable: !0, get: function() {
        return s[n];
      } }), Object.defineProperty(f, c, h);
    } : function(f, s, n, c) {
      c === void 0 && (c = n), f[c] = s[n];
    }), t = v && v.__exportStar || function(f, s) {
      for (var n in f)
        n !== "default" && !Object.prototype.hasOwnProperty.call(s, n) && r(s, f, n);
    }, e = v && v.__importDefault || function(f) {
      return f && f.__esModule ? f : { default: f };
    };
    Object.defineProperty(i, "__esModule", { value: !0 }), i.autoDetect = void 0;
    const o = e(J), u = H, l = z, p = yt(), a = (0, o.default)("serialport/bindings-cpp");
    t(sn, i), t(H, i), t(z, i), t(yt(), i), t(Y, i);
    function d() {
      switch (process.platform) {
        case "win32":
          return a("loading WindowsBinding"), p.WindowsBinding;
        case "darwin":
          return a("loading DarwinBinding"), u.DarwinBinding;
        default:
          return a("loading LinuxBinding"), l.LinuxBinding;
      }
    }
    i.autoDetect = d;
  }($e)), $e;
}
Object.defineProperty(ve, "__esModule", { value: !0 });
ve.SerialPort = void 0;
const on = G, an = Dt(), xe = (0, an.autoDetect)();
class Ve extends on.SerialPortStream {
  constructor(r, t) {
    const e = {
      binding: xe,
      ...r
    };
    super(e, t);
  }
}
m(Ve, "list", xe.list), m(Ve, "binding", xe);
ve.SerialPort = Ve;
(function(i) {
  var r = v && v.__createBinding || (Object.create ? function(e, o, u, l) {
    l === void 0 && (l = u);
    var p = Object.getOwnPropertyDescriptor(o, u);
    (!p || ("get" in p ? !o.__esModule : p.writable || p.configurable)) && (p = { enumerable: !0, get: function() {
      return o[u];
    } }), Object.defineProperty(e, l, p);
  } : function(e, o, u, l) {
    l === void 0 && (l = u), e[l] = o[u];
  }), t = v && v.__exportStar || function(e, o) {
    for (var u in e)
      u !== "default" && !Object.prototype.hasOwnProperty.call(o, u) && r(o, e, u);
  };
  Object.defineProperty(i, "__esModule", { value: !0 }), t(fe, i), t(de, i), t(Q, i), t(pe, i), t(he, i), t(ge, i), t(we, i), t(ye, i), t(_t, i), t(be, i), t(_e, i), t(ve, i);
})(bt);
const Cn = /* @__PURE__ */ kt({
  __proto__: null
}, [bt]);
export {
  Cn as i
};
