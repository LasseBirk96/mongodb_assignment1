import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import {useState} from "react";
import {Tweet} from "./api/tweets";

const Home: NextPage = () => {
    const [tweets, setTweets] = useState<Tweet[]>([])
    const [isLoadingTweets, setIsLoadingTweets] = useState(false)
    const [isSendingTweet, setIsSendingTweet] = useState(false)
    const [isTweeting, setIsTweeting] = useState(false)
    const [tweetText, setTweetText] = useState('')

    const onClick = () => {
        setIsLoadingTweets(true)
        fetch('/api/tweets')
            .then(res => res.json())
            .then(data => {
                setTweets(data)
                setIsLoadingTweets(false)
            })
    }

    const onSend = () => {
        setIsSendingTweet(true)
        fetch('/api/tweets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: tweetText
            })
        }).then(res => res.json())
            .then(data => {
                setIsSendingTweet(false)
                setIsTweeting(false)
                setTweetText('')
                setTweets([...data, ...tweets])
            })
    }

    const viewTweets = (
        <>
            { tweets.length > 0 && <div className={styles.coolListContainer}>
                <ul className={styles.coolList}>
                    {tweets.map(tweet => (
                        <li key={tweet.id} className={styles.coolListItem}>{tweet.text}</li>
                    ))}
                </ul>
            </div> }
            { tweets.length === 0 && <button disabled={isLoadingTweets} className={styles.coolButton} onClick={onClick}>{ isLoadingTweets ? 'Loading some tweets' : 'Load some tweets'}</button>}
        </>
    )

    const sendTweets = (
        <>
            <textarea onChange={(e) => setTweetText(e.currentTarget.value)} value={tweetText} placeholder='Put in some data' className={styles.textArea}></textarea>
            <button className={styles.coolButton} onClick={onSend} disabled={isSendingTweet}>{isSendingTweet ? 'Boarding your data on the tweet tweet train' : 'Send data'}</button>
        </>
    )

    return (
        <div className={styles.container}>
            <div className={styles.innerContainer}>
                <div>
                    <h1 className={styles.coolText}>Welcome to <span className={styles.coolTextFat}>Tweet Tweet Station</span></h1>
                    <h3 className={styles.coolSmallerText}>
                        <span className={`${styles.coolSmallerTextSpan} ${isTweeting ? styles.coolSmallerTextActive : ''}`} onClick={() => setIsTweeting(true)}>Send some tweets</span>
                        <span className={`${styles.coolSmallerTextSpan} ${!isTweeting ? styles.coolSmallerTextActive : ''}`} onClick={() => setIsTweeting(false)}>View some tweets</span>
                    </h3>
                    { isTweeting ? sendTweets : viewTweets }
                </div>
            </div>
        </div>
    )
}

export default Home
