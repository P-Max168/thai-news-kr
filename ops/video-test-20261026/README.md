# One-off Gemini TTS recovery (local preparation)

Remote publication and execution belong to the parent. These files do not execute until committed to the exact approved branch and matching commit message.

Target new files only:
- `.github/workflows/thai-video-test-20261026.yml`
- `ops/video-test-20261026/tts_once.py`
- `ops/video-test-20261026/test_tts_once.py`
- `ops/video-test-20261026/script_reviewed.json` (parent supplies reviewed version)

Commit message must be exactly `one-off Thai news TTS 2026-10-26`. Branch must be `codex/thai-video-test-20261026-once`. The workflow refuses a rerun, another date or another commit message. No schedule, workflow_dispatch, PR, deployment, YouTube action or repository write permission. Existing workflows untouched. Outputs of a public repository may be publicly accessible: user approval is required before publication/execution.

## API and voice

Official REST:
https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts:generateContent

`parts[].text` is verbatim narration; delivery instructions live only in `parts[].speech_metadata.style`. One fixed prebuilt voice `Kore`, not cloned or custom. `generationConfig.speechConfig.voiceConfig.voice` is the current documented field. No new script generation call: the reviewed Gemini UI script is reused. No dependency install, only Python standard library.

Official docs checked 2026-10-26:
- https://ai.google.dev/gemini-api/docs/generate-content/speech-generation
- https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash-tts
- https://ai.google.dev/gemini-api/docs/pricing#gemini-3.8-flash-tts

Unary response defaults to complete RIFF WAV, 24kHz mono16-bit. The script validates WAV and MIME; it wraps raw `audio/l16` only when actually returned, never wraps an existing RIFF twice. Unsupported MIME, truncated completion, silent/invalid audio, or bad format stops immediately. No fallback API/provider.

## Bounded usage

At most 14 calls: one short calibration, then exactly 13 opening/article/closing segments. No retries. 60-second network timeout per call, local 720-second gate, job15-minute timeout. `maxOutputTokens=3072`. Per narration maximum1200characters, full13segments maximum9000characters. Current supplied script ~3,700characters.

Conservative reservation per call = `(3072 * $9 + 4000 * $0.50)/1,000,000`; all14calls reserve16.60288THB at conservative40THB/USD, below the explicit18.4THB approval guard. Snapshot33.7621THB/USD separately yields14.01370237THB. The entire run is checked before any API call, then checked again before each call. This is a calculated request-limit estimate, not billing/account cap or guarantee. 4,000 input tokens is deliberately conservative for each at-most1,200character Korean input plus short style. If API rejects a generation option or key/model scope, calibration fails and no episode calls follow.

Published standard paid rates through2026-12-31: input$0.50/M text tokens, output$9/M audio tokens;25audio tokens/second. For10minutes, output estimate$0.135 (~4.56THB), plus text input, calibration and GitHub Actions/storage if billable. Not a measured charge. Per-call numeric usage and calculated cost are saved; actual billed amount remains null until billing reconciliation.

Key remains in runner env and header, never file, URL, log or artifact. Redirects refused. Only numeric allowlisted usage and generated WAV/probe information are retained. HTTP error logs show only numeric status. Raw provider error bodies are never printed or saved. Artifact paths are explicit WAV/usage only, retention1day; no source credentials or repository archive.

## Verification

`python3 -m unittest discover -s ops/video-test-20261026 -p 'test_tts_once.py'`

Nine offline tests pass (including budget constants and full-run preflight refusing before any API call): WAV, PCM, numeric usage filtering, MIME rejection, HTTP error sanitization, truncated generation rejection and calibration failure immediate stop. No live API call was made while preparing these files. Full voiced video rendering occurs after parent downloads artifact and maps WAV paths into the existing cloud renderer.
