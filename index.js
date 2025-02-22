const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.toqnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    const taskCollection = client.db('taskmanage').collection("task");

    app.put("/updatetask/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedTask = req.body;
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedTask }
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error updating task" });
      }
    });
    // get specific  task
    app.get('/edittask/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result)

    })
    // update
    app.patch("/addedtask/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      console.log(status);
      console.log("Received Update Request:", id, status);



      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }

      const filter = { _id: new ObjectId(id) };

      const option = { upsert: true }
      const updateData = {
        $set: {
          status: status || "in-progress"
        }
      }
      const result = await taskCollection.updateOne(filter, updateData, option);
      res.send(result);
    })

    // task read
    app.get('/addedtask', async (req, res) => {
      const cursor = await taskCollection.find().toArray();
      // console.log("the data  ",cursor);

      res.send(cursor);
    })
    // task creat
    app.post("/addedtask", async (req, res) => {

      const task = req.body;
      const result = await taskCollection.insertOne(task);
      // console.log(result);

      res.send(result);
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Test API Route
app.get("/", (req, res) => {
  res.send("Task Management API is running..");
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
