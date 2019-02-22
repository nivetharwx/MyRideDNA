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

export default combineReducers({ UserAuth, TabVisibility, RideInfo, RideList, GPSState, PageState, FriendList, GarageInfo, PageOverTab, FriendGroupList });