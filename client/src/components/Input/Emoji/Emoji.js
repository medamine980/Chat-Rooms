import { useEffect, useMemo, useRef, useState } from 'react';
import emoji from './../../../images/Emoji.svg'
import './Emoji.css';


const categories = [<>&#128339;</>, <><img width={16 * 1.5} src={emoji} /></>];
const Emoji = ({ setMessage, cursorPos, setCursorPos, resizeTextArea }) => {
    // const categories = ["&#128339;", "hey"];
    const [selectedCategorieIndex, setSelectedCategorieIndex] = useState(1);
    const [emojis, setEmojis] = useState([]);
    const setEmojiInMessage = (event) => {
        if (!event.currentTarget && !event.target.textContent) return;
        try {

            setMessage(message => {
                if (cursorPos !== null) {
                    const newMessage = message.substr(0, cursorPos) + event.target.textContent +
                        message.substr(cursorPos, message.length);
                    if (cursorPos === message.length) {
                        setCursorPos(null);
                    }
                    return newMessage;
                }
                else return message + event.target.textContent;
            });
            resizeTextArea({ target: document.getElementById('messageInput') })
            const storageEmotes = JSON.parse(localStorage["recentEmojis"] || "[]");
            storageEmotes.unshift(event.target.textContent);
            const sort = [...new Set(storageEmotes)];
            if (sort.length > 15) sort.splice(15, sort.length - 5);
            localStorage["recentEmojis"] = JSON.stringify([...sort]);
        }
        catch (e) {
            // setEmojis([]);
            // delete localStorage["recentEmojis"];
            localStorage["recentEmojis"] = JSON.stringify([event.target.textContent]);
            console.log(e.message)
        }
    }
    useEffect(() => {
        if (selectedCategorieIndex === 0) {
            try {
                setEmojis(JSON.parse(localStorage["recentEmojis"] || "[]"));
            }
            catch (e) {
                setEmojis([]);
            }
        }
        else {
            // const defaultEmojis = [];
            // for (let i = 0; i < 30; i++) {
            //     if (i < 10) defaultEmojis.push(<>&#12851{i};</>)
            //     else if (i < 100) defaultEmojis.push(<>&#1285{i};</>)
            // }
            // setEmojis(defaultEmojis);
            setEmojis([
                <>&#128512;</>,
                <>&#128513;</>,
                <>&#128514;</>,
                <>&#128515;</>,
                <>&#128516;</>,
                <>&#128517;</>,
                <>&#128518;</>,
                <>&#128519;</>,
                <>&#128520;</>,
                <>&#128521;</>,
                <>&#128522;</>,
                <>&#128523;</>,
                <>&#128524;</>,
                <>&#128525;</>,
                <>&#128526;</>,
                <>&#128527;</>,
                <>&#128528;</>,
                <>&#128529;</>,
            ]);
        }
    }, [selectedCategorieIndex])
    return (
        <div className="emojiOptions">
            <div className="emojiCategories">
                {categories.map((value, index) => (
                    <div key={index} onClick={() => setSelectedCategorieIndex(index)}
                        className={index === selectedCategorieIndex ? "emojiCategorie active" : "emojiCategorie"}>
                        {value}
                    </div>
                ))}
            </div>
            <div className="emojiContainer">
                {/* {selectedCategorieIndex === 0 && <div></div>} */}
                {emojis.map((emoji, i) => (
                    <div key={i} onClick={setEmojiInMessage} className="emoji">{emoji}</div>
                ))}
                {/* <div onClick={setEmojiInMessage} className="emoji">&#128512;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128513;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128514;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128515;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128516;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128517;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128518;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128519;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128520;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128521;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128522;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128523;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128524;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128525;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128526;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128527;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128528;</div>
                <div onClick={setEmojiInMessage} className="emoji">&#128529;</div> */}
            </div>
        </div>
    )
}
export default Emoji;