# Hetzner DNS Updater - DynDNS

A very simple [Deno](https://deno.land/) script to update Records of Hetzner DNS based on the `x-real-ip` Header.   
**So be sure to run the Service behind a HTTP-Proxy (ie [Traefik](https://traefik.io/traefik/)) which:**
* Handles SSL for you
* Overwrites the `x-real-ip` Header to match the clients IP

It's recommended to use absolute DNS-Records - thus with the trailing dot.

## DNS-Updater Configuration

```yaml
# config.yaml

# Hetzner API Token
apiToken: xxxxx

# Available records
records:
  # Record for home.example.com
  # A-Record is configured relative in the DNS Server (without trailing dot)
  # Attention: This is not recommended cause some dyndns clients try to resolve the configured hostname
  home:
    # Credentials that have to be configured in your dyndns client
    user: user
    pass: pass
    # ZoneID can be copy pasted from the URL in Hetzner DNS Console
    # Ie https://dns.hetzner.com/zone/zzzzz
    zone: example.com-ZoneID

  # Record for office.example.com
  # A-Record is configured absolute in the DNS Server (with trailing dot)
  office.example.com:
    user: user
    pass: pass
    zone: example.com-ZoneID

  # Another example
  mynas.fuu.bar:
    user: user
    pass: pass
    zone: fubar.bar-ZoneID

```

## Client Configuration

### Unifi Dream Machine

`Internet > your WAN Connection > Dynamic DNS`

| Field    | Value                                                                                                                          |
|----------|--------------------------------------------------------------------------------------------------------------------------------|
| Service  | `dyndns`                                                                                                                       |
| Hostname | DNS-Record to update (ie `home.example.com`)                                                                                   |
| Username | The `user` from config.yaml                                                                                                    |
| Password | The `pass` from config.yaml                                                                                                    |
| Server   | The Domain (without protocol) where u've deployed the Hetzner DNS Updater with a `/set/` suffix (ie `dydns.example.com/set/` ) |

