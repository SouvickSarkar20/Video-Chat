import React, { useCallback, useEffect, useMemo, useState } from "react";

const PeerContext = React.createContext(null);

export const usePeer = () => {
  return React.useContext(PeerContext);
};

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );

  // Store senders to avoid re-adding tracks
  const senders = useMemo(() => [], []);

  const handleTrackEvent = useCallback((ev) => {
    const streams = ev.streams;
    setRemoteStream(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);
    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [handleTrackEvent, peer]);

  const createOffer = async () => {
    if (peer.signalingState !== "stable") {
      console.error(
        "Cannot create offer: signaling state is",
        peer.signalingState
      );
      return null;
    }
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };
  

  const setRemoteAns = async (ans) => {
    if (peer.signalingState !== "have-local-offer") {
      console.error(
        "Cannot set remote answer: signaling state is",
        peer.signalingState
      );
      return;
    }
    await peer.setRemoteDescription(ans);
  };
  

  const sendStream = async (stream) => {
    if (!stream) {
      console.error("Stream is null or undefined. Cannot send tracks.");
      return;
    }

    const tracks = stream.getTracks();
    for (const track of tracks) {
      // Check if track is already added
      const existingSender = senders.find((sender) => sender.track === track);
      if (!existingSender) {
        const sender = peer.addTrack(track, stream);
        senders.push(sender); // Keep track of added senders
      }
    }
  };

  const createAnswer = async (offer) => {
    if (peer.signalingState !== "stable") {
      console.error(
        "Invalid state: createAnswer called when signaling state is",
        peer.signalingState
      );
      return null;
    }
    await peer.setRemoteDescription(offer); // Set the incoming offer
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer); // Set the local answer
    return answer;
  };

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAns,
        sendStream,
        remoteStream,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
