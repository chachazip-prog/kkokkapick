# ADPICK secret setup

The recommended-products API URL is stored only as a GitHub Actions secret.

1. Repository → Settings → Secrets and variables → Actions.
2. Choose **New repository secret**.
3. Name: `ADPICK_API_URL`
4. Secret: paste the full personal ADPICK API example URL.
5. Save.
6. Open Actions → **Sync ADPICK products** → Run workflow.

The workflow refreshes `data/adpick-products.json` and commits only when the catalog changes.
It is also scheduled every 6 hours. The URL is never written to the repository.

> Before production launch, re-check ADPICK's permitted cache/redisplay duration. The scheduled JSON catalog is for integration validation until that policy is confirmed.
