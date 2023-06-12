const express = require("express");
const app = express();
const cors = require("cors");
// const jwt = require('jsonwebtoken');
require("dotenv").config();
// const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.8eid0qf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const usersCollection = client.db("SummerCampDB").collection("users");
    const classesCollection = client.db("SummerCampDB").collection("classes");
    const instructorsCollection = client
      .db("SummerCampDB")
      .collection("instructors");
    const enrollCollection = client.db("SummerCampDB").collection("enroll");

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/instructors", async (req, res) => {
      const cursor = instructorsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const cursor = classesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Manage Classes
    app.put("/classes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const cls = req.body;
      const updatedClass = {
        $set: { type: cls.type },
      };
      const result = await classesCollection.updateOne(
        query,
        updatedClass,
        options
      );
      res.send(result);
    });

    // Manage users
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const user = req.body;
      const updatedClass = {
        $set: { role: user.role },
      };
      const result = await usersCollection.updateOne(
        query,
        updatedClass,
        options
      );
      res.send(result);
    });

    //  users info
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // Add class
    app.post("/classes", async (req, res) => {
      const newClass = req.body;
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    // enroll info
    app.post("/enroll", async (req, res) => {
      const user = req.body;
      const queryUser = { email: user.email , selectItemId: user.selectItemId};
      const existingUser = await enrollCollection.findOne(queryUser);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await enrollCollection.insertOne(user);
      res.send(result);
      
    });

    app.get("/enroll", async (req, res) => {
      const cursor = enrollCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await enrollCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await enrollCollection.findOne(query);
      res.send(result);
    });

    app.put("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const user = req.body;
      const updatedClass = {
        $set: { enroll: user.enroll },
      };
      const update = { $set: { enroll: "enrolled" } };
      const result = await enrollCollection.updateOne(
        query,
        update,
        options
      );
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Summer camp is on going");
});

app.listen(port, () => {
  console.log(`Summer camp on port ${port}`);
});
