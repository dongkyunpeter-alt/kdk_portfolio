from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
DESKTOP_MOCKUP = Path(r"C:\Users\PC\Downloads\dark.png")
MOBILE_SCREEN = ROOT / "assets/images/pulmuone-mobile-screen.png"
OUTPUT = ROOT / "assets/images/pulmuone-project-mockup.png"


# Keep the supplied 4x browser mockup at its original 7424x4980 resolution.
canvas = Image.open(DESKTOP_MOCKUP).convert("RGBA")
mobile = Image.open(MOBILE_SCREEN).convert("RGB")

# Phone placement follows the Figma composition: lower-right overlap with a
# shared bottom baseline. Only this region is drawn over the original browser.
phone_box = (5790, 1625, 7210, 4705)
phone_width = phone_box[2] - phone_box[0]
phone_height = phone_box[3] - phone_box[1]

shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.rounded_rectangle(
    (phone_box[0] + 38, phone_box[1] + 46, phone_box[2] + 38, phone_box[3] + 46),
    radius=230,
    fill=(0, 0, 0, 115),
)
shadow = shadow.filter(ImageFilter.GaussianBlur(34))
canvas.alpha_composite(shadow)

phone = Image.new("RGBA", (phone_width, phone_height), (0, 0, 0, 0))
phone_draw = ImageDraw.Draw(phone)
phone_draw.rounded_rectangle(
    (0, 0, phone_width - 1, phone_height - 1),
    radius=230,
    fill="#171717",
)

screen_box = (54, 54, phone_width - 54, phone_height - 54)
screen_size = (screen_box[2] - screen_box[0], screen_box[3] - screen_box[1])
screen = mobile.resize(screen_size, Image.Resampling.LANCZOS)
screen_mask = Image.new("L", screen_size, 0)
ImageDraw.Draw(screen_mask).rounded_rectangle(
    (0, 0, screen_size[0] - 1, screen_size[1] - 1),
    radius=178,
    fill=255,
)
phone.paste(screen, (screen_box[0], screen_box[1]), screen_mask)

# Restore a clean device edge and Dynamic Island over the mobile screenshot.
phone_draw = ImageDraw.Draw(phone)
phone_draw.rounded_rectangle(
    (1, 1, phone_width - 2, phone_height - 2),
    radius=230,
    outline="#171717",
    width=54,
)
island_width, island_height = 360, 112
island_x = (phone_width - island_width) // 2
phone_draw.rounded_rectangle(
    (island_x, 74, island_x + island_width, 74 + island_height),
    radius=island_height // 2,
    fill="#151515",
)

canvas.alpha_composite(phone, (phone_box[0], phone_box[1]))
canvas.save(OUTPUT, "PNG", optimize=True)
print(OUTPUT)
