# Enrollment System Wireframe

This is a code bundle for Enrollment System Wireframe. The original project is available at https://www.figma.com/design/QuqnGPxNPlqTMRVIixU3Ub/Enrollment-System-Wireframe.

## 🚀 Quick Start

**This project now uses SQLite database (no MySQL required!)**

### For Complete Setup Instructions:

👉 **See [LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md) for detailed setup instructions**

### Quick Commands:

1. **Install Backend Dependencies:**
   ```bash
   cd src/backend-setup
   npm install
   ```

2. **Setup SQLite Database:**
   ```bash
   npm run db:setup
   ```

3. **Start Backend Server:**
   ```bash
   npm run dev
   ```
   (Keep this terminal running)

4. **Install Frontend Dependencies** (in a new terminal):
   ```bash
   # From project root
   npm install
   ```

5. **Start Frontend:**
   ```bash
   npm run dev
   ```

### Default Login Credentials:

- **Superadmin:** `superadmin` / `admin123`
- **Admin:** `admin1` / `admin123`
- **Dean:** `dean1` / `admin123`
- **Registrar:** `registrar1` / `admin123`

---

## 📚 Documentation

- **[LOCAL_SETUP_GUIDE.md](./LOCAL_SETUP_GUIDE.md)** - Complete local setup guide with SQLite
- **[src/README_START_HERE.md](./src/README_START_HERE.md)** - Original project documentation

---

## 🗄️ Database

This project uses **SQLite** - a file-based database that requires no separate server installation.

The database file (`enrollment_system.db`) is created automatically when you run `npm run db:setup` in the `src/backend-setup` directory.

---

## 🛠️ Technology Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT

---

## 📝 Notes

- No MySQL installation required!
- SQLite database file is portable and easy to backup
- Perfect for local development and testing
- See LOCAL_SETUP_GUIDE.md for troubleshooting
