import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Modal from "../Modal/Modal";
import UserDisplay from "./UserDisplay/UserDisplay";
import "./UsersDisplay.css";


const UsersDisplay = ({ users, room, kickEvent, banEvent, jsx }) => {
    const { username: thisUser } = useSelector(state => state.joinData);
    const [hostUser, setHostUser] = useState(null);
    const [banDetails , setBanDetails] = useState(null);
    const [showTable , setShowTable] = useState(false);
    const handleShowTable = () => {
        setShowTable(!showTable)
    }
    useEffect(() => {
        const foundHost = users.find(user => user.host)
        foundHost ? 
        setHostUser(foundHost.username) : 
        setHostUser(null)
        return () => {
            document.onclick = ()=>{}
        }
    }, [users, hostUser])
    return(
        <>
        <header className="usersTableToggler" onClick={handleShowTable}>{jsx}</header>
        { showTable &&
            <Modal show={setShowTable} header={"Users"}>
                <table className="usersTable">
                    <thead></thead>
                    <tbody>
                        {
                        users.map(user => (
                            <tr className="" key={user.id}>
                                <td><UserDisplay user={user} banDetails={banDetails} 
                                currentUser={thisUser} setBanDetails={setBanDetails} 
                                enableButtons={thisUser === hostUser} banEvent={banEvent} hostUser={hostUser} kickEvent={kickEvent}/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal>
            
        }
        </>
    )}

export default UsersDisplay;