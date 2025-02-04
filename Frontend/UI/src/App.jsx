import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/homepage/Home";
import { SocketProvider } from "./providers/Socket";
import RoomPage from "./pages/roomPage/RoomPage";
import { PeerProvider } from "./providers/Peer";

const App = () => {
  return (
    <div>
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:id" element={<RoomPage />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  );
};

export default App;
