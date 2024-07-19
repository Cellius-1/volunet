import functions from '@google-cloud/functions-framework';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

//import dotenv from 'dotenv';

import MiniSearch from 'minisearch'

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

function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		dist = dist * 1.609344
		return dist;
	}
}

// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP request to the deployed function's endpoint.
functions.http('search', async (req, res) => {
  //to test:
  // curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d '{"searchParameters": "zen", "location": {"lat": 40.7484, "lng": 73.9857}, "radius": 5}'
  const reqJSON = req.body;

  const eventsRef = collection(db, "events");
  const time = new Date().getTime();
  const docsSnapshots = await getDocs(query(eventsRef, where("time", ">", time)))
  let docs = [];
  let docData;
  for (let doc of docsSnapshots.docs) {
    docData = doc.data();
    docData.id = doc.id;
    docs.push(docData);
  }
  // Find *local* events
  const center = [reqJSON.location.lat, reqJSON.location.lng];
  docs.filter((document)=>{
    const distanceFromCenter = distance(center[0], center[1], document.location.lat, document.location.lng);
    return distanceFromCenter <= reqJSON.radius;
  })


  // Find events that match query

  // Create index
  let miniSearch = new MiniSearch({
    fields: ['name'],
    storeFields: ['name', 'location', 'time']
  });
  // Add documents
  miniSearch.addAll(docs);

  // Search
  const results = miniSearch.search(reqJSON.searchParameters);

  res.send(JSON.stringify({ matches: results }));
});