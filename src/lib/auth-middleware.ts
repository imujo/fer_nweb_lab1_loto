import { createMiddleware, json } from "@tanstack/react-start";
import { createRemoteJWKSet, jwtVerify } from "jose";

export const authMiddleware = createMiddleware().server(
  // @ts-expect-error this works
  async ({ request, next }) => {
    const AUTH0_DOMAIN = process.env.AUTH0_M2M_DOMAIN!;
    const AUTH0_AUDIENCE = process.env.AUTH0_M2M_AUDIENCE!;

    const JWKS = createRemoteJWKSet(
      new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`)
    );

    const header = request.headers.get("authorization");
    console.log("header", header);
    if (!header?.startsWith("Bearer ")) {
      return json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const token = header.slice("Bearer ".length);

    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: `https://${AUTH0_DOMAIN}/`,
        audience: AUTH0_AUDIENCE,
      });

      if (!payload.aud || payload.aud !== AUTH0_AUDIENCE) {
        return json({ error: "Invalid audience" }, { status: 401 });
      }

      return next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }
);
