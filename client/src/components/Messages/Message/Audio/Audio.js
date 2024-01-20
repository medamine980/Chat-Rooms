import "./Audio.css";

const Audio = ({ imgDownloadRef, loaded, setloaded, style, url,
    fileType, fileName, handleDownload, download }) => {
    const handleLoaded = (e) => {
        if (!loaded) setloaded(true)
        e.currentTarget.currentTime = 0;
    }
    return (
        <>
            <audio className="audioSent"
                style={style} onLoadStart={(e) => e.currentTarget.currentTime = 9999}
                onLoadedDataCapture={handleLoaded} controls>
                <source src={url} type={fileType}></source>
            </audio>
        </>
    )
}

export default Audio;