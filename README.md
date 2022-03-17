# MongoDB Sharding

### Installation

```sh
docker-compose up -d
```

The app will be available on [http://localhost:3000](http://localhost:3000).

### To restore dumps

```sh
make restore
```

### To shard tweets
In this example, we will shard the tweets collection, by user favorites count.

If tweets is not loaded in run following command, to load it.
```
make restore
```

Then run:
```js
sh.enableSharding("twitter") // enable sharding on the "twitter" database
db.tweets.ensureIndex({"user.favourites_count": 1}) // create index on the "favourites_count" field
sh.shardCollection("twitter.tweets", { "user.favourites_count": 1 }) // shard the "tweets" collection by the "favourites_count" field
sh.splitAt("twitter.tweets", { "user.favourites_count": 250 }) // split the "tweets" collection at the value 250
db.tweets.getShardDistribution() // show the distribution of the "tweets" collection
```


### Answers
a) What is sharding in MongoDB?
- Sharding is a technique for splitting a collection into multiple collections, each with a different shard key. Each shard is on it's own machine/server.

b) What are the different components required to implement sharding?
- Components required to implement sharding are:
  - A router (mongos)
  - A set of shard servers (mongod)
  - A config server (mongod)
  - A shard key

c) Explain architecture of sharding in mongoDB?
- The architecture of sharding in mongoDB is as follows:
  - Lasse tekst her

d) Provide implementation of map and reduce function
- Map function:
```js
db.tweets.aggregate(
  [
    { $project: 
      {
        hashtagLengths:
        {
          $map:
          {
            input: "$entities.hashtags",
            as: "hashtag",
            in: { $strLenCP: "$$hashtag.text" }
          }
        }
      }
    }
  ]
)
```

- Reduce function:
```js
db.tweets.aggregate(
  [
    { $project: 
      {
        reallyLongHashtag:
        {
          $reduce:
          {
            input: "$entities.hashtags",
            initialValue: "",
            in: { $concat : ["$$value", "$$this.text"] }
          }
        }
      }
    }
  ]
)
```

e) Provide execution command for running MapReduce
- As of [MongoDB 5.0., map-reduce is deprecated](https://docs.mongodb.com/manual/core/map-reduce/), so we will use an aggregation pipeline instead.

```js
db.tweets.aggregate(
  [
    { $project: 
      {
        hashtagLengths:
        {
          $map:
          {
            input: "$entities.hashtags",
            as: "hashtag",
            in: { $strLenCP: "$$hashtag.text" }
          }
        },
      }
    },
    { $project:
      {
        sumHashtagsLength:
        {
          $reduce:
          {
            input: "$hashtagLengths",
            initialValue: 0,
            in: { $add : ["$$value", "$$this"] }
          }
        }
      }
    }
  ]
)
```

f) Provide top 10 recorded out of the sorted result

- Again we used an aggregation pipeline, but this time we used a sort stage.
- 
```js
db.tweets.aggregate(
  [
    { $project: 
      {
        hashtagLengths:
        {
          $map:
          {
            input: "$entities.hashtags",
            as: "hashtag",
            in: { $strLenCP: "$$hashtag.text" }
          }
        },
      }
    },
    { $project:
      {
        sumHashtagsLength:
        {
          $reduce:
          {
            input: "$hashtagLengths",
            initialValue: 0,
            in: { $add : ["$$value", "$$this"] }
          }
        }
      }
    },
    {
      $sort: { sumHashtagsLength: -1, _id: -1 }
    },
    {
      $limit: 10
    }
  ]
)

