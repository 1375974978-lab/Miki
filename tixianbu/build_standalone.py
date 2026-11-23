"""Build a single-file copy of 体线簿 for static hosting."""

from __future__ import annotations

import base64
import mimetypes
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "tixianbu-standalone.html"


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    payload = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{payload}"


def inline_css() -> str:
    css = (ROOT / "styles.css").read_text(encoding="utf-8")

    def replace_asset(match: re.Match[str]) -> str:
        asset_path = ROOT / match.group(1)
        return f'url("{data_uri(asset_path)}")'

    return re.sub(r'url\("(assets/[^"]+)"\)', replace_asset, css)


def inline_script(path: Path) -> str:
    return f"<script>\n{path.read_text(encoding='utf-8')}\n</script>"


def build() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    app = (ROOT / "app.js").read_text(encoding="utf-8")

    html = re.sub(
        r'<link\s+rel="icon"[^>]+>',
        f'<link rel="icon" href="{data_uri(ROOT / "assets/icons/dumbbell.svg")}" type="image/svg+xml" />',
        html,
        count=1,
    )
    html = re.sub(
        r'<link\s+rel="preload"[\s\S]*?/>',
        "",
        html,
        count=1,
    )
    html = html.replace(
        '<link rel="stylesheet" href="styles.css" />',
        f"<style>\n{inline_css()}\n</style>",
    )
    html = html.replace(
        'src="assets/illustrations/undraw-fitness-stats.svg"',
        f'src="{data_uri(ROOT / "assets/illustrations/undraw-fitness-stats.svg")}"',
    )
    html = html.replace(
        '<script src="assets/vendor/three.min.js"></script>',
        inline_script(ROOT / "assets/vendor/three.min.js"),
    )
    html = html.replace(
        '<script src="assets/vendor/GLTFLoader.js"></script>',
        inline_script(ROOT / "assets/vendor/GLTFLoader.js"),
    )
    html = html.replace(
        '<script src="assets/vendor/confetti.browser.js"></script>',
        inline_script(ROOT / "assets/vendor/confetti.browser.js"),
    )
    html = re.sub(
        r'<script>\s*if \(location\.protocol === "file:"\) \{[\s\S]*?</script>',
        inline_script(ROOT / "assets/models/woman-base-light.glb.js"),
        html,
        count=1,
    )

    app = app.replace(
        'location.protocol === "file:" && window.BODY_MODEL_DATA_URI\n'
        '      ? window.BODY_MODEL_DATA_URI\n'
        '      : "assets/models/woman-base-light.glb"',
        'window.BODY_MODEL_DATA_URI || "assets/models/woman-base-light.glb"',
    )
    app = app.replace(
        "assets/illustrations/undraw-fitness-stats.svg",
        data_uri(ROOT / "assets/illustrations/undraw-fitness-stats.svg"),
    )
    html = html.replace(
        '<script src="app.js"></script>',
        f"<script>\n{app}\n</script>",
    )

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Built {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    build()
