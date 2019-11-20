import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, FlatList, Animated, TouchableOpacity, Alert, Easing, ImageBackground } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { BasicCard } from '../../../components/cards';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, IS_ANDROID, PORTRAIT_TAIL_TAG } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicButton, IconButton, LinkButton } from '../../../components/buttons';
import { Icon as NBIcon, Item } from 'native-base';
import { getPicture, getGarageInfo, setBikeAsActive, deleteBike, updateGarageName } from '../../../api';
import { BaseModal } from '../../../components/modal';
import { replaceGarageInfoAction, toggleLoaderAction, updateBikePictureListAction, apiLoaderActions } from '../../../actions';

class MyGarageTab extends Component {
    spacelistRef = null;
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
            isVisibleOptionsModal: false,
            selectedBike: null,
            spinValue: new Animated.Value(0),
        };
    }

    componentDidMount() {
        if (this.props.garage.garageId === null) {
            this.props.getGarageInfo(this.props.user.userId);
        } else {
            this.props.garage.spaceList.forEach(bike => {
                if (bike.pictureIdList.length > 0) {
                    this.props.getBikePicture(bike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), bike.spaceId);
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.garage.spaceList.length > 0) {
            if (prevProps.garage.garageId === null) {
                this.props.garage.spaceList.forEach(bike => {
                    if (bike.pictureIdList.length > 0) {
                        this.props.getBikePicture(bike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), bike.spaceId);
                    }
                });
                return;
            }
            if (this.props.garage.activeBikeIndex !== prevProps.garage.activeBikeIndex) {
                this.spacelistRef.scrollToIndex({ index: 0, viewPosition: 0 });
            } else if (this.props.garage.spaceList.length > prevProps.garage.spaceList.length) {
                this.spacelistRef.scrollToEnd();
                const newBike = this.props.garage.spaceList[this.props.garage.spaceList.length - 1];
                if (newBike.pictureIdList.length > 0) {
                    this.props.getBikePicture(newBike.pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG), newBike.spaceId);
                }
            } else if (this.props.garage.spaceList.length === prevProps.garage.spaceList.length) {
                prevProps.garage.spaceList.forEach(item => {
                    const index = this.props.garage.spaceList.findIndex(val => val.spaceId === item.spaceId && val.pictureIdList !== item.pictureIdList);
                    if (index > -1 && this.props.garage.spaceList[index].pictureIdList.length > 0) {
                        this.props.getBikePicture(this.props.garage.spaceList[index].pictureIdList[0].replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG), this.props.garage.spaceList[index].spaceId);
                    }
                })
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

    onChangeActiveBike = () => {
        const { garage } = this.props;
        const { selectedBike } = this.state;
        this.onCancelOptionsModal();
        const prevActiveBikeIndex = garage.spaceList.findIndex(bike => bike.isDefault);
        const newActiveBikeIndex = garage.spaceList.findIndex(bike => bike.spaceId === selectedBike.spaceId);
        this.props.setBikeAsActive(this.props.user.userId, selectedBike.spaceId, prevActiveBikeIndex, newActiveBikeIndex);
    }

    openBikeForm = (bike = this.state.selectedBike) => {
        if (bike) {
            Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: this.props.garage.spaceList.findIndex(item => item.spaceId === bike.spaceId) });
            this.onCancelOptionsModal();
        } else {
            Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: -1 });
        }
    }

    onUpdateGarageName = (garageName) => {
        this.props.updateGarageName(garageName, this.props.garage.garageId);
    }

    showOptionsModal = (index) => {
        this.setState({ selectedBike: this.props.garage.spaceList[index], isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedBike: null })

    renderMenuOptions = () => {
        if (this.state.selectedBike === null) return;
        let options = [{ text: 'Edit', id: 'editBike', handler: () => this.openBikeForm() }];
        if (!this.state.selectedBike.isDefault) {
            options.push({ text: 'Select as active', id: 'activeBike', handler: () => this.onChangeActiveBike() })
        }
        options.push({ text: 'Remove bike', id: 'removeBike', handler: () => this.onPressDeleteBike() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() });
        return (
            options.map(option => (
                <LinkButton
                    key={option.id}
                    onPress={option.handler}
                    highlightColor={APP_COMMON_STYLES.infoColor}
                    style={APP_COMMON_STYLES.menuOptHighlight}
                    title={option.text}
                    titleStyle={APP_COMMON_STYLES.menuOptTxt}
                />
            ))
        )
    }

    openBikeDetailsPage = (bike) => {
        Actions.push(PageKeys.BIKE_DETAILS, { bike });
    }

    onPressDeleteBike = () => {
        const { selectedBike } = this.state;
        const index = this.props.garage.spaceList.findIndex(bike => bike.spaceId === selectedBike.spaceId);
        setTimeout(() => {
            Alert.alert(
                'Remove confirmation',
                `Are you sure to remove ${selectedBike.name} from your list?`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Remove', onPress: () => this.props.deleteBike(this.props.user.userId, selectedBike.spaceId, index) },
                ]
            );
        }, 100);
        this.onCancelOptionsModal();
    }

    renderBike = ({ item, index }) => {
        return <TouchableOpacity activeOpacity={0.7} style={{ marginBottom: 12 }} onPress={() => this.openBikeDetailsPage(item)}>
            <View style={[styles.imgContainer, { borderBottomColor: item.isDefault ? APP_COMMON_STYLES.infoColor : APP_COMMON_STYLES.headerColor }]}>
                <ImageBackground style={{ flex: 1, width: null, height: null }} source={item.pictureList && item.pictureList[0] ? { uri: item.pictureList[0] } : require('../../../assets/img/bike_placeholder.png')}>
                    {
                        item.isDefault
                            ? <View style={styles.contentOvrImg}>
                                <View style={styles.activeIndicator} />
                                <Item style={styles.txtContainer}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <Text style={[styles.cardSubtitle, { color: APP_COMMON_STYLES.infoColor }]}>{`${item.make || ''}${item.model ? ' - ' + item.model : ''}`}</Text>
                                </Item>
                            </View>
                            : <View style={styles.contentOvrImg}>
                                <Item style={[styles.txtContainer, { marginLeft: styles.txtContainer.marginLeft + styles.activeIndicator.width }]}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <Text style={[styles.cardSubtitle, { color: '#D9D9D9' }]}>{`${item.make || ''}${item.model ? ' - ' + item.model : ''}`}</Text>
                                </Item>
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
                <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                    <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                        {
                            this.renderMenuOptions()
                        }
                    </View>
                </BaseModal>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'ios-notifications', type: 'Ionicons', style: { fontSize: 26 } }}
                        style={styles.headerIconCont} onPress={() => Actions.push(PageKeys.NOTIFICATIONS)} />
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.title}>
                            {user.name}
                        </Text>
                        {
                            user.nickname ?
                                <Text style={styles.subtitle}>
                                    {user.nickname.toUpperCase()}
                                </Text>
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
                        extraData={this.state}
                        ref={elRef => this.spacelistRef = elRef}
                        renderItem={this.renderBike}
                    />
                    {
                        this.props.hasNetwork === false && garage.spaceList.length === 0 && <View style={{ flex: 1, position: 'absolute', top: heightPercentageToDP(30) }}>
                            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
                            </Animated.View>
                            <Text style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</Text>
                            <Text style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </Text>
                        </View>
                    }
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const garage = { garageId, garageName, spaceList, activeBikeIndex } = state.GarageInfo;
    const { hasNetwork } = state.PageState;
    return { user, garage, hasNetwork };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getGarageInfo: (userId) => {
            // dispatch(toggleLoaderAction(true));
            dispatch(apiLoaderActions(true));
            getGarageInfo(userId, (garage) => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                dispatch(replaceGarageInfoAction(garage));
            }, (error) => {
                // dispatch(toggleLoaderAction(false));
                dispatch(apiLoaderActions(false));
                console.log(`getGarage error: `, error);
            })
        },
        updateGarageName: (garageName, garageId) => dispatch(updateGarageName(garageName, garageId)),
        setBikeAsActive: (userId, spaceId, prevActiveIndex, index) => dispatch(setBikeAsActive(userId, spaceId, prevActiveIndex, index)),
        deleteBike: (userId, bikeId, index) => dispatch(deleteBike(userId, bikeId, index)),
        getBikePicture: (pictureId, spaceId) => getPicture(pictureId, (response) => {
            dispatch(updateBikePictureListAction({ spaceId, ...response }))
        }, (error) => console.log("getPicture error: ", error)),
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
    title: {
        fontSize: widthPercentageToDP(6),
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    subtitle: {
        color: 'rgba(189, 195, 199, 1)',
        fontWeight: 'bold'
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
        fontSize: 17,
        // fontWeight: 'bold'
        fontFamily: 'Roboto-Bold'
    },
    cardSubtitle: {
        fontFamily: 'Roboto',
        fontSize: 11,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    }
});