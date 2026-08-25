# Real-data replay fixtures (Sprint 17.6)

Captured live SerpAPI search + hotel property details for internal tester sessions.

## Enable

```bash
# .env.local
GLOOCONN_REPLAY_MODE=true
USE_MOCK_PROVIDERS=true   # optional; replay short-circuits before providers
```

Never set `GLOOCONN_REPLAY_MODE` on Vercel Production.

## Scenarios (route match on originId + destinationId)

| Id | Route |
|----|-------|
| milan-paris | Milan → Paris |
| milan-tokyo | Milan → Tokyo |
| milan-new-york | Milan → New York |
| rome-dubai | Rome → Dubai |
| london-barcelona | London → Barcelona |

Dates may be any valid trip dates — matching is route-based.

## Recapture (costs SerpAPI quota)

```bash
npx tsx --env-file=.env.local --import ./test/register-server-only.mjs \
  scripts/capture-replay-fixtures.mts
```

Optional: `CAPTURE_SCENARIOS=milan-paris,rome-dubai`

## Quota

| Mode | Search | Property details |
|------|--------|------------------|
| Replay | 0 | 0 |
| Live | existing | existing |
