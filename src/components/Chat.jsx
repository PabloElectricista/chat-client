/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import io from 'socket.io-client';
const socket = io('http://localhost:4000/');

function Chat() {

  const initialState = {
    username: '',
    message: ''
  }
  const [data, setdata] = useState(initialState);
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [typing, setTyping] = useState('');
  useEffect(() => {

  }, []);
  useEffect(() => {
    const recceiveMessage = (message) => {
      setTyping('')
      let newmessage = {
        from: message.username,
        body: message.message
      }
      setMessages([
        newmessage,
        ...messages
      ])
    }
    socket.on('message', recceiveMessage)
    return () => {
      
    }
  }, [messages])

  useEffect(()=>{
    const userTyping = (user) => {
      if (user !== data.username) {
        setTyping(`${user} is typing`)
      }
    }
    socket.on('typing', userTyping)
    return () => {
      socket.off('typing', userTyping)
    }
  }, [typing])

  const messRef = useRef(null);

  const handleChange = (ev) => {
    ev.preventDefault();
    if (ev.target.id === 'message') {
      socket.emit('typing', data.username)
    }
    setdata({
      ...data,
      [ev.target.id]: ev.target.value
    });
  }

  const handleSubmit = (ev) => {
    ev.preventDefault();
    socket.emit('message', data);
    setdata({
      ...data,
      message: ''
    })
    messRef.current.focus();
  }

  const me = 'bg-sky-700 ml-auto';
  const other = 'bg-red-700 mr-auto';
  const props = {showModal, setShowModal, username:data.username, handleChange}

  return (
    <div className="h-screen w-80 bg-zinc-800 text-white">
    <Modal props={props}/>
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden bg-zinc-900 p-5"
    >
      <label
        htmlFor="message"
        onClick={()=> setShowModal(true)}
      >{data.username}:</label>
      <input
        type="text"
        id="message"
        className='border-2 border-zinc-500 p-1 my-1 text-black w-full'
        ref={messRef}
        value={data.message}
        onChange={handleChange}
      />
      <button
        type="submit"
        className='bg-green-500 my-5 px-3 rounded'
      >
        Send
      </button>
      <span
        className='p-1 mx-10 text-white w-full'
      >{typing}</span>
      <ul className="h-80 overflow-y-auto">
        {
          messages && messages.length
            ? messages.map(({ body, from }, idx) => <li
              className={`my-2 p-2 table text-sm rounded-md ${(from === data.username) ? me : other}`}
              key={idx}
            >
              <p><strong>{from}</strong>: {body}</p>
            </li>)
            : null
        }
      </ul>
    </form>
  </div>
  );
}

export default Chat;