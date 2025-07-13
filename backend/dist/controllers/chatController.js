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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLLMResponse = exports.getBranchesForUser = exports.getUser = exports.createBranch = exports.generateBranchTitle = exports.setBranchTitle = exports.deleteBranch = exports.getBranchParent = exports.setBranchParent = exports.appendMessageToBranch = exports.getMessagesForBranch = void 0;
exports.default = getCompletion;
const client_1 = require("@prisma/client");
const express_1 = require("@clerk/express");
require("dotenv/config");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function getCompletion(_a) {
    return __awaiter(this, arguments, void 0, function* ({ messages }) {
        const completion = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...messages,
            ],
        });
        return completion;
    });
}
const prisma = new client_1.PrismaClient();
const getMessagesForBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const branchId = req.params.branchId;
    try {
        const branch = yield prisma.branch.findUnique({
            where: { id: branchId },
            select: { messages: true }
        });
        if (!branch) {
            res.status(404).json({ error: "Branch not found" });
            return;
        }
        res.json((_a = branch.messages) !== null && _a !== void 0 ? _a : []);
    }
    catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
        return;
    }
});
exports.getMessagesForBranch = getMessagesForBranch;
const appendMessageToBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const branchId = req.params.branchId;
    const newMessage = req.body.message; // should be { role: 'user' | 'assistant' | 'system', content: '...' }
    try {
        const branch = yield prisma.branch.findUnique({
            where: { id: branchId },
            select: { messages: true }
        });
        const currentMessages = Array.isArray(branch === null || branch === void 0 ? void 0 : branch.messages) ? branch.messages : [];
        const updatedMessages = [...currentMessages, newMessage];
        const updatedBranch = yield prisma.branch.update({
            where: { id: branchId },
            data: { messages: updatedMessages }
        });
        res.json(updatedBranch.messages);
    }
    catch (err) {
        console.error('Failed to append message:', err);
        res.status(500).json({ error: 'Failed to append message' });
        return;
    }
});
exports.appendMessageToBranch = appendMessageToBranch;
const setBranchParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { childId, parentId } = req.body;
    const updatedBranch = yield prisma.branch.update({
        where: { id: childId },
        data: { parentId: parentId }
    });
    res.json(updatedBranch);
    return;
});
exports.setBranchParent = setBranchParent;
const getBranchParent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const branchId = req.params.branchId;
    const branch = yield prisma.branch.findUnique({
        where: { id: branchId },
        include: { parent: true }
    });
    res.json(branch === null || branch === void 0 ? void 0 : branch.parent);
    return;
});
exports.getBranchParent = getBranchParent;
const deleteBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const branchId = req.params.branchId;
    const deleteBranch = yield prisma.branch.delete({
        where: {
            id: branchId
        }
    });
    res.json(deleteBranch);
    return;
});
exports.deleteBranch = deleteBranch;
const setBranchTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { branchId } = req.params;
        const { title } = req.body;
        const updatedBranch = yield prisma.branch.update({
            where: { id: branchId },
            data: { name: title }
        });
        res.json(updatedBranch);
    }
    catch (err) {
        console.error('Error setting branch title:', err);
        res.status(500).json({ error: 'Failed to set branch title' });
        return;
    }
});
exports.setBranchTitle = setBranchTitle;
const generateBranchTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        const { branchId } = req.params;
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            res.status(401).json({ error: 'Not signed in' });
            return;
        }
        const branch = yield prisma.branch.findUnique({
            where: { id: branchId },
            select: { messages: true }
        });
        if (!branch || !Array.isArray(branch.messages) || branch.messages.length === 0) {
            res.status(404).json({ error: "Branch not found or has no messages" });
            return;
        }
        // Take the first 4 messages to generate a title
        const messagesForTitle = branch.messages.slice(0, 4);
        const titlePrompt = {
            role: 'system',
            content: "Summarize the following conversation in 5 words or less to be used as a title. Be concise and descriptive. Do not use quotes."
        };
        const response = yield getCompletion({ messages: [titlePrompt, ...messagesForTitle] });
        const title = (_d = (_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim().replace(/["']/g, "")) !== null && _d !== void 0 ? _d : "New Title";
        // Deduct credits for title generation
        const costPerMillionInputTokens = 0.15;
        const costPerMillionOutputTokens = 0.60;
        const promptTokens = (_f = (_e = response.usage) === null || _e === void 0 ? void 0 : _e.prompt_tokens) !== null && _f !== void 0 ? _f : 0;
        const completionTokens = (_h = (_g = response.usage) === null || _g === void 0 ? void 0 : _g.completion_tokens) !== null && _h !== void 0 ? _h : 0;
        const cost = (promptTokens / 1000000) * costPerMillionInputTokens +
            (completionTokens / 1000000) * costPerMillionOutputTokens;
        yield prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: cost } },
        });
        const updatedBranch = yield prisma.branch.update({
            where: { id: branchId },
            data: { name: title }
        });
        const updatedUser = yield prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        res.json({ updatedBranch, remainingCredits: updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.credits });
    }
    catch (err) {
        console.error('Error generating branch title:', err);
        res.status(500).json({ error: 'Failed to generate branch title' });
        return;
    }
});
exports.generateBranchTitle = generateBranchTitle;
const createBranch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { branchId, name = 'New Branch' } = req.body;
        console.log('Attempting to create branch:', { branchId, name });
        // Get authenticated user
        const { userId } = (0, express_1.getAuth)(req);
        if (!userId) {
            res.status(401).json({ error: 'Not signed in' });
            return;
        }
        // Ensure user exists in local DB
        const clerkUser = yield express_1.clerkClient.users.getUser(userId);
        const email = ((_a = clerkUser.emailAddresses[0]) === null || _a === void 0 ? void 0 : _a.emailAddress) || "";
        yield prisma.user.upsert({
            where: { id: userId },
            update: { email },
            create: { id: userId, email }
        });
        const branch = yield prisma.branch.create({
            data: {
                id: branchId,
                name,
                user: { connect: { id: userId } }
            }
        });
        res.json(branch);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error('Error creating branch:', {
                message: err.message,
                code: err instanceof client_1.Prisma.PrismaClientKnownRequestError ? err.code : undefined,
                stack: err.stack
            });
        }
        res.status(500).json({ error: 'Failed to create branch' });
        return;
    }
});
exports.createBranch = createBranch;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = (0, express_1.getAuth)(req);
    if (!userId) {
        res.status(401).json({ error: 'Not signed in' });
        return;
    }
    try {
        let user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            const clerkUser = yield express_1.clerkClient.users.getUser(userId);
            const email = ((_a = clerkUser.emailAddresses[0]) === null || _a === void 0 ? void 0 : _a.emailAddress) || "";
            user = yield prisma.user.upsert({
                where: { id: userId },
                update: { email, name: clerkUser.firstName },
                create: { id: userId, email, name: clerkUser.firstName },
            });
        }
        res.json(user);
    }
    catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
exports.getUser = getUser;
const getBranchesForUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_1.getAuth)(req);
    if (!userId) {
        res.status(401).json({ error: 'Not signed in' });
        return;
    }
    try {
        const branches = yield prisma.branch.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                parentId: true,
                messages: true
            }
        });
        res.json(branches);
    }
    catch (err) {
        console.error('Error fetching branches:', err);
        res.status(500).json({ error: 'Failed to fetch branches' });
    }
});
exports.getBranchesForUser = getBranchesForUser;
const getLLMResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e, _f;
    const { messages } = req.body;
    const { userId } = (0, express_1.getAuth)(req);
    if (!userId) {
        res.status(401).json({ error: 'Not signed in' });
        return;
    }
    const user = yield prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    if (user.credits <= 0) {
        res.status(403).json({ error: "Out of credits" });
        return;
    }
    try {
        // Set up Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': process.env.CLIENT_ORIGIN || 'http://localhost:3000',
            'Access-Control-Allow-Credentials': 'true',
        });
        const stream = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                ...messages,
            ],
            stream: true,
        });
        let fullContent = '';
        let promptTokens = 0;
        let completionTokens = 0;
        try {
            for (var _g = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _g = true) {
                _c = stream_1_1.value;
                _g = false;
                const chunk = _c;
                const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || '';
                if (content) {
                    fullContent += content;
                    res.write(`data: ${JSON.stringify({ content, type: 'content' })}\n\n`);
                }
                // Track usage if available
                if (chunk.usage) {
                    promptTokens = chunk.usage.prompt_tokens || 0;
                    completionTokens = chunk.usage.completion_tokens || 0;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_g && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Calculate cost and deduct credits
        const costPerMillionInputTokens = 0.15;
        const costPerMillionOutputTokens = 0.60;
        const cost = (promptTokens / 1000000) * costPerMillionInputTokens +
            (completionTokens / 1000000) * costPerMillionOutputTokens;
        yield prisma.user.update({
            where: { id: userId },
            data: {
                credits: { decrement: cost },
            },
        });
        const updatedUser = yield prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        // Send final message with credits
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            credits: (_f = updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.credits) !== null && _f !== void 0 ? _f : 0,
            fullContent
        })}\n\n`);
        res.end();
    }
    catch (err) {
        console.error("Error in getLLMResponse:", err);
        res.write(`data: ${JSON.stringify({ type: 'error', error: 'LLM failed' })}\n\n`);
        res.end();
    }
});
exports.getLLMResponse = getLLMResponse;
