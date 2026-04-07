# EcoMarket - Eco-Friendly Marketplace

A modern, eco-friendly marketplace website built with Django, PostgreSQL, HTML, CSS, and JavaScript.

## 🚀 Quick Start

**For detailed setup instructions, see [SETUP.md](SETUP.md)**

### Quick Setup (SQLite - No Database Installation)

```bash
# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# OR .venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations
python manage.py migrate

# 4. Create admin user
python manage.py createsuperuser

# 5. Start server
python manage.py runserver
```

Visit http://127.0.0.1:8000/

---

## 📖 Full Setup Guide

See **[SETUP.md](SETUP.md)** for complete step-by-step instructions including:
- PostgreSQL installation and setup
- Environment variable configuration
- Troubleshooting guide
- Production deployment notes

## Features

- 🌱 **Eco-Friendly Products**: Browse 15+ sustainable products
- 🛒 **Shopping Cart**: Add products to cart with quantity management
- 🔍 **Product Search**: Search products by name, description, or category
- 👤 **User Authentication**: Login and Signup functionality
- 💳 **Payment Methods Display**: View supported payment options (no gateway integration)
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Running Locally

1. Simply open `index.html` in your web browser, or
2. Use a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

## Pages

- **Homepage** (`index.html`): Browse products and search
- **Login** (`login.html`): User login page
- **Signup** (`signup.html`): User registration page
- **Cart** (`cart.html`): View and manage cart items

## Demo Products

The website includes 15 eco-friendly products including:
- Bamboo toothbrushes
- Reusable shopping bags
- Stainless steel water bottles
- Organic cotton products
- Solar-powered lights
- And more!

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- LocalStorage for data persistence

## Django + PostgreSQL (no Docker)

This repo now includes a Django backend (for real **products** and **user login/signup** storage) that can use **PostgreSQL**.

### 1) Create and activate a virtualenv

```bash
cd /home/vishwajit/Workspace/Ecomarket
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

### 2) Install PostgreSQL (direct install) and create a database

On Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

Create DB + user:

```bash
sudo -u postgres psql
CREATE DATABASE ecomarket;
CREATE USER ecomarket_user WITH PASSWORD 'replace-me';
GRANT ALL PRIVILEGES ON DATABASE ecomarket TO ecomarket_user;
\\q
```

### 3) Export DB settings (example)

This project reads DB config from environment variables. See `env.example`.

```bash
export DJANGO_SECRET_KEY='replace-me'
export DJANGO_DEBUG=1
export DJANGO_ALLOWED_HOSTS='127.0.0.1,localhost'

export POSTGRES_DB='ecomarket'
export POSTGRES_USER='ecomarket_user'
export POSTGRES_PASSWORD='replace-me'
export POSTGRES_HOST='127.0.0.1'
export POSTGRES_PORT='5432'
```

### 4) Run migrations + start server

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Open:
- Admin: `http://127.0.0.1:8000/admin/` (add Products there)

### MSSQL?

You *can* use MS SQL Server with Django, but PostgreSQL is the simplest/most common choice.
If you want MSSQL, you typically use `mssql-django` (plus an ODBC driver) and set `ENGINE` accordingly.

## Notes

- User data and cart are stored in browser's localStorage
- Payment gateway integration is not included (only payment methods display)
- All products are demo products with emoji icons
