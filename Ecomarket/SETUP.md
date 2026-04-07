# EcoMarket - Setup Guide

Complete step-by-step guide to run EcoMarket on a new system.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- PostgreSQL (optional - SQLite works for development)
- Git (to clone the repository)

---

## Step 1: Clone or Copy the Project

### Option A: If using Git
```bash
git clone <repository-url>
cd Ecomarket
```

### Option B: If copying files
Copy the entire project folder to the new system.

---

## Step 2: Install Python Dependencies

### 2.1 Create a Virtual Environment

**On Linux/Mac:**
```bash
cd /path/to/Ecomarket
python3 -m venv .venv
source .venv/bin/activate
```

**On Windows:**
```bash
cd C:\path\to\Ecomarket
python -m venv .venv
.venv\Scripts\activate
```

### 2.2 Install Required Packages

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- Django 5.1.6
- psycopg2-binary 2.9.9 (PostgreSQL driver)

---

## Step 3: Database Setup

You have two options:

### Option A: Use SQLite (Easiest - No Installation Required)

**SQLite works automatically!** Just skip to Step 4. Django will create a `db.sqlite3` file automatically.

### Option B: Use PostgreSQL (Recommended for Production)

#### 3.1 Install PostgreSQL

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

**On CentOS/RHEL:**
```bash
sudo yum install postgresql postgresql-server
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
Download and install from: https://www.postgresql.org/download/windows/

**On Mac:**
```bash
brew install postgresql
brew services start postgresql
```

#### 3.2 Create Database and User

```bash
# Switch to postgres user (Linux/Mac)
sudo -u postgres psql

# Or on Windows, open "SQL Shell (psql)" from Start Menu
```

Then run these SQL commands:
```sql
CREATE DATABASE ecomarket;
CREATE USER ecomarket_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE ecomarket TO ecomarket_user;
ALTER USER ecomarket_user CREATEDB;
\q
```

---

## Step 4: Configure Environment Variables

### 4.1 Create `.env` File (Optional but Recommended)

Copy the example file:
```bash
cp env.example .env
```

### 4.2 Set Environment Variables

**For SQLite (Default - No setup needed):**
No environment variables needed! Django will use SQLite automatically.

**For PostgreSQL:**

**On Linux/Mac:**
```bash
export DJANGO_SECRET_KEY='your-secret-key-here-change-this-in-production'
export DJANGO_DEBUG=1
export DJANGO_ALLOWED_HOSTS='127.0.0.1,localhost'

export POSTGRES_DB='ecomarket'
export POSTGRES_USER='ecomarket_user'
export POSTGRES_PASSWORD='your_secure_password_here'
export POSTGRES_HOST='127.0.0.1'
export POSTGRES_PORT='5432'
```

**On Windows (Command Prompt):**
```cmd
set DJANGO_SECRET_KEY=your-secret-key-here-change-this-in-production
set DJANGO_DEBUG=1
set DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

set POSTGRES_DB=ecomarket
set POSTGRES_USER=ecomarket_user
set POSTGRES_PASSWORD=your_secure_password_here
set POSTGRES_HOST=127.0.0.1
set POSTGRES_PORT=5432
```

**On Windows (PowerShell):**
```powershell
$env:DJANGO_SECRET_KEY="your-secret-key-here-change-this-in-production"
$env:DJANGO_DEBUG="1"
$env:DJANGO_ALLOWED_HOSTS="127.0.0.1,localhost"

$env:POSTGRES_DB="ecomarket"
$env:POSTGRES_USER="ecomarket_user"
$env:POSTGRES_PASSWORD="your_secure_password_here"
$env:POSTGRES_HOST="127.0.0.1"
$env:POSTGRES_PORT="5432"
```

**Note:** To make environment variables persistent, add them to your `.env` file or system environment variables.

---

## Step 5: Run Database Migrations

Make sure your virtual environment is activated, then:

```bash
python manage.py migrate
```

This creates all necessary database tables (users, products, sessions, etc.).

---

## Step 6: Create Admin Superuser

Create an admin account to access Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Username: (enter your username)
- Email: (optional)
- Password: (enter a secure password)
- Password (again): (confirm password)

---

## Step 7: Start the Development Server

```bash
python manage.py runserver
```

Or to make it accessible from other devices on your network:

```bash
python manage.py runserver 0.0.0.0:8000
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

---

## Step 8: Access the Website

Open your web browser and navigate to:

- **Homepage**: http://127.0.0.1:8000/
- **Admin Panel**: http://127.0.0.1:8000/admin/
- **Cart**: http://127.0.0.1:8000/cart/
- **Login**: http://127.0.0.1:8000/login/
- **Signup**: http://127.0.0.1:8000/signup/

---

## Step 9: Add Products (Optional)

1. Go to http://127.0.0.1:8000/admin/
2. Login with your superuser credentials
3. Click on "Products" under "STORE"
4. Click "Add Product"
5. Fill in the form:
   - **Name**: Product name (required)
   - **Description**: Product description (optional)
   - **Price**: Product price (required)
   - **SKU**: Stock keeping unit (optional)
   - **Image URL**: Product image URL (optional)
   - **Emoji**: Emoji icon (optional, defaults to 🌱)
   - **Category**: Product category (optional, defaults to "General")
   - **Is Active**: Check this to show product on website
6. Click "Save"

Your products will appear on the homepage alongside the 15 demo products!

---

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'django'"

**Solution:** Make sure your virtual environment is activated:
```bash
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

### Issue: "django.db.utils.OperationalError: could not connect to server"

**Solution:** 
- Check if PostgreSQL is running: `sudo systemctl status postgresql` (Linux)
- Verify your database credentials in environment variables
- Try using SQLite instead (remove PostgreSQL env vars)

### Issue: "Port 8000 already in use"

**Solution:** Use a different port:
```bash
python manage.py runserver 8001
```

### Issue: Static files (CSS/JS) not loading

**Solution:** The static files should work automatically. If not, check:
- You're accessing via Django server (not opening HTML files directly)
- URLs use absolute paths (starting with `/`)

### Issue: "No such file or directory: manage.py"

**Solution:** Make sure you're in the project root directory where `manage.py` is located.

---

## Quick Start (SQLite - No Database Setup)

If you just want to run it quickly without PostgreSQL:

```bash
# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate     # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run migrations (creates SQLite database)
python manage.py migrate

# 4. Create admin user
python manage.py createsuperuser

# 5. Start server
python manage.py runserver
```

That's it! Visit http://127.0.0.1:8000/

---

## Production Deployment Notes

For production deployment:

1. **Set DEBUG=False** in environment variables
2. **Set a strong SECRET_KEY** (generate with: `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`)
3. **Set ALLOWED_HOSTS** to your domain
4. **Use PostgreSQL** (not SQLite)
5. **Collect static files**: `python manage.py collectstatic`
6. **Use a production WSGI server** (like Gunicorn + Nginx)

---

## File Structure

```
Ecomarket/
├── backend/              # Django project settings
│   ├── settings.py       # Django configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI configuration
├── store/               # Django app (products, views)
│   ├── models.py        # Product model
│   ├── views.py         # API endpoints
│   └── admin.py         # Admin configuration
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
├── env.example          # Environment variables template
├── index.html           # Homepage
├── cart.html            # Cart page
├── login.html           # Login page
├── signup.html          # Signup page
├── styles.css           # Stylesheet
└── script.js            # JavaScript (products, cart, etc.)
```

---

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure virtual environment is activated
4. Check that migrations have been run
5. Verify database connection (if using PostgreSQL)

---

## License

[Your License Here]
