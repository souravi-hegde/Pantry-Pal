# PantryPal: Food Waste Reduction System

PantryPal is a full-stack web application designed to help users manage their kitchen inventory, reduce food waste, and discover recipes based on items they already own. Developed as a capstone project for food sustainability.

## 🚀 Key Features

*   **Smart Inventory Management:** Features an intuitive web interface with full CRUD operations enabling users to easily store, monitor, and manage pantry items.
*   **Intelligent Recipes:** Integrated with the **Spoonacular API** to generate personalized recipe recommendations based on real-time inventory availability, helping drastically reduce food waste.
*   **Automated Expiry Tracking:** Implemented automated expiry tracking with reminder notifications using `node-cron`, allowing users to proactively manage perishable inventory before it goes to waste.
*   **Waste Analytics:** Provides visual data representations using **Recharts** to track consumption vs. waste ratios.
*   **Robust Security:** Secure user authentication and password hashing implemented using **JWT** and **Bcrypt**.

## 🛠️ Tech Stack

*   **Frontend:** React.js, Vite, Tailwind CSS, Shadcn UI
*   **Backend:** Node.js, Express.js
*   **Database & ORM:** MySQL with Prisma ORM
*   **Automation:** Node-Cron

## ⚙️ Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the backend folder and configure your variables (see `.env.example` for details):
   ```text
   DATABASE_URL="mysql://user:password@localhost:3306/pantrypal"
   JWT_SECRET="your_secret_key"
   ```
4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the server:
   ```bash
   node index.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
