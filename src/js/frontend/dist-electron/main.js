var P = Object.defineProperty;
var k = (t, e, r) => e in t ? P(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var d = (t, e, r) => (k(t, typeof e != "symbol" ? e + "" : e, r), r);
import { app as S, ipcMain as m, BrowserWindow as y } from "electron";
import b from "child_process";
import E from "util";
import G from "events";
import O, { existsSync as v } from "fs";
import D from "net";
import "path";
var $ = b.spawn, C = E, g = G, M = O, B = D, U = 2947;
function R(t) {
  let e = new B.Socket();
  return e.setEncoding("ascii"), e.on("connect", function(r) {
    t.logger.info("Socket connected."), t.connected = !0, t.partialMessages = [], t.emit("connected");
  }), e.on("data", function(r) {
    const i = Buffer.from(r, "utf-8");
    r[r.length - 1] === `
` ? t.partialMessages.length === 0 ? o(i) : (t.partialMessages.push(i), o(Buffer.concat(t.partialMessages)), t.partialMessages = []) : t.partialMessages.push(i);
    function o(n) {
      for (var h = n.toString("ascii"), u = h.replace(/\}\{/g, `}
{`), a = u.split(`
`), c = 0; c < a.length; c++)
        if (a[c])
          if (!t.parse)
            t.emit("raw", a[c]);
          else
            try {
              var s = JSON.parse(a[c]);
              t.emit(s.class, s);
            } catch (l) {
              t.logger.error("Bad message format", a[c], l), t.emit("error", {
                message: "Bad message format",
                cause: a[c],
                error: l
              });
              continue;
            }
    }
  }), e.on("close", function(r) {
    t.logger.info("Socket disconnected."), t.emit("disconnected", r), t.connected = !1;
  }), e.on("error", function(r) {
    r.code === "ECONNREFUSED" ? (t.logger.error("socket connection refused"), t.emit("error.connection")) : (t.logger.error("socket error", r), t.emit("error.socket", r));
  }), e;
}
function p(t) {
  return this.port = U, this.hostname = "localhost", this.logger = {
    info: function() {
    },
    warn: console.warn,
    error: console.error
  }, this.parse = !0, t !== void 0 && (t.port !== void 0 && (this.port = t.port), t.hostname !== void 0 && (this.hostname = t.hostname), t.logger !== void 0 && (this.logger = t.logger), t.parse !== void 0 && (this.parse = t.parse)), g.EventEmitter.call(this), this.connected = !1, this;
}
C.inherits(p, g.EventEmitter);
var A = p;
p.prototype.connect = function(t) {
  this.serviceSocket && (this.serviceSocket.destroy(), this.serviceSocket.removeAllListeners(), this.serviceSocket = null), this.serviceSocket = R(this), this.serviceSocket.connect(this.port, this.hostname), t !== void 0 && this.serviceSocket.once("connect", function(e) {
    t(e);
  });
};
p.prototype.disconnect = function(t) {
  this.unwatch(), this.serviceSocket.end(), t !== void 0 && this.serviceSocket.once("close", function(e) {
    t(e);
  });
};
p.prototype.isConnected = function() {
  return this.connected;
};
p.prototype.watch = function(t) {
  var e = { class: "WATCH", json: !0, nmea: !1 };
  t && (e = t), this.serviceSocket.write("?WATCH=" + JSON.stringify(e));
};
p.prototype.unwatch = function() {
  this.serviceSocket.write(`?WATCH={"class": "WATCH", "json":true, "enable":false}
`);
};
p.prototype.version = function() {
  this.serviceSocket.write(`?VERSION;
`);
};
p.prototype.devices = function() {
  this.serviceSocket.write(`?DEVICES;
`);
};
p.prototype.device = function() {
  this.serviceSocket.write(`?DEVICE;
`);
};
function f(t) {
  this.program = "gpsd", this.device = "/dev/ttyUSB0", this.port = U, this.pid = "/tmp/gpsd.pid", this.readOnly = !1, this.logger = {
    info: function() {
    },
    warn: console.warn,
    error: console.error
  }, g.EventEmitter.call(this), t !== void 0 && (t.program !== void 0 && (this.program = t.program), t.device !== void 0 && (this.device = t.device), t.port !== void 0 && (this.port = t.port), t.pid !== void 0 && (this.pid = t.pid), t.readOnly !== void 0 && (this.readOnly = t.readOnly), t.logger !== void 0 && (this.logger = t.logger)), this.arguments = [], this.arguments.push("-N"), this.arguments.push("-P"), this.arguments.push(this.pid), this.arguments.push("-S"), this.arguments.push(this.port), this.arguments.push(this.device), this.readOnly && this.arguments.push("-b");
}
C.inherits(f, g.EventEmitter);
var I = f;
f.prototype.start = function(t) {
  var e = this;
  M.exists(this.device, function(r) {
    var i = function(o) {
      e.gpsd === void 0 && (e.logger.info("Spawning gpsd."), e.gpsd = $(e.program, e.arguments), e.gpsd.on("exit", function(n) {
        e.logger.warn("gpsd died."), e.gpsd = void 0, e.emit("died");
      }), e.gpsd.on("error", function(n) {
        e.emit("error", n);
      }), setTimeout(function() {
        o !== void 0 && o.call();
      }, 100));
    };
    r ? i.apply(this, [t]) : (e.logger.info("Device not found. watching device."), M.watchFile(e.device, function(o, n) {
      e.logger.info("device status changed."), i.apply(this, [t]);
    }));
  });
};
f.prototype.stop = function(t) {
  this.gpsd.on("exit", function(e) {
    t !== void 0 && t.call();
  }), this.gpsd !== void 0 && this.gpsd.kill();
};
class N {
  constructor(e, r) {
    d(this, "logger");
    d(this, "config");
    d(this, "ports");
    d(this, "callback");
    d(this, "continue");
    this.logger = r, this.config = e, this.ports = {
      MCU: {
        enabled: !1,
        port: null,
        parser: null,
        data: {
          voltage: "0v",
          cells: "0",
          mean: "0v",
          stddev: "0v",
          alerts: [],
          current: "0A",
          SOC: "0%",
          uptime: ["0", "0", "0"]
        }
      },
      GPS: {
        enabled: !1,
        daemon: null,
        listener: null,
        data: {
          speed: 0,
          lon: 0,
          lat: 0
        }
      }
    }, this.continue = {
      MCU: !0,
      GPS: !0
    }, this.callback = () => {
      console.log("callback not set");
    };
  }
  start() {
    this.logger.warn("Logger initialized in backend!"), this.initMCU(), this.initGPS();
  }
  async initMCU() {
    const { SerialPort: e, DelimiterParser: r } = await import("./index-XF-gXMLX.js").then((i) => i.i);
    v(this.config.MCU.path) ? (this.logger.success("MCU serial port is being opened..."), this.ports.MCU.enabled = !0, this.ports.MCU.port = new e({
      path: this.config.MCU.path,
      baudRate: this.config.MCU.baudRate,
      autoOpen: !1
    }), this.ports.MCU.parser = this.ports.MCU.port.pipe(new r({
      delimiter: "sh"
    })), this.ports.MCU.port.on("open", () => {
      this.logger.success("MCU serial port opened"), this.continue.MCU = !0;
    }), this.ports.MCU.parser.on("data", (i) => {
      this.parseBMSData(i.toString().split(`
`));
    }), this.ports.MCU.port.on("error", (i) => {
    }), this.ports.MCU.port.on("close", () => {
      this.logger.warn("MCU serial port closed"), this.continue.MCU = !1;
    }), this.ports.MCU.port.on("drain", () => {
      this.logger.success("MCU serial port drained (write failed)");
    }), this.ports.MCU.port.open((i) => {
      i && console.error(i);
    })) : this.logger.fail("MCU serial port not found at " + this.config.MCU.path);
  }
  initGPS() {
    v(this.config.GPS.path) ? (this.ports.GPS.enabled = !0, this.ports.GPS.daemon = new I({
      program: "gpsd",
      device: this.config.GPS.path,
      port: 2947,
      // Default port for gpsd, usually shouldn't be changed
      pid: "/tmp/gpsd.pid",
      readOnly: !1,
      logger: {
        info: function() {
        },
        warn: console.warn,
        error: console.error
      }
    }), this.ports.GPS.listener = new A({
      // i doubt we need both the listener and the daemon but thats what docs say so..
      port: 2947,
      hostname: "localhost",
      logger: {
        info: function() {
        },
        warn: console.warn,
        error: console.error
      },
      parse: !0
    }), this.ports.GPS.daemon.start(() => {
      this.logger.success("GPS daemon started");
    }), this.ports.GPS.listener.connect(() => {
      this.logger.success("Connected to gpsd"), this.ports.GPS.listener.watch();
    }), this.ports.GPS.listener.on("TPV", (e) => {
      this.parseGPSData(e);
    })) : this.logger.fail("GPS device not found at " + this.config.GPS.path);
  }
  stopMCU() {
    var e;
    this.continue.MCU = !1, (e = this.ports.MCU.port) == null || e.close(), this.logger.warn("MCU serial port closed");
  }
  parseBMSData(e) {
    try {
      e.shift(), e.shift(), e.pop(), e = e.map((s) => s.split(":").map((l) => l.trim())), e = e.map((s) => s.map((l) => l.replace(/\r/g, ""))), e = e.map((s) => s.map((l) => l.replace(/\s/g, "")));
      let r = [], i = e.findIndex((s) => s[0] === "alerts"), o = e.findIndex((s) => s[0] === "current");
      for (let s = i; s < o; s++)
        e[s][1] !== "" && r.push(e[s][1]);
      let n = {};
      for (let s of e)
        s[0] !== "" && (n[s[0]] = s[1]);
      n.alerts = r;
      let h = n.uptime.split(""), u = [];
      for (let s = 0; s < h.length; s++)
        isNaN(h[s]) ? h[s].match(",") && u.push(h[s]) : u.push(h[s]);
      n.uptime = u.join("").split(",");
      let a = n.cells.split(""), c = [];
      for (let s = 0; s < a.length; s++)
        isNaN(a[s]) || c.push(a[s]);
      return n.cells = c.join(""), this.ports.MCU.data = n, this.ports.MCU.data;
    } catch (r) {
      return this.logger.warn("Error parsing BMS data: " + r), this.ports.MCU.data;
    }
  }
  parseGPSData(e) {
    return e.speed && (this.ports.GPS.data.speed = e.speed), e.lon && (this.ports.GPS.data.lon = e.lon), e.lat && (this.ports.GPS.data.lat = e.lat), this.ports.GPS.data;
  }
  sendMessage(e) {
    e == "bms-restart" ? (this.stopMCU(), this.initMCU()) : e == "bms-data" ? this.callback(e, this.ports.MCU.data) : e == "gps-data" && this.callback(e, this.ports.GPS.data);
  }
}
function w(t = "/", e, r) {
  let i = new y({
    width: 1420,
    height: 900,
    title: e,
    icon: r,
    webPreferences: {
      nodeIntegration: !0,
      contextIsolation: !1
    },
    autoHideMenuBar: !0
  });
  return i.loadURL(`${process.env.VITE_DEV_SERVER_URL}/#${t}`), i;
}
S.whenReady().then(() => {
  let t = {
    MCU: {
      path: "/dev/ttyUSB0",
      baudRate: 115200
    },
    GPS: {
      path: "/dev/ttyAMA0"
    }
  }, e = w("/", "main", "../assets/dashboard.ico");
  w("/cameras", "cameras", "/cameras.ico");
  let r = new N(t, console);
  r.callback = (i, o) => {
    e.webContents.send(i, o);
  }, m.on("gps-data", () => {
    r.sendMessage("gps-data");
  }), m.on("bms-data", () => {
    r.sendMessage("bms-data");
  }), m.on("bms-restart", () => {
    r.sendMessage("bms-restart");
  }), r.start();
});
S.on("window-all-closed", () => {
  S.quit();
});
