# Decisions

## Slice 1

- Use a single static HTML page with vanilla CSS and JavaScript. There is no build tool, framework, model call, or server state in the foundation.
- In this slice, Continue confirms that the citizen's `Observed` words are held for the browser session. It does not route, diagnose, or show the read-back screen; those begin in Slice 3.
- Speech uses the browser's Web Speech API when available. If the browser does not provide it, the screen gives a clear type-or-body-map fallback instead of failing silently.
- The body-map promise is introduced with Slice 2, so the Slice 1 checkpoint does not advertise an interaction that is not yet deployed.

## Slice 2

- The body map has twelve semantic controls: ten front regions, one combined upper-or-lower back region, and whole body/general. The visible front and back silhouettes are decorative; the labelled buttons are the accessible interaction surface.
- A map-only path records region, duration, and current severity as `Observed`, then stops at a ready-for-next-step summary. It does not route or display a department before Slice 3.
- The typed or spoken sentence is preserved verbatim when someone opens the map, while the map route itself sends nothing to an AI service.
