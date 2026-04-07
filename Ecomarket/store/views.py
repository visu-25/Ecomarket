import json
import os
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.http import FileResponse, Http404, JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from backend.accounts.models import UserAddress

from .models import Order, OrderItem, Product

# Frontend static demo products use small integer ids; DB products use this offset to stay unique.
DB_PRODUCT_ID_OFFSET = 100_000


def products_api(request):
    """JSON list of active products for the storefront (merged with static products in script.js)."""
    placeholder_image = (
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&h=500&fit=crop"
    )
    items = []
    for p in Product.objects.filter(is_active=True).order_by("-created_at"):
        price = float(p.price)
        if price == int(price):
            price = int(price)
        if p.image:
            image = request.build_absolute_uri(p.image.url)
        else:
            image = placeholder_image
        items.append(
            {
                "id": DB_PRODUCT_ID_OFFSET + p.pk,
                "name": p.name,
                "description": p.description or "",
                "price": price,
                "emoji": "🌱",
                "image": image,
                "category": p.category,
            }
        )
    return JsonResponse(items, safe=False)


def home(request):
    """Serve the homepage (index.html)"""
    return render(request, 'index.html')

def cart(request):
    """Serve the cart page"""
    return render(request, 'cart.html')


def checkout_view(request):
    """Multi-step checkout: delivery address then payment."""
    return render(request, 'checkout.html')


def account_view(request):
    """Profile, saved addresses, and order history."""
    return render(request, 'account.html')


PAYMENT_METHOD_LABELS = {
    "cod": "Cash on delivery (COD)",
    "card": "Credit / debit card",
    "upi": "UPI",
    "netbanking": "Net banking",
    "wallet": "Wallet",
}


def _get_json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None


def _shipping_snapshot_from_address(addr: UserAddress) -> dict:
    return {
        "label": addr.label,
        "full_name": addr.full_name,
        "line1": addr.line1,
        "line2": addr.line2,
        "city": addr.city,
        "state": addr.state,
        "postal_code": addr.postal_code,
        "country": addr.country,
        "phone": addr.phone,
    }


def _order_to_json(order: Order) -> dict:
    return {
        "id": order.pk,
        "created_at": order.created_at.isoformat(),
        "payment_method": order.payment_method,
        "payment_label": PAYMENT_METHOD_LABELS.get(order.payment_method, order.payment_method),
        "total": str(order.total),
        "shipping": order.shipping_snapshot,
        "items": [
            {
                "product_id": li.product_id,
                "name": li.product_name,
                "quantity": li.quantity,
                "unit_price": str(li.unit_price),
                "line_total": str(li.line_total),
            }
            for li in order.items.all()
        ],
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def orders_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "GET":
        qs = Order.objects.filter(user=request.user).prefetch_related("items")
        return JsonResponse([_order_to_json(o) for o in qs], safe=False)

    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    try:
        address_id = int(data.get("address_id"))
    except (TypeError, ValueError):
        return JsonResponse({"error": "address_id is required"}, status=400)

    payment_method = (data.get("payment_method") or "").strip().lower()
    if payment_method not in PAYMENT_METHOD_LABELS:
        return JsonResponse({"error": "Invalid payment_method"}, status=400)

    items_in = data.get("items")
    if not isinstance(items_in, list) or len(items_in) == 0:
        return JsonResponse({"error": "items must be a non-empty list"}, status=400)

    addr = UserAddress.objects.filter(pk=address_id, user=request.user).first()
    if not addr:
        return JsonResponse({"error": "Invalid delivery address"}, status=400)

    line_rows = []
    total = Decimal("0.00")
    for raw in items_in:
        if not isinstance(raw, dict):
            return JsonResponse({"error": "Invalid item"}, status=400)
        try:
            pid = int(raw.get("id"))
            qty = int(raw.get("quantity", 0))
            price = Decimal(str(raw.get("price", 0)))
        except (TypeError, ValueError, InvalidOperation):
            return JsonResponse({"error": "Invalid item fields"}, status=400)

        name = (raw.get("name") or "").strip()
        if qty < 1 or price < 0 or not name:
            return JsonResponse({"error": "Invalid item content"}, status=400)

        line_total = price * qty
        total += line_total
        line_rows.append((pid, name, qty, price))

    order = Order.objects.create(
        user=request.user,
        payment_method=payment_method,
        shipping_snapshot=_shipping_snapshot_from_address(addr),
        total=total,
    )
    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                product_id=pid,
                product_name=name,
                quantity=qty,
                unit_price=price,
            )
            for pid, name, qty, price in line_rows
        ]
    )

    return JsonResponse(
        {
            "message": "Order placed successfully",
            "order": _order_to_json(order),
        },
        status=201,
    )


def login_view(request):
    """Serve the login page"""
    return render(request, 'login.html')

def signup_view(request):
    """Serve the signup page"""
    return render(request, 'signup.html')

def product_details(request):
    """Serve the product details page"""
    return render(request, 'product-details.html')

def forgot_password_view(request):
    """Serve the forgot password page"""
    return render(request, 'forgot-password.html')

def reset_password_view(request):
    """Serve the reset password page"""
    return render(request, 'reset-password.html')

def serve_css(request):
    """Serve styles.css file"""
    css_path = os.path.join(settings.BASE_DIR, 'styles.css')
    if os.path.exists(css_path):
        return FileResponse(open(css_path, 'rb'), content_type='text/css')
    raise Http404("CSS file not found")

def serve_js(request):
    """Serve script.js file"""
    js_path = os.path.join(settings.BASE_DIR, 'script.js')
    if os.path.exists(js_path):
        return FileResponse(open(js_path, 'rb'), content_type='application/javascript')
    raise Http404("JS file not found")
