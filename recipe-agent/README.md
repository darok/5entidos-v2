# Recipe Agent

Node.js SSE server that researches recipes collaboratively using Claude. Searches the web and YouTube, iterates with you via a draft review loop, and saves 5entidos-compatible JSON.

## Setup

```bash
cd recipe-agent
npm install
cp .env.example .env
# Fill in ANTHROPIC_API_KEY and TAVILY_API_KEY in .env
npm run dev
```

Requires Node 20.6+ (uses `--env-file` flag).

## Endpoints

### POST /recipe/start
Start a new research job.
```json
{ "prompt": "Quiero hacer un risotto de hongos con porcini" }
```
Returns: `{ "jobId": "abc123" }`

### GET /recipe/stream/:jobId
SSE stream. Connect here to receive real-time events. Replays buffered events if you connect after start.

### POST /recipe/respond/:jobId
Send your reply when the agent is waiting for input.
```json
{ "input": "Prefiero porcini secos, sin vino" }
```
Returns: `{ "ok": true }`

## SSE Events

| type          | fields                                    | meaning                              |
|---------------|-------------------------------------------|--------------------------------------|
| `thinking`    | `text`                                    | Agent reasoning                      |
| `searching`   | `query`                                   | About to search the web              |
| `reading_url` | `url`                                     | About to read a page or video        |
| `question`    | `text`                                    | Quick mid-research question          |
| `draft`       | `recipe`, `questions[]`, `notes[]`        | Full draft ready for review          |
| `preferences` | `proposed[{ key, value, reason }]`        | End-of-session preference proposals  |
| `done`        | `recipe`                                  | Final approved recipe                |
| `error`       | `message`                                 | Something went wrong                 |

## Output

Saved to `output/[recipe-slug].json` — compatible with 5entidos `ExtractedRecipe` schema.

## Files

- `preferences.md` — persistent user preferences, updated with approval at end of each session
- `output/` — one JSON per recipe
