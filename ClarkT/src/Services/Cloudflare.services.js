"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const r2 = new aws_sdk_1.default.S3({
    endpoint: process.env.R2_ENDPOINT,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
    region: "auto"
});
function uploadFile(workspace_id, bucketName, fileName, buffer, mimeType) {
    return __awaiter(this, void 0, void 0, function* () {
        yield r2
            .putObject({
            Bucket: 'clark',
            Key: `${workspace_id}/${fileName}`,
            Body: buffer,
            ContentType: mimeType,
            ACL: "public-read" // Optional: use with Cloudflare Pages/Workers to avoid egress cost
        })
            .promise();
        return `https://${process.env.R2_ENDPOINT_DOMAIN}/${bucketName}/${fileName}`;
    });
}
