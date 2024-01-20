import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { removeFlashMessage } from "../../../actions";
import "./FlashMessage.css";

let thisId;
const FlashMessage = ({ message, type, id }) => {
    const [closing , setClosing] = useState(false);
    const dispatch = useDispatch();
    const flashMessageContainerRef = useRef(null);
    useEffect(()=>{
        thisId = setTimeout(()=>{
            if(!flashMessageContainerRef.current) return;
            flashMessageContainerRef.current.classList.add("closeFlashMessage");
        }, 12000);
    }, [])
    const handleCloseButtonClick = () => {
        if(closing) return
        setClosing(true);
        clearTimeout(id);
        clearTimeout(thisId);
        flashMessageContainerRef.current.classList.add("closeFlashMessage")
        setTimeout(()=>{
            dispatch(removeFlashMessage(id));
        },2000);
    };
    return (
        <>
        { type === "error" && 
        <div ref={flashMessageContainerRef} className="flashMessageContainer flashMessageError">
            <header className="flashMessageHeader">Error !
            { !closing && <span className="spanClose" onClick={handleCloseButtonClick}>&times;</span>}</header>
            { message }
            {!closing && <button className="flashMessageCloseButton" onClick={handleCloseButtonClick}>close</button>}
        </div>
        }
        {type === "warning" && 
        <div ref={flashMessageContainerRef} className="flashMessageContainer flashMessageWarning">
            <header className="flashMessageHeader">Warning !
            { !closing && <span className="spanClose" onClick={handleCloseButtonClick}>&times;</span>}</header>
            { message }
            <button className="flashMessageCloseButton" onClick={handleCloseButtonClick}>Close</button>
        </div>
        }
        {type === "success" && 
        <div ref={flashMessageContainerRef} className="flashMessageContainer flashMessageSuccess">
            <header className="flashMessageHeader">Success !
            { !closing && <span className="spanClose" onClick={handleCloseButtonClick}>&times;</span>}</header>
            { message }
            <button onClick={handleCloseButtonClick} className="flashMessageCloseButton">Close</button>
        </div>
        }
    
        </>
    );
};

export default FlashMessage;