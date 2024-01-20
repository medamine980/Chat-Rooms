import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addFlashMessage, removeFlashMessage } from '../../actions';
import IdbHandler from '../../IdbHandler';
import ScrollToBottom from '../ScrollToBottom/ScrollToBottom';
import Message from './Message/Message';
import './Messages.css';

const Messages = React.memo(({ messages, setMessages, username, messagesObjectStore, messageEvent }) => {
        const observer = useRef();
        const isAtBottom = useRef(true);
        const isAtTop = useRef(true);
        const scrollBack = useRef();
        const [loading, setLoading] = useState(false);
        const dispatch = useDispatch();
        const filterFunction = (err, dbMessages) => {
                if (err && !dbMessages) return
                // console.log(dbMessages)
                // messagesObjectStore.deleteMany(dbMessages);
                setTimeout(() => {
                        if (scrollBack.current && isAtTop.current) scrollBack.current(25);
                        setMessages(currentMessages => [...dbMessages, ...currentMessages])
                        setLoading(false);
                }, 2000)
        }
        const topMessageRef = useCallback(node => {
                if (observer.current) observer.current.disconnect()
                observer.current = new IntersectionObserver(entries => {
                        if (entries[0].isIntersecting && messagesObjectStore) {
                                messagesObjectStore.length((err, length) => {
                                        if (!err && length > 0 && !(messages.length - length > 10) && !loading) {
                                                setLoading(true);
                                                messagesObjectStore.findByFilter(
                                                        "order", IdbHandler.IDB_RANGE_BOUND,
                                                        [Math.max(messages[0].order - 5, 1), messages[0].order],
                                                        filterFunction
                                                )
                                        }
                                })
                        }

                })
                if (node) observer.current.observe(node)
        }, [messagesObjectStore, filterFunction])
        console.log(messages)
        useEffect(() => {
                messageEvent.current = (length) => {
                        if (length > 10 && isAtBottom.current) {
                                const messagesToStore = messages.splice(0, length - 10);

                                messagesObjectStore.updateMany(messagesToStore, (err, i) => {
                                        if (err) {
                                                const id = setTimeout(() => {
                                                        dispatch(removeFlashMessage(id));
                                                }, 140000)
                                                dispatch(addFlashMessage({
                                                        message: `${err.message}`,
                                                        timeOutId: id,
                                                        type: "error"
                                                }))
                                        }
                                }, true);
                        }
                }
        }, [messageEvent, messagesObjectStore, messages, dispatch]);

        return (
                <ScrollToBottom scrollBack={scrollBack} isAtBottom={isAtBottom} isAtTop={isAtTop} messages={messages}>
                        {loading && <div role="progress" className="messages-top-loading"></div>}
                        {messages && messages.map((message, i) =>
                        (i !== 0 ?
                                <div key={message.order.toString()}><Message message={message} username={username} /></div>
                                : <div key={message.order.toString()} ref={topMessageRef}>
                                        <Message message={message} username={username}></Message>
                                </div>
                        ))}
                </ScrollToBottom>
        )

})

export default Messages;