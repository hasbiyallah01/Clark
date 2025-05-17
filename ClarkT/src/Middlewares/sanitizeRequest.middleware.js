"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeRequestBody = sanitizeRequestBody;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const xss_1 = __importDefault(require("xss"));
// Keys that should not be allowed in objects
const dangerousKeys = ["__proto__", "prototype", "constructor"];
function sanitizeValue(value) {
    if (typeof value === "string") {
        const clean = (0, xss_1.default)((0, sanitize_html_1.default)(value, { allowedTags: [], allowedAttributes: {} }));
        return clean.trim();
    }
    else if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }
    else if (typeof value === "object" && value !== null) {
        return sanitizeObject(value);
    }
    return value;
}
function sanitizeObject(obj) {
    const sanitizedObj = {};
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key))
            continue;
        // Skip dangerous keys to prevent prototype pollution
        if (dangerousKeys.includes(key))
            continue;
        sanitizedObj[key] = sanitizeValue(obj[key]);
    }
    return sanitizedObj;
}
function sanitizeRequestBody(req, res, next) {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeObject(req.body);
    }
    next();
}
