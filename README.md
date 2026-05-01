# Proxy Checker

A simple Express-based API to check if a proxy is working.

## Usage

- Start the server:
  ```bash
  pnpm run dev
  ```
- Make a GET request to `/check?proxy=host:port` (optionally with `username` and `password` for authentication).

## API

### `GET /check`

**Query Parameters:**
- `proxy` (required): Proxy address in `host:port` format
- `username` (optional): Proxy username
- `password` (optional): Proxy password

**Response:**
- `{ working: true }` if the proxy is functional
- `{ working: false, error: "..." }` if not

## Example

```
curl "http://localhost:3000/check?proxy=1.2.3.4:8080"
```

---

MIT License
