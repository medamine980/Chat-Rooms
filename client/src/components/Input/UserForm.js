import PropTypes from 'prop-types';

import './UserForm.css';
import uploadDocumentIcon from './../../images/FilesIcons/upload_document.png';
import Emoji from './Emoji/Emoji';
import React, { useEffect, useRef, useState } from 'react';
import FilePreviewModal from './FilePreviewModal/FilePreviewModal';
import { useDispatch } from 'react-redux';
import { addFlashMessage, removeFlashMessage } from '../../actions';
import FileTypesMenu from './FileTypesMenu/FileTypesMenu';
import AudioModal from './AudioModal/AudioModal';

let data;
const Input = React.memo(React.forwardRef(({ message, setMessage, sendMessage, sendFile }, ref) => {
    const [showPreview, setShowPreview] = useState(false);
    const [showFileTypes, setShowFileTypes] = useState(false);
    const [showAudioModal, setShowAudioModal] = useState(false);
    const [showEmojiOptions, setShowEmojiOptions] = useState(false);
    const [cursorPos, setCursorPos] = useState(null);
    // const textAreaRef = useRef(null);
    const fileName = useRef(null);
    const dispatch = useDispatch();
    const inputFile = useRef(null);
    const openFileTypesButtonRef = useRef(null);

    const handleSend = e => {
        sendMessage(e);
        setShowEmojiOptions(false);
    }
    const handleChangeTxtArea = e => {
        setMessage(e.target.value);
    }
    const resizeTextArea = e => {
        setTimeout(() => {
            if (!e.target) return
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 2 + 'px';
        }, 0)
    }
    const openFileTypesMenu = () => {
        if (!showFileTypes) {
            setShowFileTypes(true);
        }
    }
    useEffect(() => {
        if (showFileTypes) {
            if (openFileTypesButtonRef.current) openFileTypesButtonRef.current.classList.add("selected");
        }
        if (!showFileTypes) {
            if (openFileTypesButtonRef.current) openFileTypesButtonRef.current.classList.remove("selected")
        }
    }, [showFileTypes])

    const readInputFileDocument = (e, f) => {
        const file = e ? e.currentTarget.files[0] : f;
        if (inputFile.current) inputFile.current.value = "";
        if (!file) return;
        if (!file.type) {
            const id = setTimeout(() => {
                dispatch(removeFlashMessage(id));
            }, 14000);
            dispatch(addFlashMessage({
                message: "Cannot read this file type",
                timeOutId: id,
                type: "warning"
            }));

            return
        }
        setShowFileTypes(false);
        fileName.current = file.name;
        data = file;
        setShowPreview(true);
    }
    useEffect(() => {
        if (!ref.current)
            ref.current = readInputFileDocument
    }, [readInputFileDocument, ref])
    return (
        <>
            {showPreview &&
                <FilePreviewModal sendFile={sendFile} fileName={fileName.current} show={setShowPreview} data={data} />
            }
            {showAudioModal &&
                <AudioModal sendFile={sendFile} show={setShowAudioModal} />
            }

            <form id="chatInputForm">
                {showEmojiOptions && <Emoji resizeTextArea={resizeTextArea} cursorPos={cursorPos} setCursorPos={setCursorPos}
                    showEmojiOptions={showEmojiOptions} setMessage={setMessage} />}
                <div id="chatInputContainer">
                    <div onClick={openFileTypesMenu} ref={openFileTypesButtonRef} id="uploadDocumentSettingsButton">
                        {showFileTypes &&
                            <FileTypesMenu buttonRef={openFileTypesButtonRef} showAudio={setShowAudioModal}
                                inputFileRef={inputFile} show={setShowFileTypes} />
                        }
                    </div>
                    <textarea
                        cols="5" type='text' id="messageInput" placeholder="Type a message..." value={message}
                        onPaste={resizeTextArea} onCopy={resizeTextArea} onKeyDown={resizeTextArea}
                        onKeyPress={e => e.key == "Enter" && !e.shiftKey ? handleSend(e) : null}
                        onKeyUp={e => setCursorPos(e.currentTarget.selectionEnd)}
                        onMouseUp={e => setCursorPos(e.currentTarget.selectionEnd)}
                        onChange={handleChangeTxtArea} autoFocus />
                    <input type="file" onChange={readInputFileDocument} hidden accept="image/*" ref={inputFile} />
                    {showEmojiOptions ?
                        <div id="emojiOption" className="withCloseChar" onClick={() => setShowEmojiOptions(false)}>&times;</div>
                        :
                        <div id="emojiOption" className="withEmojiImg" onClick={() => setShowEmojiOptions(true)}></div>
                    }

                    <button id="submitMessageButton" onClick={handleSend}>Send</button>
                </div>


            </form>

        </>
    )
}))

Input.propTypes = {
    message: PropTypes.string,
    sendMessage: PropTypes.func,
    setMessage: PropTypes.func,
    sendFile: PropTypes.func
}

export default Input;