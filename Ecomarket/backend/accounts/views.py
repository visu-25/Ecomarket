import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods, require_POST

from django.core.mail import send_mail
from django.conf import settings
from .models import AccountProfile, UserAddress


def _get_json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None


@csrf_exempt
@require_POST
def signup_api(request):
    """
    Create a new user from JSON body:
    { name, email, phone, password }
    """

    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    password = data.get("password") or ""

    if not name or not email or not password:
        return JsonResponse({"error": "name, email, and password are required"}, status=400)

    if len(password) < 6:
        return JsonResponse({"error": "Password must be at least 6 characters"}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already registered"}, status=409)

    user = User.objects.create_user(
        username=email,  # authenticate() uses the `username` field by default
        email=email,
        first_name=name,
        password=password,
    )
    AccountProfile.objects.create(user=user, phone=phone)

    # Keep API simple; client can call /api/login/ after signup if needed.
    return JsonResponse({"message": "Account created successfully"}, status=201)


@csrf_exempt
@require_POST
def login_api(request):
    """Login from JSON body: { email, password }"""

    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return JsonResponse({"error": "email and password are required"}, status=400)

    user = authenticate(request, username=email, password=password)
    if not user:
        return JsonResponse({"error": "Invalid email or password"}, status=401)

    login(request, user)
    profile = getattr(user, "profile", None)
    phone = profile.phone if profile else ""
    return JsonResponse(
        {
            "message": "Login successful",
            "name": user.first_name or user.get_username(),
            "email": user.email,
            "phone": phone or "",
        },
        status=200,
    )


@require_POST
@csrf_exempt
def logout_api(request):
    logout(request)
    return JsonResponse({"message": "Logged out"}, status=200)


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def me_api(request):
    if not request.user.is_authenticated:
        if request.method == "GET":
            return JsonResponse({"authenticated": False}, status=200)
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "GET":
        profile = getattr(request.user, "profile", None)
        phone = profile.phone if profile else ""
        return JsonResponse(
            {
                "authenticated": True,
                "name": request.user.first_name or request.user.get_username(),
                "email": request.user.email,
                "phone": phone or "",
            },
            status=200,
        )

    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    if "name" in data:
        request.user.first_name = (data.get("name") or "").strip()[:150]

    request.user.save()

    if "phone" in data:
        profile, _ = AccountProfile.objects.get_or_create(
            user=request.user,
            defaults={"phone": ""},
        )
        profile.phone = (data.get("phone") or "").strip()[:20]
        profile.save()

    profile = getattr(request.user, "profile", None)
    phone = profile.phone if profile else ""
    return JsonResponse(
        {
            "authenticated": True,
            "name": request.user.first_name or request.user.get_username(),
            "email": request.user.email,
            "phone": phone or "",
        },
        status=200,
    )


def _address_to_json(addr: UserAddress) -> dict:
    return {
        "id": addr.pk,
        "label": addr.label,
        "full_name": addr.full_name,
        "line1": addr.line1,
        "line2": addr.line2,
        "city": addr.city,
        "state": addr.state,
        "postal_code": addr.postal_code,
        "country": addr.country,
        "phone": addr.phone,
        "is_default": addr.is_default,
    }


def _set_default_address(user, address: UserAddress) -> None:
    UserAddress.objects.filter(user=user).exclude(pk=address.pk).update(is_default=False)
    if not address.is_default:
        address.is_default = True
        address.save(update_fields=["is_default", "updated_at"])


@csrf_exempt
@require_http_methods(["GET", "POST"])
def addresses_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method == "GET":
        rows = request.user.addresses.all()
        return JsonResponse([_address_to_json(a) for a in rows], safe=False)

    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    full_name = (data.get("full_name") or "").strip()
    line1 = (data.get("line1") or "").strip()
    city = (data.get("city") or "").strip()
    state = (data.get("state") or "").strip()
    postal_code = (data.get("postal_code") or "").strip()

    if not full_name or not line1 or not city or not state or not postal_code:
        return JsonResponse(
            {"error": "full_name, line1, city, state, and postal_code are required"},
            status=400,
        )

    is_first = not request.user.addresses.exists()
    want_default = bool(data.get("is_default")) or is_first

    address = UserAddress.objects.create(
        user=request.user,
        label=(data.get("label") or "").strip(),
        full_name=full_name,
        line1=line1,
        line2=(data.get("line2") or "").strip(),
        city=city,
        state=state,
        postal_code=postal_code,
        country=(data.get("country") or "India").strip() or "India",
        phone=(data.get("phone") or "").strip(),
        is_default=want_default,
    )
    if want_default:
        UserAddress.objects.filter(user=request.user).exclude(pk=address.pk).update(is_default=False)
        UserAddress.objects.filter(pk=address.pk).update(is_default=True)
        address.refresh_from_db()

    return JsonResponse(_address_to_json(address), status=201)


@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def address_detail_api(request, pk: int):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    address = get_object_or_404(UserAddress, pk=pk, user=request.user)

    if request.method == "DELETE":
        was_default = address.is_default
        address.delete()
        if was_default:
            fallback = request.user.addresses.order_by("-updated_at").first()
            if fallback:
                UserAddress.objects.filter(pk=fallback.pk).update(is_default=True)
        return JsonResponse({"message": "Deleted"}, status=200)

    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    if "label" in data:
        address.label = (data.get("label") or "").strip()
    if "full_name" in data:
        fn = (data.get("full_name") or "").strip()
        if not fn:
            return JsonResponse({"error": "full_name cannot be empty"}, status=400)
        address.full_name = fn
    if "line1" in data:
        l1 = (data.get("line1") or "").strip()
        if not l1:
            return JsonResponse({"error": "line1 cannot be empty"}, status=400)
        address.line1 = l1
    if "line2" in data:
        address.line2 = (data.get("line2") or "").strip()
    if "city" in data:
        c = (data.get("city") or "").strip()
        if not c:
            return JsonResponse({"error": "city cannot be empty"}, status=400)
        address.city = c
    if "state" in data:
        st = (data.get("state") or "").strip()
        if not st:
            return JsonResponse({"error": "state cannot be empty"}, status=400)
        address.state = st
    if "postal_code" in data:
        pc = (data.get("postal_code") or "").strip()
        if not pc:
            return JsonResponse({"error": "postal_code cannot be empty"}, status=400)
        address.postal_code = pc
    if "country" in data:
        address.country = (data.get("country") or "").strip() or "India"
    if "phone" in data:
        address.phone = (data.get("phone") or "").strip()

    address.save()

    if data.get("is_default"):
        _set_default_address(request.user, address)

    address.refresh_from_db()
    return JsonResponse(_address_to_json(address), status=200)


@csrf_exempt
@require_POST
def forgot_password_api(request):
    """
    Simulate sending a reset password link via email (it will show in the terminal).
    { email }
    """
    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    email = (data.get("email") or "").strip().lower()
    if not email:
        return JsonResponse({"error": "email is required"}, status=400)

    user = User.objects.filter(email=email).first()
    if user:
        # Pass the email to the reset link to identify the user later
        reset_link = f"http://127.0.0.1:8000/reset-password/?email={email}&token=demo-token"
        message = (
            f"Hello {user.first_name or user.username},\n\n"
            "You requested a password reset. Click the link below to reset your password:\n\n"
            f"{reset_link}\n\n"
            "If you didn't request this, please ignore this email."
        )
        from_email = settings.DEFAULT_FROM_EMAIL
        subject = "EcoMarket - Password Reset Request"
        try:
            send_mail(subject, message, from_email, [email], fail_silently=False)
        except Exception as e:
            # Check server logs for exact error if it fails even in console mode
            print(f"Failed to send email: {e}")

    # Return a generic success message for security to avoid email enumeration
    return JsonResponse(
        {"message": "A reset link has been sent to your email (if registered). Check your terminal for the email output."},
        status=200
    )


@csrf_exempt
@require_POST
def reset_password_api(request):
    """
    Actually reset the password in the database.
    { email, token, password }
    """
    data = _get_json_body(request)
    if data is None:
        return JsonResponse({"error": "Invalid JSON body"}, status=400)

    email = data.get("email")
    password = data.get("password")
    
    if not email:
        # Should we generic here? For now, we'll keep it simple for testing.
        return JsonResponse({"error": "User identity (email) is missing from the request."}, status=400)
    if not password or len(password) < 6:
        return JsonResponse({"error": "Password must be at least 6 characters"}, status=400)

    user = User.objects.filter(email=email).first()
    if not user:
        return JsonResponse({"error": "User not found."}, status=404)

    # In a real production app, you would also validate the 'token'
    # For this demo, we'll proceed with the password change.
    user.set_password(password)
    user.save()
    
    return JsonResponse({"message": "Your password has been successfully updated. Please login again."}, status=200)
