import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";
import xss from "xss";

// Keys that should not be allowed in objects
const dangerousKeys = ["__proto__", "prototype", "constructor"];

function sanitizeValue(value: any): any {
  if (typeof value === "string") {
    const clean = xss(sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }));
    return clean.trim();
  } else if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  } else if (typeof value === "object" && value !== null) {
    return sanitizeObject(value);
  }
  return value;
}

function sanitizeObject(obj: any): any {
  const sanitizedObj: any = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    // Skip dangerous keys to prevent prototype pollution
    if (dangerousKeys.includes(key)) continue;
    sanitizedObj[key] = sanitizeValue(obj[key]);
  }
  return sanitizedObj;
}

export function sanitizeRequestBody(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  next();
}
