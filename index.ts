import { Server } from "./lib/Server.ts";
import { logger } from "./lib/logger.ts";
import { config } from "./lib/config.ts";
import { HetznerDNS } from "./lib/HetznerDNS.ts";

const srv = new Server();

const hetznerDns = new HetznerDNS(config.apiToken);

srv.on("request", async ({ request, respondWith }) => {
  const uri = new URL(request.url);
  if (uri.pathname.startsWith('/set/')) {
    try {
      const name = uri.pathname.substring(5);
      const record = config.records[name];

      if(!record) {
        respondWith(new Response("Not found", { status: 404 }));
        return;
      }

      if(record.user) {
        const auth = await Server.basicAuth(request,record.user, record.pass );
        if(auth !== null) {
          respondWith(auth);
          return;
        }
      }

      const ip = request.headers.get('x-real-ip');

      if(!ip) {
        logger.error(`Could not update ${record} cause no X-REAL-IP Header was found.`);
        respondWith(new Response("Bad Request", { status: 400 }));
        return;
      }

      try {
        await hetznerDns.updateRecord(ip, name, record.zone);
        respondWith(new Response('Record updated', { status: 200 }));
      } catch(e) {
        logger.warning(e.toString());
        respondWith(new Response("Server Error", { status: 500 }));
      }

    } catch (e) {
      logger.error(e);
      respondWith(new Response("Service Unavailable", { status: 503 }));
    }
  } else {
    respondWith(new Response("Not found", { status: 404 }));
  }
});
