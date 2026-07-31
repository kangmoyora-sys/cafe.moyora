import "server-only";

import { createCipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

const stateTtlMilliseconds = 10 * 60 * 1000;
const canonicalBase64Pattern = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

type NaverOAuthConfig = {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  encryptionKey: Buffer;
};

export function getNaverOAuthConfig(): NaverOAuthConfig | null {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const callbackUrl = process.env.NAVER_CALLBACK_URL;
  const encryptionKey = process.env.NAVER_TOKEN_ENCRYPTION_KEY;
  if (!clientId || !clientSecret || !callbackUrl || !encryptionKey) return null;

  if (!canonicalBase64Pattern.test(encryptionKey)) return null;

  const decodedKey = Buffer.from(encryptionKey, "base64");
  if (decodedKey.length !== 32 || decodedKey.toString("base64") !== encryptionKey) return null;

  return { clientId, clientSecret, callbackUrl, encryptionKey: decodedKey };
}

export function isNaverOAuthTokenExpired(tokenExpiresAt: string | null) {
  return tokenExpiresAt ? new Date(tokenExpiresAt).getTime() <= Date.now() : false;
}

export const naverOAuthConfigurationMessage = "네이버 카페 연동 설정이 아직 완료되지 않았습니다.";

export function createOAuthState() {
  return randomBytes(32).toString("base64url");
}

export function hashOAuthState(state: string) {
  return createHash("sha256").update(state).digest("hex");
}

export function getOAuthStateExpiry() {
  return new Date(Date.now() + stateTtlMilliseconds).toISOString();
}

export function statesMatch(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function encryptNaverToken(token: string, encryptionKey: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${authTag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function createNaverAuthorizationUrl(config: NaverOAuthConfig, state: string) {
  const url = new URL("https://nid.naver.com/oauth2.0/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.callbackUrl);
  url.searchParams.set("state", state);
  return url;
}

export function isExpectedNaverCallback(callbackUrl: string, requestUrl: string) {
  const expected = new URL(callbackUrl);
  const received = new URL(requestUrl);
  return expected.origin === received.origin && expected.pathname === received.pathname;
}
