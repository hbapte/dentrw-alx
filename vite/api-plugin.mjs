import { loadEnv } from "vite"

const ROUTES = {
  "/api/contact": {
    module: "/api/_lib/process-contact.ts",
    handler: "processContact",
  },
  "/api/subscribe": {
    module: "/api/_lib/process-subscribe.ts",
    handler: "processSubscribe",
  },
}

// Mounts the api/_lib handlers at /api/* during `vite dev`, using the same
// modules the Vercel functions import. Handlers are loaded lazily through
// server.ssrLoadModule so Vite transpiles the .ts/.tsx chain and picks up edits.
export function apiDevPlugin() {
  return {
    name: "dentrw-api-dev",

    config(_, { mode }) {
      // Expose non-VITE_ env vars (RESEND_API_KEY, CONVERTKIT_*, ...) to the
      // dev handlers via process.env. Vite does not do this on its own.
      const env = loadEnv(mode, process.cwd(), "")
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || "").split("?")[0]
        const route = ROUTES[path]
        if (!route) return next()

        const { readJsonBody, sendJson, clientIp } =
          await server.ssrLoadModule("/api/_lib/http.ts")

        if (req.method !== "POST") {
          return sendJson(res, 405, { error: "Method not allowed" })
        }
        try {
          const mod = await server.ssrLoadModule(route.module)
          let body
          try {
            body = await readJsonBody(req)
          } catch {
            return sendJson(res, 400, { error: "Invalid JSON" })
          }
          const { status, json } = await mod[route.handler](body, {
            ip: clientIp(req),
          })
          sendJson(res, status, json)
        } catch (err) {
          server.config.logger.error(
            `[api-dev] ${path} failed: ${err?.stack || err}`
          )
          sendJson(res, 500, { error: "Dev handler error" })
        }
      })
    },
  }
}
