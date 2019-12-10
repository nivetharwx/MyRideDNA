import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IconButton, ShifterButton, ImageButton } from '../../../../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, CUSTOM_FONTS } from '../../../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../../../../components/headers';
import { DefaultText } from '../../../../../components/labels';
import { appNavMenuVisibilityAction } from '../../../../../actions';
import { RideCard } from '../../../../../components/cards';

const loggedRideDummy = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }]
class LogggedRide extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0,
        };
    }
    componentDidMount() {

    }
    componentDidUpdate(prevProps, prevState) {

    }

    showAppNavMenu = () => this.props.showAppNavMenu()

    onPressBackButton = () => Actions.pop();

    _renderItem = ({ item, index }) => {
        return (
            <RideCard
                headerContent={<View style={styles.rideCardHeader}>
                    <DefaultText style={{ fontSize: 19, color: '#585756', fontFamily: CUSTOM_FONTS.robotoBold }}>{item.nameOfRide ? item.nameOfRide : 'Name of Ride'}</DefaultText>
                    <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: styles.headerIcon }} />
                </View>
                }

                footerContent={<View style={{ flexDirection: 'row', justifyContent: 'space-around', height: 40, backgroundColor: '#585756', }}>
                    <View style={{ flexDirection: 'row' }}>
                        <ImageButton imageSrc={require('../../../../../assets/img/distance.png')} imgStyles={styles.footerIcon} />
                        <DefaultText style={styles.footerText}>14.2 mi</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <ImageButton imageSrc={require('../../../../../assets/img/duration.png')} imgStyles={styles.footerIcon} />
                        <DefaultText style={styles.footerText}>40 m</DefaultText>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <ImageButton imageSrc={require('../../../../../assets/img/date.png')} imgStyles={styles.footerIcon} />
                        <DefaultText style={styles.footerText}>Oct. 18</DefaultText>
                    </View>
                </View>}
            />
        );
    }

    loadMoreData = ({ distanceFromEnd }) => {
        // this.setState({ isLoading: true, isLoadingData: false })
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        // this.setState((prevState) => ({ isLoading: true }),
        //     () => {
        //         this.props.11getBuddyAlbum(this.props.user.userId, this.props.person.userId, this.state.pageNumber, 15, (res) => {
        //             if (res.pictures.length > 0) {
        //                 this.setState({ pageNumber: this.state.pageNumber + 1 })
        //             }
        //             this.setState({ isLoading: false })
        //         },
        //             (er) => {
        //                 this.setState({ isLoading: false })
        //             });
        //     })
    }

    renderFooter = () => {
        if (this.state.isLoading) {
            return (
                <View
                    style={{
                        paddingVertical: 20,
                        borderTopWidth: 1,
                        borderColor: "#CED0CE"
                    }}
                >
                    <ActivityIndicator animating size="large" />
                </View>
            );
        }
        return null
    }

    render() {
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title='Logged Rides' leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }} />
                    <FlatList
                        style={{ flexDirection: 'column' }}
                        contentContainerStyle={styles.loggedRideList}
                        data={loggedRideDummy}
                        renderItem={this._renderItem}
                        initialNumToRender={4}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}

                    />
                </View>
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    const { currentBikeId } = state.GarageInfo;
    const currentBikeIndex = state.GarageInfo.spaceList.findIndex(({ spaceId }) => spaceId === currentBikeId);
    const bike = currentBikeIndex === -1 ? null : state.GarageInfo.spaceList[currentBikeIndex];
    return { user, hasNetwork, bike };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(LogggedRide);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loggedRideList: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    rideCardHeader: {
        flexDirection: 'row',
        height: 50,
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingHorizontal: 26
    },
    headerIcon: {
        color: '#8D8D8D',
        fontSize: 19,
    },
    footerIcon: {
        height: 23,
        width: 26,
        marginTop: 8
    },
    footerText: {
        color: '#EAEAEA',
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.robotoBold,
        marginTop: 11,
        marginLeft: 7.5
    }
})  