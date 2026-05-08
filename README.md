# Bazaar Hub - Complete Marketplace Platform

### Step 1: Install Required Software

1. **Install Node.js** (Version 18 or higher)
   - Go to https://nodejs.org/
   - Download and install the LTS  version
   - Verify: Open terminal/command prompt and type: `node --version`

2. **Install PostgreSQL** (Version 14 or higher)
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: https://postgresapp.com/ or use `brew install postgresql`
   - During installation, remember your postgres password!
   - Verify: Type `psql --version` in terminal

3. **Install Redis**
   - Windows: https://github.com/microsoftarchive/redis/releases (download .msi)
   - Mac: `brew install redis`
   - Start Redis:
     - Windows: Redis starts automatically after install
     - Mac: `brew services start redis`

### Step 2: Set Up the Database

1. Open terminal/command prompt
2. Connect to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Enter your postgres password
4. Create the database:
   ```sql
   CREATE DATABASE bazaar_hub;
   \q
   ```

### Step 3: Copy Project Files to Cursor

1. Create a folder named `bazaar-hub` on your computer
2. Copy ALL the files I provide into this folder (keep the folder structure intact)
3. Open Cursor
4. Click "File" → "Open Folder" → Select the `bazaar-hub` folder

### Step 4: Install Dependencies

1. Open terminal in Cursor (Terminal → New Terminal)
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Step 5: Configure Environment Variables

1. In the `backend` folder, create a file named `.env`
2. Copy this content (update the password to your postgres password):
   ```
   PORT=5000
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bazaar_hub
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   REDIS_URL=redis://localhost:6379
   NODE_ENV=development
   ```

### Step 6: Set Up Database Tables

1. Make sure you're in the backend folder
2. Run migrations:
   ```bash
   npm run migrate
   ```
3. Add sample data:
   ```bash
   npm run seed
   ```

### Step 7: Start the Application

1. Start the backend (in backend folder):
   ```bash
   npm run dev
   ```
2. Open a NEW terminal in Cursor
3. Start the frontend (in frontend folder):
   ```bash
   cd frontend
   npm start
   ```

### Step 8: Access the Application

1. Open your browser
2. Go to: `http://localhost:3000`
3. You should see the Bazaar Hub homepage!

### Test Accounts

After seeding, you can log in with:
- **Test Account**: user@test.com / password123 (same account can buy and sell)

## Troubleshooting

### "Port already in use"
- Kill the process using that port or change PORT in .env

### "Database connection failed"
- Check PostgreSQL is running
- Verify password in .env matches your postgres password

### "Redis connection failed"
- Make sure Redis is running
- Windows: Check Services
- Mac: `brew services list`

### "npm command not found"
- Node.js not installed correctly - reinstall Node.js

## Project Structure

```
bazaar-hub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── migrations/
│   ├── seeds/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── App.js
    └── package.json
```
