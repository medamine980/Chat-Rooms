import { useRef } from "react";
import "./Image.css";

const Image = ({
    style, openInNewWindow, setloaded, loaded, handleLoaded,
    fileName, imgDownloadRef, url, download
}) => {

    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
        );
    }
    const thisImg = useRef(null);
    // console.log(thisImg.current.outerHTML)
    // if(thisImg.current){
    //     thisImg.current.parentElement.parentElement.parentElement.parentElement.onscroll =  e => {
    //         if(isElementInViewport(thisImg.current) && !thisImg.current.src !== url){
    //             thisImg.current.src = url;
    //         }
    //         else if(!isElementInViewport(thisImg.current) && thisImg.current.src === url){
    //             thisImg.current.src = "";
    //             // setloaded(false)
    //         }
    //     }
    // }
    return (
        <>

            <img ref={thisImg} style={style} onClick={(e) => openInNewWindow(e.currentTarget.outerHTML, "image")} className="imageSentByUser" onError={() => loaded ? null : setloaded(true)}
                onLoad={() => loaded ? null : handleLoaded(url)} src={url} alt="img sent by user" />
            <img src={download} style={{ cursor: "pointer" }} loading="lazy"
                onClick={() => imgDownloadRef.current ? imgDownloadRef.current.click() : null}
                width={14} alt="download" />
            <a className="documentFileName" ref={imgDownloadRef} href={url} download={fileName}>{fileName}</a>
        </>
    )
}

export default Image