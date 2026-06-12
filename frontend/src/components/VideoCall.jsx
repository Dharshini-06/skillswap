import React, { useRef } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useParams, useNavigate } from 'react-router-dom';

function VideoCall() {
    const { swapId } = useParams();
    const navigate = useNavigate();
    const joinedRoom = useRef(false);

    // Retrieve user info from localStorage, default to generic if not set
    const user = JSON.parse(localStorage.getItem("user")) || { _id: localStorage.getItem("userId") || "unknown", name: "SkillSwap User" };

    const myMeeting = async (element) => {
        if (!element || joinedRoom.current) return;
        joinedRoom.current = true;

        const roomID = swapId;
        const userID = user._id + "_" + Math.floor(Math.random() * 10000); // Ensure unique ID per session refresh
        const userName = user.name;

        console.log("ROOM ID:", roomID);
        console.log("USER ID:", userID);

        // These IDs are from the ZEGOCLOUD console for testing 1-on-1 calls
        const appID = 1866114087;
        const serverSecret = "6fbd5f2f9627dafac44a82f388a02fde";

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomID,
            userID,
            userName
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
            container: element,
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            onLeaveRoom: () => {
                navigate('/swap-progress');
            },
            showScreenSharingButton: true,
        });
    };

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <div ref={myMeeting}></div>
        </div>
    );
}

export default VideoCall;

