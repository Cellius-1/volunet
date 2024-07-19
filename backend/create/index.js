import { initializeApp } from "firebase/app";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import functions from '@google-cloud/functions-framework';

import { v4 as uuidv4 } from 'uuid';

//import dotenv from 'dotenv';

//dotenv.config({path: "../../.env"});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
functions.http('create', async (req, res) => {
  //to test:
  // curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d '{"name": "ultimate zen mewwing session", "address": "20 W 34th St., New York, NY 10001", "date": "2025-01-01T00:00:00.000Z"}'
  const reqJSON = req.body;
  const geocodeRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(reqJSON.address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
  const geocodeJSON = await geocodeRes.json();
  const location = geocodeJSON.results[0].geometry.location;
  
  const id = uuidv4();

  const time = new Date(reqJSON.date).getTime();

  const eventRef = doc(db, "events", id);
  setDoc(eventRef, {
    name: reqJSON.name,
    location: location,
    time: time,
  })
  res.send("Success");
});