# Actions

## To init table
```
npx prisma migrate dev --name init
```

## To insert data           
execute
```
npx tsx prisma/seed.ts
```

## Delete All Data
```
await prisma.user.deleteMany()
```