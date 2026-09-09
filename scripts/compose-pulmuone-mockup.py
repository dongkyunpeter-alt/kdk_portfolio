from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BASE = Path(r"C:\Users\PC\Downloads\Frame 2.png")
DESKTOP = ROOT / "assets/images/pulmuone-desktop-screen.png"
MOBILE = ROOT / "assets/images/pulmuone-mobile-screen.png"
OUTPUT = ROOT / "assets/images/pulmuone-project-mockup.png"


base = Image.open(BASE).convert("RGBA")
desktop = Image.open(DESKTOP).convert("RGBA").resize((3456, 2234), Image.Resampling.LANCZOS)
mobile = Image.open(MOBILE).convert("RGBA").resize((786, 1704), Image.Resampling.LANCZOS)

# Figma Frame 2 at 2x export: browser screen is 1728x1117 scaled to 3456x2234.
base.alpha_composite(desktop, (272, 922))

# The phone screen is the original 393x852 region scaled exactly to 786x1704.
phone_x, phone_y = 3016, 1412
phone_mask = Image.new("L", mobile.size, 0)
ImageDraw.Draw(phone_mask).rounded_rectangle(
    (0, 0, mobile.width - 1, mobile.height - 1), radius=108, fill=255
)
base.paste(mobile, (phone_x, phone_y), phone_mask)

# Restore only the original Figma hardware frame, side buttons, and Dynamic Island.
source = Image.open(BASE).convert("RGBA")
hardware_mask = Image.new("L", base.size, 0)
mask_px = hardware_mask.load()
source_px = source.load()

for y in range(1340, 3180):
    for x in range(2920, 3900):
        r, g, b, _ = source_px[x, y]
        is_dark = max(r, g, b) < 85
        is_hardware_zone = x < 3040 or x > 3777 or y < 1515 or y > 3070
        if is_dark and is_hardware_zone:
            mask_px[x, y] = 255

base.paste(source, (0, 0), hardware_mask)

# Replace only the outer canvas with a quiet green color gradient.
# The device layout and screen contents remain on the exact Figma coordinates.
gradient_map = Image.linear_gradient("L").resize(base.size)
green_background = ImageOps.colorize(
    gradient_map,
    black="#F5FAF2",
    white="#DCECDC",
).convert("RGBA")

device_mask = Image.new("L", base.size, 0)
device_mask_draw = ImageDraw.Draw(device_mask)
device_mask_draw.rounded_rectangle((250, 820, 3750, 3180), radius=55, fill=255)
device_mask_draw.rounded_rectangle((2930, 1330, 3890, 3190), radius=170, fill=255)
device_mask = device_mask.filter(ImageFilter.GaussianBlur(12))
base = Image.composite(base, green_background, device_mask)

# Keep the Figma frame's original 4000px export resolution so small UI text
# remains sharp on high-density displays.
base = base.convert("RGB")
base.save(OUTPUT, "PNG", optimize=True)
print(OUTPUT)
