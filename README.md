API endpoints
- `POST /api/auth/vendor/signup` -> vendor registration
- `POST /api/auth/customer/signup` -> customer registration
- `POST /api/auth/login` -> login; body: `{ email, password, role }`
- `GET /api/auth/me` -> protected; provide `x-auth-token` header