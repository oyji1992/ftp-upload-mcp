import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";
import FtpServer from "@electerm/ftp-srv";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const silentLogger = {
  child() {
    return this;
  },
  trace() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
  fatal() {},
};

test("upload_file uploads through MCP to a real local FTP server", { timeout: 20_000 }, async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), "ftp-upload-mcp-"));
  const ftpRoot = join(tempRoot, "ftp-root");
  const sourcePath = join(tempRoot, "fixture file.txt");
  const sourceContent = "uploaded through the MCP tool\n";
  await writeFile(sourcePath, sourceContent, "utf8");

  const ftpServer = new FtpServer({
    url: "ftp://127.0.0.1:0",
    pasv_url: "127.0.0.1",
    endOnProcessSignal: false,
    log: silentLogger,
  });
  ftpServer.on("login", ({ username, password }, resolve, reject) => {
    if (username === "test-user" && password === "test-password") {
      resolve({ root: ftpRoot });
      return;
    }
    reject(new Error("Invalid test credentials"));
  });

  let client;
  try {
    await ftpServer.listen();
    const address = ftpServer.server.address();
    assert.ok(address && typeof address !== "string");

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [join(projectRoot, "dist", "index.js")],
      cwd: projectRoot,
      env: {
        ...getDefaultEnvironment(),
        MEDIA_FTP_HOST: "127.0.0.1",
        MEDIA_FTP_PORT: String(address.port),
        MEDIA_FTP_USER: "test-user",
        MEDIA_FTP_PASSWORD: "test-password",
        MEDIA_PUBLIC_BASE_URL: "https://media.example.test/files",
        MEDIA_REMOTE_DIR: "mcp-tests",
      },
      stderr: "pipe",
    });
    client = new Client({ name: "ftp-upload-e2e-test", version: "1.0.0" });
    await client.connect(transport);

    const packageManifest = JSON.parse(
      await readFile(join(projectRoot, "package.json"), "utf8"),
    );
    assert.equal(client.getServerVersion()?.version, packageManifest.version);

    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map(({ name }) => name).sort(),
      ["upload_file", "upload_files"],
    );

    const response = await client.callTool({
      name: "upload_file",
      arguments: { file_path: sourcePath },
    });
    assert.equal(response.isError, undefined);
    assert.equal(response.content.length, 1);
    assert.equal(response.content[0].type, "text");

    const upload = JSON.parse(response.content[0].text);
    assert.equal(upload.original_filename, "fixture file.txt");
    assert.match(upload.stored_filename, /^[0-9a-f]{32}\.txt$/);
    assert.equal(upload.remote_path, `mcp-tests/${upload.stored_filename}`);
    assert.equal(
      upload.public_url,
      `https://media.example.test/files/mcp-tests/${upload.stored_filename}`,
    );

    const uploadedContent = await readFile(
      join(ftpRoot, "mcp-tests", upload.stored_filename),
      "utf8",
    );
    assert.equal(uploadedContent, sourceContent);
  } finally {
    await client?.close();
    await ftpServer.close();
    await rm(tempRoot, { recursive: true, force: true });
  }
});
