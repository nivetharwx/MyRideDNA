import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, FlatList, Animated, TouchableOpacity, Easing, ImageBackground } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, PORTRAIT_TAIL_TAG, CUSTOM_FONTS } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton, LinkButton } from '../../../components/buttons';
import { Item } from 'native-base';
import { getPicture, getGarageInfo, setBikeAsActive, deleteBike, updateGarageName } from '../../../api';
import { BaseModal } from '../../../components/modal';
import { replaceGarageInfoAction, updateBikePictureAction, apiLoaderActions, setCurrentBikeIdAction } from '../../../actions';
import { DefaultText } from '../../../components/labels';

class MyGarageTab extends Component {
    spacelistRef = null;
    constructor(props) {
        super(props);
        this.state = {
            isVisibleOptionsModal: false,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() {
        if (this.props.garage.garageId === null) {
            this.props.getGarageInfo(this.props.user.userId);
        } else {
            this.props.garage.spaceList.forEach(bike => {
                // if (bike.pictureIdList.length > 0) {
                //     this.props.getBikePicture(bike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), bike.spaceId);
                // }
                bike.picture && this.props.getBikePicture(bike.picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), bike.spaceId);
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.garage.spaceList.length > 0) {
            if (prevProps.garage.garageId === null) {
                this.props.garage.spaceList.forEach(bike => {
                    // if (bike.pictureIdList.length > 0) {
                    //     this.props.getBikePicture(bike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), bike.spaceId);
                    // }
                    bike.picture && this.props.getBikePicture(bike.picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), bike.spaceId);
                });
                return;
            }
            if (this.props.garage.activeBikeIndex !== prevProps.garage.activeBikeIndex) {
                this.spacelistRef.scrollToIndex({ index: 0, viewPosition: 0 });
            } else if (this.props.garage.spaceList.length > prevProps.garage.spaceList.length) {
                this.spacelistRef.scrollToEnd();
                const newBike = this.props.garage.spaceList[this.props.garage.spaceList.length - 1];
                // if (newBike.pictureIdList.length > 0) {
                //     this.props.getBikePicture(newBike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), newBike.spaceId);
                // }
                newBike.picture && this.props.getBikePicture(newBike.picture.id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), newBike.spaceId);
            } else if (this.props.garage.spaceList.length === prevProps.garage.spaceList.length) {
                // prevProps.garage.spaceList.forEach(item => {
                //     const index = this.props.garage.spaceList.findIndex(val => val.spaceId === item.spaceId && val.pictureIdList !== item.pictureIdList);
                //     if (index > -1 && this.props.garage.spaceList[index].pictureIdList.length > 0) {
                //         this.props.getBikePicture(this.props.garage.spaceList[index].pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), this.props.garage.spaceList[index].spaceId);
                //     }
                // })
            }
            if (!prevProps.currentBikeId && this.props.currentBikeId) {
                Actions.push(PageKeys.BIKE_DETAILS, {});
            }
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
                this.props.getGarageInfo(this.props.user.userId);
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
        this.props.setCurrentBikeId(bike.spaceId);
    }

    renderBike = ({ item, index }) => {
        return <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 12 }} onPress={() => this.openBikeDetailsPage(item)}>
            <View style={[styles.imgContainer, { borderBottomColor: item.isDefault ? APP_COMMON_STYLES.infoColor : APP_COMMON_STYLES.headerColor }]}>
                <ImageBackground style={{ flex: 1, width: null, height: null }} source={item.picture && item.picture.data ? { uri: item.picture.data } : require('../../../assets/img/bike_placeholder.png')}>
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
        const { isVisibleOptionsModal } = this.state;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <View style={styles.fill}>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }}
                        style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
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
                <View style={[styles.fill, styles.pageContent]}>
                    <FlatList
                        contentContainerStyle={{ paddingBottom: APP_COMMON_STYLES.tabContainer.height }}
                        data={garage.spaceList}
                        keyExtractor={(item, index) => item.spaceId + ''}
                        showsVerticalScrollIndicator={false}
                        extraData={{ activeBikeIndex: garage.activeBikeIndex }}
                        ref={elRef => this.spacelistRef = elRef}
                        renderItem={this.renderBike}
                    />
                    {
                        this.props.hasNetwork === false && garage.spaceList.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                            </Animated.View>
                            <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
                            <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet</DefaultText>
                        </View>
                    }
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const garage = { garageId, garageName, spaceList } = state.GarageInfo;
    const { currentBikeId } = state.GarageInfo;
    const { hasNetwork } = state.PageState;
    return { user, garage, currentBikeId, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getGarageInfo: (userId) => {
            dispatch(apiLoaderActions(true));
            getGarageInfo(userId, (garage) => {
                dispatch(apiLoaderActions(false));
                dispatch(replaceGarageInfoAction(garage));
            }, (error) => {
                dispatch(apiLoaderActions(false));
                console.log(`getGarage error: `, error);
            })
        },
        updateGarageName: (garageName, garageId) => dispatch(updateGarageName(garageName, garageId)),
        getBikePicture: (pictureId, spaceId) => getPicture(pictureId, (response) => {
            dispatch(updateBikePictureAction({ spaceId, picture: response.picture }))
        }, (error) => console.log("getPicture error: ", error)),
        setCurrentBikeId: (bikeId) => dispatch(setCurrentBikeIdAction(bikeId)),
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
    addBikeItem: {
        width: '100%',
        height: heightPercentageToDP(30),
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
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