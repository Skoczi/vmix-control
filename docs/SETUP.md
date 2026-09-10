# Setup

## Run the release

Install Node.js 22.13 or newer. Download the ZIP attached to the latest GitHub release and extract it into its own folder.

**Windows:** launch `START-LAN.bat` for network access, or `START-WINDOWS.bat` for local access only.

**macOS / Linux:** open a terminal in the extracted folder:

```bash
node server.mjs --lan
```

Omit `--lan` for local access only. Leave the terminal running. Stop the server with Ctrl+C.

The administrator opens **http://127.0.0.1:3000**. Operators use the LAN address printed in the terminal. Allow the server through the host firewall on the private network.

## Connect vMix

On the Windows computer running vMix, enable its Web Controller in Settings. The default port is 8088.

In the dashboard's local settings, enter the Windows computer's IPv4 address and port, such as `192.168.1.100:8088`. Use `127.0.0.1:8088` only when the dashboard server and vMix run on the same computer. The address is resolved by the dashboard server, not by the operator's phone.

Only available mixes are shown. Mix 1 is the main program; additional mixes follow their vMix input identities. If a selected mix disappears, the dashboard does not silently select its replacement.

The real vMix connection is pinned after its first successful read. Restart the server to use a different vMix computer. Demo remains a separate simulation.

## Demo

The local administrator selects **Start demo**. LAN clients join automatically. Demo includes PGM, AUX 1–15 and 24 inputs. The simulated state is shared and resets when the server restarts.

## Access and updates

Enable **Password protection** in Settings on the server computer through `127.0.0.1`. Passwords accept 4–128 characters. Choose a password appropriate for your network. LAN operators log in; local loopback clients do not need a password.

Only the local administrator can change connection or password settings. Logged-in LAN clients cannot perform those changes through the API either. Sessions expire after eight hours, logout, password changes or a server restart.

The password is stored as a salted scrypt hash in `.vmix-access.json` in the server working directory. This file is not included in release downloads.

To update:

1. Stop the current server.
2. Extract the new release to a new folder.
3. Copy `.vmix-access.json` from the old working folder to the new one to retain protection. On macOS, press ⌘⇧. to show hidden files.
4. Run the new server, reconnect locally, and refresh all operator browsers.

If the password is lost, use the local administrator session to change it. A damaged access configuration fails closed; stop the server and restore its configuration rather than exposing it remotely.

The server is intended for direct trusted-LAN access. It does not provide HTTPS. A reverse proxy connecting through loopback would be treated as the local administrator and must not be used with this trust model.

## Operator workflow

- Select a mix, then choose **Switcher** or **Sources**.
- Select PREVIEW and use CUT or AUTO. Clicking a PROGRAM key makes an immediate CUT.
- `1–9`, `0`, `-`, `=` select the first 12 PREVIEW slots on the current page. Enter runs AUTO; C runs CUT. Shortcuts ignore editable fields, open dialogs and repeated keys. Enter on a focused button retains that button's normal action.
- ON AIR locks configuration in that browser. Focus hides additional panels.
- Back returns by CUT to the previous observed program source. It rejects a stale PROGRAM expectation. Polling can miss changes that occur between reads.
- Station controls store source layout, groups, favorites and named presets per browser. Export profiles before clearing browser data.

## If devices show different dashboards

Confirm that all devices use the same server's LAN address and port. Only run one release instance. On macOS, `localhost` may resolve to IPv6 while the LAN server listens on IPv4; a separate development process can occupy the same numbered port. Use `127.0.0.1` locally and stop the development server while using the release.
