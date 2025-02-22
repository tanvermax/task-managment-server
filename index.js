const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.toqnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "https://task-management-b4adc.web.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ Client connected");

  socket.on("updateTask", (updatedTask) => {
    console.log("📡 Received task update:", updatedTask);
    io.emit("taskUpdated");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
  });
});

const client = new MongoClient(uri, {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const taskCollection = client.db("taskmanage").collection("task");

    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.patch("/addedtask/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const result = await taskCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );

      res.json(result);
    });

    app.get("/addedtask", async (req, res) => {
      try {
        const tasks = await taskCollection.find().toArray();
        res.send(tasks);
      } catch (error) {
        res.status(500).send("Error fetching tasks");
      }
    });

    app.post("/addedtask", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
}
run();

app.get("/", (req, res) => res.send("Task Management API is running.."));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
