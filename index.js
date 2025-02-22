const express = require("express");
const http = require("http"); 
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const { Server } = require("socket.io")

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.toqnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/",
    methods: ["GET", "POST"],
  },

})

 io.on("connection",(socket)=>{
  console.log("New client connected:", socket.id);
  

  // listen
  socket.on("updateTask", (task) => {
    console.log("Task updated:", task);

    // Broadcast the updated task to all clients
    io.emit("taskUpdated", task);
  });


  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

 })



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
    const userCollection = client.db('taskmanage').collection("user");


    // data delete 


    app.delete('/task/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })



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
      try {
        console.log("Fetching tasks...");
        const cursor = await taskCollection.find().toArray();
        console.log("user fetched:", cursor);
        res.send(cursor);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // task creat
    app.post("/addedtask", async (req, res) => {

      const task = req.body;
      const result = await taskCollection.insertOne(task);
      // console.log(result);

      res.send(result);
    })

    app.get('/user', async (req, res) => {
      try {
        console.log("Fetching tasks...");
        const cursor = await userCollection.find().toArray();
        console.log("user fetched:", cursor);
        res.send(cursor);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Internal Server Error");
      }
    });


    // user
    app.post("/user", async (req, res) => {

      const task = req.body;
      const result = await userCollection.insertOne(task);
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
