import document from './../../../images/FilesIcons/upload_document.png';
import camera from "./../../../images/camera.png";
import micIcon from "./../../../images/mic_icon.png"
import "./FileTypesMenu.css";
import React, { useRef } from 'react';

const FileTypesMenu = ({ buttonRef , show, inputFileRef, showAudio }) => {
    const fileTypesRef = useRef(null);
    const setAcceptAttr = (type) => {
        if(!inputFileRef.current) return
        inputFileRef.current.setAttribute("accept", type);
        inputFileRef.current.click();
    }
    const toggleFileType = () => {
        show(showFileTypes => showFileTypes ? setTimeout(()=>{
            show(false)
        },500) : show(true));
    }
    if(buttonRef.current){
            buttonRef.current.onclick = (e) => {
                if(fileTypesRef.current && e.target === buttonRef.current){
                    toggleFileType();
                    if(fileTypesRef.current.className.match(/\bclose\b/)) {
                        fileTypesRef.current.classList.remove("close");
                        fileTypesRef.current.classList.add("open");
                        
                    }
                    else if(fileTypesRef.current.className.match(/\bopen\b/)) {
                        fileTypesRef.current.classList.add("close");
                        fileTypesRef.current.classList.remove("open");
                        buttonRef.current.classList.remove("blackCircle");
                    }
                }
            }
    }
    window.addEventListener("click", (e)=>{
        if(!fileTypesRef.current || !buttonRef.current) return;
        if(fileTypesRef.current.className.match(/\bopen\b/) && !fileTypesRef.current.contains(e.target) && e.target !== buttonRef.current){
            fileTypesRef.current.classList.add("close");
            fileTypesRef.current.classList.remove("open");
            setTimeout(()=>{
                show(false);
            },500);
        }
    })
    return(
        <>
        <div ref={fileTypesRef} className="fileTypes open">
            <div className="fileType" onClick={()=>setAcceptAttr("image/* , video/*")}>
                <img alt="camera" src={camera}/>
                <p>Images & Videos</p>
            </div>
            <div className="fileType" onClick={()=>setAcceptAttr("*")}>
                <img alt="document" src={document}/>
                <p>Documents</p>
            </div>
            <div className="fileType" onClick={()=>showAudio(true)}>
                <img src={micIcon} alt="mic" />
                <p>Record Audio</p>
            </div>
        </div>
        </>
        // <Modal show={show} header={ "File Type" }>
        //     <div className="fileType" onClick={()=>setAcceptAttr("*")}>
        //         <img src={document} width={48} height={48} alt="document"/>
        //         <p>Document</p>
        //     </div>
        //     <div className="fileType" onClick={()=>setAcceptAttr("image/*, video/*")}>
        //         <img src={document} width={48} height={48} alt="document"/>
        //         <p>Images & Videos</p>
        //     </div>
        // </Modal>
    )
}

export default FileTypesMenu;