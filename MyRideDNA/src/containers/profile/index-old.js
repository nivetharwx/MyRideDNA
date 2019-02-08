import React, { Component } from 'react';
import {
    View, ImageBackground, Image, Text, ScrollView, StyleSheet,
    Animated, TouchableOpacity, TouchableWithoutFeedback, TouchableHighlight,
    InteractionManager, SafeAreaView, Platform, BackHandler
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';

import { List, ListItem, Icon as NBIcon, Body, Left, Right, ActionSheet } from 'native-base';
import { User } from '../../model/user'; // DOC: User model class
import { PageKeys, TAB_CONTAINER_HEIGHT } from '../../constants/index';
import { Tabs } from '../../components/tabs';
import { ShifterButton } from '../../components/buttons';
import { appNavMenuVisibilityAction } from '../../actions';

const HEADER_MAX_HEIGHT = 400;
const HEADER_MIN_HEIGHT = 80;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const BUTTONS = ['Gallery', 'Camera', 'Cancel'];
const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80
};

class Profile extends Component {
    hScrollView = null;
    LINK_LIST = [
        {
            id: PageKeys.EDIT_PROFILE,
            title: 'Edit Profile',
            icon: <NBIcon name='edit' type='MaterialIcons' style={{ color: 'rgba(0,118,181,0.7)' }} />
        },
        {
            id: PageKeys.VISIT_GARAGE,
            title: 'Visit Garage',
            icon: <NBIcon name='md-speedometer' type='Ionicons' style={{ color: 'rgba(0,118,181,0.7)' }} />
        },
        {
            id: PageKeys.PASSENGERS,
            title: 'Passengers',
            icon: <NBIcon name='md-contacts' type='Ionicons' style={{ color: 'rgba(0,118,181,0.7)' }} />
        }
    ];
    constructor(props) {
        super(props);
        this.state = {
            scrollY: new Animated.Value(0),
            activeSpace: 1,
            selectedSpace: -1,
            media: [],
            showLoadMore: null,
            profilePicString: null,
        };
    }

    showAppNavMenu = () => this.props.showAppNavMenu();

    componentWillUnmount() {
        // BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
        console.log("Profile unmounted");
    }

    onSpaceLongPress = (newSpace) => {
        const { selectedSpace } = this.state;
        this.setState({ selectedSpace: selectedSpace === newSpace ? -1 : newSpace });
    }

    markSpaceAsActive = () => {
        setTimeout(() => this.setState({ activeSpace: this.state.selectedSpace, selectedSpace: -1 }), 500);
    }

    onPressCamerIcon = () => {
        ActionSheet.show(
            {
                options: BUTTONS,
                cancelButtonIndex: 2,
                title: 'Choose an option'
            },
            async (buttonIndex) => {
                if (BUTTONS[buttonIndex] === 'Gallery') {
                    const imageObj = await ImagePicker.openPicker({
                        width: 300,
                        height: 300,
                        cropping: false,
                        includeBase64: true,
                    });
                    this.setState({ profilePicString: `data:${imageObj.mime};base64,${imageObj.data}` });
                } else if (BUTTONS[buttonIndex] === 'Camera') {
                    const imageObj = await ImagePicker.openCamera({
                        width: 300,
                        height: 300,
                        includeBase64: false,
                        cropping: false, // DOC: Setting this to true (in openCamera) is not working as expected (19-12-2018).
                    });
                    this.setState({ profilePicString: `data:${imageObj.mime};base64,${imageObj.data}` });
                } else {
                    console.log('Cancelled by user');
                }
            }
        );
    }

    openPage(pageName) {
        let callback, options;
        if (pageName === PageKeys.EDIT_PROFILE) {
            callback = (updatedInfo) => {
                return new Promise((resolve, reject) => {
                    //DOC: Do assync task and call resolve/reject to dismiss loader
                    this.setState({ user: { ...this.state.user, ...updatedInfo } }, () => {
                        resolve();
                    });
                });
            };
            options = { user: this.state.user, callback: callback };
        } else if (pageName === PageKeys.PASSENGERS) {
            options = { user: this.state.user };
        }

        Actions.push(pageName, options);
    }

    renderScrollViewContent() {
        return (
            <View style={styles.scrollViewContent}>
                <View style={{ height: 180, justifyContent: 'space-around' }}>
                    <View style={{
                        flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center',
                        alignItems: 'center', paddingHorizontal: 10, marginTop: 10
                    }}>
                        {
                            this.state.selectedSpace > -1 ?
                                <TouchableHighlight underlayColor='#7BB7D7' style={{ borderRadius: 20, borderColor: '#0083CA', borderWidth: 1, padding: 5 }} onPress={this.markSpaceAsActive}><Text style={{ color: '#0083CA', fontSize: 15 }}>Mark as active</Text></TouchableHighlight> :
                                <TouchableWithoutFeedback><Text style={{ marginTop: 0 }}>{''}</Text></TouchableWithoutFeedback>
                        }
                    </View>
                    {/* Horizontal scroll view start */}
                    <ScrollView style={{ borderBottomColor: '#ACACAC', borderBottomWidth: 1, paddingBottom: 10, }}
                        showsHorizontalScrollIndicator={false}
                        horizontal={true}
                        contentContainerStyle={styles.horizontalScroll}
                        ref={view => this.hScrollView = view}>
                        {/* <Thumbnail horizontal={false} height={80} width={120} selected={this.state.selectedSpace === 0} active={this.state.activeSpace === 0} imagePath={require('../../assets/img/harley.jpg')} title='Harley Space' onLongPress={this.state.activeSpace != 0 ? () => this.onSpaceLongPress(0) : null} />
                        <Thumbnail horizontal={false} height={80} width={120} selected={this.state.selectedSpace === 1} active={this.state.activeSpace === 1} imagePath={require('../../assets/img/harley.jpg')} title='Harley Space' onLongPress={this.state.activeSpace != 1 ? () => this.onSpaceLongPress(1) : null} />
                        <Thumbnail horizontal={false} height={80} width={120} selected={this.state.selectedSpace === 2} active={this.state.activeSpace === 2} imagePath={require('../../assets/img/harley.jpg')} title='Harley Space' onLongPress={this.state.activeSpace != 2 ? () => this.onSpaceLongPress(2) : null} />
                        <Thumbnail horizontal={false} height={80} width={120} selected={this.state.selectedSpace === 3} active={this.state.activeSpace === 3} imagePath={require('../../assets/img/harley.jpg')} title='Harley Space' onLongPress={this.state.activeSpace != 3 ? () => this.onSpaceLongPress(3) : null} />
                        <Thumbnail horizontal={false} height={80} width={120} selected={this.state.selectedSpace === 4} active={this.state.activeSpace === 4} imagePath={require('../../assets/img/harley.jpg')} title='Harley Space' onLongPress={this.state.activeSpace != 4 ? () => this.onSpaceLongPress(4) : null} />
                        <Thumbnail horizontal={false} height={80} width={120} selected={this.state.selectedSpace === 5} active={this.state.activeSpace === 5} imagePath={require('../../assets/img/harley.jpg')} title='Harley Space' onLongPress={this.state.activeSpace != 5 ? () => this.onSpaceLongPress(5) : null} /> */}
                    </ScrollView>
                    {/* Horizontal scroll view end */}
                </View>

                <List containerStyle={{ borderTopWidth: 0 }}>
                    {
                        this.LINK_LIST.map((item, index) => (
                            <ListItem icon
                                key={item.id}
                                style={[styles.listItem, { backgroundColor: index & 1 ? 'rgba(0,118,181,0.1)' : '#fff' }]}
                                onPress={() => { Actions.push(item.id); /*this.openPage(item.id)*/ }}
                            >
                                <Left>
                                    {item.icon}
                                </Left>
                                <Body style={styles.noBorderTB}>
                                    <Text>{item.title}</Text>
                                </Body>
                                <Right style={[styles.noBorderTB, { height: '100%' }]}>
                                    <NBIcon name="chevron-right" type='FontAwesome' style={{ color: 'rgba(0,118,181,0.5)' }} />
                                </Right>
                            </ListItem>
                        ))
                    }
                </List>
            </View>
        );
    }

    render() {
        const { user } = this.props;
        const headerHeight = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
            extrapolate: 'clamp',
        });
        const imageOpacity = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
            outputRange: [1, 1, 0],
            extrapolate: 'clamp',
        });
        const headerTextTranslateY = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [HEADER_MAX_HEIGHT - 55 + (Platform.OS === 'ios' ? 20 : 0), 0],
            extrapolate: 'clamp',
        });
        const headerTextTranslateX = this.state.scrollY.interpolate({
            inputRange: [0, (HEADER_SCROLL_DISTANCE / 2) + (HEADER_SCROLL_DISTANCE / 4), HEADER_SCROLL_DISTANCE],
            outputRange: [-50, -50, 0],
            extrapolate: 'clamp',
        });
        const imageTranslate = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -100],
            extrapolate: 'clamp',
        });

        return (
            <SafeAreaView style={styles.fill}>
                <ScrollView
                    style={[styles.fill, { backgroundColor: '#fff' }]}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }]
                    )}
                >
                    {this.renderScrollViewContent()}
                </ScrollView>
                <Animated.View style={[styles.header, { height: headerHeight }]}>
                    <Animated.View
                        style={[
                            styles.backgroundImageAnimView,
                            { opacity: imageOpacity, transform: [{ translateY: imageTranslate }] },
                        ]}
                    >
                        <ImageBackground source={require('../../assets/img/profile-bg.png')} style={styles.backgroundImage}>
                            <View style={styles.profilePic}>
                                <Image source={this.state.profilePicString ? { uri: this.state.profilePicString } : require('../../assets/img/profile-pic.png')} style={{ height: null, width: null, flex: 1, borderRadius: 5 }} />
                            </View>
                            <View style={{ position: 'absolute', top: 300, left: 310 }}>
                                <TouchableOpacity style={[styles.iconPadding, { height: 60, width: 60, borderRadius: 30 }]}
                                    onPress={this.onPressCamerIcon}>
                                    <NBIcon name='photo-camera' type='MaterialIcons' color='#000' />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </Animated.View>
                    <View style={styles.bar}>
                        <View style={{ marginHorizontal: 20 }}>
                            <TouchableOpacity style={styles.iconPadding} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)}>
                                <NBIcon name='bell' type='FontAwesome' color='#000' style={{ fontSize: 18 }} />
                            </TouchableOpacity>
                        </View>
                        <Animated.View style={{ flex: 3, translateY: headerTextTranslateY, translateX: headerTextTranslateX }}>
                            <Text style={styles.title}
                                renderToHardwareTextureAndroid collapsable={false}>
                                {user.name}
                                <Text style={{ color: '#EB861E', fontWeight: 'bold' }}>
                                    {'  '}{user.nickname}
                                </Text>
                            </Text>
                        </Animated.View>
                        <View style={{ marginHorizontal: 20 }}>
                            <TouchableOpacity style={styles.iconPadding}>
                                <NBIcon name='sign-out' type='FontAwesome' color='#000' style={{ fontSize: 18 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
                {/* <Tabs activeTab={PageKeys.PROFILE} /> */}

                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { showMenu } = state.TabVisibility;
    return { user, showMenu };
};
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Profile);


const styles = StyleSheet.create({
    fill: {
        flex: 1,
        // paddingBottom: TAB_CONTAINER_HEIGHT,
    },
    row: {
        height: 40,
        margin: 16,
        backgroundColor: '#D3D3D3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0076B5',
        overflow: 'hidden',
    },
    bar: {
        height: HEADER_MIN_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 20 : 0
    },
    title: {
        fontSize: 20,
        color: 'white',
        alignItems: 'flex-start',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    scrollViewContent: {
        marginTop: HEADER_MAX_HEIGHT,
    },
    backgroundImageAnimView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: null,
        height: HEADER_MAX_HEIGHT,
    },
    backgroundImage: {
        height: HEADER_MAX_HEIGHT,
        resizeMode: 'cover',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconPadding: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 15,
        height: 30,
        width: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    profilePic: {
        height: 300,
        width: 300,
        maxHeight: 300,
        maxWidth: 300,
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 30 : 20
    },
    listItem: {
        height: 80,
        marginLeft: 0,
        paddingLeft: 10
    },
    horizontalScroll: {
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        paddingStart: 5,
        paddingEnd: 5,
    },
    noBorderTB: {
        borderBottomWidth: 0,
        borderTopWidth: 0,
    }
});