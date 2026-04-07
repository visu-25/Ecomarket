# Generated manually for longer image URLs and help text

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0003_remove_product_category_remove_product_emoji"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="image_url",
            field=models.URLField(
                blank=True,
                help_text="Direct link to an image file (e.g. ends in .jpg, .png, .webp). Do not use gallery or HTML page URLs—they will not display in the shop.",
                max_length=2048,
            ),
        ),
    ]
