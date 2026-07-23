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
npx -y @oyji1992/ftp-upload-mcp
```

### Generic MCP config (Claude Desktop / Cursor / etc.)

```json
{
  "mcpServers": {
    "ftp-upload": {
      "command": "npx",
      "args": ["-y", "@oyji1992/ftp-upload-mcp"],
      "env": {
        "MEDIA_FTP_HOST": "<ftp-host>",
        "MEDIA_FTP_PORT": "21",
        "MEDIA_FTP_USER": "<ftp-user>",
        "MEDIA_FTP_PASSWORD": "<ftp-password>",
        "MEDIA_PUBLIC_BASE_URL": "https://<cdn-host>/files",
        "MEDIA_REMOTE_DIR": "media"
      }
    }
  }
}
```

### Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.ftp-upload]
type = "stdio"
command = "npx"
args = ["-y", "@oyji1992/ftp-upload-mcp"]
startup_timeout_sec = 30

[mcp_servers.ftp-upload.env]
MEDIA_FTP_HOST = "<ftp-host>"
MEDIA_FTP_PORT = "21"
MEDIA_FTP_USER = "<ftp-user>"
MEDIA_FTP_PASSWORD = "<ftp-password>"
MEDIA_PUBLIC_BASE_URL = "https://<cdn-host>/files"
MEDIA_REMOTE_DIR = "media"
```

Pin version if needed: `@oyji1992/ftp-upload-mcp@1.0.1`.

## Environment

All of these should be set in the MCP config. Some have defaults if omitted.

| Variable | Default | Description |
|----------|---------|-------------|
| `MEDIA_FTP_HOST` | _(none)_ | FTP host |
| `MEDIA_FTP_PORT` | `21` | FTP port |
| `MEDIA_FTP_USER` | _(none)_ | Username |
| `MEDIA_FTP_PASSWORD` | _(none)_ | Password |
| `MEDIA_PUBLIC_BASE_URL` | _(none)_ | HTTPS base URL (must be `https://`) |
| `MEDIA_REMOTE_DIR` | empty | Remote subdirectory under the FTP login home |

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

## License

MIT
