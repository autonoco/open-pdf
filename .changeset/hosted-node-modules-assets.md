---
"@autono/open-pdf": patch
---

Serve the PDF renderer's WASM, pdf.js worker and UI font when node_modules is symlinked from outside the project, and report a render worker that fails to start instead of waiting forever.
