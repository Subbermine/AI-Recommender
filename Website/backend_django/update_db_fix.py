import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'apexbuy.settings')
django.setup()

from api.models import Product

mappings = {
    "Floral Wrap Dress": "image.png",
    "Relaxed Pajama Set": "Relaxed Pyjama set.png",
    "NIVIA Storm Football - Size: 5 (Pack of 1, Multicolor)": "NIVIA Storm Football - Size 5 (Pack of 1, Multicolor).png"
}

for title, img_name in mappings.items():
    try:
        p = Product.objects.get(title=title)
        p.images = [f"/images/{img_name}"]
        p.save()
        print(f"Fixed {title}")
    except Product.DoesNotExist:
        pass
