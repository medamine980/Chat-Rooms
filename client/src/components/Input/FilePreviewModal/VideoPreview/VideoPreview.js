import React, { useEffect } from "react";
import "./VideoPreview.css";
const VideoPreview = ({ url, data:{type}}) => {
    useEffect(()=>{
        return () => {
            if(url) URL.revokeObjectURL(url);
        }
    }, [url])
    return(
        <video className="videoPreview" controls controlsList="nodownload">
            <source src={url} type={type}/>
            Your browser does not support this feature
        </video>
    )
}

export default VideoPreview;