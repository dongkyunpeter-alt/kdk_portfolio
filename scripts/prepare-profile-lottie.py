"""프로필용 dotLottie 에셋을 원본을 훼손하지 않고 생성합니다."""

from __future__ import annotations

import json
import sys
import zipfile
from pathlib import Path


BRAND_COLORS = {
    "Shape L 1": "#287645",
    "Shape S 2": "#F0C94A",
    "Shape T": "#5A936B",
    "Shape T 2": "#D6E2D2",
}


def hex_to_lottie(value: str) -> list[float]:
    value = value.lstrip("#")
    return [int(value[index:index + 2], 16) / 255 for index in (0, 2, 4)]


def recolor(node: object, color: list[float]) -> None:
    if isinstance(node, dict):
        if node.get("ty") in {"fl", "st"} and isinstance(node.get("c"), dict):
            node["c"]["a"] = 0
            node["c"]["k"] = color
        for value in node.values():
            recolor(value, color)
    elif isinstance(node, list):
        for value in node:
            recolor(value, color)


def move_spawn_above_canvas(layer: dict) -> None:
    """완성 좌표는 유지하고 각 조각의 첫 진입 좌표만 화면 위로 옮깁니다."""
    position = layer.get("ks", {}).get("p", {})
    keyframes = position.get("k") if position.get("a") == 1 else None
    if not isinstance(keyframes, list) or not keyframes:
        return

    first_value = keyframes[0].get("s")
    if isinstance(first_value, list) and len(first_value) >= 2:
        first_value[1] = -180


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: prepare-profile-lottie.py INPUT.lottie OUTPUT.lottie")

    source, destination = map(Path, sys.argv[1:])
    with zipfile.ZipFile(source) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        animation_name = f"a/{manifest['initial']['animation']}.json"
        animation = json.loads(archive.read(animation_name))

    for layer in animation.get("layers", []):
        color = BRAND_COLORS.get(layer.get("nm"))
        if color:
            recolor(layer.get("shapes", []), hex_to_lottie(color))
            move_spawn_above_canvas(layer)

        # 원본의 약 7Hz 점멸을 없애 접근성과 시각적 안정성을 높입니다.
        opacity = layer.get("ks", {}).get("o")
        if isinstance(opacity, dict):
            opacity.update({"a": 0, "k": 100})

    destination.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        archive.writestr("manifest.json", json.dumps(manifest, separators=(",", ":")))
        archive.writestr(animation_name, json.dumps(animation, separators=(",", ":")))


if __name__ == "__main__":
    main()
