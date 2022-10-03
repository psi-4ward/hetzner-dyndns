import { EventEmitter } from "https://deno.land/std@0.158.0/node/events.ts";
import { config } from "./config.ts";
import { logger } from "./logger.ts";


export class Server extends EventEmitter {
  protected enabled = false;

  constructor() {
    super();
    if (!config.listen_address) return;
    this.enabled = true;

    const addParts = config.listen_address.split(":");
    const port = parseInt(addParts.pop() || "9015", 10);
    const hostname = addParts.join(":") || "0.0.0.0";

    const server = Deno.listen({ port, hostname });
    logger.info(`HTTP Server listening on ${hostname}:${port}`);

    ( async () => {
      // Connections to the server will be yielded up as an async iterable.
      for await (const conn of server) {
        // In order to not be blocking, handle each connection individually without awaiting
        this.serveHttp(conn);
      }
    } )();
  }

  async serveHttp(conn: Deno.Conn) {
    try {
      // This "upgrades" a network connection into an HTTP connection.
      const httpConn = Deno.serveHttp(conn);
      // Each request sent over the HTTP connection will be yielded as an async
      // iterator from the HTTP connection.
      for await (const { request, respondWith } of httpConn) {
        this.emit("request", { request, respondWith });
      }
    } catch (err) {
      // Ignore http errors (ie client aborted or wrong tls connections)
      if (!( err instanceof Deno.errors.Http )) {
        logger.error(err);
      }
    }
  }

  static async basicAuth(
    request: Request,
    user: string,
    pass: string
  ): Promise<Response | null> {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const match = authHeader.match(/^Basic\s+(.*)$/);
      if (match) {
        const [authUser, authPasswd] = atob(match[1]).split(":");
        if (user === authUser && authPasswd === pass) {
          return null;
        }
      }
    }

    return new Response("401 Unauthorized", {
      status: 401,
      statusText: "Unauthorized",
      headers: {
        "www-authenticate": `Basic realm=protected"`,
      },
    });
  }
}
