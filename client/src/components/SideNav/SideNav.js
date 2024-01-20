import oneUserIcon from '../../images/1user_icon.png';
import doubleArrow from '../../images/double_arrow_icon.png';
import { Link } from 'react-router-dom';
import "./SideNav.css";
import { useSelector } from 'react-redux';
import { useState } from 'react';
import UsernameModal from '../UsernameModal/UsernameModal';

const SideNav = () => {
    const [showUsernameModal , setShowUsernameModal] = useState(false);
    const { username } = useSelector(state => state.joinData);
    if(username === "" && !showUsernameModal) setShowUsernameModal(true)
    return (
        <>
        <nav id="nav">
            
            <ul className="nav-items">
                <li className="nav-logo">
                    <Link className="nav-link" to="#">
                        <span className="nav-link-text">
                            Chat
                        </span>
                        <img src={doubleArrow} alt="double arrow"/>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="#" onClick={()=> setShowUsernameModal(true)}>
                        <img src={oneUserIcon} alt="one user"/>
                        <span className="nav-link-text">{username}</span>
                    </Link>
                </li>
            </ul>
        </nav>
        {showUsernameModal && <UsernameModal show={setShowUsernameModal}/>}
        </>
    )
}

export default SideNav;