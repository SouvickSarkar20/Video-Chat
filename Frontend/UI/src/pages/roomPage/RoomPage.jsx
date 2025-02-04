import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../../providers/Socket";
import { usePeer } from "../../providers/Peer";
import ReactPlayer from "react-player";

const RoomPage = () => {
  const socket = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState("");

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log(`New user joined : ${emailId}`);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming call from", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
    console.log("call got accepted", ans);
    await setRemoteAns(ans);
  }, []);

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    sendStream(stream);
    setMyStream(stream);
  }, [sendStream]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  const handleNegotiation = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit('call-user',{emailId:remoteEmailId,offer:localOffer})
  }, [peer.localDescription,remoteEmailId,socket]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  });

  return (
    <div className="room-page-container">
      <h1>RoomPage</h1>
      <h4>You are connected to {remoteEmailId}</h4>
      <button onClick={()=>sendStream(myStream)}>Send my stream</button>
      <ReactPlayer url={myStream} playing muted />
      <ReactPlayer url={remoteStream} playing muted />
    </div>
  );
};

export default RoomPage;
