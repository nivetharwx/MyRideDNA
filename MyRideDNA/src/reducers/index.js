import { combineReducers } from 'redux';
import UserAuth from './UserAuth';
import TabVisibility from './TabVisibility';
import RideInfo from './RideInfo';
import RideList from './RideList';
import GPSState from './GPSState';
import PageState from './PageState';
import FriendList from './FriendList';
import GarageInfo from './GarageInfo';
import PageOverTab from './PageOverTab';
import FriendGroupList from './FriendGroupList';
import PassengerList from './PassengerList';
import CommunitySearchList from './CommunitySearchList';
import NotificationList from './NotificationList';
import FriendRequest from './FriendRequest';
import ChatList from './ChatList';

const rootReducer = (state, action) => {
    if (action.type === 'RESETING_STATE_ON_LOGOUT') {
      state = undefined
    }
  
    return appReducer(state, action)
  }
// export default  combineReducers({ UserAuth, TabVisibility, RideInfo, RideList, GPSState, PageState, FriendList, GarageInfo, PageOverTab, FriendGroupList, PassengerList, CommunitySearchList, NotificationList, FriendRequest });
 const appReducer = combineReducers({ UserAuth, TabVisibility, RideInfo, RideList, GPSState, PageState, FriendList, GarageInfo, PageOverTab, FriendGroupList, PassengerList, CommunitySearchList, NotificationList, FriendRequest,ChatList });

 export default rootReducer;