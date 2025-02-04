import React, { useEffect, useState } from 'react'
import './Home.css';
import { useSocket } from '../../providers/Socket';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const socket = useSocket();
  //got an error in the above line : Remember that usesocket returns a socket object so no need to distructure it 
  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [roomId,setRoomId] = useState("");

  const handleRoomJoined = ({roomId}) => {
    navigate(`/room/${roomId}`)
  }

  useEffect( () => {
    socket.on("joined-room",handleRoomJoined);

    return()=>{
      socket.off("joined-room",handleRoomJoined);
    }
    //this is done to prevent rendering the page everytime we reload 
  },[socket]);

  const handleSubmit = () => {
    socket.emit("join-room" , {emailId : email , roomId : roomId});
  }

  
  
  return (
    <div className='Home'>
        <input name="email" onChange={(e)=>setEmail(e.target.value)} type="email" placeholder='Enter your e-mail here' />
        <input name="room" onChange={(e)=>setRoomId(e.target.value)} type="text" placeholder='Enter room code' />
        <button onClick={handleSubmit} type='submit' className='submit'>Enter room</button>
    </div>
  )
}

export default Home;