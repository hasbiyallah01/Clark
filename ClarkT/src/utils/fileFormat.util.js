"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFileSize = void 0;
const formatFileSize = (bytes) => {
    if (bytes >= 1024 ** 2) {
        return `${(bytes / (1024 ** 2)).toFixed(2)} MB`;
    }
    else if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }
    else {
        return `${bytes} B`;
    }
};
exports.formatFileSize = formatFileSize;
