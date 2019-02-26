import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, SafeAreaView, Platform, StatusBar, Animated, ImageBackground, TouchableNativeFeedback, TouchableWithoutFeedback, Text, View } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { Tabs, Tab, TabHeading, ScrollableTab, Icon as NBIcon } from 'native-base';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID } from '../../constants';
import styles from './styles';
import AllFriendsTab from './all-friends';
import GroupsTab from './groups';
import { appNavMenuVisibilityAction } from '../../actions';
import { ShifterButton } from '../../components/buttons';
import { IconLabelPair } from '../../components/labels';

class Friends extends Component {
    tabsRef = null;
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
            groupTabPressed: false
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.tabsRef.props.goToPage(1)
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

    onPressGroupTab = () => {
        this.setState({ activeTab: 2, groupTabPressed: true }, () => this.tabsRef.props.goToPage(2));
        setTimeout(() => this.setState(prevState => ({ groupTabPressed: false })), 200);
    }

    render() {
        const { headerSearchMode, searchQuery, activeTab } = this.state;

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

                    <Tabs locked={true} onChangeTab={this.onChangeTab} style={{ flex: 1, paddingBottom: IS_ANDROID ? 0 : 20, backgroundColor: '#fff', marginTop: APP_COMMON_STYLES.headerHeight }} renderTabBar={() => <ScrollableTab ref={elRef => this.tabsRef = elRef} activeTab={activeTab} backgroundColor='#E3EED3' underlineStyle={{ height: 0 }} />}>
                        <Tab
                            heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 0 ? '#81BB41' : '#E3EED3' }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`Online\nFriends`} textStyle={{ color: activeTab === 0 ? '#fff' : '#6B7663' }} iconProps={{ name: 'user', type: 'Feather', style: { color: activeTab === 0 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <View style={{ flex: 1 }}>

                            </View>
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 1 ? '#81BB41' : '#E3EED3', borderColor: '#fff', borderRightWidth: 2, borderLeftWidth: 2 }}>
                                <IconLabelPair containerStyle={styles.tabContentCont} text={`All\nFriends`} textStyle={{ color: activeTab === 1 ? '#fff' : '#6B7663' }} iconProps={{ name: 'people-outline', type: 'MaterialIcons', style: { color: activeTab === 1 ? '#fff' : '#6B7663' } }} />
                            </TabHeading>}>
                            <AllFriendsTab refreshContent={activeTab === 1} searchQuery={searchQuery} />
                        </Tab>
                        <Tab
                            heading={<TabHeading style={{ flex: 1, backgroundColor: activeTab === 2 ? '#81BB41' : '#E3EED3', borderColor: '#fff' }}>
                                <TouchableWithoutFeedback onPress={this.onPressGroupTab}>
                                    <IconLabelPair containerStyle={styles.tabContentCont} text={`Groups`} textStyle={{ color: activeTab === 2 ? '#fff' : '#6B7663' }} iconProps={{ name: 'group', type: 'FontAwesome', style: { color: activeTab === 2 ? '#fff' : '#6B7663' } }} />
                                </TouchableWithoutFeedback>
                            </TabHeading>}>
                            <GroupsTab goToGroupList={this.state.groupTabPressed} refreshContent={activeTab === 2} />
                        </Tab>
                    </Tabs>

                    <View style={[StyleSheet.absoluteFill, { zIndex: 900 }]} pointerEvents={this.state.selectedPersonImg ? 'auto' : 'none'}>
                        <View style={{ flex: 2, zIndex: 1000 }} ref={elRef => this.viewImage = elRef}>
                            <ImageBackground style={{ flex: 1 }} source={this.state.selectedPersonImg ? require('../../assets/img/profile-bg.png') : null}>
                                <Animated.Image
                                    source={this.state.selectedPersonImg ? require('../../assets/img/friend-profile-pic.png') : null}
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

                    {/* Shifter: - Brings the app navigation menu */}
                    <ShifterButton onPress={this.toggleAppNavigation} alignLeft={this.props.user.handDominance === 'left'} />
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