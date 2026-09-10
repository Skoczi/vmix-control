# Contributing

Open an issue before starting a substantial change. Include the dashboard version, host OS, Node.js version, vMix version and the affected mix. A minimal reproduction or demo-mode sequence is more useful than a general description.

Do not include passwords, `.vmix-access.json`, private network captures or operator profiles containing private information.

For code changes, run:

```bash
npm ci
npm test
npm run typecheck
npm run build:portable
```

Preserve GUID-based mix identity and server-side command validation. Never retry an uncertain switching command automatically. Add regression coverage for routing, access control or persistence changes. Keep interface text in the translation catalog.

Pull requests should explain the affected behavior, the change and how it was verified. Note whether verification used demo, a fake transport or a real vMix installation.
