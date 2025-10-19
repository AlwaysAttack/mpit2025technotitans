"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
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
var _useNavigationAuto = require("./useNavigationAuto");
Object.keys(_useNavigationAuto).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useNavigationAuto[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _useNavigationAuto[key];
    }
  });
});
//# sourceMappingURL=index.js.map