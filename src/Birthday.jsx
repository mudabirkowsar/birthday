import React, { useState, useEffect, useRef } from "react";

const Birthday = () => {
    const [kissCount, setKissCount] = useState(0);
    const [hearts, setHearts] = useState([]);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // --- Secret Message States ---
    const [showUnlock, setShowUnlock] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Audio Ref
    const audioRef = useRef(null);

    // --- 1. Initialize Floating Background Hearts ---
    useEffect(() => {
        const heartEmojis = ["❤️", "💕", "💖", "💗", "💓", "💝", "🌸", "✨"];
        const newHearts = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
            left: Math.random() * 100 + "%",
            animationDuration: Math.random() * 5 + 5 + "s",
            animationDelay: Math.random() * 5 + "s",
            fontSize: Math.random() * 20 + 10 + "px",
        }));
        setHearts(newHearts);

        // Initialize Audio
        audioRef.current = new Audio("/music.mp3");
        audioRef.current.loop = true;
        audioRef.current.volume = 0.6;
    }, []);

    // --- 2. Countdown Logic ---
    useEffect(() => {
        const targetDate = new Date();
        targetDate.setHours(24, 0, 0, 0);

        const timer = setInterval(() => {
            const currentTime = new Date();
            const difference = targetDate - currentTime;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // --- 3. Scroll Reveal Animation Logic ---
    useEffect(() => {
        if (!showWelcome) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                        }
                    });
                },
                { threshold: 0.1 }
            );

            const sections = document.querySelectorAll(".reveal-section");
            sections.forEach((section) => observer.observe(section));

            return () => sections.forEach((section) => observer.unobserve(section));
        }
    }, [showWelcome]);

    // --- 4. Handle Welcome Click ---
    const handleEnterWorld = () => {
        setShowWelcome(false);
        if (audioRef.current) {
            audioRef.current.play().catch((error) => console.log("Audio play failed:", error));
            setIsPlaying(true);
        }
    };

    // --- 5. Toggle Music ---
    const toggleMusic = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // --- 6. Handle Kiss Button ---
    const handleKiss = (e) => {
        setKissCount((prev) => prev + 1);

        const kiss = document.createElement("span");
        kiss.textContent = "💋";
        kiss.style.position = "fixed";
        kiss.style.left = `${e.clientX}px`;
        kiss.style.top = `${e.clientY}px`;
        kiss.style.fontSize = "30px";
        kiss.style.pointerEvents = "none";
        kiss.style.animation = "floatUp 1s ease-out forwards";
        kiss.style.zIndex = "1000";

        document.body.appendChild(kiss);

        setTimeout(() => {
            document.body.removeChild(kiss);
        }, 1000);
    };

    // --- 7. Handle Secret Unlock ---
    const checkPasscode = () => {
        // CHANGE "love" TO WHATEVER PASSWORD YOU WANT
        if (passcode.toLowerCase() === "qalbi") {
            setIsUnlocked(true);
            setErrorMsg("");
        } else {
            setErrorMsg("Wrong passcode! Hint: What is it that connects us?");
        }
    };

    return (
        <div className="birthday-container">
            {/* ---------------------------------------------
        INTERNAL CSS
        ---------------------------------------------
      */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Poppins:wght@300;400;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }

        .birthday-container {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fad0c4 100%);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
          color: #444;
        }

        .cursive { font-family: 'Dancing Script', cursive; }
        .pulse-heart { display: inline-block; animation: pulse 1.5s ease-in-out infinite; }

        /* --- Animations --- */
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(1.5); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* --- Background Hearts --- */
        .hearts-container { position: fixed; width: 100%; height: 100%; top: 0; left: 0; pointer-events: none; z-index: 0; }
        .heart { position: absolute; bottom: -50px; animation-name: float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; opacity: 0.6; }

        /* --- Header --- */
        header { background: linear-gradient(to right, #ec4899, #ef4444, #ec4899); color: white; padding: 2rem 1rem; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
        header h1 { font-size: 2.5rem; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }

        /* --- Welcome Modal --- */
        .welcome-modal {
          position: fixed;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(15px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease;
        }
        .modal-content {
          background: white;
          padding: 3rem;
          border-radius: 30px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          max-width: 90%;
          border: 4px solid #ff4d6d;
        }
        .enter-btn {
          background: linear-gradient(to right, #ff4d6d, #ff8fa3);
          color: white;
          border: none;
          padding: 15px 40px;
          font-size: 1.5rem;
          border-radius: 50px;
          cursor: pointer;
          margin-top: 20px;
          font-family: 'Dancing Script', cursive;
          box-shadow: 0 5px 15px rgba(255, 77, 109, 0.4);
          transition: transform 0.2s;
        }
        .enter-btn:hover { transform: scale(1.1); }

        /* --- Music Control --- */
        .music-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          cursor: pointer;
          z-index: 1000;
          font-size: 24px;
          border: 2px solid #ff4d6d;
          transition: transform 0.3s;
        }
        .music-btn:hover { transform: rotate(360deg); }

        /* --- Scroll Reveal Sections --- */
        .reveal-section {
          opacity: 0;
          transform: translateY(50px);
          transition: all 1s ease-out;
        }
        .reveal-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* --- Countdown --- */
        .countdown-container {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin: 30px auto;
          flex-wrap: wrap;
        }
        .time-box {
          background: rgba(255,255,255,0.3);
          backdrop-filter: blur(5px);
          padding: 15px;
          border-radius: 15px;
          min-width: 80px;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .time-val { font-size: 1.8rem; font-weight: bold; color: #db2777; display: block; }
        .time-label { font-size: 0.8rem; color: #555; text-transform: uppercase; letter-spacing: 1px; }

        /* --- General Layout --- */
        .content { position: relative; z-index: 10; }
        section { padding: 3rem 1.5rem; text-align: center; }
        .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
        
        /* --- Abstract Cards --- */
        .abstract-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          cursor: pointer;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: transform 0.5s ease;
        }
        .abstract-card:hover { transform: scale(1.05); }
        .card-icon { font-size: 5rem; animation: bounce 2s infinite; }
        .abstract-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.5s ease;
          background: rgba(0,0,0,0.6); 
          color: white;
          padding: 1rem;
          backdrop-filter: blur(3px);
        }
        .abstract-card:hover .abstract-overlay { opacity: 1; }
        .overlay-text { transform: translateY(20px); opacity: 0; transition: all 0.5s ease 0.2s; }
        .abstract-card:hover .overlay-text { transform: translateY(0); opacity: 1; }

        .bg-1 { background: linear-gradient(to top right, #fbc2eb 0%, #a6c1ee 100%); }
        .bg-2 { background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%); }
        .bg-3 { background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%); }
        .bg-4 { background: linear-gradient(to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); }

        /* --- Reasons Section --- */
        .reasons-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto; }
        .reason-card {
          background: white; padding: 20px; border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transition: transform 0.3s;
          border-left: 5px solid #ff4d6d;
        }
        .reason-card:hover { transform: translateY(-5px); }
        .reason-icon { font-size: 30px; margin-bottom: 10px; display: block; }

        .message-card { max-width: 800px; margin: 2rem auto; background: linear-gradient(135deg, #fff 0%, #ffe4e8 100%); padding: 3rem 2rem; border-radius: 25px; box-shadow: 0 15px 50px rgba(255, 77, 109, 0.3); position: relative; }
        .wishes-box { background: rgba(255, 255, 255, 0.8); padding: 2rem; border-radius: 25px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .kiss-btn { background: linear-gradient(to right, #ec4899, #ef4444); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; cursor: pointer; font-size: 1.2rem; margin-top: 10px; transition: transform 0.2s; }
        .kiss-btn:hover { transform: scale(1.05); }

        /* --- SECRET SECTION CSS --- */
        .secret-trigger { cursor: pointer; font-size: 3rem; transition: transform 0.3s; display: inline-block; }
        .secret-trigger:hover { transform: scale(1.1) rotate(10deg); }
        .unlock-input {
          padding: 10px 15px; border-radius: 20px; border: 2px solid #db2777; 
          outline: none; font-size: 1rem; text-align: center; width: 200px;
          margin-bottom: 10px;
        }
        .unlock-btn {
          background: #db2777; color: white; border: none; padding: 10px 20px; 
          border-radius: 20px; margin-left: 10px; cursor: pointer; font-weight: bold;
        }
        .secret-message {
          background: #fff; border: 2px dashed #db2777; padding: 20px; 
          border-radius: 15px; max-width: 500px; margin: 20px auto; 
          animation: bounce 0.5s;
        }
        
        /* --- Responsive --- */
        @media (max-width: 768px) { header h1 { font-size: 2rem; } .time-box { min-width: 60px; padding: 10px; } .time-val { font-size: 1.4rem; } }
      `}</style>

            {/* BACKGROUND HEARTS */}
            <div className="hearts-container">
                {hearts.map((h) => (
                    <span
                        key={h.id}
                        className="heart"
                        style={{
                            left: h.left,
                            animationDuration: h.animationDuration,
                            animationDelay: h.animationDelay,
                            fontSize: h.fontSize,
                        }}
                    >
                        {h.emoji}
                    </span>
                ))}
            </div>

            {/* --- WELCOME MODAL --- */}
            {showWelcome && (
                <div className="welcome-modal">
                    <div className="modal-content">
                        <h2 className="cursive" style={{ fontSize: "2.5rem", color: "#d6336c" }}>
                            Hey Beautiful! ❤️
                        </h2>
                        <p style={{ margin: "20px 0", fontSize: "1.1rem", color: "#555" }}>
                            I have prepared something special for you.
                            <br />
                            Turn up the volume! 🎵
                        </p>
                        <button className="enter-btn pulse-heart" onClick={handleEnterWorld}>
                            Open Your Gift 🎁
                        </button>
                    </div>
                </div>
            )}

            {/* FLOATING MUSIC TOGGLE */}
            {!showWelcome && (
                <div className="music-btn" onClick={toggleMusic}>
                    {isPlaying ? "🔇" : "🎵"}
                </div>
            )}

            {/* MAIN WEBSITE CONTENT */}
            <div className="content" style={{ filter: showWelcome ? "blur(10px)" : "none", transition: "filter 0.8s ease" }}>

                {/* HEADER */}
                <header>
                    <h1 className="cursive sparkle">🎉 Happy Birthday My Love 🎉</h1>
                    <p>Today is all about you ✨</p>
                </header>

                {/* HERO & COUNTDOWN */}
                <section className="reveal-section">
                    <h2 className="cursive">
                        To the most special person in my life <span className="pulse-heart">❤️</span>
                    </h2>
                    <p className="hero-text" style={{ marginBottom: '20px' }}>
                        Today isn't just your birthday,<br />
                        it's the day my world became brighter ✨
                    </p>

                    <div className="countdown-container">
                        <div className="time-box">
                            <span className="time-val">{timeLeft.days}</span>
                            <span className="time-label">Days</span>
                        </div>
                        <div className="time-box">
                            <span className="time-val">{timeLeft.hours}</span>
                            <span className="time-label">Hours</span>
                        </div>
                        <div className="time-box">
                            <span className="time-val">{timeLeft.minutes}</span>
                            <span className="time-label">Mins</span>
                        </div>
                        <div className="time-box">
                            <span className="time-val">{timeLeft.seconds}</span>
                            <span className="time-label">Secs</span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#db2777', fontWeight: 'bold' }}>Countdown to Midnight Celebration! 🌙</p>
                </section>

                {/* GALLERY */}
                <section className="reveal-section">
                    <h2 className="cursive">✨ Things I Cherish About Us ✨</h2>
                    <div className="gallery-grid">
                        <div className="abstract-card bg-1">
                            <span className="card-icon">📅</span>
                            <div className="abstract-overlay">
                                <div className="overlay-text">
                                    <h3 className="cursive">The Day We Met</h3>
                                    <p>The beginning of my favorite story.</p>
                                </div>
                            </div>
                        </div>
                        <div className="abstract-card bg-2">
                            <span className="card-icon">🦋</span>
                            <div className="abstract-overlay">
                                <div className="overlay-text">
                                    <h3 className="cursive">Your Presence</h3>
                                    <p>Butterflies, every single time.</p>
                                </div>
                            </div>
                        </div>
                        <div className="abstract-card bg-3">
                            <span className="card-icon">💫</span>
                            <div className="abstract-overlay">
                                <div className="overlay-text">
                                    <h3 className="cursive">Our Dreams</h3>
                                    <p>Building a future together.</p>
                                </div>
                            </div>
                        </div>
                        <div className="abstract-card bg-4">
                            <span className="card-icon">🔐</span>
                            <div className="abstract-overlay">
                                <div className="overlay-text">
                                    <h3 className="cursive">My Promise</h3>
                                    <p>To love you, always & forever.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* REASONS */}
                <section className="reveal-section" style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '30px', margin: '20px' }}>
                    <h2 className="cursive" style={{ color: '#db2777' }}>Why You Are Special ✨</h2>
                    <div className="reasons-grid">
                        <div className="reason-card">
                            <span className="reason-icon">🎁</span>
                            <h4>Your Kindness</h4>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>You have the purest heart I've ever known.</p>
                        </div>
                        <div className="reason-card">
                            <span className="reason-icon">⚡</span>
                            <h4>Your Energy</h4>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>You light up every room you walk into.</p>
                        </div>
                        <div className="reason-card">
                            <span className="reason-icon">🧠</span>
                            <h4>Your Mind</h4>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>I love the way you think and see the world.</p>
                        </div>
                    </div>
                </section>

                {/* VIDEO */}
                <section className="reveal-section">
                    <h2 className="cursive">🎬 A Small Surprise</h2>
                    <div className="video-wrapper" style={{ maxWidth: '800px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
                        <video controls style={{ width: '100%', display: 'block' }}>
                            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                        </video>
                    </div>
                </section>

                {/* MESSAGE */}
                <section className="reveal-section">
                    <div className="message-card">
                        <h2 className="cursive" style={{ color: '#db2777', fontSize: '2.2rem', marginBottom: '1.5rem' }}>💌 A Message For You</h2>
                        <div className="message-content" style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#4b5563' }}>
                            <p className="cursive" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>"Happy Birthday, my love ❤️"</p>
                            <p>You are my happiness, my peace, and my forever.</p>
                            <p>Every day with you feels like a gift, and today I celebrate the most precious gift of all — <strong>YOU</strong>.</p>
                            <br />
                            <p>Thank you for being my best friend, my soulmate, and my everything.</p>
                            <div style={{ marginTop: '2rem' }}>
                                <span style={{ fontSize: '2.5rem' }}>🎂</span>
                                <p className="cursive" style={{ color: '#db2777', fontSize: '1.4rem', marginTop: '10px' }}>I promise to celebrate you, today and always ✨</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WISHES BUTTON */}
                <section className="reveal-section">
                    <div className="wishes-box">
                        <h3 className="cursive" style={{ color: '#db2777', fontSize: '1.8rem', marginBottom: '1rem' }}>Send Your Love</h3>
                        <button className="kiss-btn" onClick={handleKiss}>Click to Send a Kiss 💋</button>
                        <p style={{ marginTop: '1rem', color: '#666' }}>Kisses sent: <span style={{ fontWeight: 'bold', color: '#db2777' }}>{kissCount}</span></p>
                    </div>
                </section>

                {/* --- SECRET SECTION START --- */}
                <section className="reveal-section">
                    <h3 className="cursive" style={{ color: '#db2777', marginBottom: '10px' }}>🔐 A Secret for You</h3>
                    <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>(Click the lock to open)</p>

                    {!showUnlock && !isUnlocked && (
                        <div className="secret-trigger" onClick={() => setShowUnlock(true)}>
                            🔐
                        </div>
                    )}

                    {showUnlock && !isUnlocked && (
                        <div style={{ animation: "bounce 0.5s" }}>
                            <p style={{ marginBottom: '10px' }}>Enter the magic word:</p>
                            <input
                                type="text"
                                className="unlock-input"
                                placeholder="Hint: love"
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                            <button className="unlock-btn" onClick={checkPasscode}>Unlock</button>
                            {errorMsg && <p style={{ color: 'red', marginTop: '10px', fontSize: '0.9rem' }}>{errorMsg}</p>}
                        </div>
                    )}

                    {isUnlocked && (
                        <div className="secret-message">
                            <h3 className="cursive" style={{ color: '#ff4d6d', fontSize: '1.8rem' }}>My Deepest Secret...</h3>
                            <p style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '1.1rem' }}>
                                "Hey my Love!, in just two months you became my favorite feeling.
                                Everything about you feels right — your smile, your heart, your presence.
                                Loving you already feels like home." ❤️
                            </p>
                        </div>
                    )}
                </section>
                {/* --- SECRET SECTION END --- */}

                {/* FOOTER */}
                <footer style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(5px)', marginTop: '2rem' }}>
                    <p style={{ fontSize: '1.1rem' }}>Made with <span className="pulse-heart">❤️</span> just for you</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.9 }}>Forever and Always 💕</p>
                </footer>
            </div>
        </div>
    );
};

export default Birthday;