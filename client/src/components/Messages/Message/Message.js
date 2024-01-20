import documentIcon from './../../../images/FilesIcons/upload_document.png';
import textIcon from './../../../images/FilesIcons/text_icon.png'
import download from './../../../images/download.png';
import msaccess from './../../../images/FilesIcons/microsoft-access.png';
import './Message.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import openInNewWindow from '../../../openInNewWindow';
import Video from './Video/Video';
import Image from './Image/Image';
import Document from './Document/Document';
import Audio from './Audio/Audio';


const Message = React.memo(({ message: { user, text, fileType, blob, time, fileName }, username }) => {
    function concat(arrays) {

        // sum of individual array lengths
        let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);

        if (!arrays.length) return null;

        let result = new Uint8Array(totalLength);

        // for each array - copy it over result
        // next array is copied right after the previous one
        let length = 0;
        for (let array of arrays) {
            result.set(array, length);
            length += array.length;
        }

        return result;
    }
    const currentUser = username.trim();
    const [loaded, setloaded] = useState(false);
    const sentByThisUser = currentUser === user;
    const imgDownloadRef = useRef(null);
    const url = useRef(null);
    if (fileType === undefined || fileType === null) fileType = ""
    const isDocument = useMemo(() =>
        fileType && (fileType.includes("excel") || fileType.includes("application/x-msdownload")
            || fileType.includes("xml")) || fileType.includes('application/pdf'), [fileType])
    const isText = useMemo(() => fileType && fileType.includes("text"), [fileType]);
    const isMsAccess = useMemo(() => fileType && fileType.includes("application/msaccess"), [fileType]);
    const isImage = useMemo(() => fileType && fileType.includes("image"), [fileType]);
    const isVideo = useMemo(() => fileType && fileType.includes("video"), [fileType]);
    const isAudio = useMemo(() => fileType && fileType.includes("audio"), [fileType]);

    let style = { display: url.current && !loaded ? "none" : "block" };
    const handleLoaded = () => {
        setloaded(true);
    }
    // console.log(s)
    // if (message.fileBuffer) {
    //     const blob = new Blob([new Uint8Array(message.fileBuffer)], { type: message.type });
    //     delete message.fileBuffer;

    //     message.blob = blob;
    // }
    /**
     * 
     * @param {string} string 
     * @returns {string}
     */
    function distinguishElements(string) {
        const regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
        const matchs = string.match(regex);
        let newLineRegEx = /\n/g
        const newLineMatch = string.match(newLineRegEx);
        const urlRegex = /(?:\bhttps?:\/\/(?:www\.)?[a-zA-Z0-9@~#%-_]{1,256}(?:\.|:)[a-zA-Z0-9()]{1,6}\b(?:[a-zA-Z0-9@~#%-_//\?&()=])*)/g
        const urlMatch = string.match(urlRegex);
        // var parts = "I am a cow; cows say moo. MOOOOO.".split(/(\bmoo+\b)/gi);
        // for (var i = 1; i < parts.length; i += 2) {
        //     parts[i] = <span className="match" key={i}>{parts[i]}</span>;
        // }
        if (matchs) {
            const arr = string.split(regex);
            for (let i = 0; i < arr.length; i++) {
                if (newLineMatch) {
                    arr[i] = arr[i].split(newLineRegEx);
                    for (let j = 0; j < arr[i].length - 1; j++) {
                        if (urlMatch) {
                            arr[i][j] = arr[i][j].split(urlRegex);
                            for (let k = 0; k < arr[i][j].length - 1; k++) {
                                if (urlMatch[j]) {
                                    arr[i][j][k] =
                                        <React.Fragment key={k}>
                                            {arr[i][j][k]}<a href={urlMatch[j]} target="_blank">{urlMatch[j]}</a>
                                        </React.Fragment>
                                } else break
                            }
                        }
                        arr[i][j] = <React.Fragment key={j}>
                            {arr[i][j]}<br />
                        </React.Fragment>
                    }

                }
                if (urlMatch && !newLineMatch) {
                    arr[i] = arr[i].split(urlRegex);
                    for (let j = 0; j < arr.length - 1; j++) {
                        if (urlMatch[i])
                            arr[i][j] = <React.Fragment key={j}>
                                {arr[i][j]}<a href={urlMatch[i]} target="_blank">{urlMatch[i]}</a>
                            </React.Fragment>
                    }
                }
                if (matchs[i])
                    arr[i] = <React.Fragment key={i}>
                        {arr[i]}<span className="messageEmoji">{matchs[i]}</span>
                    </React.Fragment>;

            }
            return arr
        }
        if (newLineMatch) {
            const arr = string.split(newLineRegEx);
            for (let i = 0; i < arr.length; i++) {
                if (urlMatch) {
                    arr[i] = arr[i].split(urlRegex);
                    for (let j = 0; j < arr[i].length; j++) {
                        if (urlMatch[i]) {
                            arr[i][j] = <React.Fragment key={j}>
                                {arr[i][j]}<a href={urlMatch[j]} target='_blank'>{urlMatch[j]}</a>
                            </React.Fragment>
                        } else break

                    }
                }
                if (newLineMatch[i])
                    arr[i] = <React.Fragment key={i}>
                        {arr[i]}<br />
                    </React.Fragment>
            }
            return arr;
        }
        if (urlMatch) {
            const arr = string.split(urlRegex);

            for (let i = 0; i < arr.length; i++) {
                arr[i] = <React.Fragment key={i}>
                    {arr[i]}<a href={urlMatch[i]} target='_blank'>{urlMatch[i]}</a>
                </React.Fragment>
            }
            return arr;
        }
        return string;
    }
    if (blob && blob.size && !url.current) {
        url.current = URL.createObjectURL(blob);
    }

    useEffect(() => {
        return () => {
            console.log("dead");
            url.current && URL.revokeObjectURL(url.current);
        }
    }, [url])
    if (sentByThisUser) return (
        <div className="myMessage">
            <header >You</header>{/* L25 L23 */}
            <svg width={25} height={25} className="dialogueArrow">
                <path d="M10 10 L23 3 q1 0, 1 -1.5 q0 -1 -1 -1.5 L0 0 Z" ></path>
            </svg>
            {blob && blob.size &&
                <div style={style} className="fileContainer">
                    {!loaded && (isImage || isVideo) && <div style={{ width: "100%", paddingTop: "175%", marginTop: fileName.length + "px" }}></div>}
                    {isImage &&
                        <Image url={url.current} loaded={loaded} setloaded={setloaded} handleLoaded={handleLoaded}
                            fileName={fileName} imgDownloadRef={imgDownloadRef} openInNewWindow={openInNewWindow}
                            download={download} />
                    }
                    {isDocument &&
                        <Document url={url.current} fileName={fileName} documentIconType={documentIcon} />
                    }
                    {isMsAccess &&
                        <Document _alt="ms-access file" url={url.current} fileName={fileName} documentIconType={msaccess} />
                    }
                    {isText &&
                        <Document _alt="ms-access file" url={url.current} fileName={fileName} documentIconType={textIcon} />
                    }
                    {isVideo &&
                        <Video imgDownloadRef={imgDownloadRef} download={download}
                            loaded={loaded} setloaded={setloaded} url={url.current} fileName={fileName}
                            fileType={fileType}
                        />
                    }
                    {isAudio &&
                        <Audio loaded={loaded} setloaded={setloaded} fileType={fileType} url={url.current} />
                    }

                </div>
            }
            {text && <p>{distinguishElements(text)}</p>}
            <footer className="receivedTime">
                <time dateTime={time}>
                    {time}
                </time>
            </footer>


        </div>
    )

    else if (user === "admin") return (
        <div className="roomMessage">
            <p>{text}</p>
        </div>
    )

    else return (
        <div className="message">
            <header>{user}</header>
            <svg width={25} height={25} className="dialogueArrow">
                <path d="M15 10 L2 3 q-1 0, -1 -1.5 q0 -1 1 -1.5 L25 0" ></path>
            </svg>
            {blob && blob.size &&
                <div style={style} className="fileContainer">
                    {!loaded && (isImage || isVideo) && <div style={{ width: "100%", paddingTop: "150%", marginTop: fileName.length + "px" }}></div>}
                    {url.current && isImage &&
                        <Image url={url.current} loaded={loaded} setloaded={setloaded} handleLoaded={handleLoaded}
                            fileName={fileName} imgDownloadRef={imgDownloadRef} openInNewWindow={openInNewWindow}
                            download={download} />
                    }
                    {isDocument &&
                        <Document _alt="ms-access file" url={url.current}
                            fileName={fileName} documentIconType={msaccess} />
                    }
                    {isVideo &&
                        <Video imgDownloadRef={imgDownloadRef} download={download}
                            loaded={loaded} setloaded={setloaded} url={url.current} fileName={fileName}
                            fileType={fileType}
                        />
                    }
                    {isAudio &&
                        <Audio loaded={loaded} setloaded={setloaded} fileType={fileType} url={url.current} />
                    }
                </div>}
            {text && <p>{distinguishElements(text)}</p>}
            <footer className="receivedTime">
                <time dateTime={time}>
                    {time}
                </time>
            </footer>
        </div>
    )
})

export default Message;