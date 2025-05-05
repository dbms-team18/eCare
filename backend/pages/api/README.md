## API TEST

### Test Login
```
curl -X POST http://localhost:3000/api/User/login \
  -H "Content-Type: application/json" \
  -d '{"username": "Juliana", "password": "12345678abc"}'
```

### Test Signup
```
curl -X POST http://localhost:3000/api/User/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Juliana",
    "email": "Juliana@example.com",
    "password": "12345678abc"
  }'
```

### Test Logout
```
curl -X POST http://localhost:3000/api/User/logout \
  -b cookie.txt \
  -c cookie.txt
```