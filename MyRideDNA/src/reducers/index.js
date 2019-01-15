import { combineReducers } from 'redux';
import UserAuth from './UserAuth';
import TabVisibility from './TabVisibility';
import RideInfo from './RideInfo';
import GPSState from './GPSState';
import PageState from './PageState';

export default combineReducers({ UserAuth, TabVisibility, RideInfo, GPSState, PageState });