import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const emojis = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🍍'];

const generateCards = () => {
    const emojiPairs = emojis.flatMap(emoji => [emoji, emoji]);
    for (let i = emojiPairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emojiPairs[i], emojiPairs[j]] = [emojiPairs[j], emojiPairs[i]];
    }
    return emojiPairs.map(emoji => ({ emoji, state: 'hidden' }));
};

const App = () => {
    const [cards, setCards] = useState(generateCards());
    const [firstCard, setFirstCard] = useState(null);
    const [secondCard, setSecondCard] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [time, setTime] = useState(0);
    const [bestTime, setBestTime] = useState(localStorage.getItem('bestTime') || 'N/A');
    const timer = useRef(null); // Use useRef to persist the timer

    useEffect(() => {
        if (startTime) {
            timer.current = setInterval(() => {
                setTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
            return () => clearInterval(timer.current);
        }
    }, [startTime]);

    const handleCardClick = index => {
        if (cards[index].state !== 'hidden' || secondCard) return;

        if (!startTime) {
            setStartTime(Date.now());
        }

        const newCards = [...cards];
        newCards[index].state = 'open';
        setCards(newCards);

        if (!firstCard) {
            setFirstCard({ ...newCards[index], index });
        } else {
            setSecondCard({ ...newCards[index], index });
            if (firstCard.emoji === newCards[index].emoji) {
                setTimeout(() => {
                    newCards[firstCard.index].state = 'removed';
                    newCards[index].state = 'removed';
                    setFirstCard(null);
                    setSecondCard(null);
                    setCards(newCards);
                    if (newCards.every(card => card.state === 'removed')) {
                        clearInterval(timer.current);
                        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
                        if (bestTime === 'N/A' || timeTaken < bestTime) {
                            setBestTime(timeTaken);
                            localStorage.setItem('bestTime', timeTaken);
                        }
                        alert(`Game over! Time taken: ${timeTaken} seconds`);
                    }
                }, 1000); // Delay before removing the cards
            } else {
                setTimeout(() => {
                    newCards[firstCard.index].state = 'hidden';
                    newCards[index].state = 'hidden';
                    setFirstCard(null);
                    setSecondCard(null);
                    setCards(newCards);
                }, 1000);
            }
        }
    };

    const startGame = () => {
        setCards(generateCards());
        setFirstCard(null);
        setSecondCard(null);
        setStartTime(null);
        setTime(0);
    };

    return (
        <div className="App">
            <div className="sidebar">
                <div className="score">Time: <span id="time">{time}</span> seconds</div>
                <div className="best-score">Best Time: <span id="best-time">{bestTime}</span> seconds</div>
                <button onClick={startGame}>Restart Game</button>
            </div>
            <div className="game-area">
                <h1>Memory Game</h1>
                <div className="grid">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className={`card ${card.state}`}
                            onClick={() => handleCardClick(index)}
                        >
                            {card.state !== 'hidden' && card.emoji}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default App;