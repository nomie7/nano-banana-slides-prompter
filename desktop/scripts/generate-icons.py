#!/usr/bin/env python3
"""Generate app icons for Nano Banana Slides Prompter."""

import math
from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Installing Pillow...")
    import subprocess
    subprocess.run(["pip", "install", "pillow", "-q"])
    from PIL import Image, ImageDraw


def create_banana_icon(size: int = 1024) -> Image.Image:
    """Create a modern banana-themed app icon."""
    # Create canvas with dark purple background (matches app theme)
    img = Image.new('RGBA', (size, size), (26, 26, 46, 255))  # #1a1a2e
    draw = ImageDraw.Draw(img)

    # Calculate dimensions
    margin = size * 0.1
    center_x, center_y = size // 2, size // 2

    # Draw rounded rectangle background (golden gradient effect)
    corner_radius = size * 0.2
    bg_rect = [margin, margin, size - margin, size - margin]

    # Create gradient background rectangle
    for i in range(int(size - 2 * margin)):
        y = margin + i
        # Gradient from gold to orange
        ratio = i / (size - 2 * margin)
        r = int(255 - ratio * 30)
        g = int(200 - ratio * 50)
        b = int(50 + ratio * 20)
        draw.line([(margin, y), (size - margin, y)], fill=(r, g, b, 255))

    # Draw banana shape (stylized crescent)
    banana_color = (255, 220, 80, 255)  # Bright banana yellow
    banana_highlight = (255, 240, 150, 255)
    banana_shadow = (230, 180, 50, 255)

    # Main banana body - curved shape
    banana_width = size * 0.5
    banana_height = size * 0.6
    banana_x = center_x - banana_width * 0.3
    banana_y = center_y - banana_height * 0.4

    # Draw stylized banana as curved ellipse
    points = []
    for angle in range(0, 360, 5):
        rad = math.radians(angle)
        # Create banana curve
        rx = banana_width * 0.4 * (1 + 0.3 * math.sin(rad * 2))
        ry = banana_height * 0.35
        x = center_x + rx * math.cos(rad) - size * 0.05
        y = center_y + ry * math.sin(rad) * (1 + 0.2 * math.cos(rad))
        points.append((x, y))

    if len(points) >= 3:
        draw.polygon(points, fill=banana_color)

    # Draw presentation slide frame overlay
    slide_margin = size * 0.25
    slide_rect = [
        slide_margin + size * 0.05,
        slide_margin + size * 0.1,
        size - slide_margin - size * 0.05,
        size - slide_margin - size * 0.05
    ]

    # Slide background (semi-transparent white)
    draw.rounded_rectangle(slide_rect, radius=size * 0.03, fill=(255, 255, 255, 200))

    # Slide content lines (representing text)
    line_y_start = slide_rect[1] + size * 0.08
    line_height = size * 0.04
    line_spacing = size * 0.06
    line_margin = size * 0.06

    for i in range(3):
        y = line_y_start + i * line_spacing
        line_width = (size * 0.35) if i == 0 else (size * 0.25 - i * size * 0.03)
        draw.rounded_rectangle(
            [slide_rect[0] + line_margin, y,
             slide_rect[0] + line_margin + line_width, y + line_height],
            radius=size * 0.01,
            fill=(255, 200, 50, 255)  # Golden lines
        )

    # Draw small banana accent in corner
    accent_size = size * 0.12
    accent_x = slide_rect[2] - accent_size - size * 0.03
    accent_y = slide_rect[3] - accent_size - size * 0.02

    draw.ellipse(
        [accent_x, accent_y, accent_x + accent_size, accent_y + accent_size * 0.6],
        fill=(255, 210, 60, 255)
    )

    # Add subtle border to entire icon
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=corner_radius,
        outline=(255, 200, 50, 100),
        width=int(size * 0.01)
    )

    return img


def generate_ico(source: Image.Image, output_path: Path):
    """Generate Windows .ico file with multiple sizes."""
    sizes = [16, 24, 32, 48, 64, 128, 256]
    icons = []
    for size in sizes:
        resized = source.resize((size, size), Image.Resampling.LANCZOS)
        icons.append(resized)
    icons[0].save(output_path, format='ICO', sizes=[(s, s) for s in sizes], append_images=icons[1:])
    print(f"Created: {output_path}")


def generate_icns(source: Image.Image, output_dir: Path):
    """Generate macOS .icns by creating iconset folder."""
    iconset_dir = output_dir / "icon.iconset"
    iconset_dir.mkdir(exist_ok=True)

    # macOS icon sizes
    sizes = {
        "icon_16x16.png": 16,
        "icon_16x16@2x.png": 32,
        "icon_32x32.png": 32,
        "icon_32x32@2x.png": 64,
        "icon_128x128.png": 128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png": 256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png": 512,
        "icon_512x512@2x.png": 1024,
    }

    for filename, size in sizes.items():
        resized = source.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(iconset_dir / filename, format='PNG')

    print(f"Created iconset at: {iconset_dir}")
    print("Note: Run 'iconutil -c icns icon.iconset' on macOS to create .icns")

    # Also save a placeholder .icns (actually PNG, will be replaced by CI)
    source.resize((512, 512), Image.Resampling.LANCZOS).save(
        output_dir / "icon.icns", format='PNG'
    )


def generate_png_sizes(source: Image.Image, output_dir: Path):
    """Generate PNG files for Linux and other uses."""
    sizes = [16, 32, 48, 64, 128, 256, 512, 1024]

    for size in sizes:
        resized = source.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(output_dir / f"{size}x{size}.png", format='PNG')

    # Main icon.png (512x512 for Linux)
    source.resize((512, 512), Image.Resampling.LANCZOS).save(
        output_dir / "icon.png", format='PNG'
    )
    print(f"Created PNG icons in: {output_dir}")


def main():
    # Paths
    script_dir = Path(__file__).parent
    icons_dir = script_dir.parent / "resources" / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)

    print("Generating Nano Banana Slides Prompter icons...")

    # Generate source icon
    source_icon = create_banana_icon(1024)
    source_path = icons_dir / "icon-source.png"
    source_icon.save(source_path, format='PNG')
    print(f"Created source icon: {source_path}")

    # Generate platform-specific icons
    generate_ico(source_icon, icons_dir / "icon.ico")
    generate_icns(source_icon, icons_dir)
    generate_png_sizes(source_icon, icons_dir)

    # Clean up .gitkeep if exists
    gitkeep = icons_dir / ".gitkeep"
    if gitkeep.exists():
        gitkeep.unlink()

    print("\nIcon generation complete!")
    print(f"Icons saved to: {icons_dir}")


if __name__ == "__main__":
    main()
