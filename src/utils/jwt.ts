function b64urlDecode(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  return decodeURIComponent(
    atob(input)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export type JwtPayload = { exp?: number; iat?: number; [k: string]: any };

export function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(b64urlDecode(payload));
  } catch {
    return null;
  }
}

export function msUntilExpiry(token: string): number | null {
  const p = parseJwt(token);
  if (!p?.exp) return null;
  const ms = p.exp * 1000 - Date.now();
  return ms;
}
