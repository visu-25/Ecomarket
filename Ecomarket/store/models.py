from decimal import Decimal

from django.conf import settings
from django.db import models


# Keep in sync with demo categories in script.js (STATIC_PRODUCTS).
PRODUCT_CATEGORY_CHOICES = [
    ("General", "General"),
    ("Personal Care", "Personal Care"),
    ("Accessories", "Accessories"),
    ("Kitchen", "Kitchen"),
    ("Clothing", "Clothing"),
    ("Electronics", "Electronics"),
    ("Fitness", "Fitness"),
    ("Stationery", "Stationery"),
    ("Home & Garden", "Home & Garden"),
]


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(
        max_length=100,
        choices=PRODUCT_CATEGORY_CHOICES,
        default="General",
        help_text="Used for storefront filters.",
    )
    sku = models.CharField(max_length=64, blank=True)
    image = models.ImageField(
        upload_to="product_images/%Y/%m/",
        blank=True,
        null=True,
        help_text="Upload a product photo (shown on the storefront).",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    payment_method = models.CharField(max_length=32)
    shipping_snapshot = models.JSONField(
        help_text="Delivery address fields as they were at checkout.",
    )
    total = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order {self.pk} — {self.user_id} — ₹{self.total}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product_id = models.PositiveIntegerField(
        help_text="Storefront product id (static or DB offset id).",
    )
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["pk"]

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity

    def __str__(self) -> str:
        return f"{self.product_name} × {self.quantity}"
