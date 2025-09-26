var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// calendar-do.js
var CalendarDO = class {
  static {
    __name(this, "CalendarDO");
  }
  constructor(state, env2) {
    this.state = state;
    this.storage = state.storage;
    this.env = env2;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    try {
      if (url.pathname === "/add" && request.method === "POST") {
        return await this.handleAddEvent(request, corsHeaders);
      }
      if (url.pathname === "/list" && request.method === "GET") {
        return await this.handleListEvents(corsHeaders);
      }
      if (url.pathname.startsWith("/delete/") && request.method === "DELETE") {
        const eventId = url.pathname.split("/")[2];
        return await this.handleDeleteEvent(eventId, corsHeaders);
      }
      if (url.pathname.startsWith("/update/") && request.method === "PUT") {
        const eventId = url.pathname.split("/")[2];
        return await this.handleUpdateEvent(eventId, request, corsHeaders);
      }
      if (url.pathname === "/conflicts" && request.method === "POST") {
        return await this.handleCheckConflicts(request, corsHeaders);
      }
      return new Response(
        JSON.stringify({
          error: "Unknown DO endpoint",
          availableEndpoints: ["/add", "/list", "/delete/:id", "/update/:id", "/conflicts"]
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    } catch (error3) {
      console.error("DO Error:", error3);
      return new Response(
        JSON.stringify({
          error: "Internal DO error",
          message: error3.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
  async handleAddEvent(request, corsHeaders) {
    try {
      const eventData = await request.json();
      const validationResult = this.validateEvent(eventData);
      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: validationResult.error
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }
      const event = {
        id: this.generateEventId(),
        title: eventData.title,
        datetime: eventData.datetime,
        priority: eventData.priority || "medium",
        participants: eventData.participants || [],
        duration: eventData.duration || 60,
        location: eventData.location || null,
        description: eventData.description || null,
        created: (/* @__PURE__ */ new Date()).toISOString(),
        updated: (/* @__PURE__ */ new Date()).toISOString()
      };
      const conflicts = await this.checkConflicts(event);
      if (conflicts.length > 0 && !eventData.forceAdd) {
        return new Response(
          JSON.stringify({
            success: false,
            hasConflicts: true,
            conflicts,
            event,
            message: "Event conflicts detected. Add forceAdd: true to override."
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }
      await this.storage.put(`event:${event.id}`, event);
      const count3 = await this.getEventCount();
      await this.storage.put("eventCount", count3 + 1);
      return new Response(
        JSON.stringify({
          success: true,
          event,
          conflicts,
          message: conflicts.length > 0 ? "Event added despite conflicts" : "Event added successfully"
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    } catch (error3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to add event",
          details: error3.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
  async handleListEvents(corsHeaders) {
    try {
      const events = await this.getAllEvents();
      const count3 = await this.getEventCount();
      return new Response(
        JSON.stringify({
          success: true,
          events,
          count: count3,
          totalEvents: events.length
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    } catch (error3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to retrieve events",
          details: error3.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
  async handleDeleteEvent(eventId, corsHeaders) {
    try {
      const event = await this.storage.get(`event:${eventId}`);
      if (!event) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Event not found"
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }
      await this.storage.delete(`event:${eventId}`);
      const count3 = await this.getEventCount();
      await this.storage.put("eventCount", Math.max(0, count3 - 1));
      return new Response(
        JSON.stringify({
          success: true,
          deletedEvent: event,
          message: "Event deleted successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    } catch (error3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to delete event",
          details: error3.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
  async handleUpdateEvent(eventId, request, corsHeaders) {
    try {
      const updates = await request.json();
      const existingEvent = await this.storage.get(`event:${eventId}`);
      if (!existingEvent) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Event not found"
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }
      const updatedEvent = {
        ...existingEvent,
        ...updates,
        id: eventId,
        // Preserve ID
        created: existingEvent.created,
        // Preserve creation time
        updated: (/* @__PURE__ */ new Date()).toISOString()
      };
      const validationResult = this.validateEvent(updatedEvent);
      if (!validationResult.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: validationResult.error
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }
      await this.storage.put(`event:${eventId}`, updatedEvent);
      return new Response(
        JSON.stringify({
          success: true,
          event: updatedEvent,
          message: "Event updated successfully"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    } catch (error3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to update event",
          details: error3.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
  async handleCheckConflicts(request, corsHeaders) {
    try {
      const eventData = await request.json();
      const conflicts = await this.checkConflicts(eventData);
      return new Response(
        JSON.stringify({
          success: true,
          hasConflicts: conflicts.length > 0,
          conflicts
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    } catch (error3) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to check conflicts",
          details: error3.message
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }
  }
  async getAllEvents() {
    const events = [];
    const list = await this.storage.list({ prefix: "event:" });
    for (const [key, value] of list) {
      events.push(value);
    }
    return events.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  }
  async checkConflicts(newEvent) {
    const existingEvents = await this.getAllEvents();
    const conflicts = [];
    const newStart = new Date(newEvent.datetime);
    const newEnd = new Date(newStart.getTime() + (newEvent.duration || 60) * 6e4);
    for (const event of existingEvents) {
      if (event.id === newEvent.id) continue;
      const eventStart = new Date(event.datetime);
      const eventEnd = new Date(eventStart.getTime() + (event.duration || 60) * 6e4);
      if (newStart < eventEnd && newEnd > eventStart) {
        conflicts.push({
          conflictingEvent: event,
          overlapStart: new Date(Math.max(newStart, eventStart)).toISOString(),
          overlapEnd: new Date(Math.min(newEnd, eventEnd)).toISOString(),
          suggestion: this.generateConflictSuggestion(newEvent, event)
        });
      }
    }
    return conflicts;
  }
  generateConflictSuggestion(newEvent, conflictingEvent) {
    const suggestions = [];
    const conflictEnd = new Date(new Date(conflictingEvent.datetime).getTime() + (conflictingEvent.duration || 60) * 6e4);
    const afterTime = new Date(conflictEnd.getTime() + 15 * 6e4);
    suggestions.push(`Consider scheduling at ${afterTime.toLocaleTimeString()} instead`);
    const newDate = new Date(newEvent.datetime);
    const conflictDate = new Date(conflictingEvent.datetime);
    if (newDate.toDateString() === conflictDate.toDateString()) {
      const nextDay = new Date(newDate);
      nextDay.setDate(nextDay.getDate() + 1);
      suggestions.push(`Consider moving to ${nextDay.toLocaleDateString()}`);
    }
    return suggestions;
  }
  validateEvent(event) {
    if (!event.title || typeof event.title !== "string") {
      return { valid: false, error: "Event title is required and must be a string" };
    }
    if (!event.datetime) {
      return { valid: false, error: "Event datetime is required" };
    }
    const date = new Date(event.datetime);
    if (isNaN(date.getTime())) {
      return { valid: false, error: "Invalid datetime format" };
    }
    if (event.title.length > 200) {
      return { valid: false, error: "Event title too long (max 200 characters)" };
    }
    if (event.duration && (typeof event.duration !== "number" || event.duration <= 0 || event.duration > 1440)) {
      return { valid: false, error: "Duration must be a positive number <= 1440 minutes" };
    }
    return { valid: true };
  }
  async getEventCount() {
    const count3 = await this.storage.get("eventCount");
    return count3 || 0;
  }
  generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// index.js
var PROMPTS = {
  eventExtraction: {
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 512,
    temperature: 0.1,
    buildPrompt: /* @__PURE__ */ __name((userInput, currentDate = /* @__PURE__ */ new Date()) => {
      return `You are an expert calendar assistant. Extract structured event information from natural language.

Current date/time: ${currentDate.toISOString()}
User input: "${userInput}"

Extract the following information and respond ONLY with valid JSON:
{
  "success": true/false,
  "confidence": 0.0-1.0,
  "event": {
    "title": "brief descriptive title",
    "description": "optional longer description",
    "datetime": "ISO 8601 datetime string",
    "duration": minutes as number,
    "participants": ["name1", "name2"],
    "location": "location or null",
    "priority": "low/medium/high",
    "type": "meeting/appointment/meal/event/call",
    "urgency": "low/normal/high"
  },
  "ambiguities": ["list of unclear aspects"],
  "suggestions": ["alternative interpretations"]
}

Rules:
- For relative times like "tomorrow", "next Tuesday", calculate actual dates
- Default duration: meetings=30min, meals=60min, appointments=30min
- If time is ambiguous, suggest business hours (9am-5pm)
- Extract all mentioned people as participants
- Determine urgency from words like "urgent", "ASAP", "important"
- If information is missing or unclear, note in ambiguities

Examples:
Input: "Book lunch with Sarah tomorrow at 1pm"
Output: {"success":true,"confidence":0.95,"event":{"title":"Lunch with Sarah","datetime":"2024-09-26T13:00:00.000Z","duration":60,"participants":["Sarah"],"location":null,"priority":"medium","type":"meal","urgency":"normal"},"ambiguities":[],"suggestions":[]}

Now extract from: "${userInput}"`;
    }, "buildPrompt")
  },
  conversationClassification: {
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 256,
    temperature: 0.1,
    buildPrompt: /* @__PURE__ */ __name((userInput) => {
      return `Classify the user's intent for this calendar-related request.

User input: "${userInput}"

Respond ONLY with valid JSON:
{
  "intent": "create/query/modify/delete/conflict_check/general/help",
  "confidence": 0.0-1.0,
  "subtype": "specific action type",
  "entities": {
    "timeframe": "today/tomorrow/next week/specific date/null",
    "people": ["mentioned names"],
    "event_types": ["meeting/appointment/etc"],
    "keywords": ["important words"]
  },
  "requires_clarification": true/false,
  "suggested_response_type": "conversational/action/question"
}

Intent categories:
- create: wants to schedule/book/add/plan new event
- query: asking about schedule/events (what/when/show/list)
- modify: change/update/move/reschedule existing event
- delete: cancel/remove/clear events
- conflict_check: check for overlaps/conflicts/availability
- general: help/capabilities/general calendar discussion
- help: unclear intent or needs assistance

Examples:
"Book lunch tomorrow" \u2192 {"intent":"create","confidence":0.9}
"What's my schedule today?" \u2192 {"intent":"query","confidence":0.95}
"Do I have conflicts?" \u2192 {"intent":"conflict_check","confidence":0.9}
"Help me" \u2192 {"intent":"help","confidence":0.8}

Classify: "${userInput}"`;
    }, "buildPrompt")
  },
  naturalLanguageQuery: {
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 512,
    temperature: 0.2,
    buildPrompt: /* @__PURE__ */ __name((userQuery, events, currentDate) => {
      return `You are a helpful calendar assistant. Answer the user's question about their schedule.

Current date: ${currentDate.toISOString()}
User question: "${userQuery}"
User's events: ${JSON.stringify(events)}

Respond ONLY with valid JSON:
{
  "answer": "natural language response",
  "relevant_events": ["array of event IDs that match the query"],
  "summary": {
    "count": number,
    "timeframe": "description of time period",
    "highlights": ["key points about the schedule"]
  },
  "suggestions": ["helpful follow-up actions"],
  "confidence": 0.0-1.0
}

Query types to handle:
- Schedule overview: "What's my day like?"
- Specific searches: "Meetings with John"
- Time availability: "Am I free tomorrow afternoon?"
- Event details: "When is my next appointment?"
- Pattern analysis: "How busy am I this week?"

Be conversational, helpful, and specific. Include relevant details like times, participants, and locations.

Answer: "${userQuery}"`;
    }, "buildPrompt")
  },
  contextualConversation: {
    model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    maxTokens: 384,
    temperature: 0.4,
    buildPrompt: /* @__PURE__ */ __name((currentMessage, conversationHistory, userEvents) => {
      return `You are AutoCal, a friendly AI calendar assistant. Continue this conversation naturally.

Current message: "${currentMessage}"
User's events: ${JSON.stringify(userEvents)}

Respond ONLY with valid JSON:
{
  "response": "natural, helpful response",
  "action_needed": "none/create_event/modify_event/query_schedule/clarify",
  "follow_up_questions": ["questions to better help the user"],
  "suggestions": ["helpful next steps"],
  "tone": "friendly/professional/casual"
}

Guidelines:
- Be helpful and proactive in offering assistance
- Ask clarifying questions when needed
- Offer relevant suggestions based on their calendar
- Use a warm, professional tone

Continue the conversation for: "${currentMessage}"`;
    }, "buildPrompt")
  }
};
function validateAIResponse(response) {
  try {
    const parsed = JSON.parse(response);
    return { valid: true, data: parsed };
  } catch (error3) {
    return { valid: false, error: error3.message };
  }
}
__name(validateAIResponse, "validateAIResponse");
var index_default = {
  async fetch(request, env2, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-ID"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    try {
      const sessionId = getSessionId(request);
      if (url.pathname === "/api" || url.pathname === "/api/") {
        return new Response(
          JSON.stringify({
            message: "ok",
            status: "success",
            phase: 4,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            sessionId,
            ai_enabled: !!env2.AI,
            note: "Phase 4: AI-powered natural language processing with Llama 3.3"
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
      if (url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            status: "healthy",
            version: "1.0.0",
            phase: 4,
            uptime: Date.now(),
            ai_service: env2.AI ? "available" : "unavailable",
            features: ["cors", "chat-api", "durable-objects", "event-storage", "conflict-detection", "workers-ai", "llama-3.3"]
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
      if (url.pathname === "/api/chat") {
        if (request.method === "POST") {
          try {
            const body = await request.json();
            const validationResult = validateChatRequest(body);
            if (!validationResult.valid) {
              return new Response(
                JSON.stringify({
                  message: validationResult.error,
                  status: "error",
                  code: "VALIDATION_ERROR"
                }),
                {
                  status: 400,
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                }
              );
            }
            const response = await processCommandWithAI(body.command, body, sessionId, env2);
            return new Response(
              JSON.stringify({
                ...response,
                status: "success",
                phase: 4,
                timestamp: (/* @__PURE__ */ new Date()).toISOString(),
                sessionId,
                requestId: generateRequestId()
              }),
              {
                status: 200,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders
                }
              }
            );
          } catch (error3) {
            console.error("Chat API error:", error3);
            if (error3 instanceof SyntaxError) {
              return new Response(
                JSON.stringify({
                  message: "Invalid JSON in request body",
                  status: "error",
                  code: "INVALID_JSON"
                }),
                {
                  status: 400,
                  headers: {
                    "Content-Type": "application/json",
                    ...corsHeaders
                  }
                }
              );
            }
            return new Response(
              JSON.stringify({
                message: "Internal server error processing chat request",
                status: "error",
                code: "INTERNAL_ERROR",
                error: error3.message
              }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders
                }
              }
            );
          }
        }
        return new Response(
          JSON.stringify({
            message: "Method not allowed. Use POST for /api/chat",
            status: "error",
            code: "METHOD_NOT_ALLOWED",
            allowedMethods: ["POST"]
          }),
          {
            status: 405,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
      if (url.pathname.startsWith("/api/events")) {
        return await handleEventRequest(request, sessionId, env2, corsHeaders);
      }
      return new Response(
        JSON.stringify({
          message: "Endpoint not found",
          status: "error",
          code: "NOT_FOUND",
          availableEndpoints: ["/api", "/health", "/api/chat", "/api/events/*"]
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    } catch (error3) {
      console.error("Worker error:", error3);
      return new Response(
        JSON.stringify({
          message: "Internal server error",
          status: "error",
          code: "GLOBAL_ERROR",
          error: error3.message
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
  }
};
async function handleEventRequest(request, sessionId, env2, corsHeaders) {
  try {
    const calendarDO = getCalendarDO(sessionId, env2);
    const url = new URL(request.url);
    let doPath = url.pathname.replace("/api/events", "");
    if (doPath === "" || doPath === "/") {
      doPath = "/list";
    }
    const doUrl = new URL(`https://fake-host${doPath}`);
    doUrl.search = url.search;
    const doRequest = new Request(doUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null
    });
    return await calendarDO.fetch(doRequest);
  } catch (error3) {
    console.error("Event request error:", error3);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to process event request",
        details: error3.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
}
__name(handleEventRequest, "handleEventRequest");
async function processCommandWithStorage(command, requestData, sessionId, env2) {
  const trimmedCommand = command.trim().toLowerCase();
  const analysis = analyzeCommand(trimmedCommand);
  const response = {
    message: `\u{1F4AC} Processing: "${command}"`,
    originalCommand: command,
    commandLength: command.length,
    analysis,
    phase: 3,
    conversationType: determineConversationType(trimmedCommand)
  };
  const calendarDO = getCalendarDO(sessionId, env2);
  try {
    switch (response.conversationType) {
      case "create":
        return await handleEventCreation(command, analysis, calendarDO, response);
      case "query":
        return await handleEventQuery(trimmedCommand, calendarDO, response);
      case "modify":
        return await handleEventModification(trimmedCommand, calendarDO, response);
      case "delete":
        return await handleEventDeletion(trimmedCommand, calendarDO, response);
      case "conflict_check":
        return await handleConflictCheck(trimmedCommand, calendarDO, response);
      case "general":
        return await handleGeneralConversation(trimmedCommand, calendarDO, response);
      default:
        response.message = `\u{1F914} I understand you said "${command}" but I'm not sure how to help. Try asking about your events or creating new ones.`;
        response.suggestions = [
          "Ask: 'What's my schedule today?'",
          "Create: 'Book lunch tomorrow at 1pm'",
          "Check: 'Do I have any conflicts?'"
        ];
        return response;
    }
  } catch (error3) {
    console.error("Command processing error:", error3);
    response.message = `\u274C Error processing your request: ${error3.message}`;
    response.error = error3.message;
    return response;
  }
}
__name(processCommandWithStorage, "processCommandWithStorage");
function determineConversationType(command) {
  if (/\b(book|schedule|add|create|set up|plan|make)\b/.test(command) && (/\b(at|on|for|next|this|tomorrow|today)\b/.test(command) || /\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)/.test(command))) {
    return "create";
  }
  if (/\b(what|when|where|who|how|show|list|find|search|tell me|what's)\b/.test(command)) {
    return "query";
  }
  if (/\b(change|update|modify|move|reschedule|edit)\b/.test(command)) {
    return "modify";
  }
  if (/\b(delete|remove|cancel|clear)\b/.test(command)) {
    return "delete";
  }
  if (/\b(conflicts?|clash|overlap|busy|free|available)\b/.test(command)) {
    return "conflict_check";
  }
  if (/\b(calendar|schedule|event|appointment|meeting|plan)\b/.test(command)) {
    return "general";
  }
  return "unknown";
}
__name(determineConversationType, "determineConversationType");
async function handleEventCreation(command, analysis, calendarDO, response) {
  if (shouldCreateEvent(analysis, command.toLowerCase())) {
    const eventData = extractEventFromCommand(command, analysis);
    if (eventData) {
      const doRequest = new Request("https://fake-host/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });
      const doResponse = await calendarDO.fetch(doRequest);
      const result = await doResponse.json();
      if (result.success) {
        response.message = `\u2705 Great! I've created "${eventData.title}" for ${formatDateTime(eventData.datetime)}`;
        response.eventCreated = result.event;
        response.conflicts = result.conflicts || [];
        if (result.conflicts && result.conflicts.length > 0) {
          response.message += `
\u26A0\uFE0F Note: This conflicts with ${result.conflicts.length} other event${result.conflicts.length > 1 ? "s" : ""}. You can still keep it or let me suggest alternatives.`;
        }
      } else if (result.hasConflicts) {
        response.message = `\u{1F914} I can create "${eventData.title}" but it conflicts with existing events. Would you like me to suggest alternative times?`;
        response.eventData = eventData;
        response.conflicts = result.conflicts;
        response.canForceAdd = true;
      } else {
        response.message = `\u274C I couldn't create the event: ${result.error}`;
      }
    } else {
      response.message = `\u{1F914} I understand you want to create an event, but I need more details. Can you specify a time and date?`;
      response.suggestions = [
        "Try: 'Book lunch tomorrow at 1pm'",
        "Or: 'Schedule meeting with team Friday at 2pm'"
      ];
    }
  } else {
    response.message = `\u{1F914} It sounds like you want to create something, but I need more information. What would you like to schedule?`;
    response.suggestions = [
      "Include a time: 'at 2pm' or 'tomorrow'",
      "Be specific: 'Book lunch with Sam Friday at noon'"
    ];
  }
  return response;
}
__name(handleEventCreation, "handleEventCreation");
async function handleEventQuery(command, calendarDO, response) {
  const doRequest = new Request("https://fake-host/list", { method: "GET" });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  if (!result.success) {
    response.message = "\u274C I couldn't retrieve your events right now.";
    return response;
  }
  const events = result.events || [];
  if (/\b(today|today's)\b/.test(command)) {
    const todayEvents = filterEventsByDate(events, /* @__PURE__ */ new Date());
    response.message = formatEventsResponse(todayEvents, "today");
  } else if (/\b(tomorrow|tomorrow's)\b/.test(command)) {
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowEvents = filterEventsByDate(events, tomorrow);
    response.message = formatEventsResponse(tomorrowEvents, "tomorrow");
  } else if (/\b(week|this week)\b/.test(command)) {
    const weekEvents = filterEventsThisWeek(events);
    response.message = formatEventsResponse(weekEvents, "this week");
  } else if (/\b(next|upcoming)\b/.test(command)) {
    const upcomingEvents = events.slice(0, 5);
    response.message = formatEventsResponse(upcomingEvents, "upcoming");
  } else if (/\b(all|everything|schedule)\b/.test(command)) {
    response.message = formatEventsResponse(events, "all your events");
  } else if (/\b(with|participant)\b/.test(command)) {
    const participant = extractParticipantFromQuery(command);
    const participantEvents = filterEventsByParticipant(events, participant);
    response.message = formatEventsResponse(participantEvents, `events with ${participant}`);
  } else if (/\b(count|how many)\b/.test(command)) {
    response.message = `\u{1F4CA} You have ${events.length} event${events.length !== 1 ? "s" : ""} scheduled total.`;
  } else {
    response.message = formatEventsResponse(events, "your schedule");
  }
  response.events = events;
  return response;
}
__name(handleEventQuery, "handleEventQuery");
async function handleEventModification(command, calendarDO, response) {
  response.message = `\u{1F527} I can help you modify events! However, the full modification feature will be enhanced in Phase 4 with AI. For now, you can:`;
  response.suggestions = [
    "Delete the event and create a new one",
    "Tell me which event to change and I'll guide you",
    "Use the delete button (\u{1F5D1}\uFE0F) in the events list"
  ];
  if (/\b(lunch|meeting|appointment|dinner)\b/.test(command)) {
    const doRequest = new Request("https://fake-host/list", { method: "GET" });
    const doResponse = await calendarDO.fetch(doRequest);
    const result = await doResponse.json();
    if (result.success && result.events.length > 0) {
      response.message += `

\u{1F4C5} Here are your current events that might match:`;
      response.events = result.events;
    }
  }
  return response;
}
__name(handleEventModification, "handleEventModification");
async function handleEventDeletion(command, calendarDO, response) {
  response.message = `\u{1F5D1}\uFE0F I can help you delete events! You can:`;
  response.suggestions = [
    "Use the trash button (\u{1F5D1}\uFE0F) next to any event in the list",
    "Tell me specifically which event to delete",
    "Say 'delete my lunch meeting' for example"
  ];
  const doRequest = new Request("https://fake-host/list", { method: "GET" });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  if (result.success && result.events.length > 0) {
    response.message += `

\u{1F4C5} Your current events:`;
    response.events = result.events;
  } else {
    response.message = `\u{1F937} You don't have any events to delete right now.`;
  }
  return response;
}
__name(handleEventDeletion, "handleEventDeletion");
async function handleConflictCheck(command, calendarDO, response) {
  const doRequest = new Request("https://fake-host/list", { method: "GET" });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  if (!result.success) {
    response.message = "\u274C I couldn't check for conflicts right now.";
    return response;
  }
  const events = result.events || [];
  const conflicts = findExistingConflicts(events);
  if (conflicts.length === 0) {
    response.message = "\u2705 Great news! You don't have any scheduling conflicts.";
  } else {
    response.message = `\u26A0\uFE0F I found ${conflicts.length} scheduling conflict${conflicts.length > 1 ? "s" : ""}:`;
    response.conflicts = conflicts;
  }
  response.events = events;
  return response;
}
__name(handleConflictCheck, "handleConflictCheck");
async function handleGeneralConversation(command, calendarDO, response) {
  const doRequest = new Request("https://fake-host/list", { method: "GET" });
  const doResponse = await calendarDO.fetch(doRequest);
  const result = await doResponse.json();
  const events = result.success ? result.events || [] : [];
  response.message = `\u{1F4C5} I'm here to help with your calendar! You have ${events.length} event${events.length !== 1 ? "s" : ""} scheduled.`;
  if (events.length === 0) {
    response.message += ` Let's start by creating your first event!`;
    response.suggestions = [
      "Try: 'Book lunch tomorrow at 1pm'",
      "Or: 'Schedule meeting with team Friday'",
      "Ask: 'What can you help me with?'"
    ];
  } else {
    response.suggestions = [
      "Ask: 'What's my schedule today?'",
      "Create: 'Book dinner with friends Saturday'",
      "Check: 'Do I have any conflicts?'",
      "Query: 'Show me all my meetings'"
    ];
  }
  response.events = events;
  response.capabilities = [
    "Create events from natural language",
    "Check your schedule for any time period",
    "Detect and warn about conflicts",
    "Help manage your calendar efficiently"
  ];
  return response;
}
__name(handleGeneralConversation, "handleGeneralConversation");
function filterEventsByDate(events, targetDate) {
  const targetDateStr = targetDate.toDateString();
  return events.filter((event) => {
    const eventDate = new Date(event.datetime);
    return eventDate.toDateString() === targetDateStr;
  });
}
__name(filterEventsByDate, "filterEventsByDate");
function filterEventsThisWeek(events) {
  const now = /* @__PURE__ */ new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return events.filter((event) => {
    const eventDate = new Date(event.datetime);
    return eventDate >= weekStart && eventDate < weekEnd;
  });
}
__name(filterEventsThisWeek, "filterEventsThisWeek");
function filterEventsByParticipant(events, participant) {
  if (!participant) return [];
  return events.filter(
    (event) => event.participants && event.participants.some(
      (p) => p.toLowerCase().includes(participant.toLowerCase())
    )
  );
}
__name(filterEventsByParticipant, "filterEventsByParticipant");
function extractParticipantFromQuery(command) {
  const withMatch = command.match(/with\s+([a-zA-Z]+)/);
  return withMatch ? withMatch[1] : "";
}
__name(extractParticipantFromQuery, "extractParticipantFromQuery");
function formatEventsResponse(events, timeframe) {
  if (events.length === 0) {
    return `\u{1F4C5} You don't have any events ${timeframe}.`;
  }
  let message = `\u{1F4C5} Here's ${timeframe} (${events.length} event${events.length !== 1 ? "s" : ""}):

`;
  events.forEach((event) => {
    const date = new Date(event.datetime);
    const timeStr = date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    message += `\u2022 ${event.title} - ${timeStr}`;
    if (event.participants && event.participants.length > 0) {
      message += ` (with ${event.participants.join(", ")})`;
    }
    message += "\n";
  });
  return message.trim();
}
__name(formatEventsResponse, "formatEventsResponse");
function findExistingConflicts(events) {
  const conflicts = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const event1 = events[i];
      const event2 = events[j];
      const start1 = new Date(event1.datetime);
      const end1 = new Date(start1.getTime() + (event1.duration || 60) * 6e4);
      const start2 = new Date(event2.datetime);
      const end2 = new Date(start2.getTime() + (event2.duration || 60) * 6e4);
      if (start1 < end2 && start2 < end1) {
        conflicts.push({
          event1,
          event2,
          overlapStart: new Date(Math.max(start1, start2)).toISOString(),
          overlapEnd: new Date(Math.min(end1, end2)).toISOString()
        });
      }
    }
  }
  return conflicts;
}
__name(findExistingConflicts, "findExistingConflicts");
function formatDateTime(datetime) {
  return new Date(datetime).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
__name(formatDateTime, "formatDateTime");
function shouldCreateEvent(analysis, command) {
  const creationKeywords = ["book", "schedule", "add", "create", "set up", "plan"];
  const hasCreationKeyword = creationKeywords.some((keyword) => command.includes(keyword));
  return hasCreationKeyword && (analysis.hasTime || analysis.hasDate) && analysis.eventType !== "unknown";
}
__name(shouldCreateEvent, "shouldCreateEvent");
function extractEventFromCommand(command, analysis) {
  try {
    const title2 = extractTitle(command);
    const datetime = extractDateTime(command);
    if (!title2 || !datetime) {
      return null;
    }
    return {
      title: title2,
      datetime,
      priority: "medium",
      duration: analysis.eventType === "meal" ? 60 : 30,
      participants: extractParticipants(command)
    };
  } catch (error3) {
    console.error("Event extraction error:", error3);
    return null;
  }
}
__name(extractEventFromCommand, "extractEventFromCommand");
function extractTitle(command) {
  let title2 = command.replace(/^(book|schedule|add|create|set up|plan)\s+/i, "").replace(/\s+(at|on|for|with|next|this|tomorrow|today)\s+.*$/i, "").trim();
  if (title2.length === 0) {
    if (command.includes("lunch")) return "Lunch";
    if (command.includes("meeting")) return "Meeting";
    if (command.includes("call")) return "Call";
    if (command.includes("appointment")) return "Appointment";
    return "Event";
  }
  return title2.charAt(0).toUpperCase() + title2.slice(1);
}
__name(extractTitle, "extractTitle");
function extractDateTime(command) {
  const now = /* @__PURE__ */ new Date();
  const timeMatch = command.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i) || command.match(/(\d{1,2})\s*(am|pm)/i);
  let hour = 12;
  let minute = 0;
  if (timeMatch) {
    hour = parseInt(timeMatch[1]);
    minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    if (timeMatch[3] && timeMatch[3].toLowerCase() === "pm" && hour !== 12) {
      hour += 12;
    } else if (timeMatch[3] && timeMatch[3].toLowerCase() === "am" && hour === 12) {
      hour = 0;
    }
  }
  let targetDate = new Date(now);
  if (command.includes("tomorrow")) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (command.includes("next thursday") || command.includes("thursday")) {
    const daysUntilThursday = (4 - targetDate.getDay() + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + daysUntilThursday);
  } else if (command.includes("friday")) {
    const daysUntilFriday = (5 - targetDate.getDay() + 7) % 7 || 7;
    targetDate.setDate(targetDate.getDate() + daysUntilFriday);
  }
  targetDate.setHours(hour, minute, 0, 0);
  return targetDate.toISOString();
}
__name(extractDateTime, "extractDateTime");
function extractParticipants(command) {
  const participants = [];
  const withMatch = command.match(/with\s+([^at|on|for|next|this|tomorrow|today]+)/i);
  if (withMatch) {
    const names = withMatch[1].trim().split(/\s+and\s+|\s*,\s*/);
    participants.push(...names.filter((name) => name.length > 0));
  }
  return participants;
}
__name(extractParticipants, "extractParticipants");
function getCalendarDO(sessionId, env2) {
  const doId = env2.CALENDAR_DO.idFromName(sessionId);
  return env2.CALENDAR_DO.get(doId);
}
__name(getCalendarDO, "getCalendarDO");
function getSessionId(request) {
  let sessionId = request.headers.get("X-Session-ID");
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  return sessionId;
}
__name(getSessionId, "getSessionId");
function generateSessionId() {
  return "session_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
}
__name(generateSessionId, "generateSessionId");
function validateChatRequest(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body must be a JSON object" };
  }
  if (!body.command || typeof body.command !== "string") {
    return { valid: false, error: 'Missing or invalid "command" field' };
  }
  if (body.command.trim().length === 0) {
    return { valid: false, error: "Command cannot be empty" };
  }
  if (body.command.length > 1e3) {
    return { valid: false, error: "Command too long (max 1000 characters)" };
  }
  return { valid: true };
}
__name(validateChatRequest, "validateChatRequest");
function analyzeCommand(command) {
  const analysis = {
    wordCount: command.split(/\s+/).length,
    hasTime: /\d{1,2}:?\d{0,2}\s*(am|pm)|\d{1,2}:\d{2}/.test(command),
    hasDate: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|next|this)/.test(command),
    eventType: "unknown"
  };
  if (command.includes("lunch") || command.includes("dinner") || command.includes("breakfast")) {
    analysis.eventType = "meal";
  } else if (command.includes("meeting") || command.includes("call")) {
    analysis.eventType = "meeting";
  } else if (command.includes("appointment")) {
    analysis.eventType = "appointment";
  } else if (command.includes("book") || command.includes("schedule")) {
    analysis.eventType = "booking";
  }
  return analysis;
}
__name(analyzeCommand, "analyzeCommand");
function generateRequestId() {
  return Math.random().toString(36).substr(2, 9);
}
__name(generateRequestId, "generateRequestId");
async function processCommandWithAI(command, requestData, sessionId, env2) {
  if (env2.LOCAL_DEV_MODE === "true") {
    console.log("[LOCAL DEV] Bypassing AI, using Phase 3 processing");
    return await processCommandWithStorage(command, requestData, sessionId, env2);
  }
  const response = {
    message: `\u{1F9E0} AI Processing: "${command}"`,
    originalCommand: command,
    commandLength: command.length,
    phase: 4,
    ai_powered: true
  };
  try {
    const classificationResult = await classifyConversationWithAI(command, env2);
    response.classification = classificationResult;
    const calendarDO = getCalendarDO(sessionId, env2);
    switch (classificationResult.intent) {
      case "create":
        return await handleAIEventCreation(command, calendarDO, response, env2);
      case "query":
        return await handleAIQuery(command, calendarDO, response, env2);
      case "modify":
        return await handleAIModification(command, calendarDO, response, env2);
      case "delete":
        return await handleAIDeletion(command, calendarDO, response, env2);
      case "conflict_check":
        return await handleAIConflictCheck(command, calendarDO, response, env2);
      case "general":
      case "help":
        return await handleAIGeneralConversation(command, calendarDO, response, env2);
      default:
        console.warn("AI classification failed, falling back to Phase 3");
        return await processCommandWithStorage(command, requestData, sessionId, env2);
    }
  } catch (error3) {
    console.error("AI processing error:", error3);
    response.ai_error = error3.message;
    response.fallback_used = "phase_3_processing";
    response.message = `\u{1F916} AI processing failed, using basic parsing: ${error3.message}`;
    return await processCommandWithStorage(command, requestData, sessionId, env2);
  }
}
__name(processCommandWithAI, "processCommandWithAI");
async function classifyConversationWithAI(command, env2) {
  try {
    const prompt = PROMPTS.conversationClassification.buildPrompt(command);
    const aiResponse = await env2.AI.run(PROMPTS.conversationClassification.model, {
      prompt,
      max_tokens: PROMPTS.conversationClassification.maxTokens,
      temperature: PROMPTS.conversationClassification.temperature
    });
    const validation = validateAIResponse(aiResponse.response);
    if (!validation.valid) {
      throw new Error(`Invalid AI response: ${validation.error}`);
    }
    return validation.data;
  } catch (error3) {
    console.error("AI classification error:", error3);
    return {
      intent: determineConversationType(command.toLowerCase()),
      confidence: 0.5,
      fallback: "phase_3_classification",
      error: error3.message
    };
  }
}
__name(classifyConversationWithAI, "classifyConversationWithAI");
async function handleAIEventCreation(command, calendarDO, response, env2) {
  try {
    const extractionPrompt = PROMPTS.eventExtraction.buildPrompt(command);
    const aiResponse = await env2.AI.run(PROMPTS.eventExtraction.model, {
      prompt: extractionPrompt,
      max_tokens: PROMPTS.eventExtraction.maxTokens,
      temperature: PROMPTS.eventExtraction.temperature
    });
    const validation = validateAIResponse(aiResponse.response);
    if (!validation.valid) {
      throw new Error(`Invalid AI extraction response: ${validation.error}`);
    }
    const extractionResult = validation.data;
    if (!extractionResult.success || !extractionResult.event) {
      response.message = `\u{1F914} I understand you want to create an event, but I need more details. ${extractionResult.ambiguities ? extractionResult.ambiguities.join(", ") : ""}`;
      response.suggestions = extractionResult.suggestions || [
        "Try being more specific about time and date",
        "Include who should attend the event"
      ];
      response.ai_extraction = extractionResult;
      return response;
    }
    const eventData = {
      ...extractionResult.event,
      aiExtracted: true,
      aiConfidence: extractionResult.confidence,
      extractedFrom: command
    };
    const doRequest = new Request("https://fake-host/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData)
    });
    const doResponse = await calendarDO.fetch(doRequest);
    const result = await doResponse.json();
    if (result.success) {
      response.message = `\u2705 Perfect! I've created "${extractionResult.event.title}" for ${formatDateTime(extractionResult.event.datetime)}`;
      response.eventCreated = result.event;
      response.conflicts = result.conflicts || [];
      response.ai_extraction = extractionResult;
      if (result.conflicts && result.conflicts.length > 0) {
        const conflictSuggestions = await generateAIConflictSuggestions(
          extractionResult.event,
          result.conflicts,
          env2
        );
        response.ai_conflict_suggestions = conflictSuggestions;
        response.message += `
\u26A0\uFE0F I detected ${result.conflicts.length} scheduling conflict${result.conflicts.length > 1 ? "s" : ""}. Would you like me to suggest alternatives?`;
      }
    } else if (result.hasConflicts) {
      response.message = `\u{1F914} I can create "${extractionResult.event.title}" but it conflicts with existing events. Should I suggest alternative times?`;
      response.eventData = eventData;
      response.conflicts = result.conflicts;
      response.canForceAdd = true;
    } else {
      response.message = `\u274C I couldn't create the event: ${result.error}`;
      response.error = result.error;
    }
    return response;
  } catch (error3) {
    console.error("AI event creation error:", error3);
    return await handleEventCreation(command, analyzeCommand(command.toLowerCase()), calendarDO, response);
  }
}
__name(handleAIEventCreation, "handleAIEventCreation");
async function handleAIQuery(command, calendarDO, response, env2) {
  try {
    const doRequest = new Request("https://fake-host/list", { method: "GET" });
    const doResponse = await calendarDO.fetch(doRequest);
    const result = await doResponse.json();
    if (!result.success) {
      response.message = "\u274C I couldn't retrieve your events right now.";
      return response;
    }
    const events = result.events || [];
    const queryPrompt = PROMPTS.naturalLanguageQuery.buildPrompt(command, events, /* @__PURE__ */ new Date());
    const aiResponse = await env2.AI.run(PROMPTS.naturalLanguageQuery.model, {
      prompt: queryPrompt,
      max_tokens: PROMPTS.naturalLanguageQuery.maxTokens,
      temperature: PROMPTS.naturalLanguageQuery.temperature
    });
    const validation = validateAIResponse(aiResponse.response);
    if (!validation.valid) {
      throw new Error(`Invalid AI query response: ${validation.error}`);
    }
    const queryResult = validation.data;
    response.message = queryResult.answer;
    response.events = events;
    response.relevant_events = queryResult.relevant_events;
    response.ai_analysis = queryResult;
    response.suggestions = queryResult.suggestions;
    return response;
  } catch (error3) {
    console.error("AI query error:", error3);
    return await handleEventQuery(command.toLowerCase(), calendarDO, response);
  }
}
__name(handleAIQuery, "handleAIQuery");
async function handleAIGeneralConversation(command, calendarDO, response, env2) {
  try {
    const doRequest = new Request("https://fake-host/list", { method: "GET" });
    const doResponse = await calendarDO.fetch(doRequest);
    const result = await doResponse.json();
    const events = result.success ? result.events || [] : [];
    const conversationPrompt = PROMPTS.contextualConversation.buildPrompt(
      command,
      [],
      // TODO: Implement conversation history
      events
    );
    const aiResponse = await env2.AI.run(PROMPTS.contextualConversation.model, {
      prompt: conversationPrompt,
      max_tokens: PROMPTS.contextualConversation.maxTokens,
      temperature: PROMPTS.contextualConversation.temperature
    });
    const validation = validateAIResponse(aiResponse.response);
    if (!validation.valid) {
      throw new Error(`Invalid AI conversation response: ${validation.error}`);
    }
    const conversationResult = validation.data;
    response.message = conversationResult.response;
    response.events = events;
    response.suggestions = conversationResult.suggestions;
    response.follow_up_questions = conversationResult.follow_up_questions;
    response.ai_conversation = conversationResult;
    return response;
  } catch (error3) {
    console.error("AI conversation error:", error3);
    return await handleGeneralConversation(command.toLowerCase(), calendarDO, response);
  }
}
__name(handleAIGeneralConversation, "handleAIGeneralConversation");
async function generateAIConflictSuggestions(newEvent, conflicts, env2) {
  try {
    const conflictPrompt = PROMPTS.conflictResolution.buildPrompt(
      newEvent,
      conflicts,
      {}
      // TODO: Add user schedule context
    );
    const aiResponse = await env2.AI.run(PROMPTS.conflictResolution.model, {
      prompt: conflictPrompt,
      max_tokens: PROMPTS.conflictResolution.maxTokens,
      temperature: PROMPTS.conflictResolution.temperature
    });
    const validation = validateAIResponse(aiResponse.response);
    if (validation.valid) {
      return validation.data;
    }
  } catch (error3) {
    console.error("AI conflict resolution error:", error3);
  }
  return null;
}
__name(generateAIConflictSuggestions, "generateAIConflictSuggestions");
async function handleAIModification(command, calendarDO, response, env2) {
  response.message = `\u{1F527} AI-powered event modification coming soon! For now, you can delete and recreate events.`;
  response.note = "Phase 4 focuses on creation and querying. Modification will be enhanced in future updates.";
  return response;
}
__name(handleAIModification, "handleAIModification");
async function handleAIDeletion(command, calendarDO, response, env2) {
  response.message = `\u{1F5D1}\uFE0F AI-powered event deletion coming soon! For now, use the delete button (\u{1F5D1}\uFE0F) next to events.`;
  response.note = "Phase 4 focuses on creation and querying. Deletion will be enhanced in future updates.";
  return response;
}
__name(handleAIDeletion, "handleAIDeletion");
async function handleAIConflictCheck(command, calendarDO, response, env2) {
  return await handleAIQuery(command, calendarDO, response, env2);
}
__name(handleAIConflictCheck, "handleAIConflictCheck");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-0FZzJk/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-0FZzJk/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  CalendarDO,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
