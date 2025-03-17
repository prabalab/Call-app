const { useState, useEffect, useRef } = React;

const App = () => {
    const [myId, setMyId] = useState("");
    const [peerId, setPeerId] = useState("");
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState("");
    
    const peerRef = useRef(null);
    const myVideoRef = useRef(null);
    const userVideoRef = useRef(null);
    const socket = io("https://call-app-ypk7.onrender.com");

    useEffect(() => {
        const peer = new Peer();
        peer.on("open", (id) => setMyId(id));
        peerRef.current = peer;

        socket.on("incoming-call", ({ from, signal }) => {
            setIncomingCall(true);
            setCallerId(from);

            peerRef.current.once("call", (call) => {
                navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
                    myVideoRef.current.srcObject = stream;
                    call.answer(stream);
                    call.on("stream", (remoteStream) => {
                        userVideoRef.current.srcObject = remoteStream;
                    });
                });
            });
        });
    }, []);

    const startCall = () => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((stream) => {
            myVideoRef.current.srcObject = stream;
            const call = peerRef.current.call(peerId, stream);
            call.on("stream", (remoteStream) => {
                userVideoRef.current.srcObject = remoteStream;
            });
        });
    };

    const answerCall = () => {
        setIncomingCall(false);
        socket.emit("answer-call", { to: callerId });
    };

    return React.createElement("div", null,
        React.createElement("h2", null, `My ID: ${myId}`),
        React.createElement("input", { placeholder: "Enter Peer ID", onChange: (e) => setPeerId(e.target.value) }),
        React.createElement("button", { onClick: startCall }, "Call"),
        React.createElement("video", { ref: myVideoRef, autoPlay: true, muted: true, width: 300 }),
        React.createElement("video", { ref: userVideoRef, autoPlay: true, width: 300 }),
        incomingCall &&
            React.createElement("div", { style: { backgroundColor: "lightcoral", padding: "10px", marginTop: "10px" } },
                React.createElement("p", null, `Incoming call from: ${callerId}`),
                React.createElement("button", { onClick: answerCall }, "Answer")
            )
    );
};

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
