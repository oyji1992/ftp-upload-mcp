#!/usr/bin/env node
import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { uploadFile, uploadFiles } from "./uploader.js";

const packageManifest = createRequire(import.meta.url)("../package.json") as {
  version: string;
};

const server = new McpServer({
  name: "ftp-upload-mcp",
  version: packageManifest.version,
});

function jsonText(data: unknown): { content: [{ type: "text"; text: string }] } {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

function errorText(err: unknown): {
  content: [{ type: "text"; text: string }];
  isError: true;
} {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

server.tool(
  "upload_file",
  "Upload one local file via FTP and return a permanent public HTTPS URL.",
  {
    file_path: z
      .string()
      .describe("Absolute path to a local file to upload"),
  },
  async ({ file_path }) => {
    try {
      const config = loadConfig();
      const result = await uploadFile(config, file_path);
      return jsonText(result);
    } catch (err) {
      return errorText(err);
    }
  },
);

server.tool(
  "upload_files",
  "Upload multiple local files via FTP and return permanent public HTTPS URLs.",
  {
    file_paths: z
      .array(z.string())
      .min(1)
      .describe("Absolute paths to local files to upload"),
  },
  async ({ file_paths }) => {
    try {
      const config = loadConfig();
      const results = await uploadFiles(config, file_paths);
      return jsonText({ uploads: results });
    } catch (err) {
      return errorText(err);
    }
  },
);

async function main(): Promise<void> {
  // Fail fast on missing env so clients see a clear error at startup.
  loadConfig();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
