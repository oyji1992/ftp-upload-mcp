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

```json
{
  "mcpServers": {
    "ftp-upload": {
      "command": "npx",
      "args": ["-y", "@oyji1992/ftp-upload-mcp"],
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

需要锁版本时用：`@oyji1992/ftp-upload-mcp@1.0.0`。

## 环境变量

| 变量 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `MEDIA_FTP_HOST` | 是 | | FTP 主机 |
| `MEDIA_FTP_USER` | 是 | | 用户名 |
| `MEDIA_FTP_PASSWORD` | 是 | | 密码 |
| `MEDIA_PUBLIC_BASE_URL` | 是 | | HTTPS 基址（必须 `https://`） |
| `MEDIA_FTP_PORT` | 否 | `21` | 端口 |
| `MEDIA_REMOTE_DIR` | 否 | 空 | 远端子目录 |

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

## 发版

| Workflow | 触发 |
|----------|------|
| `CI` | push / PR 到 `main` 或 `master` |
| `Publish to npm` | tag `v*` |

1. GitHub Secret 配置 `NPM_TOKEN`（npm Automation token）
2. 发版：

```bash
npm version patch
git push origin master --tags
```

tag 去掉 `v` 后须等于 `package.json` 的 version（`npm version` 会生成 `v1.0.1`）。

首次：

```bash
git tag v1.0.0
git push origin v1.0.0
```

## License

MIT
