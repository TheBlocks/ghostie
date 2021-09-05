const child_process = require("child_process");
const fs = require("fs");
const https = require("https");
const path = require("path");

const sanitize = require("sanitize-filename");

const core = require("@actions/core");
const github = require("@actions/github");


async function run() {
    const repoToken = core.getInput("repo-token");
    const client = github.getOctokit(repoToken);
    const issueNumber = getIssueNumber();
    const { data: issue } = await client.rest.issues.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: issueNumber,
    });

    const allowedUsers = core.getInput("allowed-users");
    if (issue.author_association !== allowedUsers.toUpperCase()) {
        console.log("User not allowed to upload content to repo.")
        return;
    }

    const body = issue.body;
    if (!body) {
        console.log(`No image or video found in body of issue #${issueNumber}.`);
        return;
    }

    const imagesFolder = core.getInput("image-folder");
    const videosFolder = core.getInput("video-folder");
    const miscFolder = core.getInput("misc-folder");
    if (!fs.existsSync(imagesFolder))
        fs.mkdirSync(imagesFolder);
    if (!fs.existsSync(videosFolder))
        fs.mkdirSync(videosFolder);
    if (!fs.existsSync(miscFolder))
        fs.mkdirSync(miscFolder);

    // Regex matches any URL starting with http:// or https:// and ending with an extension
    // We get the first matching URL, so only 1 URL is allowed per issue
    const regex = /https?:\/\/.*\.[a-zA-Z0-9]*/;

    const url = body.match(regex)[0];
    const filenameUnsafe = `${issue.title}.${getExtension(url)}`;
    const filename = sanitize(filenameUnsafe);

    let folder = miscFolder;
    if (isImage(filename))
        folder = imagesFolder;
    if (isVideo(filename))
        folder = videosFolder;
    const filePath = path.join(folder, filename);

    await download(url, filePath, () => {
        const commitMsg = core.getInput("commit-msg");
        const branchName = core.getInput("branch-name");
        const ghActor = process.env.GITHUB_ACTOR;
        const ghRepo = process.env.GITHUB_REPOSITORY;
        const remote = `https://${ghActor}:${repoToken}@github.com/${ghRepo}.git`;
        exec(
            `git config --global user.email "action@github.com" && ` +
            `git config --global user.name "GitHub Action" && ` +
            `git add -A && ` +
            `git commit -m "${commitMsg}" -a && ` +
            `git push "${remote}" HEAD:${branchName}`
        );
        console.log("Committed to repo");
    });
}


function getIssueNumber() {
    const issue = github.context.payload.issue;
    if (!issue)
        return undefined;

    return issue.number;
}

async function download(url, dest, cb) {
    console.log(`Starting download from ${url}`);
    return new Promise(() => {
        var file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on("finish", () => {
                file.close(cb);
                const fileSize = (fs.statSync(dest).size / 1024 / 1024).toFixed(2);
                console.log(`Completed download, size: ${fileSize}MiB`);
            });
        });
    });
}

function exec(cmd) {
    console.log(`Running: ${cmd}`);

    child_process.execSync(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`Stderr: ${stderr}`);
            return;
        }
        console.log(`Stdout: ${stdout}`);
    });
}

function getExtension(filename) {
    const split = filename.split(".");
    const extension = split[split.length - 1];
    return extension;
}

function isImage(filename) {
    const imageTypes = [
        "gif", "jpeg", "jpg", "png", "bmp", "fodg", "odg"
    ];
    const extension = getExtension(filename);
    return imageTypes.includes(extension);
}

function isVideo(filename) {
    const imageTypes = [
        "mov", "mp4", "webm", "avi", "m4v", "mpg"
    ];
    const extension = getExtension(filename);
    return imageTypes.includes(extension);
}

run();