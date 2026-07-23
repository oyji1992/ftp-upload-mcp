# ftp-upload-mcp

[English](./README.md) | [中文](./README.zh-CN.md)

MCP server: upload a local file over FTP and get back an HTTPS URL.

Tools: `upload_file`, `upload_files`.

## Flow

```text
local file → FTP (uuid + original extension) → MEDIA_PUBLIC_BASE_URL + path
```

The FTP directory and `MEDIA_PUBLIC_BASE_URL` must point at the same files.

## Usage

```bash
npx -y ftp-upload-mcp
```

```json
{
  "mcpServers": {
    "ftp-upload": {
      "command": "npx",
      "args": ["-y", "ftp-upload-mcp"],
      "env": {
        "MEDIA_FTP_HOST": "<ftp-host>",
        "MEDIA_FTP_USER": "<ftp-user>",
        "MEDIA_FTP_PASSWORD": "<ftp-password>",
        "MEDIA_PUBLIC_BASE_URL": "https://<cdn-host>/files",
        "MEDIA_REMOTE_DIR": "media"
      }
    }
  }
}
```

Pin version if needed: `ftp-upload-mcp@1.0.0`.

## Environment

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MEDIA_FTP_HOST` | yes | | FTP host |
| `MEDIA_FTP_USER` | yes | | Username |
| `MEDIA_FTP_PASSWORD` | yes | | Password |
| `MEDIA_PUBLIC_BASE_URL` | yes | | HTTPS base URL (must be `https://`) |
| `MEDIA_FTP_PORT` | no | `21` | Port |
| `MEDIA_REMOTE_DIR` | no | empty | Remote subdirectory |

Plain FTP only (no FTPS/SFTP). Keep real credentials out of git.

## Tools

**`upload_file`**

```json
{ "file_path": "/absolute/path/to/shot.png" }
```

```json
{
  "original_filename": "shot.png",
  "stored_filename": "<uuid>.png",
  "remote_path": "media/<uuid>.png",
  "public_url": "https://<cdn-host>/files/media/<uuid>.png"
}
```

**`upload_files`**

```json
{ "file_paths": ["/path/a.png", "/path/b.mp4"] }
```

Returns `{ "uploads": [ ... ] }`.

## Development

```bash
npm install
npm run build
npm start
```

## Release

| Workflow | Trigger |
|----------|---------|
| `CI` | push / PR to `main` or `master` |
| `Publish to npm` | tag `v*` |

1. Add GitHub secret `NPM_TOKEN` (npm Automation token)
2. Release:

```bash
npm version patch
git push origin master --tags
```

Tag without `v` must match `package.json` version (`npm version` creates `v1.0.1`).

First tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
