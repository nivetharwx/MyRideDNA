import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, StatusBar, ImageBackground, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, WindowDimensions, widthPercentageToDP, THUMBNAIL_TAIL_TAG, RELATIONSHIP, PageKeys } from '../../constants/index';
import { ShifterButton, IconButton } from '../../components/buttons';
import { appNavMenuVisibilityAction, getFriendsInfoAction, resetCurrentFriendAction, updateFriendAction, toggleLoaderAction, screenChangeAction } from '../../actions';
import { Tabs, Tab, ScrollableTab, TabHeading, Accordion, ListItem, Left } from 'native-base';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { Loader } from '../../components/loader';
import styles from './styles';
import { getPicture, getGarageInfo, getFriendsRideList, getRideByRideId } from '../../api';
import { BasicCard } from '../../components/cards';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class FriendsProfile extends Component {
    // DOC: Icon format is for Icon component from NativeBase Library
    FRIENDS_PROFILE_ICONS = [
        { name: 'ios-chatbubbles', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Chat pressed") },
        { name: 'account-remove', type: 'MaterialCommunityIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Unfriend pressed") },
        { name: 'location-on', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Show location pressed") },
        // { name: 'ios-shirt', type: 'Ionicons', style: { color: APP_COMMON_STYLES.infoColor, fontSize: widthPercentageToDP(7) }, onPress: () => console.log("Vest pressed") },
    ];
    tabsRef = null;
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            isLoadingProfPic: false,
            profilePicId: null
        };
    }

    componentDidMount() {
        // setTimeout(() => {
        //     this.tabsRef.props.goToPage(0);
        //     this.setState({ activeTab: 0 });
        // }, 50);

        this.props.getFriendsInfo(this.props.friendIdx, this.props.friendType);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentFriend !== this.props.currentFriend) {
            if (this.props.currentFriend === null) {
                Actions.pop();
                return;
            }
            if (prevProps.currentFriend === null) {
                if (this.props.currentFriend.profilePictureId) {
                    this.setState({ profilePicId: this.props.currentFriend.profilePictureId, isLoadingProfPic: true });
                    this.props.getPicture(this.props.currentFriend.profilePictureId, this.props.currentFriend.userId, this.props.friendType);
                }
                return;
            }
            if (this.state.profilePicId) {
                if (this.state.profilePicId.indexOf(THUMBNAIL_TAIL_TAG) > -1) {
                    setTimeout(() => {
                        this.setState(prevState => ({ profilePicId: prevState.profilePicId.replace(THUMBNAIL_TAIL_TAG, '') }), () => {
                            this.props.getPicture(this.state.profilePicId, this.props.currentFriend.userId, this.props.friendType);
                        });
                    }, 300);
                } else {
                    this.setState({ isLoadingProfPic: false });
                }
            }
        }
    }

    onPressRide(rideId) {
        this.props.changeScreen(PageKeys.MAP);
        this.props.loadRideOnMap(rideId);
    }
    rideKeyExtractor = (item) => item.rideId;
    onPressBackButton = () => {
        setTimeout(() => this.props.resetCurrentFriend(), 100);
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i }, () => {
            if (this.state.activeTab === 1) {
                // GARAGE Tab
                this.props.getGarageInfo(this.props.currentFriend.userId, this.props.friendType);
            }
            else if (this.state.activeTab === 2) {
                this.props.getFirendsRideInfo(this.props.currentFriend.userId, RELATIONSHIP.FRIEND)
            }
        });
    }


    renderAccordionItem = (item) => {
        if (item.title === 'Options') {
            return (
                <View style={styles.rowContent}>
                    {
                        item.content.map(props => <IconButton key={props.name} iconProps={props} onPress={props.onPress} />)
                    }
                </View>
            );
        }
    }

    render() {
        const { user, currentFriend } = this.props;
        const { activeTab, isLoadingProfPic } = this.state;
        currentFriend && console.log("Friend's garage: ", currentFriend.garage);
        return currentFriend === null
            ? <View style={styles.fill} />
            : <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title={<Text style={{
                        fontSize: widthPercentageToDP(5),
                        color: 'white',
                        fontWeight: 'bold',
                        backgroundColor: 'transparent',
                    }}
                        renderToHardwareTextureAndroid collapsable={false}>
                        {currentFriend.name}
                        <Text style={{ color: APP_COMMON_STYLES.infoColor }}>
                            {'  '}{currentFriend.nickname}
                        </Text>
                    </Text>} leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <Tabs onChangeTab={this.onChangeTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} style={{ backgroundColor: '#6C6C6B', height: BOTTOM_TAB_HEIGHT }} underlineStyle={{ height: 0 }} />}>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>PROFILE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <ImageBackground source={require('../../assets/img/profile-bg.png')} style={styles.profileBG}>
                                    <View style={styles.profilePic}>
                                        <ImageBackground source={currentFriend.profilePicture ? { uri: currentFriend.profilePicture } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }}>
                                            {
                                                isLoadingProfPic
                                                    ? <Loader show={isLoadingProfPic} />
                                                    : null
                                            }
                                        </ImageBackground>
                                    </View>
                                </ImageBackground>
                                <ScrollView styles={styles.scrollBottom} contentContainerStyle={styles.scrollBottomContent}>
                                    <Accordion dataArray={[{ title: 'Options', content: this.FRIENDS_PROFILE_ICONS }]}
                                        renderContent={this.renderAccordionItem} headerStyle={styles.accordionHeader} />
                                </ScrollView>
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 1 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 1, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>GARAGE</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                               {currentFriend.garage?<View style={styles.content}>
                                    <FlatList
                                        data={currentFriend.garage.spaceList}
                                        keyExtractor={(item, index) => item.spaceId + ''}
                                        showsVerticalScrollIndicator={false}
                                        extraData={this.state}
                                        renderItem={({ item, index }) => {
                                            return <BasicCard
                                                isActive={false}
                                                // FIXME: Change this based on pictureIdList
                                                media={item.pictureList && item.pictureList[0] ? { uri: item.pictureList[0] } : require('../../assets/img/bike_placeholder.png')}
                                                mainHeading={item.name}
                                                subHeading={`${item.make}-${item.model}, ${item.year}`}
                                                notes={item.notes}
                                                // onLongPress={() => this.showOptionsModal(index)}
                                            >                                             
                                            </BasicCard>
                                        }}
                                    />
                                </View>:null}
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 2 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 1, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>RIDES</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>

                                {
                                    currentFriend.rideList && currentFriend.rideList.length > 0 ?
                                        <FlatList
                                            data={currentFriend.rideList}
                                            renderItem={({ item, index }) => <ListItem style={{ marginLeft: 0, paddingLeft: 10, backgroundColor: index % 2 === 0 ? '#fff' : '#F3F2F2' }}>
                                                <Left style={{ flex: 1 }}>
                                                    <TouchableOpacity style={{ flex: 1 }}
                                                        onPress={() => this.onPressRide(item.rideId)}>
                                                        <Text>{item.name}</Text>
                                                    </TouchableOpacity>
                                                </Left>
                                            </ListItem>}
                                            keyExtractor={this.rideKeyExtractor}
                                        />
                                        : <ImageBackground source={require('../../assets/img/empty-rides-bg.png')} style={{ width: '100%', height: '100%' }} />
                                }
                            </View>
                        </Tab>
                        <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: activeTab === 3 ? '#0083CA' : '#6C6C6B' }]}>
                            <Text style={{ color: '#fff', fontSize: widthPercentageToDP(3) }}>VEST</Text>
                        </TabHeading>}>
                            <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                <Text>VEST</Text>
                            </View>
                        </Tab>
                    </Tabs>

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.showAppNavMenu}
                        containerStyles={{ bottom: IS_ANDROID ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 8 }} size={18} alignLeft={user.handDominance === 'left'} />
                </View>
            </View >
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showMenu } = state.TabVisibility;
    const { currentFriend } = state.FriendList;
    return { user, showMenu, currentFriend };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        getFriendsInfo: (friendIdx, friendType) => dispatch(getFriendsInfoAction({ index: friendIdx, friendType })),
        resetCurrentFriend: () => dispatch(resetCurrentFriendAction()),
        getPicture: (pictureId, friendId, friendType) => getPicture(pictureId, ({ picture }) => {
            dispatch(updateFriendAction({ profilePicture: picture }))
        }, (error) => {
            dispatch(updateFriendAction({}))
        }),
        getGarageInfo: (friendId, friendType) => {
            dispatch(toggleLoaderAction(true));
            getGarageInfo(friendId, (garage) => {
                dispatch(toggleLoaderAction(false));
                dispatch(updateFriendAction({ garage }));
            }, (error) => {
                dispatch(toggleLoaderAction(false));
                console.log(`getGarage error: `, error);
            })
        },
        getFirendsRideInfo: (friendId, relationship) => {
            dispatch(getFriendsRideList(friendId, relationship))
        },
        loadRideOnMap: (rideId) => dispatch(getRideByRideId(rideId)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(FriendsProfile);