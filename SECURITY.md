# Security and deployment boundaries

Use this application on a trusted production LAN, with direct connections to the bundled server. It is not an internet-facing service.

- The bundled server uses HTTP. Passwords and session traffic require a trusted network; TLS is not provided by this application.
- Verified loopback clients are administrators and bypass password login. A reverse proxy connecting over loopback would inherit that access. Do not use that deployment pattern.
- LAN clients can operate mixes after login. A selected mix is a view preference, not an authorization boundary or reservation.
- Keep `.vmix-access.json` private. It contains the password verifier and is excluded from source control and release assets.
- Current releases are preferred. Historical downloads retain the behavior and limitations of their original builds.

## Dependency status

The imported v19.4 lockfile has npm audit findings, including high-severity advisories affecting the framework and development/build dependency graph. A passing functional test suite does not resolve those findings. Dependency remediation is separate from this source-and-release import.

The portable release serves prebuilt assets using its own Node HTTP server; it does not run the Vinext development server. Do not expose the development server on an untrusted network.

## Reporting

Do not post passwords, password-verifier files or sensitive operator data in public issues. For a non-sensitive report, include the version, affected endpoint, expected access boundary and a minimal reproduction against demo or a test instance.
