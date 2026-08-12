const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Make sure this is imported
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client'); // Import Prisma
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middleware/auth'); // Import auth middleware

const app = express();
const prisma = new PrismaClient(); // Create an instance of Prisma
const PORT = 3001;

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Test Routes ---
app.get('/api/test', (req, res) => {
  res.json({ message: "Success! Your backend is connected." });
});

// A new test route to check the database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      message: "Database connection successful!",
      userCount: userCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed!",
      error: error.message
    });
  }
});

// TEMPORARY: Route to create a test user
app.post('/api/temp-create-user', async (req, res) => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: "test@user.com",
        name: "Test User",
        password: "password" // We'll hash this later
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to create test user", error: error.message });
  }
});
// --- API Routes ---

// POST /api/items - Add a new item
app.post('/api/items', authMiddleware, async (req, res) => {
  try {
    const { name, quantity, expiryDate, unit, purchaseDate, notes, category } = req.body;
    if (!name || !quantity || !expiryDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let categoryId = null;
    if (category) {
      let existingCategory = await prisma.category.findFirst({
        where: {
          name: { equals: category }
        }
      });
      if (!existingCategory) {
        existingCategory = await prisma.category.create({
          data: {
            name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
          }
        });
      }
      categoryId = existingCategory.id;
    }
    const newItem = await prisma.item.create({
      data: {
        name: name,
        quantity: parseFloat(quantity),
        expiryDate: new Date(expiryDate),
        unit: unit || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        notes: notes || null,
        categoryId: categoryId,
        ownerId: req.userId // SECURE
      },
      include: { category: true }
    });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create item",
      error: error.message
    });
  }
});

// GET /api/items - Get all items for the current user
app.get('/api/items', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {
      ownerId: req.userId // SECURE
    };
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    const items = await prisma.item.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { expiryDate: 'asc' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch items",
      error: error.message
    });
  }
});

// GET /api/items/:id - Get a single item by ID
app.get('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id: id },
      include: { category: true }
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.ownerId !== req.userId) { // SECURE
      return res.status(403).json({ message: "Access denied" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch item",
      error: error.message
    });
  }
});

// PUT /api/items/:id - Update an item
app.put('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, purchaseDate, expiryDate, notes, category } = req.body;
    const existingItem = await prisma.item.findUnique({
      where: { id: id }
    });
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (existingItem.ownerId !== req.userId) { // SECURE
      return res.status(403).json({ message: "Access denied" });
    }
    let categoryId = existingItem.categoryId;
    if (category !== undefined) {
      if (category) {
        let existingCategory = await prisma.category.findFirst({
          where: {
            name: { equals: category }
          }
        });
        if (!existingCategory) {
          existingCategory = await prisma.category.create({
            data: {
              name: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
            }
          });
        }
        categoryId = existingCategory.id;
      } else {
        categoryId = null;
      }
    }
    const updatedItem = await prisma.item.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(quantity && { quantity: parseFloat(quantity) }),
        ...(unit !== undefined && { unit }),
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(notes !== undefined && { notes }),
        categoryId: categoryId
      },
      include: { category: true }
    });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update item",
      error: error.message
    });
  }
});

// DELETE /api/items/:id - Delete an item
app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existingItem = await prisma.item.findUnique({
      where: { id: id }
    });
    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (existingItem.ownerId !== req.userId) { // SECURE
      return res.status(403).json({ message: "Access denied" });
    }
    await prisma.item.delete({
      where: { id: id }
    });
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message
    });
  }
});

// POST /api/auth/register - Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name || null,
        password: hashedPassword
      }
    });
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to register user",
      error: error.message
    });
  }
});

// POST /api/auth/login - Login a user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await prisma.user.findUnique({
      where: { email: email }
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );
    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to login",
      error: error.message
    });
  }
});

// GET /api/dashboard/kpis - Get dashboard KPIs (Total Items, Near Expiry, Expired)
app.get('/api/dashboard/kpis', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    const totalItems = await prisma.item.count({
      where: { ownerId: req.userId } // SECURE
    });
    const nearExpiry = await prisma.item.count({
      where: {
        ownerId: req.userId, // SECURE
        expiryDate: {
          gte: today,
          lte: threeDaysFromNow
        }
      }
    });
    const expired = await prisma.item.count({
      where: {
        ownerId: req.userId, // SECURE
        expiryDate: {
          lt: today
        }
      }
    });
    res.json({
      totalItems,
      nearExpiry,
      expired
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch KPIs",
      error: error.message
    });
  }
});

// GET /api/dashboard/expiring-soon - Get top 5 items expiring soon
app.get('/api/dashboard/expiring-soon', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const expiringItems = await prisma.item.findMany({
      where: {
        ownerId: req.userId, // SECURE
        expiryDate: {
          gte: today 
        }
      },
      orderBy: { expiryDate: 'asc' },
      take: 5, 
      include: { category: true }
    });
    res.json(expiringItems);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch expiring items",
      error: error.message
    });
  }
});

// POST /api/items/:id/mark-used - Mark an item as used (moves to WasteLog)
app.post('/api/items/:id/mark-used', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const item = await prisma.item.findUnique({
      where: { id: id }
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.ownerId !== req.userId) { // SECURE
      return res.status(403).json({ message: "Access denied" });
    }
    const result = await prisma.$transaction(async (tx) => {
      const wasteLog = await tx.wasteLog.create({
        data: {
          itemName: item.name,
          quantity: item.quantity,
          action: "USED",
          reason: reason || null,
          ownerId: req.userId // SECURE
        }
      });
      await tx.item.delete({
        where: { id: id }
      });
      return wasteLog;
    });
    res.json({
      message: "Item marked as used successfully",
      wasteLog: result
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark item as used",
      error: error.message
    });
  }
});

// POST /api/items/:id/mark-wasted - Mark an item as wasted (moves to WasteLog)
app.post('/api/items/:id/mark-wasted', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const item = await prisma.item.findUnique({
      where: { id: id }
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.ownerId !== req.userId) { // SECURE
      return res.status(403).json({ message: "Access denied" });
    }
    const result = await prisma.$transaction(async (tx) => {
      const wasteLog = await tx.wasteLog.create({
        data: {
          itemName: item.name,
          quantity: item.quantity,
          action: "WASTED",
          reason: reason || null,
          ownerId: req.userId // SECURE
        }
      });
      await tx.item.delete({
        where: { id: id }
      });
      return wasteLog;
    });
    res.json({
      message: "Item marked as wasted successfully",
      wasteLog: result
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark item as wasted",
      error: error.message
    });
  }
});

// *** NEW/UPDATED ADMIN CLEANUP ROUTE ***
// Use this to delete old, "orphan" waste logs
app.delete('/api/admin/clear-all-waste', async (req, res) => {
  try {
    // This deletes ALL entries in the WasteLog. 
    // Use this ONCE to clean your database.
    const result = await prisma.wasteLog.deleteMany({}); 
    res.status(200).json({ 
      message: "All waste logs have been deleted.",
      deletedCount: result.count
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear waste log", error: error.message });
  }
});

// GET /api/waste-log - Get full waste log for the user (SECURE)
app.get('/api/waste-log', authMiddleware, async (req, res) => {
  try {
    // Validate that req.userId exists and is not empty
    if (!req.userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const wasteLogs = await prisma.wasteLog.findMany({
      where: {
        ownerId: req.userId // Only return logs for the current user
      },
      orderBy: {
        date: 'desc' // Most recent first
      }
    });

    res.json(wasteLogs);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch waste log",
      error: error.message
    });
  }
});

// GET /api/analytics/summary - Get analytics summary (Waste vs Used, Top 5 Wasted)
app.get('/api/analytics/summary', authMiddleware, async (req, res) => {
  try {
    const allLogs = await prisma.wasteLog.findMany({
      where: {
        ownerId: req.userId // SECURE
      }
    });
    let totalUsed = 0;
    let totalWasted = 0;
    allLogs.forEach(log => {
      if (log.action === "USED") {
        totalUsed += log.quantity;
      } else if (log.action === "WASTED") {
        totalWasted += log.quantity;
      }
    });
    const wastedLogs = allLogs.filter(log => log.action === "WASTED");
    const wastedByItem = {};
    wastedLogs.forEach(log => {
      if (wastedByItem[log.itemName]) {
        wastedByItem[log.itemName] += log.quantity;
      } else {
        wastedByItem[log.itemName] = log.quantity;
      }
    });
    const top5Wasted = Object.entries(wastedByItem)
      .map(([itemName, quantity]) => ({ itemName, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    res.json({
      wasteVsUsed: {
        used: totalUsed,
        wasted: totalWasted
      },
      top5Wasted: top5Wasted
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics summary",
      error: error.message
    });
  }
});

// GET /api/recipes/ingredients - Get list of near-expiry item names for recipe search
app.get('/api/recipes/ingredients', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    const nearExpiryItems = await prisma.item.findMany({
      where: {
        ownerId: req.userId, // SECURE
        expiryDate: {
          gte: today,
          lte: sevenDaysFromNow
        }
      },
      select: { name: true }
    });
    const ingredientNames = nearExpiryItems.map(item => item.name);
    res.json({
      ingredients: ingredientNames
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch ingredients",
      error: error.message
    });
  }
});

// POST /api/recipes/find - Find recipes by ingredients using Spoonacular API
app.post('/api/recipes/find', authMiddleware, async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        message: "Missing or invalid ingredients",
        error: "Ingredients must be a non-empty array"
      });
    }
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "API configuration error",
        error: "Spoonacular API key is not configured"
      });
    }
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        apiKey: apiKey,
        ingredients: ingredients.join(','),
        number: 10,
        ranking: 2
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching recipes:', error.response ? error.response.data : error.message);
    res.status(500).json({
      message: "Failed to fetch recipes",
      error: error.message
    });
  }
});

// GET /api/categories - Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message
    });
  }
});

// POST /api/categories - Create a new category
app.post('/api/categories', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const existingCategory = await prisma.category.findUnique({
      where: { name: name }
    });
    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists" });
    }
    const newCategory = await prisma.category.create({
      data: {
        name: name
      }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create category",
      error: error.message
    });
  }
});

// GET /api/settings - Get user settings
app.get('/api/settings', authMiddleware, async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: {
        userId: req.userId
      }
    });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: req.userId,
          expiryLeadTime: 3 // Default 3 days
        }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch settings",
      error: error.message
    });
  }
});

// PUT /api/settings - Update user settings
app.put('/api/settings', authMiddleware, async (req, res) => {
  try {
    const { expiryLeadTime } = req.body;
    if (expiryLeadTime === undefined) {
      return res.status(400).json({ message: "expiryLeadTime is required" });
    }
    let settings = await prisma.settings.findUnique({
      where: { userId: req.userId }
    });
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: req.userId,
          expiryLeadTime: parseInt(expiryLeadTime)
        }
      });
    } else {
      settings = await prisma.settings.update({
        where: { userId: req.userId },
        data: {
          expiryLeadTime: parseInt(expiryLeadTime)
        }
      });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message
    });
  }
});

// --- Notification Routes ---

// GET /api/notifications - Get all unread notifications for the current user
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId,
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(notifications);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message
    });
  }
});

// POST /api/notifications/mark-read - Mark notifications as read
app.post('/api/notifications/mark-read', authMiddleware, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    // Validate that notificationIds is an array
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        message: "notificationIds must be a non-empty array"
      });
    }

    // Update notifications only if they belong to the current user (security check)
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        },
        userId: req.userId // Security: only update user's own notifications
      },
      data: {
        read: true
      }
    });

    res.json({
      message: "Notifications marked as read",
      updatedCount: result.count
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notifications as read",
      error: error.message
    });
  }
});

// GET /api/recipes/link/:id - Get the source URL for a single recipe
app.get('/api/recipes/link/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "API key is not configured" });
    }
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
      params: { apiKey: apiKey }
    });
    res.status(200).json({ url: response.data.spoonacularSourceUrl });
  } catch (error) {
    console.error("Spoonacular Link Error:", error.response ? error.response.data : error.message);
    res.status(500).json({
      message: "Failed to get recipe link",
      error: error.message
    });
  }
});

// --- Scheduled Jobs ---

// Daily Expiry Notification Cron Job (temporary: runs every minute for demo)
cron.schedule('0 8 * * *', async () => {
  try {
    console.log('--- CRON JOB RUNNING ---');
    console.log('Running daily expiry notification job...');

    // Find all users
    const users = await prisma.user.findMany();

    for (const user of users) {
      // Get user's settings to get expiryLeadTime
      let settings = await prisma.settings.findUnique({
        where: { userId: user.id }
      });

      // Default to 3 days if settings don't exist
      const expiryLeadTime = settings?.expiryLeadTime || 3;

      // Calculate date range
      const today = new Date();
      const expiryDeadline = new Date();
      expiryDeadline.setDate(today.getDate() + expiryLeadTime);

      // Find items expiring within the lead time
      const expiringItems = await prisma.item.findMany({
        where: {
          ownerId: user.id,
          expiryDate: {
            gte: today,
            lte: expiryDeadline
          }
        }
      });

      // If there are expiring items, create a notification
      if (expiringItems.length > 0) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            message: `You have ${expiringItems.length} item${expiringItems.length > 1 ? 's' : ''} expiring soon.`,
            read: false
          }
        });
        console.log(`Created expiry notification for user ${user.id}`);
      }
    }

    console.log('Daily expiry notification job completed');
  } catch (error) {
    console.error('Error in daily expiry notification job:', error);
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});