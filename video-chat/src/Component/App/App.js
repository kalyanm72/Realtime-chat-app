import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Video = styled.video`
  position: absolute;
  top: 0;
  right: 0;
  width: 20%;
  height: 30%;
  z-index: 100;
`;

function App() {
  const [yourID, setYourID] = useState("");
  const [users, setUsers] = useState({});
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const socket = useRef();

  const pVideo = {
    width:'100vw',
    height: '100%',
    position: 'fixed',
    zIndex: '0'
  };

  useEffect(() => {
    socket.current = io.connect("/");
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    })

    socket.current.on("yourID", (id) => {
      setYourID(id);
    })
    socket.current.on("allUsers", (users) => {
      setUsers(users);
    })

    socket.current.on("hey", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    })
  }, []);

  function callPeer(id) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: {

        iceServers: [
            {
                urls: "stun:numb.viagenie.ca",
                username: "sultan1640@gmail.com",
                credential: "98376683"
            },
            {
                urls: "turn:numb.viagenie.ca",
                username: "sultan1640@gmail.com",
                credential: "98376683"
            }
        ]
    },
      stream: stream,
    });

    peer.on("signal", data => {
      socket.current.emit("callUser", { userToCall: id, signalData: data, from: yourID })
    })

    peer.on("stream", stream => {
      if (partnerVideo.current) {
        partnerVideo.current.srcObject = stream;
      }
    });

    socket.current.on("callAccepted", signal => {
      setCallAccepted(true);
      peer.signal(signal);
    })

  }

  function acceptCall() {
      setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", data => {
      socket.current.emit("acceptCall", { signal: data, to: caller })
    })

    peer.on("stream", stream => {
      partnerVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
  }

  let UserVideo;
  if (stream) {
    UserVideo = (
      <Video playsInline muted ref={userVideo} autoPlay />
    );
  }

  let PartnerVideo;
  let cb;
  if (callAccepted) {
    PartnerVideo = (
      <Video style={pVideo} playsInline ref={partnerVideo} autoPlay />
    );
    if(!receivingCall) {
      cb= (
        <button className="ebtnStyle2" onClick={endCall}>END CALL</button>
      );
    }
  }

  function endCall() {
    /*setReceivingCall(false);
    setCallAccepted(false);
    PartnerVideo = null;*/
    window.open("about:blank", "_self");
    window.close();
  }

  let incomingCall;
  if (receivingCall) {
    incomingCall = (
      <div className="Caller-info">
        {!callAccepted? <h1 style={{color: 'white'}}>{caller} is calling you...</h1> : null }
        {!callAccepted? <button className="btnStyle" onClick={acceptCall}>ACCEPT</button>: null }
        <button className="ebtnStyle" onClick={endCall}>END CALL</button>
      </div>
    );
  }

  return (
    <Container className="App">
      <Row>
        {UserVideo}
        {PartnerVideo}
      </Row>
      <Row>
        {Object.keys(users).map(key => {
          if (key === yourID || receivingCall) {
            return null;
          }
          return (
            <button className="call" onClick={() => callPeer(key)}>CALL</button>
          );
        })}
      </Row>
      <Row>
        {incomingCall}
        {cb}
      </Row>
    </Container>
  );
}

export default App;
