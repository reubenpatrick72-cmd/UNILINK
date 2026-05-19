# UniLink Page Structure

This folder contains the UniLink HTML pages organized by feature area.

## Page folders

- `auth/`
  - `register.html` — User registration page
  - `login.html` — User login page

- `activation/`
  - `activate.html` — Account activation and Mpesa payment page

- `student/`
  - `dashboard.html` — Student dashboard and app home page after login
  - `tutorial.html` — Individual tutorial content page

- `admin/`
  - `admin-dashboard.html` — Administrator dashboard and management interface

## Root HTML files

- `index.html` — Public landing page
- `combined.html` — Combined or legacy page (not yet reorganized)

## Notes

- All page links have been updated to use the new folder structure.
- Shared styles and scripts are loaded from `public/css/` and `public/js/`.
- Use `../` path references from page folders to reach the correct assets and pages.
