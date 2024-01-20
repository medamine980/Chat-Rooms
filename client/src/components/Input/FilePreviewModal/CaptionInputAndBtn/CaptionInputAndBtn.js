import { useMemo, useState } from "react";
import "./CaptionInputAndBtn.css";

const CaptionInputAndBtn = ({loading, handleSend}) => {
    const [caption, setCaption] = useState("");
    const maxLength = useMemo(()=> 250, [])
    const handleChange = (e) => {
        setCaption(e.currentTarget.value.substr(0,maxLength))
    }
    return(
        <div className="captionInputAndSendButton">
            <textarea value={caption} onChange={handleChange} className="captionInput" type="text" placeholder="Add your caption..."/>
            { 
            loading ? <button className="sendButton" onClick={(e)=>handleSend(e, caption)} disabled>Send...</button>
            :<button className="sendButton" onClick={(e)=>handleSend(e, caption)}>Send</button>
            }
        </div>
    )
}

export default CaptionInputAndBtn;