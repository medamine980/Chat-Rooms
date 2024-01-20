import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { addFlashMessage, removeFlashMessage, setUsername } from "../../actions";
import Modal from "../Modal/Modal";
import "./UsernameModal.css"


const UsernameModal = ({ show }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const { username } = useSelector(state => state.joinData);
    const [usernameState, setUsernameState] = useState(username);
    const [infoMessage, setInfoMessage] = useState("");
    const handleUsername = (e) => {
        const {value} = e.currentTarget
        const maxLength = 30;
        setUsernameState(value.substr(0,maxLength));
    }
    useEffect(()=>{
        if(location.pathname === "/chat"){
            setInfoMessage("Can't change right now!")
        }
        else if(!usernameState){
            setInfoMessage("Can't leave your name empty!")
        }
        else if(usernameState && infoMessage){
            setInfoMessage("");
        }
    }, [location.pathname, usernameState, infoMessage])
    const canChange = () => usernameState && location.pathname !== "/chat";
    const handleSubmit = event => {
        event.preventDefault()
        
        if(!canChange()) return
        
        else{
            if(usernameState !== username){
                dispatch(setUsername(usernameState))
                const id = setTimeout(()=>{
                dispatch(removeFlashMessage(id));
                }, 14000);
                dispatch(addFlashMessage({
                    message: "Your name is successfully changed",
                    timeOutId: id,
                    type: "success"
                 }))
            }
            show(false)
        }
    }

    return (
        <Modal show={show} header="Name">
            <form onSubmit={handleSubmit} className="usernameInputOnModalContainer">
                { infoMessage && <div className="usernameInputInfoOnModal">{ infoMessage }</div> }
                {location.pathname !== "/chat" ?
                    <input className="usernameInputOnModal" value={usernameState} onChange={handleUsername} placeholder="Name" type="text" />
                    :<input className="usernameInputOnModal" value={usernameState} onChange={handleUsername} placeholder="Name" type="text" readOnly/>
                }
                {
                    canChange() ?
                    <button className="saveUsernameOnModal">Save</button>
                    : <button className="saveUsernameOnModal" disabled>Save</button>
                }
            </form>
            
        </Modal>
    )
}

export default UsernameModal;