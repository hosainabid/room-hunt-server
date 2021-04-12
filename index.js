const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// app.use(express.static('Rooms'));
app.use(fileUpload());

const port = 5000;
const uri = "mongodb+srv://Hasanul-Banna:NFOFHvx2U4wJMIwl@cluster0.jsi4a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookingCollection = client.db("Hotel-Book").collection("Bookings");
    const roomsCollection = client.db("Hotel-Book").collection("rooms");
    const AdminCollection = client.db("Hotel-Book").collection("Admin");

    app.post('/newBooking', (req, res) => {
        const newBooking = req.body;
        bookingCollection.insertOne(newBooking).then(res => '');
        // res.send('done')
    })
    app.post('/makeAdmin', (req, res) => {
        const email = req.body;
        AdminCollection.insertOne(email).then(res => '');
    })
    app.get('/bookings', (req, res) => {
        bookingCollection.find({}).toArray((err, documents) => res.send(documents))
    })
    app.get('/myBookings', (req, res) => {
        bookingCollection.find({ email: req.query.email }).toArray((err, documents) => res.send(documents))
    })
    app.get('/HotelData', (req, res) => {
        roomsCollection.find({}).toArray((err, documents) => res.send(documents))
    })
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        AdminCollection.find({ email: email })
            .toArray((err, Admin) => {
                res.send(Admin.length > 0);
            })
    });
    app.post('/addRoom', (req, res) => {
        const file = req.files.file;
        const id = req.body.id;
        const name = req.body.name;
        const address = req.body.address;
        const bed = req.body.bed;
        const bath = req.body.bath;
        const price = req.body.price;
        const flatSize = req.body.flatSize;
        const location = req.body.location;
        const RoomType = req.body.RoomType;
        const TV = req.body.TV;
        const Wifi = req.body.Wifi;
        const Breakfast = req.body.Breakfast;
        const SwimmingPool = req.body.SwimmingPool;
        const Parking = req.body.Parking;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        roomsCollection.insertOne({
            image, name, id, address, bed, bath, price, flatSize, location,
            RoomType, TV, Wifi, Breakfast, SwimmingPool, Parking
        })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });
    app.delete('/delete/:id', (req, res) => {
        const id = req.params.id;
        roomsCollection.deleteOne({ id })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    });
    app.patch('/update/:id', (req, res) => {
        const id = req.params.id;
        roomsCollection.updateOne({ id },
            {
                $set: { price: req.body.price }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })
});

app.get('/', (req, res) => {
    res.send('Congratulations! server is  running');
})

app.listen(process.env.PORT || port)