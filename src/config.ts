export type MediaConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  /** Permanent public HTTPS base, e.g. https://<public-cdn-host>/files */
  publicBaseUrl: string;
  /** Optional FTP remote directory (relative to login home). Default: upload to home root. */
  remoteDir: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

/**
 * Minimal config surface:
 * - 4 required: HOST / USER / PASSWORD / PUBLIC_BASE_URL
 * - PORT defaults to 21
 * - REMOTE_DIR defaults to "" (FTP home)
 * - TLS omitted: plain FTP upload; public access is HTTPS via PUBLIC_BASE_URL
 */
export function loadConfig(): MediaConfig {
  const publicBaseUrl = requireEnv("MEDIA_PUBLIC_BASE_URL").replace(/\/+$/, "");
  if (!publicBaseUrl.toLowerCase().startsWith("https://")) {
    throw new Error("MEDIA_PUBLIC_BASE_URL must be an https:// URL (permanent public link)");
  }

  const portRaw = process.env.MEDIA_FTP_PORT?.trim() || "21";
  const port = Number(portRaw);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid MEDIA_FTP_PORT: ${portRaw}`);
  }

  return {
    host: requireEnv("MEDIA_FTP_HOST"),
    port,
    user: requireEnv("MEDIA_FTP_USER"),
    password: requireEnv("MEDIA_FTP_PASSWORD"),
    publicBaseUrl,
    remoteDir: (process.env.MEDIA_REMOTE_DIR ?? "").trim().replace(/^\/+|\/+$/g, ""),
  };
}
