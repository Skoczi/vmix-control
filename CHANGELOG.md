# Changelog

What changed, what got fixed, and what got out of the way. Latest first.

Reconstructed from preserved packages and change notes. Older builds are kept as an archive; use the latest release for current work. Original version numbers are preserved.

## 19.7.4 — Room for every control

- Let the Switcher grow to fit transitions, overlays and CUT/AUTO without an inner scrollbar.
- Keep both desktop columns aligned, with the preview bank anchored at the bottom.
- Preserve tile-size preferences and the flowing mobile layout.

## 19.7.3 — A quieter transition panel

- Remove the status line beneath CUT/AUTO.
- Move the keyboard reference into a compact footer row, shown only in Switcher with shortcuts enabled.

## 19.7.2 — Same desk, every view

- Use the same page width for All mixes, Sources and Switcher.
- Reserve scrollbar space so switching views keeps the dashboard edges steady.

## 19.7.1 — A sidebar that fits

- Match desktop transition-panel height to the source banks.
- Keep CUT/AUTO visible while the settings section scrolls when needed.
- Replace the native transition selector with a themed, grouped, keyboard-accessible menu.
- Align the trigger and popup width; cap the menu height instead of opening a screen-long list.
- Preserve an uncropped, flowing layout on mobile.


## 19.7 — Overlay keys within reach

- Numbered overlay keys beside CUT/AUTO, lit from the live shared-channel state.
- Active key sends OUT; inactive key sends IN with the source assigned below.
- Source choices are shared between the quick keys and detailed panel within the current dashboard session.
- Unassigned or removed sources cannot be sent accidentally.
- A tighter transition module with consistent spacing, quieter borders and restrained active colours.

Overlay OUT still affects the shared channel across mixes. Key state updates after vMix responds.


## 19.6.2 — One browser, one operator

- Share the operator identity across tabs at the same dashboard origin.
- Reuse the previous tab identity when migrating the first tab.
- Re-read the shared identity on every heartbeat so updated tabs converge.

Refresh all open dashboard tabs once. Old entries expire after their final heartbeat. Different browser profiles and dashboard addresses retain separate identities. With multiple active tabs, the most recent heartbeat determines the browser's displayed mix.


## 19.6.1 — Refresh without a crowd

- Keep the operator identity in browser session storage across reloads and remounts.
- Update the existing presence record when the operator changes mix.
- Existing ghost entries expire through the presence timeout.

Validated with 100 reloads using one session and a separate second operator.


## 19.6 — Production controls reach AUX

- Stinger selectors and overlay IN/OUT are available on additional mixes in vMix 28+, and demo.
- Overlay IN targets the selected mix, including when the same source is already active on the shared channel.
- FTB and global production indicators remain in PGM.
- Shared overlay and stinger channels serialize dashboard commands across mixes.
- Self-routing and stale mix identities are rejected.

Overlay indicators show global channel state. OUT clears the shared channel across mixes.


## 19.5 — PGM gets a production tray

- Dedicated stinger selectors in the main Switcher. Select a slot, then AUTO.
- Overlay source selection and IN/OUT controls for channels reported by vMix.
- FTB activation and restore with confirmed state; read-only REC, STREAM and EXT indicators.
- Shared overlay and FTB state in demo. No video rendering is simulated.
- Stale commands are rejected; uncertain commands are not retried.
- Added a documentation review covering PGM, shared channels and global production controls.

Overlay OUT affects the shared channel. Animation assets and overlay effects remain configured in vMix. Physical vMix verification is still needed.


## 19.4.2 — Feedback without the takeover

- Move operation feedback to a compact bottom-left toast with a quiet dark background.
- Dismiss confirmations after four seconds; pause the timer while hovered or focused.
- Keep errors visible until dismissed and leave the CUT/AUTO side clear.


## 19.4.1 — Let operators straight in

- Remote operators no longer get connection settings on startup or after a failed connection.
- Settings can always be closed, including when ON AIR is active.
- Remote settings focus the close button, with a larger touch target and a header that stays visible while scrolling.


## v19.4 — One server. Independent operators.

- The local operator selects the vMix address or starts demo. LAN clients join the same connection after login, without setting up their own target.
- Connection and password settings are restricted to the local administrator. The API enforces the same boundary.
- Operators keep their own mix, language and layout. If the server is not connected yet, clients wait and join when it is ready.

## v19.3 — Less copy around the controls

- Removed the persistent local-access and password-length descriptions.
- Saving a short password now shows a validation bubble above the field. Editing the password clears it.

## v19.2 — Four characters, minimum

- Changed the minimum password length from eight to four characters in both the form and the server.
- Save no longer stays disabled without an explanation. Validation errors are shown when needed.

## v19.1 — Know which build is running

- Added the version number to the footer.
- Skoczi.dev now opens the website in a new tab.

## v19 — Password access for the LAN

- Added optional shared-password access, persisted as a salted scrypt hash.
- Loopback clients bypass the password. The server checks the actual client connection, not a claimed address in a header.
- Sessions expire after eight hours, logout, a password change or a server restart. Protected API requests require authentication.

## v18.2 — PROGRAM keeps its contrast

- Hovering PROGRAM preserves its green background and readable text.
- The active button brightens slightly instead of losing its active appearance.

## v18.1 — Settings back in line

- Aligned the shortcut toggle and normalized spacing between settings rows.
- The switch thumb stays light in its enabled state.

## v18 — Six tools for the operator

- Added PREVIEW, AUTO and CUT shortcuts, the ON AIR configuration lock and operator presence.
- Added previous-source recall with a check against the current PROGRAM state.
- Added focus mode and drag handles for input ordering. Station layouts retain ordering and favorites.

## v17 — Tile size where you expect it

- Moved global tile size to Settings. It controls Sources, Switcher keys and matrix density.
- Aligned the search and filter toolbar with the source grid.

## v16.1 — Switcher comes first

- Renamed Director to Switcher and made it the first, default view for a single mix. Sources follows it.
- Replaced the long connection label with a compact VMIX / DEMO / OFFLINE badge.

## v16 — More inputs, less scrolling

- PROGRAM and PREVIEW share pages of 12, 24 or 48 inputs.
- Search covers the full list. Active-source readouts and CUT/AUTO remain independent of the current page.
- Added a locate action to jump to the page containing the active source.

## v15.1 — English names in demo

- Renamed demo cameras, intro, news package, lower third, scores and break slate in English.
- PGM and AUX names remain unchanged.

## v15 — Settings get their own space

- Moved settings into a modal with a dimmed background.
- Connection errors appear inside the dialog. A successful connection closes it.

## v14 — Ten interface languages

- English is the default, with PL, DE, FR, ES, RO, RU, IT, PT and UK also available.
- Changing language does not reconnect vMix or rename user sources and profiles.

## v13.2 — A mix picker that scales

- Added search by mix name or number.
- The available-mix list now scrolls within the picker.

## v13.1 — PGM and AUX in demo

- Renamed the example mixes to PGM and AUX 1–15.
- Removed the production-specific WÓZ names from the sample configuration.

## v13 — The full mix range

- Added support for the main program and up to 15 additional mixes. Only available mixes are displayed.
- PREVIEW, CUT, AUTO and profiles support the full range. Wide matrices scroll horizontally.
- Expanded demo to 16 mixes and 24 inputs.

## v12.1 — A calmer switcher desk

- Introduced matte keys, quieter PROGRAM/PREVIEW colors and a compact transition panel.
- Reworked the visual hierarchy of the director view.

## v12 — A dedicated director view

- Added separate PROGRAM and PREVIEW banks, CUT and AUTO for the selected mix.
- PREVIEW is read from vMix and shared across operators. Stale take commands are rejected.
- Demo supports both banks. The desk displays names and state, without video previews.

## v11.2 — Demo styles in place

- Demo, search and profile styles now load from a dedicated stylesheet alongside the panel.
- Fixed displaced interface elements after starting demo.

## v11.1 — Demo actually starts

- Fixed demo request handling in the development server.
- Simulation requests no longer enter the real vMix address validator.

## v11 — Try it without vMix

- Introduced demo with 12 inputs and four mixes, shared by operators on the same server.
- Simulated program selection, transition duration and Play. No video rendering.
- Demo lives in memory and resets when the server restarts.

## v10 — Find sources. Keep your setup.

- Added search by name, number and type, plus group and favorite filters.
- Added profile rename, duplicate, delete with undo, JSON import and export.
- Import preserves existing profiles and resolves naming conflicts.

## v9 — Shared control, shared locks

- Localhost, loopback and the host IPv4 address now share the same operation lock.
- The server pins one real vMix instance after the first successful connection.
- Station links import once. Named station settings save automatically as a local draft.

## v8 — Less text around the work

- Removed unnecessary explanatory copy from the interface.
- Simplified the footer to © 2026 | Skoczi.dev.

## v7 — The matrix lines up

- Headers and routing buttons use consistent column widths.
- A PROGRAM button identifies the active source. The header stays visible while scrolling.
- Profiles and the input editor are available from Station.

## v6 — Your station, your layout

- Added station profiles for source visibility, favorites, groups, ordering and transition settings.
- Station links carry a copy of the configuration to another device.
- Profiles and layouts are stored locally in the browser.

## v5 — Confirm the switch

- Added per-mix command locking and XML confirmation of the resulting source.
- Uncertain commands are not retried automatically.
- Connection settings collapse after connecting. Cut/Fade and duration presets stay within reach.

## v4 — Beyond CUT

- Added Fade and other supported transition effects, with duration control.
- Transition parameters are sent to the selected mix.

## v3 — One mix, its own view

- Added a dedicated single-mix view with source tiles and a clear program readout.
- Sources can be switched without working through the full matrix.

## v2 — Each operator picks a mix

- Unavailable mixes are hidden and mix names are read from vMix.
- The selected-mix filter is remembered separately in each browser.
- Packaged the dashboard for local and LAN use.

## archive-initial — The first preserved source snapshot

- The initial dashboard reads vMix inputs and routes them to the selected mix.
- This source archive predates the numbered portable packages.
