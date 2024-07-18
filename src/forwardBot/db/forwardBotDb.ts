import { forwardbotmongoconnect } from "./dbConfig.js";

export const db = await forwardbotmongoconnect();

export async function forwardbot_get_bot_token(
  data: string
): Promise<any | null> {
  try {
    const bot_token = await db.BotsCollection.findOne(
      { botUsername: data },
      { projection: { botToken: 1, _id: 0 } }
    );
    return bot_token;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}

export async function forwardbot_get_bot_username(
  data: number
): Promise<any | null> {
  try {
    const bot_username = await db.BotsCollection.find(
      { user_id: data },
      {
        projection: {
          botUsername: 1,
          _id: 0,
        },
      }
    ).toArray();
    return bot_username;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
}

export async function insert_bot(data: object) {
  try {
    const insertResult = await db.BotsCollection.insertOne(data);
    if (insertResult) {
      return insertResult;
    }
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern.id) {
      console.log("Duplicate file_unique_id detected. Skipping insertion.");
    } else {
      // Handle other types of errors
      console.error("Error inserting document:", error.message);
    }
  }
}

export async function delete_bot(data: string): Promise<any | null> {
  try {
    const bot_username = data;
    const file_result = await db.BotsCollection.deleteOne({
      botUsername: bot_username,
    });
    const res = file_result.deletedCount;
    return { res };
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern.id) {
      console.log("Duplicate file_unique_id detected. Skipping insertion.");
    } else {
      // Handle other types of errors
      console.error("Error inserting document:", error.message);
    }
  }
}

export async function get_user_id(data: string): Promise<any | null> {
  try {
    const user_id = await db.BotsCollection.findOne(
      { botUsername: data },
      { projection: { user_id: 1, _id: 0 } }
    );
    return user_id;
  } catch (error: any) {
    console.log(error.message);
  }
}
