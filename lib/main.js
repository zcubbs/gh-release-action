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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
async function run() {
    try {
        const major = core.getInput('major', { required: true });
        const minor = core.getInput('minor', { required: true });
        const token = core.getInput('github-token', { required: true });
        const octokit = github.getOctokit(token);
        const { data: tags } = await octokit.rest.repos.listTags({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });
        const semVerRegExp = new RegExp(`^v${major}\\.${minor}\\.(\\d+)$`);
        const patchVersions = tags
            .map(tag => {
            const match = semVerRegExp.exec(tag.name);
            return match ? parseInt(match[1], 10) : null;
        })
            .filter((patch) => patch !== null) // Using type guard
            .sort((a, b) => b - a);
        let patch = patchVersions.length > 0 ? patchVersions[0] + 1 : 0;
        const newTag = `v${major}.${minor}.${patch}`;
        core.setOutput('new-version', newTag);
        await octokit.rest.git.createRef({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref: `refs/tags/${newTag}`,
            sha: github.context.sha,
        });
        core.info(`New tag ${newTag} created successfully`);
    }
    catch (error) {
        core.setFailed(`An error occurred: ${error instanceof Error ? error.message : "unknown error"}`);
    }
}
run().catch(error => {
    core.setFailed(`Unhandled error occurred: ${error}`);
});
