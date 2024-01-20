import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addFlashMessage, removeFlashMessage } from '../../../actions';
import openInNewWindow from '../../../openInNewWindow';
import Modal from '../../Modal/Modal';
import document from './../../../images/FilesIcons/upload_document.png';
import textIcon from './../../../images/FilesIcons/text_icon.png';
import msaccess from './../../../images/FilesIcons/microsoft-access.png';
import CaptionInputAndBtn from './CaptionInputAndBtn/CaptionInputAndBtn';
import './FilePreviewModal.css';
import VideoPreview from './VideoPreview/VideoPreview';

const FilePreviewModal = ({ show, data, sendFile, fileName, canClose }) => {
    // const base64 = data[1] ? btoa(String.fromCharCode(...new Uint8Array(data[1]))) : null;
    // const base64 = data[1] ? new TextDecoder().decode(new Uint8Array(data[1])) : null;
    // const base64 = data[1] ? data[1] : null;
    const inputZoomChecked = useRef(null);
    const url = URL.createObjectURL(data);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const fileType = useMemo(() => {
        if (data.type.includes("image")) return "image";
        else if (data.type.includes("video")) return "video";
        else if (data.type.includes("text")) return "text";
        else if (data.type.includes("msaccess")) return "msaccess";
        else return "document";
    }, [data.type])

    useEffect(() => {
        return () => {
            if (url) URL.revokeObjectURL(url);
        }
    }, [url])

    const zoomIn = (e) => {
        if (!inputZoomChecked.current) return
        const imageStyle = e.currentTarget.attributeStyleMap;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) * -1
        console.log(e.clientX - rect.left);
        const y = (e.clientY - rect.top) * -1
        imageStyle.set("--x", x + "px");
        imageStyle.set("--y", y + "px");

        inputZoomChecked.current.click();
    }
    const checkImage = (url) => {
        return new Promise(res => {
            const img = new Image();
            img.onload = () => {
                res({ status: 200 });
                img.remove();
                URL.revokeObjectURL(url);
            }
            img.onerror = () => {
                res({ status: 404 });
                img.remove();
                URL.revokeObjectURL(url);
            }
            img.src = url;
        })
    }
    const handleSend = async (e, caption) => {
        if (loading) return;
        setLoading(true);
        if (fileType === "image") {
            const { status } = await checkImage(url);
            if (status === 200) {
                sendFile({
                    event: e, data, caption, fileName, callback: (error) => {
                        if (error) {
                            return
                        }
                        setLoading(false);
                        show(false);
                    }
                });
            }
            else if (status === 404) {
                setLoading(false);
                show(false);
                const id = setTimeout(() => {
                    dispatch(removeFlashMessage(id));
                }, 14000)
                dispatch(addFlashMessage({
                    message: "Can't load the image",
                    timeOutId: id,
                    type: "error"

                }))
            }
        }
        else {
            sendFile({
                event: e, data, caption, fileName, callback: (error) => {
                    if (error) {
                        return
                    }
                    setLoading(false);
                    show(false);
                }
            });

        }

    }
    return (
        <Modal canClose={!loading} show={show} header={"Preview"}>

            {fileType === "image" && url &&
                <>
                    <input ref={inputZoomChecked} type="checkbox" id="zoomChecked" />
                    <img onClick={zoomIn} className="previewImage" src={url} alt="preview" />
                </>
            }
            {fileType === "video" && url &&
                <VideoPreview data={data} url={url} />
            }
            {fileType === "document" && url &&
                <div className="document">
                    <img src={document} alt="document" />
                    {fileName && <p onClick={() => openInNewWindow(url)}>{fileName}</p>}
                </div>
            }
            {fileType === "text" && url &&
                <div className="document">
                    <img src={textIcon} alt="text" />
                    {fileName && <p onClick={() => openInNewWindow(url)}>{fileName}</p>}
                </div>
            }
            {fileType === "msaccess" && url &&
                <div className="msaccess">
                    <img src={msaccess} alt="microsoft-access" />
                    {fileName && <p onClick={() => openInNewWindow(url)}>{fileName}</p>}
                </div>
            }
            <CaptionInputAndBtn loading={loading} handleSend={handleSend} />

        </Modal>
    )
}

export default FilePreviewModal;