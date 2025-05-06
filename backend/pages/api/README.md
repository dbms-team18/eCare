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

### Test Create Patient
```
curl -X POST http://localhost:3000/api/patient/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "林素芬",
    "age": "88",
    "gender": "female",
    "addr":"台北市中山區C路1號",
    "idNum":"Y222948393",
    "nhCardNum":"NH0003",
    "emerName":"李阿慧", 
    "emerPhone":"0987678594",
    "info":"癲癇"
  }'
```

### Test Create Alert
```
curl -X POST http://localhost:3000/api/alert/createAlert \
  -H "Content-Type: application/json" \
  -d '{
    "userID": 1,
    "patientId": "1",
    "vitalTypeId": "1"
  }'
```

### Test getUnreadAlert
```
curl -X POST http://localhost:3000/api/alert/getUnread
```

### Test Resd Alert 
```
curl -X POST http://localhost:3000/api/alert/readAlert \
  -H "Content-Type: application/json" \
  -d '{ "alertId": 22 }'
```