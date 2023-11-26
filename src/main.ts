import * as core from '@actions/core';
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils'; // Import the Octokit instance type
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods"; // Import the types for endpoint methods

type ListTagsResponse = RestEndpointMethodTypes['repos']['listTags']['response'];

async function run(): Promise<void> {
    try {
        const major: string = core.getInput('major', { required: true });
        const minor: string = core.getInput('minor', { required: true });
        const token: string = core.getInput('github-token', { required: true });

        const octokit: InstanceType<typeof GitHub> = github.getOctokit(token);

        const { data: tags }: ListTagsResponse = await octokit.rest.repos.listTags({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
        });

        const semVerRegExp: RegExp = new RegExp(`^v${major}\\.${minor}\\.(\\d+)$`);

        const patchVersions: number[] = tags
            .map(tag => {
                const match = semVerRegExp.exec(tag.name);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter((patch): patch is number => patch !== null) // Using type guard
            .sort((a, b) => b - a);

        let patch: number = patchVersions.length > 0 ? patchVersions[0] + 1 : 0;

        const newTag: string = `v${major}.${minor}.${patch}`;
        core.setOutput('new-version', newTag);

        await octokit.rest.git.createRef({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            ref: `refs/tags/${newTag}`,
            sha: github.context.sha,
        });

        core.info(`New tag ${newTag} created successfully`);

    } catch (error) {
        core.setFailed(`An error occurred: ${error instanceof Error ? error.message : "unknown error"}`);
    }
}

run().catch(error => {
    core.setFailed(`Unhandled error occurred: ${error}`);
});
