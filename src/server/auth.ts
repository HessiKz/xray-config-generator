import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { Role } from "@prisma/client";
import { prisma } from "@/server/db";
import { hashPassword, verifyPassword } from "@/server/password";

export { hashPassword, verifyPassword };

const COOKIE = "fariman_session";

function authSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET missing");
  return new TextEncoder().encode(s);
}

export type SessionUser = {
  id: string;
  username: string;
  name: string;
  role: Role;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(authSecret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    return {
      id: String(payload.id),
      username: String(payload.username),
      name: String(payload.name),
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function requireSession(roles?: Role[]) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (roles && !roles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}

export async function loginWithPassword(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  const session: SessionUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };
  await createSession(session);
  return session;
}
