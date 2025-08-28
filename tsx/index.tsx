import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

const App = () => {
    // General UI State
    const [isMenuOpen, setMenuOpen] = useState(false);
    const [isHeaderScrolled, setHeaderScrolled] = useState(false);

    // AI and Chatbot State
    const [isChatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi there! How can I help you learn about STEM Out today?' }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isBotThinking, setBotThinking] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<{ [key: string]: string }>({});
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);

    const chatMessagesRef = useRef<HTMLDivElement>(null);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY }), []);
    const chat = useMemo(() => ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a friendly and helpful chatbot for a non-profit organization called 'STEM Out'.
            - **Mission:** STEM Out works to help underprivileged populations explore their surroundings from a science-oriented perspective through tailored STEM kits, fostering inclusivity, curiosity and inspiring the next generation of innovation.
            - **Tagline:** Let's rediscover the world through science.
            - **Contact:** The primary contact email is stemout.co@gmail.com.
            - **Tone:** Be encouraging, positive, and concise. Keep answers simple and easy to understand for a general audience that may include students, teachers, and potential donors.
            - **Goal:** Your main goal is to answer questions about STEM Out's mission, events, and how to get involved. If you don't know an answer, say so politely and direct them to the contact email.`,
        },
    }), [ai]);


    // Effect for scrolling header
    useEffect(() => {
        const handleScroll = () => {
            setHeaderScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect for auto-scrolling chat
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages, isBotThinking]);

    // UI Handlers
    const toggleMenu = () => setMenuOpen(!isMenuOpen);
    const closeMenu = () => setMenuOpen(false);
    const toggleChat = () => setChatOpen(!isChatOpen);

    // Chatbot Logic
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isBotThinking) return;

        const newUserMessage = { role: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setBotThinking(true);

        try {
            const response = await chat.sendMessage({ message: userInput });
            const botResponse = { role: 'bot', text: response.text };
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorResponse = { role: 'bot', text: "Sorry, I'm having a little trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setBotThinking(false);
        }
    };
    
    // AI Analysis Logic
    const handleAnalyzeVideo = async (id: string, title: string) => {
        if (analysisResults[id]) { // Don't re-analyze
             setAnalysisResults(prev => ({ ...prev, [id]: prev[id] })); // just to trigger re-render if needed
             return;
        }
        setAnalyzingId(id);
        try {
            const prompt = `As an educational assistant for 'STEM Out', provide a brief, engaging summary (2-3 sentences) for a YouTube video titled "${title}". Focus on the potential learning points and what makes it exciting for a young audience interested in science.`;
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            setAnalysisResults(prev => ({ ...prev, [id]: response.text }));
        } catch (error) {
            console.error("Error analyzing video:", error);
            setAnalysisResults(prev => ({ ...prev, [id]: "Sorry, couldn't analyze this video right now." }));
        } finally {
            setAnalyzingId(null);
        }
    };


    // App Data
    const navLinks = [
        { href: '#home', label: 'Home' },
        { href: '#about', label: 'About Us' },
        { href: '#team', label: 'Meet the Team' },
        { href: '#events', label: 'Our Kits' },
        { href: '#analytics', label: 'Our Impact' },
        { href: '#contact', label: 'Contact' },
    ];

    const teamMembers = [
        {
            name: 'Ada Yao',
            description: "Hi everyone! My name is Ada Yao, I'm a grade 11 student at the University of Toronto Schools. I'm passionate about biology and biomedical engineering but you can also find me fencing and playing with my cat!",
            image: 'https://images.unsplash.com/photo-1596799321459-22a108938229?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        },
        {
            name: 'Jessica Lang',
            description: "Hey everyone! My name is Jessica Lang and I'm a grade 11 student at University of Toronto Schools. I'm passionate about software engineering and physics. I also love playing basketball and listening to music in my free time!",
            image: 'https://images.unsplash.com/photo-1598191264879-67375a64388e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        }
    ];

    const events = [
        { 
            title: 'Paper Helicopter Physics', 
            description: 'In this kit, we will create paper helicopters to explore how gravity and air resistance affect falling objects. The paper helicopter is made by cutting and folding a strip of paper so that it has two blades at the top, which spin as it falls. When the helicopter is dropped from a height, gravity pulls it downward, while air pushes against the blades and makes it rotate. This spinning motion slows down the fall because of air resistance, allowing the helicopter to float gently to the ground. By changing the size of the blades or the weight at the bottom, we can see how these factors influence how fast or slow the helicopter falls. This simple activity helps us understand basic physics concepts like forces, motion, and the effect of air on moving objects.', 
            image: 'https://images.unsplash.com/photo-1608275893132-6176595d7b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' 
        },
        { 
            title: 'Density & Buoyancy Boats', 
            description: 'The aluminum foil boat and pennies experiment demonstrates the concept of density and how it affects an object’s ability to float. In the experiment, a boat is made by shaping a piece of aluminum foil into a wide, shallow container. When placed in water, the boat floats, and pennies are slowly added one by one. The goal is to see how many pennies the boat can hold before it sinks. The key scientific idea is density, which is the ratio of mass to volume. Although the pennies are dense and heavy, the foil boat has a large volume and low overall density because it traps air inside. As long as the average density of the boat and its contents is less than that of water, it will float. When too many pennies are added, the combined density increases. Once it becomes greater than the density of water, the boat sinks.', 
            image: 'https://images.unsplash.com/photo-1599399430859-24c73b090875?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' 
        },
        { 
            title: 'Nanofilm Creation', 
            description: 'This STEM kit offers a calming, hands-on activity that introduces students to nanoscience through sensory-friendly exploration. Using only clear nail polish, water, and paper, students create an iridescent nanofilm that shimmers with color when transferred onto the paper’s surface. As the students see the nail polish form a film on the paper, they can learn about surface tension, light reflection and interference, and the impact of nano-thin materials that are different from bulk materials. This experiment allows students to observe a scientific phenomenon in an aesthetic, engaging way.', 
            image: 'https://images.unsplash.com/photo-1506791244131-c39a3ce4e235?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80' 
        },
        {
            title: 'Fruit DNA Extraction',
            description: 'This DNA extraction STEM kit uses safe, familiar materials (dish soap, salt, and cold rubbing alcohol) to help students extract real DNA from fruits like strawberries or bananas. First, students will mash the fruit in a resealable bag, physically breaking down cell walls. Then, they mix in salt and dish soap: the salt helps the DNA clump together, and the soap breaks open cell and nuclear membranes, releasing the DNA into solution. Next, students slowly add cold alcohol, which causes the DNA to precipitate and rise as white, stringy clouds. Students learn key biological concepts such as cell structure, molecular composition, and the universality of DNA in living things.',
            image: 'https://images.unsplash.com/photo-1588257077884-42f067645d10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80'
        }
    ];

    const youtubeVideos = [
        { id: '1', title: 'How to Build a Lemon Battery!', thumbnail: 'https://img.youtube.com/vi/G3_0556S-qg/hqdefault.jpg' },
        { id: '2', title: 'Exploring the Wonders of Surface Tension', thumbnail: 'https://img.youtube.com/vi/Ua_U6-d_A2I/hqdefault.jpg' },
        { id: '3', title: 'DIY Bottle Rocket: A Guide to Newton\'s Laws', thumbnail: 'https://img.youtube.com/vi/H-Z6j_mWm9E/hqdefault.jpg' },
    ];

    return (
        <>
            <header className={`app-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
                <a href="#home" className="logo">STEM Out</a>
                <nav>
                    <button className="menu-toggle" aria-label="Toggle navigation" onClick={toggleMenu}>
                        <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                    </button>
                    <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
                        {navLinks.map(link => (
                            <li key={link.href}><a href={link.href} onClick={closeMenu}>{link.label}</a></li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main>
                <section id="home" className="hero">
                    <div className="hero-content">
                        <h1>Let's rediscover the world through science</h1>
                        <p>Fostering inclusivity and curiosity for underprivileged populations through tailored, hands-on STEM kits.</p>
                        <a href="#about" className="btn">Learn More</a>
                    </div>
                </section>

                <section id="about" className="container">
                    <h2 className="section-title">Who We Are</h2>
                    <div className="about-content">
                        <div className="about-text">
                            <h3>Our Mission</h3>
                            <p>STEM Out works to help underprivileged populations explore their surroundings from a science-oriented perspective through tailored STEM kits, fostering inclusivity, curiosity and inspiring the next generation of innovation.</p>
                        </div>
                        <div className="about-image" role="img" aria-label="A group of students collaborating on a project"></div>
                    </div>
                </section>

                <section id="team" className="container">
                    <h2 className="section-title">Meet the Team</h2>
                    <div className="team-grid">
                        {teamMembers.map(member => (
                            <div className="team-card" key={member.name}>
                                <div className="team-card-image" style={{backgroundImage: `url(${member.image})`}}></div>
                                <div className="team-card-content">
                                    <h3>{member.name}</h3>
                                    <p>{member.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="events" className="container">
                    <h2 className="section-title">Our STEM Kits</h2>
                    <div className="events-grid">
                        {events.map(event => (
                            <div className="event-card" key={event.title}>
                                <div className="card-image" style={{backgroundImage: `url(${event.image})`}}></div>
                                <div className="card-content">
                                    <h3>{event.title}</h3>
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="analytics" className="container">
                    <h2 className="section-title">Our Impact: AI-Powered Insights</h2>
                    <div className="analytics-grid">
                        {youtubeVideos.map(video => (
                            <div className="video-card" key={video.id}>
                                <div className="video-thumbnail">
                                    <img src={video.thumbnail} alt={video.title} />
                                </div>
                                <div className="video-info">
                                    <h3>{video.title}</h3>
                                    <button className="btn" onClick={() => handleAnalyzeVideo(video.id, video.title)} disabled={analyzingId === video.id}>
                                        {analyzingId === video.id ? 'Analyzing...' : (analysisResults[video.id] ? 'View Analysis' : 'Analyze with AI')}
                                    </button>
                                    {analysisResults[video.id] && (
                                        <div className="analysis-result">
                                            <p>{analysisResults[video.id]}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="contact" className="container">
                    <h2 className="section-title">Get Involved</h2>
                    <div className="contact-content">
                      <p>Whether you're a student who wants to join, a teacher looking for classroom resources, or an organization interested in partnership, we'd love to hear from you!</p>
                      <a href="mailto:stemout.co@gmail.com" className="btn">Contact Us</a>
                    </div>
                </section>
            </main>

            <footer className="app-footer">
                <div className="social-links">
                    <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                    <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                </div>
                <p className="footer-text">&copy; {new Date().getFullYear()} STEM Out. All Rights Reserved.</p>
            </footer>
            
            {/* AI Chatbot */}
            <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
                <div className="chat-header">
                    <span>Ask STEM Out</span>
                    <button onClick={toggleChat} className="close-btn" aria-label="Close chat">&times;</button>
                </div>
                <div className="chat-messages" ref={chatMessagesRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>{msg.text}</div>
                    ))}
                    {isBotThinking && <div className="message bot thinking"><div className="dot-flashing"></div></div>}
                </div>
                <form className="chat-input" onSubmit={handleSendMessage}>
                    <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type your question..."
                        aria-label="Chat input"
                        disabled={isBotThinking}
                    />
                    <button type="submit" aria-label="Send message" disabled={!userInput.trim() || isBotThinking}>
                      <span className="material-symbols-outlined">send</span>
                    </button>
                </form>
            </div>
            <button className="chat-fab" onClick={toggleChat} aria-label="Toggle chat">
              <span className="material-symbols-outlined">{isChatOpen ? 'close' : 'forum'}</span>
            </button>
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
