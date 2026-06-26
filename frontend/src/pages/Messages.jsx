import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import './MainDashboard.css';
import './Messages.css';

const Messages = () => {
    const { userId: urlUserId } = useParams();
    const location = useLocation();
    const scrollRef = useRef();

    // ID of the swap we might be coming from (e.g. from Tracker)
    const initialSwapId = location.state?.swapId || null;

    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Session Invite Form State
    const [teachSkill, setTeachSkill] = useState('');
    const [learnSkill, setLearnSkill] = useState('');
    const [sessionTime, setSessionTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [inviteSent, setInviteSent] = useState(false);

    // Auth
    const userId = localStorage.getItem('userId');

    // Theme
    const [isDarkMode] = useState(() => localStorage.getItem('skillnova-theme') === 'dark');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!urlUserId) return;
            try {
                // Fetch the specific user details
                const res = await axios.get(`http://https://skillswap-ekvn.onrender.com/api/profile/${urlUserId}`);
                setSelectedUser(res.data);

                // Try to find the swap associated with this user if initialSwapId is not provided
                let swapId = initialSwapId;
                let swapObj = null;

                if (!swapId) {
                    const chatRes = await axios.get('http://https://skillswap-ekvn.onrender.com/api/user', {
                        headers: { 'x-user-id': userId }
                    });
                    const swap = chatRes.data.find(c => (c.sender._id === urlUserId || c.receiver._id === urlUserId));
                    if (swap) swapId = swap._id;
                }

                if (swapId) {
                    const swapRes = await axios.get(`http://https://skillswap-ekvn.onrender.com/api/swap/${swapId}`, {
                        headers: { 'x-user-id': userId }
                    });
                    swapObj = swapRes.data.swap;

                    setSelectedChat(swapObj);
                    setMeetingLink(`http://localhost:3000/video-call/${swapId}`);

                    const isSender = swapObj.sender._id === userId || swapObj.sender === userId;
                    const ts = isSender ? swapObj.skillsOffered?.[0] : swapObj.skillsWanted?.[0];
                    const ls = isSender ? swapObj.skillsWanted?.[0] : swapObj.skillsOffered?.[0];

                    setTeachSkill(ts || '');
                    setLearnSkill(ls || '');

                    console.log({
                        currentUserId: userId,
                        sender: swapObj.sender,
                        skillsOffered: swapObj.skillsOffered,
                        skillsWanted: swapObj.skillsWanted
                    });
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch user or swap data", err);
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [urlUserId, userId, initialSwapId]);


    const handleSendInvite = async () => {
        try {
            const res = await axios.post("http://https://skillswap-ekvn.onrender.com/api/session/send-invite", {
                receiverId: selectedUser?._id || urlUserId,
                message: messageInput,
                skill: teachSkill,
                meetingLink,
                startTime: sessionTime,
                sessionType: "I will Teach" // Based on user request
            }, {
                headers: { 'x-user-id': userId }
            });

            alert(res.data.msg);
            setInviteSent(true);
            setTimeout(() => setInviteSent(false), 5000);

        } catch (err) {
            console.log(err);
            alert("Failed to send invite");
        }
    };


    // Auto-scroll messages
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedChat]);

    if (isLoading) return <div className="loading">Loading Chats...</div>;

    return (
        <div className={`main-dashboard ${isDarkMode ? 'dark-theme' : ''}`}>
            <Sidebar activeItem="messages" />

            <main className="dashboard-main messages-layout">
                <div className="chat-area">
                    {selectedUser ? (
                        <div className="session-card-container">
                            <header className="session-header">
                                <div className="chat-user-details">
                                    <h2>{selectedUser.name}</h2>
                                    <p>{selectedUser.email}</p>
                                    <p>{selectedUser.bio || "SkillSwap Community Member"}</p>
                                </div>
                            </header>

                            <div className="message-box">
                                <textarea
                                    placeholder="Write a message to include in your invitation..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="message-textarea"
                                />
                            </div>

                            <div className="form-grid">
                                <div style={{ gridColumn: '1 / -1', marginBottom: '10px' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <strong>Teaching:</strong> {teachSkill || "N/A"} &nbsp;|&nbsp; <strong>Learning:</strong> {learnSkill || "N/A"}
                                    </p>
                                </div>
                                <div className="form-group-invite">
                                    <label>Session Type</label>
                                    <input value="I will Teach" disabled />
                                </div>
                                <div className="form-group-invite">
                                    <label>Skill</label>
                                    <input
                                        type="text"
                                        value={teachSkill}
                                        onChange={(e) => setTeachSkill(e.target.value)}
                                        placeholder="Skill name"
                                    />
                                </div>
                                <div className="form-group-invite">
                                    <label>Start Time</label>
                                    <input
                                        type="time"
                                        value={sessionTime}
                                        onChange={(e) => setSessionTime(e.target.value)}
                                    />
                                </div>
                                <div className="form-group-invite">
                                    <label>Meeting Link</label>
                                    <input
                                        type="text"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder="URL"
                                    />
                                </div>
                            </div>

                            <div className="button-row">
                                {inviteSent && <span className="invite-status">✓ Invitation Sent</span>}
                                <button
                                    type="button"
                                    className="start-session-btn"
                                    onClick={handleSendInvite}
                                >
                                    ⚡ Send Session Invite
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-chat-state">
                            <div className="empty-icon">💬</div>
                            <h2>Select a user to start a session</h2>
                            <p>Use the Messages link in the sidebar to select a user.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Messages;
