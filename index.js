const express = require('express');
const app = express();
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config()
// const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.8eid0qf.mongodb.net/?retryWrites=true&w=majority`;

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
     client.connect();

     const usersCollection = client.db("SummerCampDB").collection("users");
     const classesCollection = client.db("SummerCampDB").collection("classes");
     const instructorsCollection = client.db("SummerCampDB").collection("instructors");

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

    
      app.put('/classes/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id:new ObjectId(id)}
        const options={upsert:true}
        const cls=req.body
        const updatedClass={
          $set:{type:cls.type}
        }
        const result= await classesCollection.updateOne(query,updatedClass,options)
        res.send(result)
      })
      
      app.post('/users', async (req, res) => {
        const user = req.body;
        const query = { email: user.email }
        const existingUser = await usersCollection.findOne(query);

        if (existingUser) {
          return res.send({ message: 'user already exists' })
        }

        const result = await usersCollection.insertOne(user);
        res.send(result);
      });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Summer camp is sitting')
  })
  
  app.listen(port, () => {
    console.log(`Summer camp on port ${port}`);
  })
