import os
import django
import shutil

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apexbuy.settings')
django.setup()

from api.models import Product

images_dir = r"c:\Users\ansar\Downloads\SuvarnaAranjo_code\code\images"
dest_dir = r"c:\Users\ansar\Downloads\SuvarnaAranjo_code\Website\frontend\public\images"

os.makedirs(dest_dir, exist_ok=True)

image_files = os.listdir(images_dir)
for img in image_files:
    shutil.copy(os.path.join(images_dir, img), os.path.join(dest_dir, img))

products = Product.objects.all()
updated_count = 0
for p in products:
    # Update price to INR
    if p.price < 5000: # heuristic: if it's less than 5000, it's likely USD
        p.price = round(p.price * 83, 2)
        if p.discount_price:
            p.discount_price = round(p.discount_price * 83, 2)
    
    # Update image
    matched = False
    possible_img_name = f"{p.title}.png"
    if possible_img_name in image_files:
        p.images = [f"/images/{possible_img_name}"]
        matched = True
    else:
        for img in image_files:
            name_without_ext = os.path.splitext(img)[0]
            if name_without_ext.lower() == p.title.lower() or name_without_ext.lower().startswith(p.title.lower()) or p.title.lower().startswith(name_without_ext.lower()):
                p.images = [f"/images/{img}"]
                matched = True
                break
    
    if not matched:
        print(f"No image matched for {p.title}")
    
    p.save()
    updated_count += 1

print(f"Successfully updated {updated_count} products.")
