# PGM capabilities

Documentation review: 11 September 2026. Reference version: vMix 29. Availability also depends on the installed vMix version, edition and configured inputs. This is a map of control families, not a claim that every vMix function is implemented in this dashboard.

## What belongs where

| Area | Available controls | Dashboard 19.6 |
| --- | --- | --- |
| Switching | Preview, Cut, Fade, Wipe, Zoom, other transition effects | Available |
| Stingers | Animation transitions using configured channels | Existing AUTO support; dedicated selectors on PGM and supported AUX mixes |
| Overlays | Fullscreen or PiP source composition | PGM and AUX IN/OUT added; available channels come from XML |
| FTB | Fade output destinations to black and restore | Added with explicit activation and state feedback |
| T-Bar | Manual Preview-to-Output transition | Documented; not implemented |
| Audio | Master, A–G, level, mute, solo, follow | Separate mixer recommended |
| Input playback | Play, pause, restart, loop, seek | Play after switching exists; transport panel is future work |
| Titles | Text, presets, images, animation, countdowns | Future module |
| Outputs | Routing, fullscreen, snapshots | Future administrator module |
| Production | Recording, streaming, external, MultiCorder, SRT | REC/STREAM/EXT status only |
| Specialist tools | Replay, PTZ, calls, playlists, scripting | Separate modules, outside this release |

The API function families are documented in the [shortcut reference](https://www.vmix.com/help29/ShortcutFunctionReference.html). Input, output and production controls are not private to one video mix. They should not be exposed as if switching a selected AUX isolates their effects.

## Transitions and stingers

The four transition buttons in vMix are configurable. Its first transition button also selects the effect used by the T-Bar. Dashboard AUTO currently sends the selected effect directly; it does not rewrite those four native presets. [Transition buttons](https://www.vmix.com/help29/Transitions.html)

Stingers use animations configured in vMix. Selecting a numbered button in this dashboard only selects the effect; AUTO performs the transition. The dashboard does not upload animation assets or claim a slot is configured. Stingers require an edition with more than one overlay channel. [Stinger setup](https://www.vmix.com/help29/StingerTransitions.html)

The vMix 29 Mix documentation explicitly supports shared overlay and stinger channels on additional mixes. T-Bar, automatic input playback behavior and audio auto-mixing remain restricted there. Treating every AUX as “no stingers” would be incorrect for current versions. [Mix inputs](https://doc.vmix.com/help29/Mix.html)

## Overlays and output state

vMix 29 provides up to eight overlay channels; Basic HD has one. Layout, transition effect, animation duration, PiP geometry and automatic closing belong to the native overlay configuration. This release discovers the channels from XML instead of drawing eight potentially unavailable controls. [Overlays](https://www.vmix.com/help29/Overlay2.html)

The API exposes overlay channel state and root production flags. Missing flags are unknown, not OFF. Source references are resolved against current inputs. New commands use the current state as a precondition, check the result, and never automatically resend an uncertain operation. [HTTP API and XML](https://www.vmix.com/help29/DeveloperAPI.html)

FTB affects output destinations while leaving the native Output window visible for preparing the next source. Therefore the dashboard keeps the PGM source readout and indicates FTB separately. [FTB behavior](https://www.vmix.com/help29/FadeToBlack.html)

## Next implementation priorities

1. **Audio drawer:** Master and selected input first, then bus routing. A source mute affects every audio bus; solo is a headphone-monitoring operation. [Audio mixer](https://www.vmix.com/help29/Mixer.html)
2. **Manual T-Bar:** a dedicated control with ownership during the gesture, ordered updates, cancellation handling and recovery after disconnection. A decorative slider would not be sufficient.
3. **Production drawer:** recording and streaming start/stop beside verified status, separated from the source banks. Recording formats and streaming destinations remain configured in vMix. [Recording](https://www.vmix.com/help29/Recording.html), [Streaming](https://www.vmix.com/help29/Streaming.html)
4. **Title and transport drawers:** context-sensitive controls for the selected input, keeping the main Switcher compact.

The visual structure should stay consistent: the two source banks remain central, transitions remain beside them, and occasional production controls live in a collapsible tray or drawer. Colour indicates state; inactive controls remain matte. FTB must never look like an ordinary source key.

## Validation limits

The new overlay and FTB commands are covered by simulated transport tests, including stale state, shared locks, all eight overlay channels and uncertain delivery. Demo has shared overlay/FTB state, but no rendered video. Physical vMix and mobile visual verification are still required before calling the integration production-validated.

## 19.6 update

The production tray is available on additional mixes for vMix 28+ and demo. IN targets the selected mix; OUT clears the global channel. Channel state is global: ON does not prove visibility on the selected mix. The dashboard permits sending an already-active source to a new target. FTB remains exclusive to PGM.
