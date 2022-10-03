import { logger } from "./logger.ts";

export interface HetznerDnsRecord {
  type: "A" | "AAA";
  id: string;
  created: string;
  modified: string;
  zone_id: string;
  name: string;
  value: string;
  ttl: 0;
}

export class HetznerDNS {
  constructor(protected apiToken: string) {
  }

  async updateRecord(ip: string, domain: string, zoneId: string) {
    // Find Record ID
    const recordsReq = await fetch(`https://dns.hetzner.com/api/v1/records?zone_id=${zoneId}`, {
      headers: {
        'Auth-API-Token': this.apiToken
      }
    });

    if (recordsReq.status !== 200) {
      throw new Error(`Could not fetch DNS Records for ${zoneId}: ${recordsReq.status} - ${await recordsReq.text()}`);
    }

    const records = await recordsReq.json();
    const record = records.records.find((record: HetznerDnsRecord) =>
      (record.name === domain || record.name === domain + '.')
      && record.type === 'A'
    ) as HetznerDnsRecord;
    if (!record) {
      throw new Error(`Could not find existing record for ${domain}`);
    }

    // Update Record ID
    const updateReq = await fetch(`https://dns.hetzner.com/api/v1/records/${record.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Auth-API-Token': this.apiToken
      },
      body: JSON.stringify({
        name: record.name,
        type: record.type,
        ttl: record.ttl,
        value: ip,
        zone_id: zoneId
      })
    });

    if (recordsReq.status !== 200) {
      throw new Error(`Could not update DNS Record ${domain}: ${updateReq.status} - ${await updateReq.text()}`);
    }

    logger.info(`Updated ${domain} to ${ip}`);
  }

}
