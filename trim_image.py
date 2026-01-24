from PIL import Image
import os

source_path = 'Head_icon.png'
target_path = 'src/assets/header-main.png'

try:
    img = Image.open(source_path)
    print(f"Original size: {img.size}")
    
    # Get bounding box of non-zero alpha pixels
    bbox = img.getbbox()
    
    if bbox:
        print(f"Bounding box: {bbox}")
        # Crop to the bounding box
        cropped_img = img.crop(bbox)
        print(f"Cropped size: {cropped_img.size}")
        
        # Save as PNG to preserve transparency, optimized
        cropped_img.save(target_path, "PNG", optimize=True)
        print(f"Saved to {target_path}")
    else:
        print("Image is completely transparent!")

except Exception as e:
    print(f"Error: {e}")
