const express = require('express');
const { MongoClient } = require("mongodb");
const cors = require('cors');

const DB_CONN_URI = "mongodb+srv://mustafa:12345@cluster0.dv0a3.mongodb.net/mydb?retryWrites=true&w=majority";
const PORT = process.env.PORT || 8080;

const app = express();

// Just so the request is not blocked by cors
app.use(cors());

// logger middleware
const { logger } = require('./middleware')
app.use(() => logger)

// Connecting to the Database 
const client = new MongoClient(DB_CONN_URI);

async function main() {
  try {
    // Actually connecting to the database
    await client.connect();
    // Pinging the database to see if it is up
    await client.db("mydb").command({ ping: 1 });
    console.log("Connected successfully to the database");

    // Listening on PORT 5000, for requests
    app.listen(PORT, () => console.log("Server is running on port " + PORT));
  } finally {
    // Close the connection to the database
    await client.close();
  }
}

// Running the main function 
main().catch(console.dir);


// get all lessons
app.get('/lessons', async (req, res) => {
  // Connecting to the database
  await client.connect();
  // Getting all the lessons from the database
  client.db('mydb')
    .collection('lessons')
    .find()
    .toArray((err, result) => {
      // If there is an error, return the error
      if (err)
        return res.status(500).send({ error: err });

      // If there is no error, return the result, which is the array of lessons 
      return res.json(result);
    });
});



// create lesson
app.post('/lessons', async (req, res) => {

  async function createLesson(client, newLesson) {
    const result = await client.db("mydb").collection("lessons").insertOne(newLesson);
    console.log(`new lesson added with the following id: ${result.insertedId}`);
    res.status(200).json(result)

  }
  try {
    await client.connect();

    await createLesson(client, {
      id: 43,
      Icon: "fa-desktop",
      Subject: "ICT",
      Location: "Neasden",
      Price: 23,
      Spaces: 5,
      Image: "./images/Ict.jpg"
    });


  } catch (error) {

    console.log(error)
  } finally {


    // Close the connection to the database
    await client.close();
  }
});


// delete lesson
app.delete('/lessons/:Subject', async (req, res) => {
  console.log(req.params.Subject)
  try {
    await client.connect();

    await DeleteLessonById(client, req.params.Subject);

  } catch (error) {
    console.log(error)
  } finally {
    // Close the connection to the database
    await client.close();
  }


  async function DeleteLessonById(client, idOfLesson) {
    const result = await client.db("mydb").collection("lessons").deleteOne({ Subject: idOfLesson });
    console.log(`${result.deletedCount} lessons were deleted`);
    res.status(200).json(result)

  }

});

///edit lesson

app.put('/lessons/:Subject', async (req, res) => {
  console.log(req.params.Icon)

  try {
    await client.connect();

    await updateLessonById(client, req.params.Subject, {
      id: req.params.id,
      Icon: req.params.Icon,
      Subject: req.params.Subject,
      Location: req.params.Location,
      Price: req.params.Price,
      Spaces: req.params.Spaces,
      Image: req.params.Image
    });

  } catch (error) {
    console.log(error)
  } finally {
    // Close the connection to the database
    await client.close();
  }

  async function updateLessonById(client, idOfLesson, updateLesson) {
    const result = await client.db("mydb").collection("lessons").updateOne({ Subject: idOfLesson }, { $set: updateLesson });
    console.log(`${result.matchedCount} lessons matched the query`);
    console.log(`${result.modifiedCount} lessons were updated`);
    res.status(200).json(result)

  }

})

// search 

app.get('/search/:query', async (req, res) => {
  await client.connect();

  client.db('mydb')
    .collection('lessons')
    .find()
    .toArray((err, result) => {
      if (err)
        return res.status(500).send({ error: err });

      // If there is no error, return the result, which is the array of lessons 
      // get all lessons containing the search string
      let lessons = result.map(lesson => JSON.stringify(lesson).toLowerCase().includes(req.params.query.toLowerCase()) ? lesson : null).filter(Boolean)
      return res.json(lessons);
    })
})
///order information

// get all orders info


app.get('/orders', async (req, res) => {
  // Connecting to the database
  await client.connect();
  // Getting all the lessons from the database
  client.db('mydb')
    .collection('orders')
    .find()
    .toArray((err, result) => {
      // If there is an error, return the error
      if (err)
        return res.status(500).send({ error: err });

      // If there is no error, return the result, which is the array of lessons 
      return res.json(result);
    });
});


// create order
app.post('/orders', async (req, res) => {

  async function createOrder(client, newOrder) {
    const result = await client.db("mydb").collection("orders").insertOne(newOrder);
    console.log(`new order added with the following id: ${result.insertedId}`);
    res.status(200).json(result)

  }


  try {
    await client.connect();

    await createOrder(client, {
      Name: "test1",
      LessonId: "61f1aed065d80ac4de3ecdcf1",
      PhoneNumber: 3436713456,
      Spaces: 3,
    });


  } catch (error) {

    console.log(error)
  } finally {


    // Close the connection to the database
    await client.close();
  }
});

///edit order

app.put('/order/:LessonId', async (req, res) => {
  console.log(req.params.Icon)

  try {
    await client.connect();

    await updateOrderById(client, req.params.LessonId, {
      LessonId: req.params.LessonId,
      Name: req.params.Name,
      PhoneNumber: req.params.PhoneNumber,
      Spaces: req.params.Spaces
    });

  } catch (error) {
    console.log(error)
  } finally {
    // Close the connection to the database
    await client.close();
  }

  async function updateOrderById(client, idOfOrder, updateOrder) {
    const result = await client.db("mydb").collection("lessons").updateOne({ LessonId: idOfOrder }, { $set: updateOrder });
    console.log(`${result.matchedCount} orders matched the query`);
    console.log(`${result.modifiedCount} order was updated`);
    res.status(200).json(result)
  }

})

app.get('/user', async (req, res) => {
  return res.json({ 'email': 'user@email.com', 'password': 'mypassword' });
});
