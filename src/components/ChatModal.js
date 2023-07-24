import { Button } from '@enact/sandstone/Button';
import { InputField } from '@enact/sandstone/Input';
import Popup from '@enact/sandstone/Popup';
import axios from 'axios';
import { Scroller } from '@enact/sandstone/Scroller';

import * as React from 'react';
import {OPENAI_API_KEY} from '../database'
import { useState, useEffect, useRef } from 'react';

import './ChatModal.css'

const MessageItem = ({ message }) => {
    if (message.role === 'system') {
        return null;
    }

    if (message.role === 'system') {
        return null;
    }

    const senderClassName = message.role === 'chat bot' ? 'a' : 'b';

    return (
        <div className="message-item">
            <div className={`message-sender-container ${senderClassName}`}>
                <div className="message-sender">{message.role}</div>
            </div>
            <div className={`message-text-container ${senderClassName}`}>
                <div className="message-text">{message.content}</div>
            </div>
        </div>
    );
};



const Modal = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const messageEndRef = useRef(null);

    const handleChange = (e) => {
        setMessage(e.value);
    };

    const handleSubmit = async () => {
        if (message === '') {
            return;
        }

        if (messages.length === 0) {
            // 사용자가 최초로 메시지를 입력하는 경우에만 instruction 메시지 추가
            setMessages([{ role: 'system', content: "I’ll provide you the questions related with the wine. Answer the question.\n First, you have to relate to user's emotion. Second, you need to recommend the right wine with the exact name for the question." }]);
        }
        setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
        
        try {
            // OpenAI API 호출
            const apiKey = OPENAI_API_KEY; // API 키를 환경 변수로 가져옵니다.
            const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
            const apiResponse = await axios.post(apiUrl, {
                prompt: message,
                max_tokens: 150,
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            });
            
            const gptResponse = apiResponse.data.choices[0].text;
            console.log("GPT-3.5-turbo 응답:", gptResponse);

            // 이전 messages 배열에 새로운 메시지와 응답을 추가하여 새로운 배열을 생성합니다.
            if (gptResponse === '' || gptResponse === null) {
                setMessages(prevMessages => [...prevMessages, { role: 'chat bot', content: 'Sorry. Can you question again?' }]);
            }
            else {
                setMessages(prevMessages => [...prevMessages, { role: 'chat bot', content: gptResponse }]);
            }
            
            // GPT API 응답 중 텍스트만 추출하여 상태로 설정합니다.
            setResponse(apiResponse.data.choices[0].text);

            console.log("hello",message)
            console.log(messages)

            // 입력 필드를 초기화합니다.
            setMessage('');
        } catch (error) {
            console.error('Error communicating with GPT-3:', error);
        }
    };

    useEffect(() => {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="modal-chat-container">
            <div className="modal-chat-title">
                <h2>Chatting with Wine Chat Bot</h2>
                <div className="modal-close-btn">
                    <Button
                        onClick={onClose}
                        backgroundOpacity="transparent"
                        size="small"
                        icon="closex"
                    />
                </div>
            </div>
            <div className="modal-chat-content">
                <div className="message-list">
                    <Scroller style={{ maxHeight: '50vh' }}>
                        {messages.map((message, index) => (
                            <MessageItem key={index} message={message} />
                        ))}
                        <div ref={messageEndRef}></div>
                    </Scroller>
                </div>
                <div className="modal-chat-textarea">
                    <InputField
                        className="modal-input-text-field"
                        onChange={handleChange}
                        value={message}
                        size="small"
                        placeholder="Type a Message"
                        type="text"
                    />
                    <Button onClick={handleSubmit}>Send</Button>
                </div>
            </div>
        </div>
    );
};


const ChatModal = ({ isOpen, onClose }) => {
    return (
        <Popup open={isOpen} onClose={onClose} position="center">
            <Modal onClose={onClose}/>
        </Popup>
    );
};

export default ChatModal;