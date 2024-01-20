async function _arrayBufferToBase64( buffer, {sleepTime, chunkSize} ) {
    if(sleepTime === undefined) sleepTime = 100;
    if(chunkSize === undefined) chunkSize = 102400;
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        if(i % chunkSize === 0){
            await sleep(sleepTime)
        }
        binary += String.fromCharCode( bytes[ i ] );
    }
    return new Promise(res=>res(window.btoa( binary )));
}

function sleep(time){
    return new Promise(res=> setTimeout(()=>res("resolved"), time))
}

export default _arrayBufferToBase64