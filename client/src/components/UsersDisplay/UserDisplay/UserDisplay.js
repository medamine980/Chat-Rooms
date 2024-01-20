import './UserDisplay.css';
import onePersonIcon from './../../../images/1user_icon.png';
import { useEffect, useState } from 'react';
const UserDisplay = ({ user, enableButtons, hostUser, currentUser, kickEvent, banEvent, banDetails, setBanDetails }) => {

    const [reason, setReason] = useState(null);
    const [banTime, setBanTime] = useState(1);
    const handleKickClick = () => {
        kickEvent(user);
    }
    const handleBanClick = () => {
        setBanDetails(user.id);
    }
    const confirmBan = () => {
        banEvent(user, reason, banTime)
    }
    const handleTimeChange = (e) => {
        const max = 180;
        const min = 1;
        if (e.currentTarget.value > max) e.currentTarget.value = max;
        else if (e.currentTarget.value < min) e.currentTarget.value = min;
        setBanTime(e.currentTarget.value);
    }
    const handleReasonChange = e => {
        setReason(e.currentTarget.value);
    }
    useEffect(() => {
        return () => {
            setBanDetails(null);
        }
    }, [setBanDetails])
    return (
        <>
            <div className="userInfoContainer">
                <img src={onePersonIcon} alt="one person" width={25} height={25} />
                <div className="username">{user.username}</div>
                {
                    enableButtons && user.username !== currentUser &&
                    <div className="kickBanButtons">
                        {(!banDetails || banDetails !== user.id) &&
                            <>
                                <div className="kickButton" onClick={handleKickClick}>Kick</div>
                                <div className="banButton" onClick={handleBanClick}>Ban</div>
                            </>
                        }
                        {banDetails && banDetails === user.id &&
                            <div className="banTimeAndReason">
                                <label>time:<input
                                    onChange={handleTimeChange} placeholder="minutes" type="number" /></label>
                                <select defaultValue="defaultOption" onChange={handleReasonChange}>
                                    <option disabled value="defaultOption">Select a reason</option>
                                    <option value="Insult">Insult</option>
                                </select>
                                <div className="banCancelButtons">
                                    <button className="banConfirm" onClick={confirmBan}>Ban</button>
                                    <button className="cancelButton" onClick={() => setBanDetails(false)}>Cancel</button>
                                </div>
                            </div>
                        }
                    </div>
                }
                {
                    user.username === hostUser && !enableButtons &&
                    <div className="roleDisplay">Host</div>
                }
            </div>
            <hr />
        </>
    )
}

export default UserDisplay;