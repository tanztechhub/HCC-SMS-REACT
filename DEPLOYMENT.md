# GitHub Actions deployment

The workflow builds pushes and pull requests. Successful `main` pushes and manual
`main` runs deploy only when all four repository secrets are configured.
Pull requests never use deployment credentials.

Add in Settings → Secrets and variables → Actions:

| Secret | Value |
| --- | --- |
| `VPS_HOST` | VPS IPv4 address |
| `VPS_USER` | `evans` |
| `VPS_SSH_KEY` | Dedicated deployment private key, including header/footer |
| `VPS_KNOWN_HOSTS` | Known-hosts entry created from the VPS's own public SSH host key |

The same dedicated HCC deployment key can be used by the backend repository.
Authorize its public key in `/home/evans/.ssh/authorized_keys`.

The build runs on GitHub. Optional repository variables:

- `VITE_API_URL`: defaults to `https://hcc.tanzhotelms.com/hcc-sms`.
- `VPS_SSH_PORT`: defaults to `22`.

`/var/www/hcc-sms` and its existing contents must be writable by `evans`.
One-time VPS setup:

```bash
sudo chown -R evans:evans /var/www/hcc-sms
```

The VPS requires `rsync`; install it only if `command -v rsync` shows it missing.
Nginx serves `/var/www/hcc-sms`. No frontend PM2 process or Nginx reload is needed
for subsequent builds. Assets upload first; `index.html` switches atomically last.
Old hashed assets are retained for already-open browser tabs. The workflow checks
the build marker through local HTTPS, bypassing any external proxy cache. An
outdated run is skipped if a newer commit exists on `main`.

Without secrets the build runs normally, but deployment is explicitly skipped.
After setup, use Actions → Build and deploy HCC frontend → Run workflow to test
the first deployment without needing a code change. The VPS's original client
clone is not updated by this workflow; published files come from the GitHub build.

Never put server secrets into Vite variables; they are browser-visible.
