"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _navigation = require("./navigation");
Object.keys(_navigation).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _navigation[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _navigation[key];
    }
  });
});
var _navigationView = require("./navigationView");
Object.keys(_navigationView).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _navigationView[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _navigationView[key];
    }
  });
});
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
//# sourceMappingURL=index.js.map