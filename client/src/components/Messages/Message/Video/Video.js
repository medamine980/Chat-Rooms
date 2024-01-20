import React from "react";
import "./Video.css";

const Video = React.memo((
    {imgDownloadRef, loaded, setloaded, style, url,
    fileType, fileName, handleDownload, download}
    ) => {
    return (
        <>
            <video style={style} onErrorCapture={()=>loaded ? null : setloaded(true)}
            onLoadedMetadataCapture={(e)=>loaded ? null : setloaded(true)} controlsList="nodownload"
            className="videoSent" controls name="media">
                <source src={url} type={fileType}></source>
                Your browser doesn't support this feature!
            </video>
            <img src={download} style={{cursor:"pointer"}}
            onClick={()=>imgDownloadRef.current ? imgDownloadRef.current.click() : null} 
            width={14} alt="download"/>
            <a className="documentFileName"
            ref={imgDownloadRef} href={url} download={fileName}>{fileName}</a>
        </>
    )
})

export default Video;