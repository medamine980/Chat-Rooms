import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FlashMessage from "./FlashMessage/FlashMessage";
import "./FlashMessages.css";

const FlashMessages = () => {
    const { messages } = useSelector(state => state.flashMessage);
    const [flashMessagesState, setFlashMessagesState] = useState([]);
    useEffect(() => {
        setFlashMessagesState(messages)
    }, [messages])
    return (
        <>
        { flashMessagesState &&
            flashMessagesState.map((flashMessageState) => (
                <FlashMessage key={flashMessageState.timeOutId} id={flashMessageState.timeOutId} type={flashMessageState.type} message={flashMessageState.message}/> 
            ))
        }
        </>
    )
};

export default FlashMessages;