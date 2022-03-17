// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import mongoClient from "../../utilities/mongo-client";

export interface Tweet {
  id: string;
  text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Tweet[]>
) {
  if (req.method === 'POST') {
    await createTweet(req, res);
    return
  }

  await get10NewestTweets(res)
}

async function createTweet(req: NextApiRequest,
                           res: NextApiResponse<Tweet[]>) {
  try {
    await mongoClient.connect();

    const doc = await mongoClient.db("twitter").collection("tweets").insertOne({
      text: req.body.text,
    });
    res.status(200).json([{id: doc.insertedId.toString(), text: req.body.text}]);
  } catch (e) {
    await mongoClient.close()
  }
}

async function get10NewestTweets(res: NextApiResponse<Tweet[]>) {
  try {
    await mongoClient.connect()

    const cursor = await mongoClient.db("twitter")
        .collection("tweets")
        .find()
        .sort({ _id: -1 })
        .limit(10)

    const tweets: Tweet[] = []
    while (await cursor.hasNext()) {
      const tweet = await cursor.next()
      tweets.push(tweet as unknown as Tweet)
    }

    res.status(200).json(tweets)
  } catch (e) {
    await mongoClient.close()
  }
}
