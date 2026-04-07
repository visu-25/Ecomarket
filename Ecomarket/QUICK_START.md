# EcoMarket - Quick Start Checklist

## ✅ Setup Checklist

### 1. Prerequisites
- [ ] Python 3.8+ installed
- [ ] pip installed
- [ ] PostgreSQL installed (optional - SQLite works too)

### 2. Project Setup
- [ ] Clone/copy project to new system
- [ ] Navigate to project directory
- [ ] Create virtual environment: `python3 -m venv .venv`
- [ ] Activate virtual environment:
  - Linux/Mac: `source .venv/bin/activate`
  - Windows: `.venv\Scripts\activate`
- [ ] Install dependencies: `pip install -r requirements.txt`

### 3. Database (Choose One)

**Option A: SQLite (Easiest)**
- [ ] No setup needed! Skip to step 4.

**Option B: PostgreSQL**
- [ ] PostgreSQL installed and running
- [ ] Database created: `CREATE DATABASE ecomarket;`
- [ ] User created with permissions
- [ ] Environment variables set (see env.example)

### 4. Django Setup
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Start server: `python manage.py runserver`

### 5. Access
- [ ] Open browser: http://127.0.0.1:8000/
- [ ] Admin panel: http://127.0.0.1:8000/admin/
- [ ] Login with superuser credentials
- [ ] Add products in admin panel

---

## 🔧 Common Commands

```bash
# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start development server
python manage.py runserver

# Start server on specific port
python manage.py runserver 8001

# Start server accessible from network
python manage.py runserver 0.0.0.0:8000
```

---

## 🌐 URLs

- Homepage: http://127.0.0.1:8000/
- Admin: http://127.0.0.1:8000/admin/
- Cart: http://127.0.0.1:8000/cart/
- Login: http://127.0.0.1:8000/login/
- Signup: http://127.0.0.1:8000/signup/
- API: http://127.0.0.1:8000/api/products/

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Activate virtual environment |
| Port in use | Use different port: `runserver 8001` |
| Database error | Check PostgreSQL is running or use SQLite |
| Static files not loading | Access via Django server, not direct HTML |

---

## 📚 Full Documentation

For detailed instructions, see **[SETUP.md](SETUP.md)**
