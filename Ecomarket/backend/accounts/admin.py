from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import AccountProfile, UserAddress


class AccountProfileInline(admin.StackedInline):
    model = AccountProfile
    can_delete = False
    verbose_name = "Phone"
    verbose_name_plural = "Phone"


def phone_for_user(user_obj: User) -> str:
    profile = getattr(user_obj, "profile", None)
    return getattr(profile, "phone", "") if profile else ""


# `django.contrib.auth` already registers `User` by default, so we replace it
# to include the `AccountProfile` inline.
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = [AccountProfileInline]
    list_display = ("id", "username", "email", "first_name", "is_active", "phone_for_user")
    list_filter = ("is_active", "is_staff", "is_superuser")
    search_fields = ("email", "username", "first_name", "last_name")

    # Expose as a method name Django can resolve in `list_display`.
    phone_for_user = staticmethod(phone_for_user)


@admin.register(UserAddress)
class UserAddressAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "full_name", "city", "state", "is_default", "created_at")
    list_filter = ("is_default", "country")
    search_fields = ("full_name", "line1", "city", "user__email")
    raw_id_fields = ("user",)
