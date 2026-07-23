import { randomUUID } from "node:crypto";
import { basename, extname } from "node:path";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { Client } from "basic-ftp";
import type { MediaConfig } from "./config.js";

export type UploadResult = {
  original_filename: string;
  stored_filename: string;
  remote_path: string;
  public_url: string;
};

async function assertReadableFile(filePath: string): Promise<void> {
  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new Error(`Local file not found or not readable: ${filePath}`);
  }
}

function buildStoredFilename(originalFilename: string): string {
  const ext = extname(originalFilename);
  return `${randomUUID().replace(/-/g, "")}${ext}`;
}

function joinRemote(remoteDir: string, filename: string): string {
  if (!remoteDir) return filename;
  return `${remoteDir}/${filename}`;
}

function buildPublicUrl(publicBaseUrl: string, remotePath: string): string {
  return `${publicBaseUrl}/${remotePath.split("/").map(encodeURIComponent).join("/")}`;
}

export async function uploadFile(
  config: MediaConfig,
  filePath: string,
): Promise<UploadResult> {
  await assertReadableFile(filePath);

  const originalFilename = basename(filePath);
  const storedFilename = buildStoredFilename(originalFilename);
  const remotePath = joinRemote(config.remoteDir, storedFilename);
  const publicUrl = buildPublicUrl(config.publicBaseUrl, remotePath);

  const client = new Client(30_000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      secure: false,
    });

    // ensureDir cds into the directory; upload relative filename from there.
    if (config.remoteDir) {
      await client.ensureDir(config.remoteDir);
    }
    await client.uploadFrom(filePath, storedFilename);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`FTP upload failed: ${message}`);
  } finally {
    client.close();
  }

  return {
    original_filename: originalFilename,
    stored_filename: storedFilename,
    remote_path: remotePath,
    public_url: publicUrl,
  };
}

export async function uploadFiles(
  config: MediaConfig,
  filePaths: string[],
): Promise<UploadResult[]> {
  if (filePaths.length === 0) {
    throw new Error("file_paths must not be empty");
  }
  const results: UploadResult[] = [];
  for (const path of filePaths) {
    results.push(await uploadFile(config, path));
  }
  return results;
}
