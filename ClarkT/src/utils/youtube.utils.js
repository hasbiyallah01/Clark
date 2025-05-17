"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractYouTubeId = void 0;
const extractYouTubeId = (url) => {
    var _a, _b, _c;
    let id = null;
    const normalLinkRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)([\w-]{11})/;
    const shortLinkRegex = /(?:https?:\/\/)?youtu\.be\/([\w-]{11})/;
    const shortsLinkRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([\w-]{11})/;
    if (normalLinkRegex.test(url)) {
        id = (_a = url.match(normalLinkRegex)) === null || _a === void 0 ? void 0 : _a[1];
    }
    else if (shortLinkRegex.test(url)) {
        id = (_b = url.match(shortLinkRegex)) === null || _b === void 0 ? void 0 : _b[1];
    }
    else if (shortsLinkRegex.test(url)) {
        id = (_c = url.match(shortsLinkRegex)) === null || _c === void 0 ? void 0 : _c[1];
    }
    return id;
};
exports.extractYouTubeId = extractYouTubeId;
