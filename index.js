const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;


app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
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

const getmen = async (req, res, next) => {
  // console.log('get men called: ', req.method, req.url);
  next();
}

const verifiedToken = async (req, res, next) => {
  const token = req?.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' })
    }
    console.log('value in the token', decoded);
    req.user = decoded;
    next();
  })

}

async function run() {
  try {

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db('jobZenith').collection('job');
    const mybidCollection = client.db('jobZenith').collection('myBid');

    app.post('/job', async (req, res) => {
      const data = req.body;
      const result = await jobCollection.insertOne(data);
      res.send(result);
    })


    // MY BID COLLECTION POST
    app.post('/mybid', async (req, res) => {
      const data = req.body;
      const result = await mybidCollection.insertOne(data);
      res.send(result);
    })

    // MY BID COLLECTION GET
    app.get('/mybid', async (req, res) => {

      const email = req.query.email;
      const sellerMail = req.query.sellerMail;
      const query = {};

      if (email) {
        query.ByerEmail = email;
      }
      if (sellerMail) {
        query.sellerEmail = sellerMail;
      }

      
      
      const result = await mybidCollection.find(query).toArray();
      res.send(result);
    })

    // MY BID COLLECTION ID GET
    app.get('/mybid/:id', getmen, verifiedToken, async (req, res) => {

      const id = req.params.id;

      const query = { _id: new ObjectId(id) }
      const result = await mybidCollection.findOne(query);
      res.send(result);
    })

    // MY BID COLLECTION ID PUT
    app.put('/mybid/:id', getmen, verifiedToken, async (req, res) => {

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatemybid = req.body;

      const updateData = {
        $set: {
          status: updatemybid.status,
        }
      }
      const result = await mybidCollection.updateOne(filter, updateData, options);
      res.send(result);
    })



    app.get('/job', async (req, res) => {

      const query = {};
      const email = req.query.email;
      if (email) {
        query.email = email;
      }
      const result = await jobCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/web', async (req, res) => {
      const query = { jobCategory: "WEB DEVELOPMENT" };
      const web = jobCollection.find(query);
      const result = await web.toArray();
      res.send(result);
    })

    app.get('/digital', async (req, res) => {
      const query = { jobCategory: "DIGITAL MARKETING" };
      const digital = jobCollection.find(query);
      const result = await digital.toArray();
      res.send(result);
    })

    app.get('/graphics', async (req, res) => {
      const query = { jobCategory: "GRAPHICS DESIGN" };
      const graphics = jobCollection.find(query);
      const result = await graphics.toArray();
      res.send(result);
    })

    app.get('/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    })

    app.put('/job/:id', async (req, res) => {

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
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

    app.delete('/job/:id', getmen, verifiedToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(query);
      res.send(result);
    })

    app.post('/jwt', getmen, async (req, res) => {
      const user = req.body;

      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
      })
      .send({ success: true });
    })

    app.post('/logout', async(req, res) => {
      const user = req.body;
      console.log('logout user : ', user)
      res.clearCookie('token', {maxAge: 0}).send({success: true})
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