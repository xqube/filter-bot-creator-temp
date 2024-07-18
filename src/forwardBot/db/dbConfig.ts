import { MongoClient } from "mongodb";
import "dotenv/config";

export const forwardbotmongoclient = new MongoClient(process.env.MONGODB_URL!);

export async function forwardbotmongoconnect(): Promise<any> {
  // Use connect method to connect to the server
  try {
    await forwardbotmongoclient.connect();
    const forwardbotdatabase = forwardbotmongoclient.db("forwardbot");
    const BotsCollection = forwardbotdatabase.collection("Bots");

    // await BotsCollection.createIndex(
    //   {
    //     botUsername: 1,
    //   },
    //   { unique: true }
    // );
    // await BotsCollection.createIndex({ user_id: 1 });

    return { BotsCollection, forwardbotdatabase };
  } catch (error: any) {
    console.log("Error on db config", error.message);
    return null;
  }
}
