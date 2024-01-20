import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Chat from './components/Chat/Chat';
import Create from './components/Create/Create';

import './App.css';
import AvailableRooms from './components/AvailableRooms/AvailableRooms';
import SideNav from './components/SideNav/SideNav';
import FlashMessages from './components/FlashMessages/FlashMessages';

const App = () => {
    return (
        <Router>
            <SideNav />
            <FlashMessages />
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/rooms" />
                </Route>
                <Route path="/create">
                    <Create />
                </Route>
                <Route path="/chat">
                    <Chat />
                </Route>
                <Route path="/rooms">
                    <AvailableRooms />
                </Route>
            </Switch>
        </Router>
    )
}

export default App;