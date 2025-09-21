"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/convert";
exports.ids = ["pages/api/convert"];
exports.modules = {

/***/ "(api)/./pages/api/convert.ts":
/*!******************************!*\
  !*** ./pages/api/convert.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\nasync function handler(req, res) {\n    const from = String(req.query.from || \"USD\").toUpperCase();\n    const to = String(req.query.to || \"USD\").toUpperCase();\n    const amount = Number(req.query.amount ?? 1);\n    const API_KEY = process.env.FREECURRENCYAPI_KEY;\n    if (!API_KEY) {\n        return res.status(500).json({\n            error: \"Missing API key.\"\n        });\n    }\n    try {\n        const r = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=${to}&base_currency=${from}`);\n        const json = await r.json();\n        if (json.data && json.data[to]) {\n            const rate = json.data[to];\n            const result = amount * rate;\n            res.status(200).json({\n                result,\n                rate,\n                from,\n                to\n            });\n        } else {\n            console.error(\"Currency API error:\", json);\n            res.status(500).json({\n                error: \"Invalid response from currency API.\"\n            });\n        }\n    } catch (err) {\n        console.error(\"convert API error:\", err);\n        res.status(500).json({\n            error: \"Failed to fetch conversion rate.\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvY29udmVydC50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRWUsZUFBZUEsUUFBUUMsR0FBbUIsRUFBRUMsR0FBb0I7SUFDN0UsTUFBTUMsT0FBT0MsT0FBT0gsSUFBSUksS0FBSyxDQUFDRixJQUFJLElBQUksT0FBT0csV0FBVztJQUN4RCxNQUFNQyxLQUFLSCxPQUFPSCxJQUFJSSxLQUFLLENBQUNFLEVBQUUsSUFBSSxPQUFPRCxXQUFXO0lBQ3BELE1BQU1FLFNBQVNDLE9BQU9SLElBQUlJLEtBQUssQ0FBQ0csTUFBTSxJQUFJO0lBRTFDLE1BQU1FLFVBQVVDLFFBQVFDLEdBQUcsQ0FBQ0MsbUJBQW1CO0lBRS9DLElBQUksQ0FBQ0gsU0FBUztRQUNaLE9BQU9SLElBQUlZLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFtQjtJQUMxRDtJQUVBLElBQUk7UUFDRixNQUFNQyxJQUFJLE1BQU1DLE1BQ2QsQ0FBQyxpREFBaUQsRUFBRVIsUUFBUSxZQUFZLEVBQUVILEdBQUcsZUFBZSxFQUFFSixLQUFLLENBQUM7UUFFdEcsTUFBTVksT0FBTyxNQUFNRSxFQUFFRixJQUFJO1FBRXpCLElBQUlBLEtBQUtJLElBQUksSUFBSUosS0FBS0ksSUFBSSxDQUFDWixHQUFHLEVBQUU7WUFDOUIsTUFBTWEsT0FBT0wsS0FBS0ksSUFBSSxDQUFDWixHQUFHO1lBQzFCLE1BQU1jLFNBQVNiLFNBQVNZO1lBQ3hCbEIsSUFBSVksTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztnQkFBRU07Z0JBQVFEO2dCQUFNakI7Z0JBQU1JO1lBQUc7UUFDaEQsT0FBTztZQUNMZSxRQUFRTixLQUFLLENBQUMsdUJBQXVCRDtZQUNyQ2IsSUFBSVksTUFBTSxDQUFDLEtBQUtDLElBQUksQ0FBQztnQkFBRUMsT0FBTztZQUFzQztRQUN0RTtJQUNGLEVBQUUsT0FBT08sS0FBSztRQUNaRCxRQUFRTixLQUFLLENBQUMsc0JBQXNCTztRQUNwQ3JCLElBQUlZLE1BQU0sQ0FBQyxLQUFLQyxJQUFJLENBQUM7WUFBRUMsT0FBTztRQUFtQztJQUNuRTtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZmluYW5jaWFsLWRpZ2l0YWwtdHdpbi8uL3BhZ2VzL2FwaS9jb252ZXJ0LnRzPzA4MmEiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOZXh0QXBpUmVxdWVzdCwgTmV4dEFwaVJlc3BvbnNlIH0gZnJvbSBcIm5leHRcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIocmVxOiBOZXh0QXBpUmVxdWVzdCwgcmVzOiBOZXh0QXBpUmVzcG9uc2UpIHtcclxuICBjb25zdCBmcm9tID0gU3RyaW5nKHJlcS5xdWVyeS5mcm9tIHx8IFwiVVNEXCIpLnRvVXBwZXJDYXNlKCk7XHJcbiAgY29uc3QgdG8gPSBTdHJpbmcocmVxLnF1ZXJ5LnRvIHx8IFwiVVNEXCIpLnRvVXBwZXJDYXNlKCk7XHJcbiAgY29uc3QgYW1vdW50ID0gTnVtYmVyKHJlcS5xdWVyeS5hbW91bnQgPz8gMSk7XHJcblxyXG4gIGNvbnN0IEFQSV9LRVkgPSBwcm9jZXNzLmVudi5GUkVFQ1VSUkVOQ1lBUElfS0VZO1xyXG5cclxuICBpZiAoIUFQSV9LRVkpIHtcclxuICAgIHJldHVybiByZXMuc3RhdHVzKDUwMCkuanNvbih7IGVycm9yOiBcIk1pc3NpbmcgQVBJIGtleS5cIiB9KTtcclxuICB9XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgIGBodHRwczovL2FwaS5mcmVlY3VycmVuY3lhcGkuY29tL3YxL2xhdGVzdD9hcGlrZXk9JHtBUElfS0VZfSZjdXJyZW5jaWVzPSR7dG99JmJhc2VfY3VycmVuY3k9JHtmcm9tfWBcclxuICAgICk7XHJcbiAgICBjb25zdCBqc29uID0gYXdhaXQgci5qc29uKCk7XHJcblxyXG4gICAgaWYgKGpzb24uZGF0YSAmJiBqc29uLmRhdGFbdG9dKSB7XHJcbiAgICAgIGNvbnN0IHJhdGUgPSBqc29uLmRhdGFbdG9dO1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhbW91bnQgKiByYXRlO1xyXG4gICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHJlc3VsdCwgcmF0ZSwgZnJvbSwgdG8gfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiQ3VycmVuY3kgQVBJIGVycm9yOlwiLCBqc29uKTtcclxuICAgICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJJbnZhbGlkIHJlc3BvbnNlIGZyb20gY3VycmVuY3kgQVBJLlwiIH0pO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS5lcnJvcihcImNvbnZlcnQgQVBJIGVycm9yOlwiLCBlcnIpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggY29udmVyc2lvbiByYXRlLlwiIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiaGFuZGxlciIsInJlcSIsInJlcyIsImZyb20iLCJTdHJpbmciLCJxdWVyeSIsInRvVXBwZXJDYXNlIiwidG8iLCJhbW91bnQiLCJOdW1iZXIiLCJBUElfS0VZIiwicHJvY2VzcyIsImVudiIsIkZSRUVDVVJSRU5DWUFQSV9LRVkiLCJzdGF0dXMiLCJqc29uIiwiZXJyb3IiLCJyIiwiZmV0Y2giLCJkYXRhIiwicmF0ZSIsInJlc3VsdCIsImNvbnNvbGUiLCJlcnIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/convert.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/convert.ts"));
module.exports = __webpack_exports__;

})();