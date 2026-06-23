import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "service_center_admin";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_ACCESS_CODE ?? "";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateAdminCredentials(username: string, accessCode: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedCode = process.env.ADMIN_ACCESS_CODE;

  if (!expectedUsername || !expectedCode) {
    return false;
  }

  return safeEqual(username.trim(), expectedUsername) && safeEqual(accessCode, expectedCode);
}

export function createAdminSessionCookie() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const value = `admin.${expiresAt}`;
  const signature = sign(value);

  cookies().set({
    name: COOKIE_NAME,
    value: `${value}.${signature}`,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}

export function clearAdminSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function isAdminSessionValid() {
  const sessionSecret = getSessionSecret();
  const cookie = cookies().get(COOKIE_NAME)?.value;

  if (!sessionSecret || !cookie) {
    return false;
  }

  const parts = cookie.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [role, expiresAt, signature] = parts;
  if (role !== "admin" || Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return false;
  }

  return safeEqual(signature, sign(`${role}.${expiresAt}`));
}
