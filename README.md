<div align="center">
  <h1>Ghostie</h1>
  (<b>G</b>itHub-<b>host</b>-<b>ie</b>)
  <h3>Host content using GitHub Issues and Actions</h3>
</div>

<br/>

<div align="center">

[![GPLv3 License](https://img.shields.io/github/license/TheBlocks/ghostie)](https://github.com/TheBlocks/ghostie/blob/main/LICENSE/)

### [How it works](#How-it-works) • [Usage/Examples](#UsageExamples) • [Inputs](#Inputs) • [Built with](#Built-with)

</div>

## How it works

1. Create an issue
2. Attach your image/video
3. The Ghostie action is automatically triggered
4. Your content is now uploaded to your repository!

See this demo repository to see Ghostie in action: [TheBlocks/ghostie-demo](https://github.com/TheBlocks/ghostie-demo)

https://user-images.githubusercontent.com/21197843/132138613-a90d5411-c0d7-48dd-b53e-56ddda572b64.mp4

## Usage/Examples

You need to create a yml file in `.github/workflows/` (e.g. `.github/workflows/ghostie.yml`) and then configure it to use Ghostie. Here are some example configurations you could use.

This following configuration sets every available input:

```yml
name: Ghostie

on:
  issues:
    types: [opened, edited]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Upload with Ghostie
        uses: TheBlocks/ghostie@v1.0.0
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          branch-name: ${{ github.event.repository.default_branch }}
          image-folder: "images/"
          video-folder: "videos/"
          misc-folder: "misc/"
          commit-msg: "Create new image/video file"
          allowed-users: "OWNER"
```

If you're happy with the [defaults for the inputs](#Inputs), you could use a more minimal configuration:

```yml
name: Ghostie

on:
  issues:
    types: [opened, edited]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Upload with Ghostie
        uses: TheBlocks/ghostie@v1.0.0
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          branch-name: ${{ github.event.repository.default_branch }}
```

## Inputs

This action has multiple inputs so that you can customise it.

| Input name      | Required? | Default value                   | Notes
| --------------- | --------- | ------------------------------- | -------------------------------
| `repo-token`    | Yes       |                                 | Use `${{ secrets.GITHUB_TOKEN }}`
| `branch-name`   | Yes       |                                 | The branch to upload the files to
| `image-folder`  | No        | `"images/"`                     | The folder where images get uploaded
| `video-folder`  | No        | `"videos/"`                     | The folder where videos get uploaded
| `misc-folder`   | No        | `"misc/"`                       | The folder where all other files get uploaded
| `commit-msg`    | No        | `"Create new image/video file"` | The commit message when files are committed
| `allowed-users` | No        | `"OWNER"`                       | Allowed values are: `OWNER`, `COLLABORATOR`, `CONTRIBUTOR`, `FIRST_TIMER`, `FIRST_TIME_CONTRIBUTOR`, `MANNEQUIN`, `MEMBER`, `NONE`

## Built with

- [GitHub Actions Toolkit](https://github.com/actions/toolkit)
- [sanitize-filename](https://github.com/parshap/node-sanitize-filename)
