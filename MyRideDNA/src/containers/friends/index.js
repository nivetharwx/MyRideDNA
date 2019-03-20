import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, StatusBar, Animated, ImageBackground, TouchableWithoutFeedback, Text, View } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab, TabHeading, ScrollableTab } from 'native-base';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupListTab from './group-list';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';

const BOTTOM_TAB_HEIGHT = heightPercentageToDP(7);
class Friends extends Component {
    tabsRef = null;
    friendsTabsRef = null;
    viewImage = null;
    oldPosition = {};
    position = new Animated.ValueXY();
    dimensions = new Animated.ValueXY();
    animation = new Animated.Value(0);
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
            activeTab: -1,
            groupTabPressed: false,
            friendsActiveTab: 0
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.tabsRef.props.goToPage(0)
        }, 50);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.personInfo !== this.props.personInfo) {
            if (this.props.personInfo === null) {
                console.log("updated to null: ", this.props);
                this.closeProfile();
            } else {
                console.log("update with user: ", this.props);
                this.openProfile();
            }
        }
    }

    toggleAppNavigation = () => this.props.showAppNavMenu();

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i, headerSearchMode: false });
    }

    onChangeFriendsTab = ({ from, i }) => {
        this.setState({ friendsActiveTab: i });
    }

    openProfile = () => {
        const { pageX, pageY, width, height } = this.props.oldPosition;
        this.position.setValue({ x: pageX, y: pageY });
        this.dimensions.setValue({ x: width, y: height });

        this.setState({ selectedPersonImg: this.props.personInfo.image }, () => {
            this.viewImage.measure((dx, dy, dWidth, dHeight, dPageX, dPageY) => {
                Animated.parallel([
                    Animated.timing(this.position.x, {
                        toValue: (dWidth / 2) - (widthPercentageToDP(100) * 65 / 200),
                        duration: 300
                    }),
                    Animated.timing(this.position.y, {
                        toValue: heightPercentageToDP(100) * 10 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.x, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.dimensions.y, {
                        toValue: widthPercentageToDP(100) * 65 / 100,
                        duration: 300
                    }),
                    Animated.timing(this.animation, {
                        toValue: 1,
                        duration: 300
                    }),
                ]).start(() => StatusBar.setBarStyle('light-content'));
            });
        });
    }

    closeProfile = () => {
        Animated.parallel([
            Animated.timing(this.position.x, {
                toValue: this.props.oldPosition.pageX,
                duration: 300
            }),
            Animated.timing(this.position.y, {
                toValue: this.props.oldPosition.pageX,
                duration: 300
            }),
            Animated.timing(this.dimensions.x, {
                toValue: this.props.oldPosition.width,
                duration: 300
            }),
            Animated.timing(this.dimensions.y, {
                toValue: this.props.oldPosition.height,
                duration: 300
            }),
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 300
            }),
        ]).start(() => {
            this.setState({ selectedPersonImg: null });
        });
    }

    render() {
        const { headerSearchMode, searchQuery, activeTab, friendsActiveTab } = this.state;

        const activeImageStyle = {
            width: this.dimensions.x,
            height: this.dimensions.y,
            left: this.position.x,
            top: this.position.y
        };
        const animatedContentY = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-150, 0]
        });
        const animatedContentOpacity = this.animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 1]
        });
        const animatedContentStyle = {
            opacity: animatedContentOpacity,
            transform: [{
                translateY: animatedContentY
            }]
        };
        const animatedCrossOpacity = {
            opacity: this.animation
        };

        return (
            <View style={styles.fill}>
                {
                    this.state.selectedPersonImg
                        ? null
                        : <View style={APP_COMMON_STYLES.statusBar}>
                            <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                        </View>
                }
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Friends' rightIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                        searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false, searchQuery: '' })}
                        onClearSearchValue={() => this.setState({ searchQuery: '' })} />

                    <Tabs locked={true} onChangeTab={this.onChangeTab} style={{ flex: 1, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(50), backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 1 }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`Friends`} textStyle={{ color: activeTab === 0 ? '#fff' : '#6B7663' }} iconProps={{ name: 'people-outline', type: 'MaterialIcons', style: { color: activeTab === 0 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <AllFriendsTab refreshContent={activeTab === 0} searchQuery={searchQuery} />
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ width: widthPercentageToDP(50), backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderColor: '#fff', borderLeftWidth: 1 }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`Groups`} textStyle={{ color: activeTab === 1 ? '#fff' : '#6B7663' }} iconProps={{ name: 'group', type: 'FontAwesome', style: { color: activeTab === 1 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <GroupListTab refreshContent={activeTab === 1} />
                        </Tab>
                    </Tabs>
                    {
                        this.state.selectedPersonImg
                            ? <Tabs locked={true} onChangeTab={this.onChangeFriendsTab} style={styles.bottomTabContainer} tabBarPosition='bottom' renderTabBar={() => <ScrollableTab ref={elRef => this.friendsTabsRef = elRef} style={{ backgroundColor: '#6C6C6B' }} underlineStyle={{ height: 0 }} />}>
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: friendsActiveTab === 0 ? '#0083CA' : '#6C6C6B' }]}>
                                    <Text style={{ color: '#fff' }}>PROFILE</Text>
                                </TabHeading>}>
                                    <View style={styles.fill}>
                                        <View style={{ flex: 2, zIndex: 1000 }} ref={elRef => this.viewImage = elRef}>
                                            <ImageBackground style={{ flex: 1 }} source={require('../../assets/img/profile-bg.png')}>
                                                <Animated.Image
                                                    source={require('../../assets/img/friend-profile-pic.png')}
                                                    style={[{ resizeMode: 'cover', top: 0, left: 0, height: null, width: null, borderRadius: 15 }, activeImageStyle]}
                                                ></Animated.Image>
                                            </ImageBackground>
                                            <TouchableWithoutFeedback onPress={this.closeProfile}>
                                                <Animated.View style={[{ position: 'absolute', top: 30, right: 30 }, animatedCrossOpacity]}>
                                                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>X</Text>
                                                </Animated.View>
                                            </TouchableWithoutFeedback>
                                        </View>
                                        <Animated.View style={[{ flex: 1, zIndex: 900, backgroundColor: '#fff', padding: 20, paddingTop: 50, paddingBotton: 10 }, animatedContentStyle]}>
                                            <Text>TESING TEXT CONTENT</Text>
                                        </Animated.View>
                                    </View>
                                </Tab>
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: friendsActiveTab === 1 ? '#0083CA' : '#6C6C6B', borderLeftWidth: 2, borderLeftColor: '#fff', borderRightWidth: 2, borderRightColor: '#fff' }]}>
                                    <Text style={{ color: '#fff' }}>GARAGE</Text>
                                </TabHeading>}>
                                    <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                        <Text>GARAGE</Text>
                                    </View>
                                </Tab>
                                <Tab heading={<TabHeading style={[styles.bottomTab, { height: BOTTOM_TAB_HEIGHT, backgroundColor: friendsActiveTab === 2 ? '#0083CA' : '#6C6C6B' }]}>
                                    <Text style={{ color: '#fff' }}>RIDES</Text>
                                </TabHeading>}>
                                    <View style={{ backgroundColor: '#fff', flex: 1 }}>
                                        <Text>RIDES</Text>
                                    </View>
                                </Tab>
                            </Tabs>
                            : null
                    }
                    {/* <View style={[StyleSheet.absoluteFill, { zIndex: 900 }]} pointerEvents={this.state.selectedPersonImg ? 'auto' : 'none'}>

                    </View> */}

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation}
                        containerStyles={{ bottom: this.state.selectedPersonImg ? IS_ANDROID ? BOTTOM_TAB_HEIGHT : BOTTOM_TAB_HEIGHT - 8 : 0 }}
                        alignLeft={this.props.user.handDominance === 'left'} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { personInfo, oldPosition } = state.PageOverTab;
    return { user, personInfo, oldPosition };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Friends);