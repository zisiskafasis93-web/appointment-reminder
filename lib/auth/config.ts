import "server-only";

export function isPublicSignupEnabled() {
  if (process.env.ALLOW_PUBLIC_SIGNUP === "true") {
    return true;
  }

  if (process.env.ALLOW_PUBLIC_SIGNUP === "false") {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}
