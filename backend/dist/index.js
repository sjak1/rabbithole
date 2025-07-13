"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const chatController_1 = require("./controllers/chatController");
const express_2 = require("@clerk/express");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
// User
app.get('/api/user', (0, express_2.requireAuth)(), chatController_1.getUser);
// Branch
app.post('/branch', (0, express_2.requireAuth)(), chatController_1.createBranch);
app.get('/branches', (0, express_2.requireAuth)(), chatController_1.getBranchesForUser);
app.delete('/branch/:id', (0, express_2.requireAuth)(), chatController_1.deleteBranch);
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});
app.get('/messages/:branchId', (0, express_2.requireAuth)(), chatController_1.getMessagesForBranch);
app.post('/messages/:branchId', (0, express_2.requireAuth)(), chatController_1.appendMessageToBranch);
app.get('/parent/:branchId', (0, express_2.requireAuth)(), chatController_1.getBranchParent);
app.post('/parent/:branchId', (0, express_2.requireAuth)(), chatController_1.setBranchParent);
app.post('/title/:branchId', (0, express_2.requireAuth)(), chatController_1.setBranchTitle);
app.post('/title/generate/:branchId', (0, express_2.requireAuth)(), chatController_1.generateBranchTitle);
app.listen(4000, () => {
    console.log("Express server is running on port 4000");
});
