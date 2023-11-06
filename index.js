const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwdt30p.mongodb.net/?retryWrites=true&w=majority`;

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

    const jobCollection = client.db('jobZenith').collection('job');
    const mybidCollection = client.db('jobZenith').collection('myBid');

    app.post('/job', async(req, res) => {
      const data = req.body;
      const result = await jobCollection.insertOne(data);
      res.send(result);
    })

    app.post('/mybid', async(req, res) => {
      const data = req.body;
      const result = await mybidCollection.insertOne(data);
      res.send(result);
    })

    app.get('/job', async(req, res) => {

      const query = {};
      const email = req.query.email;
      if(email){
        query.email = email;
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/web', async(req, res) => {
      const query = {jobCategory: "WEB DEVELOPMENT"};
      const web = jobCollection.find(query);
      const result = await web.toArray();
      res.send(result);
    })

    app.get('/digital', async(req, res) => {
      const query = {jobCategory: "DIGITAL MARKETING"};
      const digital = jobCollection.find(query);
      const result = await digital.toArray();
      res.send(result);
    })

    app.get('/graphics', async(req, res) => {
      const query = {jobCategory: "GRAPHICS DESIGN"};
      const graphics = jobCollection.find(query);
      const result = await graphics.toArray();
      res.send(result);
    })

    app.get('/job/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.findOne(query);
      res.send(result);
    })

    app.put('/job/:id', async(req, res) => {

      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true };
      const updateJob = req.body;
      
      const updateData = {
        $set: {
          email: updateJob.email,
          title: updateJob.title,
          deadline: updateJob.deadline,
          description: updateJob.description,
          maximum: updateJob.maximum,
          minimum: updateJob.minimum,
          photo: updateJob.photo,
          jobCategory: updateJob.jobCategory
        }
      }
      const result = await jobCollection.updateOne(filter, updateData, options);
      res.send(result);
    })

    app.delete('/job/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })


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
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})