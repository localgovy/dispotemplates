#!/usr/bin/env python3
"""Inject GitHub Pages SPA routing into docs/ after export."""
from pathlib import Path
import sys

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "docs")
APPS = [
  "amber-reserve","obsidian-glow","rose-noir","ethereal-ghost","emerald-crypt",
  "nebula-clinic","luminous-botanical","citrus-grove","azure-bloom",
]

RESTORE = """<script type="text/javascript">
  /* GitHub Pages SPA path restore (rafgraph/spa-github-pages) */
  (function(l) {
    if (l.search[1] === "/") {
      var decoded = l.search.slice(1).split("&").map(function(s) {
        return s.replace(/~and~/g, "&");
      }).join("?");
      window.history.replaceState(null, null,
        l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location));
</script>
"""

ROOT_404 = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <script type="text/javascript">
      // spa-github-pages redirect for /dispotemplates/<app>/<route>
      (function () {
        var pathSegmentsToKeep = 2;
        var l = window.location;
        var segs = l.pathname.split("/").filter(Boolean);
        if (segs.length <= pathSegmentsToKeep) return;
        if (segs[segs.length - 1] === "404.html") return;

        l.replace(
          l.protocol +
            "//" +
            l.hostname +
            (l.port ? ":" + l.port : "") +
            "/" +
            segs.slice(0, pathSegmentsToKeep).join("/") +
            "/?/" +
            segs
              .slice(pathSegmentsToKeep)
              .join("/")
              .replace(/&/g, "~and~") +
            (l.search
              ? "&" + l.search.slice(1).replace(/&/g, "~and~")
              : "") +
            l.hash
        );
      })();
    </script>
  </head>
  <body>
    <p>Redirecting…</p>
  </body>
</html>
"""

for app in APPS:
  idx = OUT / app / "index.html"
  if not idx.exists():
    continue
  html = idx.read_text()
  if "GitHub Pages SPA path restore" not in html:
    if '<div id="root"></div>' in html:
      html = html.replace('<div id="root"></div>', '<div id="root"></div>\n' + RESTORE)
    else:
      html = html.replace("</body>", RESTORE + "</body>")
    idx.write_text(html)
  (OUT / app / "404.html").write_text(html)

(OUT / "404.html").write_text(ROOT_404)
print(f"SPA routing patched under {OUT}")
