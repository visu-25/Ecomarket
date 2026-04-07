"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from store import views
from backend.accounts import views as accounts_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', views.products_api, name='products_api'),
    path('api/signup/', accounts_views.signup_api, name='signup_api'),
    path('api/login/', accounts_views.login_api, name='login_api'),
    path('api/logout/', accounts_views.logout_api, name='logout_api'),
    path('api/me/', accounts_views.me_api, name='me_api'),
    path('api/addresses/', accounts_views.addresses_api, name='addresses_api'),
    path('api/addresses/<int:pk>/', accounts_views.address_detail_api, name='address_detail_api'),
    path('api/orders/', views.orders_api, name='orders_api'),
    path('', views.home, name='home'),
    path('home/', views.home, name='home_alt'),
    path('cart/', views.cart, name='cart'),
    path('checkout/', views.checkout_view, name='checkout'),
    path('account/', views.account_view, name='account'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('product-details/', views.product_details, name='product_details'),
    # Serve CSS and JS files from root
    path('styles.css', views.serve_css, name='styles'),
    path('script.js', views.serve_js, name='script'),
]

# Serve static files during development
urlpatterns += staticfiles_urlpatterns()

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
