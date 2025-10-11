# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Overview
- Monorepo with two primary apps:
  - sales_offers_frontend: Next.js 15 (TypeScript) application using the app/ router, Tailwind CSS, and Axios.
  - sales_offers_backend: Django 5.1 REST API (Django REST Framework), configured for SQLite in development and Render for production.
- Deployment:
  - Frontend: Vercel (see sales_offers_frontend/README.md)
  - Backend: Render (render.yaml encodes build and start commands)

Repository structure (high level)
- sales_offers_frontend/app: route segments for pages (admin, blog, offers, etc.).
- sales_offers_frontend/components: shared UI and layout components.
- sales_offers_frontend/lib: API client and helpers (api.ts, firebase.js, subscription.ts).
- sales_offers_backend/backend: Django project (settings, urls, wsgi/asgi).
- sales_offers_backend/apps (each is a Django app):
  - accounts: user model, auth/serialization, notifications.
  - sellers: seller profiles, subscription plans, middleware, admin.
  - deals: offer data models and endpoints.
  - newsletter: newsletter models and views.
  - blog: basic blogging models and endpoints.
  - transactions: transactional records.

Environment and configuration
- Backend env example at sales_offers_backend/.env.example. Copy it to sales_offers_backend/.env and set values locally before running the API (email config, DATABASE_URL if using Postgres, Firebase keys, etc.).
- Production backend boot steps (from render.yaml) include migrations, collectstatic, optional admin creation, and Gunicorn startup.

Common commands
Frontend (Next.js)
- Install dependencies and run dev server:
```bash path=null start=null
cd sales_offers_frontend
npm install
npm run dev
```
- Build and start (production):
```bash path=null start=null
cd sales_offers_frontend
npm run build
npm run start
```

Backend (Django)
- Install dependencies:
```bash path=null start=null
cd sales_offers_backend
pip install -r requirements.txt
```
- Initialize database and run the server:
```bash path=null start=null
cd sales_offers_backend
python manage.py migrate
python manage.py runserver
```
- Create a superuser (interactive) or use the provided command:
```bash path=null start=null
cd sales_offers_backend
python manage.py createsuperuser
# or
python manage.py create_admin
```
- Run tests (all tests or a subset):
```bash path=null start=null
cd sales_offers_backend
# all tests
python manage.py test
# by app/module
python manage.py test sellers.tests
# by class
python manage.py test sellers.tests.TestClassName
# by test method
python manage.py test sellers.tests.TestClassName.test_method
```
- Make and apply migrations, collect static assets:
```bash path=null start=null
cd sales_offers_backend
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
```

Production reference (from render.yaml)
- The backend service on Render executes the following steps (helpful for simulating prod locally):
```bash path=null start=null
# build
cd sales_offers_backend && pip install -r requirements.txt
# start
cd sales_offers_backend && \
  python manage.py makemigrations && \
  python manage.py migrate && \
  python manage.py collectstatic --noinput && \
  python manage.py create_admin && \
  gunicorn backend.wsgi:application
```

Architecture notes
- Frontend
  - App Router under sales_offers_frontend/app organizes routes for public pages (offers, blog, contact), auth (login/register), profile/dashboard, seller flows (seller/register, seller/dashboard), and admin sections under app/admin/*.
  - Components folder contains shared UI widgets (Navbar, Footer, NotificationBell, CreateOfferModal, etc.).
  - lib/api.ts centralizes HTTP calls to the backend; lib/firebase.js manages client-side Firebase integration where used; Tailwind configured via tailwind.config.ts and global styles in app/globals.css.
- Backend
  - backend/settings.py manages installed apps (Django, DRF, CORS), database, static files (whitenoise in prod), and other project settings.
  - Each app encapsulates models, serializers, views, urls, and tests. URLs are composed in backend/urls.py from per-app urls.
  - Render deployment uses Gunicorn for WSGI; database URL provided by Render. SQLite is suitable for local development per README.

Notes
- No explicit lint/test scripts are defined in sales_offers_frontend/package.json beyond dev/build/start. Use Next.js/TypeScript tooling as needed for local development.
- See README.md (root) and sales_offers_frontend/README.md for additional context and quickstart steps.
