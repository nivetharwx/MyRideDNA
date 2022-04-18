import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View,Text, FlatList, Animated, TouchableOpacity, Easing, ImageBackground, Alert } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, CUSTOM_FONTS, GET_PICTURE_BY_ID } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton } from '../../../components/buttons';
import { getGarageInfo, handleServiceErrors } from '../../../api';
import { replaceGarageInfoAction, apiLoaderActions, getCurrentBikeAction, resetErrorHandlingAction } from '../../../actions';
import { DefaultText } from '../../../components/labels';
import  {CountComponent}  from '../../../components/count';

class MyGarageTab extends Component {
    spacelistRef = null;
    constructor(props) {
        super(props);
        this.state = {
            spinValue: new Animated.Value(0),
            bikeList: null
        };
    }

    componentDidMount() {
        if (this.props.isEditable) {
            if (this.props.garage.garageId === null) {
                this.props.getGarageInfo(this.props.user.userId);
            }
        } else {
            this.props.getGarageInfo(this.props.friend.userId, (garage) => {
                const activeIndex = garage.spaceList.findIndex(bike => bike.isDefault);
                if (activeIndex === -1 || activeIndex === 0) {
                    this.setState({ bikeList: garage.spaceList });
                } else {
                    this.setState({
                        bikeList: [
                            garage.spaceList[activeIndex],
                            ...garage.spaceList.slice(0, activeIndex),
                            ...garage.spaceList.slice(activeIndex + 1),
                        ]
                    });
                }
            }, () => { });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.isEditable === false) return;
        if (this.props.garage.spaceList.length > 0) {
            if (this.props.garage.activeBikeIndex !== prevProps.garage.activeBikeIndex) {
                this.spacelistRef.scrollToIndex({ index: 0, viewPosition: 0 });
            }
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            this.retryApiFunc();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                this.retryApiFunc();
                                this.props.resetErrorHandling(false)
                            }
                        },
                        { text: 'Cancel', onPress: () => { this.props.resetErrorHandling(false) }, style: 'cancel' },
                    ],
                    { cancelable: false }
                )
            }
        }
    }

    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                if (this.props.isEditable) {
                    this.props.getGarageInfo(this.props.user.userId);
                } else {
                    this.props.getGarageInfo(this.props.friend.userId, (garage) => {
                        const activeIndex = garage.spaceList.findIndex(bike => bike.isDefault);
                        if (activeIndex === -1 || activeIndex === 0) {
                            this.setState({ bikeList: garage.spaceList });
                        } else {
                            this.setState({
                                bikeList: [
                                    garage.spaceList[activeIndex],
                                    ...garage.spaceList.slice(0, activeIndex),
                                    ...garage.spaceList.slice(activeIndex + 1),
                                ]
                            });
                        }
                    }, () => { });
                }
            }
        });
    }

    openBikeForm = (bike) => {
        if (bike) {
            Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: this.props.garage.spaceList.findIndex(item => item.spaceId === bike.spaceId) });
            this.onCancelOptionsModal();
        } else {
            Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: -1 });
        }
    }

    openBikeDetailsPage = (bike) => {
        this.props.getCurrentBike(bike.spaceId);
        if (this.props.isEditable === true) {
            Actions.push(PageKeys.BIKE_DETAILS, { currentBikeId: bike.spaceId, isEditable: true });
        } else {
            Actions.push(PageKeys.BIKE_DETAILS, { currentBikeId: bike.spaceId, isEditable: false, bike, friend: this.props.friend });
        }
    }

    renderBike = ({ item, index }) => {
        return <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 12 }} onPress={() => this.openBikeDetailsPage(item)}>
            <View style={[styles.imgContainer, { borderBottomColor: item.isDefault ? APP_COMMON_STYLES.infoColor : APP_COMMON_STYLES.headerColor }]}>
                <ImageBackground style={{ flex: 1, width: null, height: null }} source={item.picture ? { uri: `${GET_PICTURE_BY_ID}${item.picture.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` } : require('../../../assets/img/bike_placeholder.png')}>
                    {
                        item.isDefault
                            ? <View style={styles.contentOvrImg}>
                                <View style={styles.activeIndicator} />
                                <View style={styles.txtContainer}>
                                    <DefaultText numberOfLines={1} style={styles.cardTitle}>{item.name}</DefaultText>
                                    <DefaultText numberOfLines={1} style={[styles.cardSubtitle, { color: APP_COMMON_STYLES.infoColor }]}>{`${item.make || ''}${item.model ? ' - ' + item.model : ''}`}</DefaultText>
                                </View>
                            </View>
                            : <View style={styles.contentOvrImg}>
                                <View style={[styles.txtContainer, { marginLeft: styles.txtContainer.marginLeft + styles.activeIndicator.width }]}>
                                    <DefaultText numberOfLines={1} style={styles.cardTitle}>{item.name}</DefaultText>
                                    <DefaultText numberOfLines={1} style={[styles.cardSubtitle, { color: '#D9D9D9' }]}>{`${item.make || ''}${item.model ? ' - ' + item.model : ''}`}</DefaultText>
                                </View>
                            </View>
                    }
                </ImageBackground>
            </View>
        </TouchableOpacity>
    }

    render() {
        const { garage, user } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={styles.fill}>
                {
                    this.props.isEditable
                        ? <View style={styles.header}>
                            <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }}
                                style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                                {
                                    this.props.notificationCount>0?
                                    <CountComponent notificationCount={this.props.notificationCount} left={43} />:null
                                }
                               
                            <View style={styles.headerTitleContainer}>
                                <DefaultText numberOfLines={1} style={styles.heading}>
                                    {user.name}
                                </DefaultText>
                                {
                                    user.nickname ?
                                        <DefaultText numberOfLines={1} style={styles.subheading}>
                                            {user.nickname.toUpperCase()}
                                        </DefaultText>
                                        : null
                                }
                            </View>
                            <IconButton iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 19, color: '#fff' } }}
                                style={styles.rightIconPropsStyle} onPress={() => this.openBikeForm()} />
                        </View>
                        : null
                }
                <View style={[styles.fill, styles.pageContent]}>
                    <FlatList
                        contentContainerStyle={{ paddingBottom: APP_COMMON_STYLES.tabContainer.height }}
                        data={this.props.isEditable ? garage.spaceList : this.state.bikeList}
                        keyExtractor={(item, index) => item.spaceId + ''}
                        showsVerticalScrollIndicator={false}
                        extraData={this.props.isEditable ? { activeBikeIndex: garage.activeBikeIndex } : null}
                        ref={elRef => this.spacelistRef = elRef}
                        renderItem={this.renderBike}
                    />
                    {
                        this.props.hasNetwork === false && (this.props.isEditable ? ((garage.spaceList && garage.spaceList.length === 0) || !garage.spaceList) : ((this.state.bikeList && this.state.bikeList.length === 0) || !this.state.bikeList)) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                        </View>
                    }
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState;
    const notificationCount=state.NotificationList.notificationList.totalUnseen
    if (props.isEditable) {
        const garage = { garageId, garageName, spaceList } = state.GarageInfo;
        return { user, garage, hasNetwork, lastApi, isRetryApi ,notificationCount};
    } else {
        return { user, hasNetwork, lastApi, isRetryApi,notificationCount };
    };
   
}
const mapDispatchToProps = (dispatch) => {
    return {
        getGarageInfo: (userId, successCallback, errorCallback) => {
            dispatch(apiLoaderActions(true));
            getGarageInfo(userId).then(({ data: garage }) => {
                dispatch(apiLoaderActions(false));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                if (successCallback) {
                    successCallback(garage);
                } else {
                    dispatch(replaceGarageInfoAction(garage));
                }
            }).catch(error => {
                dispatch(apiLoaderActions(false));
                console.log(`getGarage error: `, error);
                handleServiceErrors(error, [userId, successCallback, errorCallback], 'getGarageInfo', true, true);
            });
        },
        getCurrentBike: (bikeId) => dispatch(getCurrentBikeAction(bikeId)),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'garage', isRetryApi: state })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyGarageTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pageContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(4.5),
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginLeft: 17,
    },
    heading: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 0.2
    },
    subheading: {
        color: '#C4C4C4',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 1.08
    },
    rightIconPropsStyle: {
        height: widthPercentageToDP(7),
        width: widthPercentageToDP(7),
        backgroundColor: '#F5891F',
        borderRadius: widthPercentageToDP(3.5),
        marginRight: 17,
        alignSelf: 'center'
    },
    imgContainer: {
        width: widthPercentageToDP(100),
        height: 178,
        borderBottomWidth: 4
    },
    contentOvrImg: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: widthPercentageToDP(100),
        height: 80,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        marginLeft: 0,
        paddingHorizontal: 20,
        borderBottomWidth: 0
    },
    activeIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    txtContainer: {
        flexDirection: 'column',
        borderBottomWidth: 0,
        marginLeft: 20,
        alignItems: 'flex-start'
    },
    cardTitle: {
        color: '#fff',
        fontSize: 19,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    cardSubtitle: {
        fontFamily: CUSTOM_FONTS.roboto,
        letterSpacing: 0.6
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    }
});