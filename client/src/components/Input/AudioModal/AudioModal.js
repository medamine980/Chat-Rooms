import { useCallback, useEffect, useRef, useState } from "react";
import Modal from "../../Modal/Modal";
import "./AudioModal.css";

const AudioModal = ({ show, sendFile }) => {
    const [isRecording, setIsRecording] = useState(true);
    const [loading, setLoading] = useState(false);
    const chunks = useRef([]);
    const url = useRef(null);
    const audioEle = useRef();
    const mediaRecorder = useRef(null);
    const isMounted = useRef(true);
    const canvas = useRef(null);
    const drawVisualiser = useRef(null);
    const streamRef = useRef(null);
    const handleStop = useCallback(() => {
        if (!mediaRecorder.current) return
        mediaRecorder.current.stop();
    }, [])
    const handleSend = (e) => {
        if (loading) return;
        setLoading(true);
        sendFile({
            event: e, data: chunks.current, fileName: chunks.current.fileName, callback: () => {
                show(false);
                setLoading(false);
            }
        });
    }

    useEffect(() => {
        if (!isRecording) {
            if (streamRef.current) {
                streamRef.current.getAudioTracks().forEach(track => track.stop());
                streamRef.current = null
            }
            mediaRecorder.current = null;
            drawVisualiser.current = null;

            return;
        };

        // navigator.mediaDevices.enumerateDevices().then(devices => devices = devices.filter(d => d.kind === 'audioInput');
        // navigator.mediaDevices.getUserMedia({audio:{deviceId: devices[0].deviceId}})
        // navigator.mediaDevices.enumerateDevices().then(devices => devices.filter(d => d.kind === "audioinput"))
        // .then(devices => 
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            if (!isMounted.current) return;
            mediaRecorder.current = new MediaRecorder(stream);
            console.log(mediaRecorder.current)
            streamRef.current = stream;
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // The analyser node will then capture audio data using a Fast Fourier Transform (fft).
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser); // connect the analyser to the stream
            analyser.fft = 128;
            const bufferLength = analyser.frequencyBinCount; // get buffer length
            const dataArray = new Uint8Array(bufferLength);

            if (canvas.current) {
                const canvasCtx = canvas.current.getContext("2d");
                canvasCtx.clearRect(0, 0, canvas.current.width, canvas.current.height);
                const draw = () => {
                    if (!canvas.current || !isMounted.current) return;
                    drawVisualiser.current = requestAnimationFrame(draw);
                    analyser.getByteFrequencyData(dataArray);
                    const grd = canvasCtx.createLinearGradient(10, 10, 80, canvas.current.width, canvas.current.height, 180);
                    grd.addColorStop(0, "#fadbae");
                    grd.addColorStop(1, "white")
                    canvasCtx.fillStyle = grd;
                    canvasCtx.fillRect(0, 0, canvas.current.width, canvas.current.height);
                    const barWidth = (canvas.current.width / bufferLength) * 10; // we multiply it by two so that we can see just half of the data
                    let barHeight;
                    var x = 0;
                    for (let i = 0; i < bufferLength; i++) {
                        barHeight = dataArray[i] / 2;

                        canvasCtx.fillStyle = `rgb(${barHeight + 70}, 0 ,0)`
                        canvasCtx.fillRect(x, canvas.current.height - barHeight, barWidth, barHeight)

                        x += barWidth + 1;
                    }
                }
                draw();
            }

            if (isRecording) {
                mediaRecorder.current.start();
            }
            mediaRecorder.current.ondataavailable = (e) => {
                if (!isMounted.current) return
                chunks.current.push(e.data);
            }
            mediaRecorder.current.onstop = (e) => {
                if (!isMounted.current) return
                chunks.current = new Blob(chunks.current, { 'type': chunks.current[0]["type"] });
                url.current = URL.createObjectURL(chunks.current)
                setIsRecording(false);
                if (!audioEle.current) return
                audioEle.current.currentTime = 9999
            }
        })
            .catch(err => console.log(err.message));
    }, [isRecording]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
            if (url.current) URL.revokeObjectURL(url.current);
            if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
                mediaRecorder.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
            }
            if (drawVisualiser.current) window.cancelAnimationFrame(drawVisualiser.current);
        }
    }, [])

    return (
        <Modal canClose={!loading} show={show} >
            {isRecording && <canvas className="audioCanvasModal" ref={canvas}></canvas>}
            {!isRecording && url.current &&
                <audio onLoadedDataCapture={(e) => e.currentTarget.currentTime = 0} ref={audioEle} className="audioPreviewAudioModal" controls controlsList="nodownload">
                    <source src={url.current} type={"audio/webm;codecs=opus"}></source>
                </audio>
            }
            <div className="audioModalButtons">
                {isRecording ?
                    <button className="stopAudioModalButton" onClick={() => handleStop()}>Stop</button>
                    :
                    <button className="stopAudioModalButton" onClick={(e) => handleSend(e)}>Send</button>}
                <button className="cancelAudioModalButton" onClick={() => show(false)}>Cancel</button>
            </div>
        </Modal>
    )
}

export default AudioModal;