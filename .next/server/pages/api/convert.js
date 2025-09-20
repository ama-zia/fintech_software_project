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

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\nasync function handler(req, res) {\n    const from = String(req.query.from || \"USD\").toUpperCase();\n    const to = String(req.query.to || \"USD\").toUpperCase();\n    const amount = Number(req.query.amount ?? 1);\n    // Free Currency API key (you would typically store this in an environment variable)\n    const API_KEY = \"fca_live_90t5v5v1e9e0v3c3b0v5b9v1c9v5b9b1e9t9b1b4\";\n    try {\n        const r = await fetch(`https://api.freecurrencyapi.com/v1/latest?apikey=${API_KEY}&currencies=${to}&base_currency=${from}`);\n        const json = await r.json();\n        // Check if the API response is valid and contains the conversion rate\n        if (json.data && json.data[to]) {\n            const rate = json.data[to];\n            const result = amount * rate;\n            res.status(200).json({\n                result\n            });\n        } else {\n            console.error(\"Currency API error: Invalid response data\", json);\n            res.status(200).json({\n                result: amount\n            }); // Fallback to original amount on error\n        }\n    } catch (err) {\n        console.error(\"convert API error:\", err);\n        res.status(500).json({\n            error: \"Failed to fetch conversion rate.\"\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvY29udmVydC50cyIsIm1hcHBpbmdzIjoiOzs7O0FBRWUsZUFBZUEsUUFBUUMsR0FBbUIsRUFBRUMsR0FBb0I7SUFDN0UsTUFBTUMsT0FBT0MsT0FBT0gsSUFBSUksS0FBSyxDQUFDRixJQUFJLElBQUksT0FBT0csV0FBVztJQUN4RCxNQUFNQyxLQUFLSCxPQUFPSCxJQUFJSSxLQUFLLENBQUNFLEVBQUUsSUFBSSxPQUFPRCxXQUFXO0lBQ3BELE1BQU1FLFNBQVNDLE9BQU9SLElBQUlJLEtBQUssQ0FBQ0csTUFBTSxJQUFJO0lBRTFDLG9GQUFvRjtJQUNwRixNQUFNRSxVQUFVO0lBRWhCLElBQUk7UUFDRixNQUFNQyxJQUFJLE1BQU1DLE1BQU0sQ0FBQyxpREFBaUQsRUFBRUYsUUFBUSxZQUFZLEVBQUVILEdBQUcsZUFBZSxFQUFFSixLQUFLLENBQUM7UUFDMUgsTUFBTVUsT0FBTyxNQUFNRixFQUFFRSxJQUFJO1FBRXpCLHNFQUFzRTtRQUN0RSxJQUFJQSxLQUFLQyxJQUFJLElBQUlELEtBQUtDLElBQUksQ0FBQ1AsR0FBRyxFQUFFO1lBQzlCLE1BQU1RLE9BQU9GLEtBQUtDLElBQUksQ0FBQ1AsR0FBRztZQUMxQixNQUFNUyxTQUFTUixTQUFTTztZQUN4QmIsSUFBSWUsTUFBTSxDQUFDLEtBQUtKLElBQUksQ0FBQztnQkFBRUc7WUFBTztRQUNoQyxPQUFPO1lBQ0xFLFFBQVFDLEtBQUssQ0FBQyw2Q0FBNkNOO1lBQzNEWCxJQUFJZSxNQUFNLENBQUMsS0FBS0osSUFBSSxDQUFDO2dCQUFFRyxRQUFRUjtZQUFPLElBQUksdUNBQXVDO1FBQ25GO0lBQ0YsRUFBRSxPQUFPWSxLQUFLO1FBQ1pGLFFBQVFDLEtBQUssQ0FBQyxzQkFBc0JDO1FBQ3BDbEIsSUFBSWUsTUFBTSxDQUFDLEtBQUtKLElBQUksQ0FBQztZQUFFTSxPQUFPO1FBQW1DO0lBQ25FO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9maW5hbmNpYWwtZGlnaXRhbC10d2luLy4vcGFnZXMvYXBpL2NvbnZlcnQudHM/MDgyYSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5leHRBcGlSZXF1ZXN0LCBOZXh0QXBpUmVzcG9uc2UgfSBmcm9tIFwibmV4dFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXE6IE5leHRBcGlSZXF1ZXN0LCByZXM6IE5leHRBcGlSZXNwb25zZSkge1xyXG4gIGNvbnN0IGZyb20gPSBTdHJpbmcocmVxLnF1ZXJ5LmZyb20gfHwgXCJVU0RcIikudG9VcHBlckNhc2UoKTtcclxuICBjb25zdCB0byA9IFN0cmluZyhyZXEucXVlcnkudG8gfHwgXCJVU0RcIikudG9VcHBlckNhc2UoKTtcclxuICBjb25zdCBhbW91bnQgPSBOdW1iZXIocmVxLnF1ZXJ5LmFtb3VudCA/PyAxKTtcclxuXHJcbiAgLy8gRnJlZSBDdXJyZW5jeSBBUEkga2V5ICh5b3Ugd291bGQgdHlwaWNhbGx5IHN0b3JlIHRoaXMgaW4gYW4gZW52aXJvbm1lbnQgdmFyaWFibGUpXHJcbiAgY29uc3QgQVBJX0tFWSA9IFwiZmNhX2xpdmVfOTB0NXY1djFlOWUwdjNjM2IwdjViOXYxYzl2NWI5YjFlOXQ5YjFiNFwiO1xyXG4gIFxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vYXBpLmZyZWVjdXJyZW5jeWFwaS5jb20vdjEvbGF0ZXN0P2FwaWtleT0ke0FQSV9LRVl9JmN1cnJlbmNpZXM9JHt0b30mYmFzZV9jdXJyZW5jeT0ke2Zyb219YCk7XHJcbiAgICBjb25zdCBqc29uID0gYXdhaXQgci5qc29uKCk7XHJcbiAgICBcclxuICAgIC8vIENoZWNrIGlmIHRoZSBBUEkgcmVzcG9uc2UgaXMgdmFsaWQgYW5kIGNvbnRhaW5zIHRoZSBjb252ZXJzaW9uIHJhdGVcclxuICAgIGlmIChqc29uLmRhdGEgJiYganNvbi5kYXRhW3RvXSkge1xyXG4gICAgICBjb25zdCByYXRlID0ganNvbi5kYXRhW3RvXTtcclxuICAgICAgY29uc3QgcmVzdWx0ID0gYW1vdW50ICogcmF0ZTtcclxuICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyByZXN1bHQgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiQ3VycmVuY3kgQVBJIGVycm9yOiBJbnZhbGlkIHJlc3BvbnNlIGRhdGFcIiwganNvbik7XHJcbiAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgcmVzdWx0OiBhbW91bnQgfSk7IC8vIEZhbGxiYWNrIHRvIG9yaWdpbmFsIGFtb3VudCBvbiBlcnJvclxyXG4gICAgfVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS5lcnJvcihcImNvbnZlcnQgQVBJIGVycm9yOlwiLCBlcnIpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBlcnJvcjogXCJGYWlsZWQgdG8gZmV0Y2ggY29udmVyc2lvbiByYXRlLlwiIH0pO1xyXG4gIH1cclxufSJdLCJuYW1lcyI6WyJoYW5kbGVyIiwicmVxIiwicmVzIiwiZnJvbSIsIlN0cmluZyIsInF1ZXJ5IiwidG9VcHBlckNhc2UiLCJ0byIsImFtb3VudCIsIk51bWJlciIsIkFQSV9LRVkiLCJyIiwiZmV0Y2giLCJqc29uIiwiZGF0YSIsInJhdGUiLCJyZXN1bHQiLCJzdGF0dXMiLCJjb25zb2xlIiwiZXJyb3IiLCJlcnIiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(api)/./pages/api/convert.ts\n");

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