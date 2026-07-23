# ftp-upload-mcp

[English](./README.md) | [中文](./README.zh-CN.md)

MCP 服务：通过 FTP 上传本地文件，返回 HTTPS URL。

工具：`upload_file`、`upload_files`。

## 流程

```text
本地文件 → FTP（uuid + 原扩展名）→ MEDIA_PUBLIC_BASE_URL + 路径
```

FTP 落盘目录与 `MEDIA_PUBLIC_BASE_URL` 必须对应同一批文件。

## 使用

```bash
npx -y @oyji1992/ftp-upload-mcp
```

### 通用 MCP 配置（Claude Desktop / Cursor 等）

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

### Codex（`~/.codex/config.toml`）

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

需要锁版本时用：`@oyji1992/ftp-upload-mcp@1.0.1`。

## 环境变量

MCP 配置里建议全部写出。部分变量未写时有默认值。

| 变量 | 默认 | 说明 |
|------|------|------|
| `MEDIA_FTP_HOST` | 无 | FTP 主机 |
| `MEDIA_FTP_PORT` | `21` | FTP 端口 |
| `MEDIA_FTP_USER` | 无 | 用户名 |
| `MEDIA_FTP_PASSWORD` | 无 | 密码 |
| `MEDIA_PUBLIC_BASE_URL` | 无 | HTTPS 基址（必须 `https://`） |
| `MEDIA_REMOTE_DIR` | 空 | FTP 登录目录下的子路径 |

仅支持普通 FTP（无 FTPS/SFTP）。真实凭据不要写入 git。

## 工具

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

返回 `{ "uploads": [ ... ] }`。

## 开发

```bash
npm install
npm run build
npm start
```

## License

MIT
