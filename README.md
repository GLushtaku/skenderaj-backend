# Skenderaj Backend API

Backend API për vendet historike në Skenderaj me PostgreSQL dhe sistem migracioni.

## Konfigurimi i Databazës

### 1. Instalimi i PostgreSQL

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Krijo databazën

```bash
# Hyr në PostgreSQL
psql postgres

# Krijo databazën
CREATE DATABASE skenderaj_db;

# Krijo përdoruesin (opsional)
CREATE USER skenderaj_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skenderaj_db TO skenderaj_user;

# Dil nga PostgreSQL
\q
```

### 3. Konfiguro .env

Shto këto rreshta në file-in `.env`:

```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/skenderaj_db
# Ose nëse ke përdorues:
# DATABASE_URL=postgresql://skenderaj_user:your_password@localhost:5432/skenderaj_db
```

## Sistemi i Migracioneve

### Ekzekuto migracionet

```bash
npm run migrate
```

### Krijo migracion të ri

```bash
npm run migration:create <emri_i_migracionit>
```

**Shembull:**

```bash
npm run migration:create add_user_table
```

### Struktura e migracioneve

Çdo migracion ka dy funksione:

- `up()` - ekzekutohet kur migracioni hapet
- `down()` - ekzekutohet kur migracioni kthehet mbrapsht

**Shembull migracion:**

```javascript
exports.up = async (pool) => {
  await pool.query("ALTER TABLE places ADD COLUMN new_field VARCHAR(255)");
};

exports.down = async (pool) => {
  await pool.query("ALTER TABLE places DROP COLUMN new_field");
};
```

## Fusha e Re: images

Tabela `places` tani ka një fushë të re `images` që është një array me URL-t e imazheve:

```sql
images TEXT[] DEFAULT '{}'
```

**Shembull përdorimi:**

```javascript
// Kur krijon një vend
const place = {
  name: "Kalaja e Prizrenit",
  description: "Kalaja historike",
  imageUrl: "https://cloudinary.com/main-image.jpg",
  images: [
    "https://cloudinary.com/image1.jpg",
    "https://cloudinary.com/image2.jpg",
    "https://cloudinary.com/image3.jpg",
  ],
};
```

## Komandat e Rëndësishme

```bash
# Instalo varësitë
npm install

# Ekzekuto migracionet
npm run migrate

# Krijo migracion të ri
npm run migration:create <emri>

# Hap serverin në development
npm run dev

# Hap serverin në production
npm start
```

## Struktura e Projektit

```
├── config/
│   ├── database.js          # Konfigurimi i PostgreSQL
│   ├── cloudinary.js        # Konfigurimi i Cloudinary
│   └── init-db.js           # (E vjetër - përdor migracionet tani)
├── migrations/
│   ├── run-migrations.js    # Ekzekutuesi i migracioneve
│   ├── create-migration.js  # Kriuesi i migracioneve
│   └── 001_create_places_table.js
├── controllers/
│   └── placeController.js   # Kontrolleri për vendet
├── routes/
│   ├── places.js           # Rrugët për vendet
│   └── upload.js           # Rrugët për upload
└── server.js               # Serveri kryesor
```
