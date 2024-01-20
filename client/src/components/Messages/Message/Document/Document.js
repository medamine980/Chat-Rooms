const Document = ({ style, url, documentIconType, fileName, _alt="document sent by user" }) => {
    return(
        <>
            <img style={style} className="documentSentByUser" 
            src={documentIconType} width={25} alt={_alt}/>
            <a href={url} className="documentFileName" 
            download={fileName}>{fileName}</a>
        </>
    )
}

export default Document;