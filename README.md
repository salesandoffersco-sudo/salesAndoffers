# Sales & Offers Platform

A modern ecommerce platform connecting buyers and sellers through amazing deals and offers.

## Project Structure

- `sales_offers_frontend/` - Next.js frontend application
- `sales_offers_backend/` - Django backend API

## Frontend (Next.js)

### Setup
```bash
cd sales_offers_frontend
npm install
npm run dev
```

### Deployment
Deploy to Vercel by connecting this repository.

## Backend (Django)

### Setup
```bash
cd sales_offers_backend
pip install django djangorestframework django-cors-headers
python manage.py migrate
python manage.py runserver
```

### Deployment
Deploy to Render by connecting this repository and using the `sales_offers_backend` directory.

## Features

- User authentication (buyers and sellers)
- Seller dashboard with offer management
- Subscription plans for sellers
- Responsive design with dark/light mode
- Real-time offer browsing
- Seller profiles and ratings

## Tech Stack

**Frontend:**
- Next.js 15
- TypeScript
- Tailwind CSS
- Axios

**Backend:**
- Django 5.1
- Django REST Framework
- SQLite (development)
- CORS headers

<!-- Deployment trigger: Platform ready for production deployment -->