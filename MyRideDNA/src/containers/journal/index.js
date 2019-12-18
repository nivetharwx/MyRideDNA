import React, { Component } from 'react';
import { View, ImageBackground, StatusBar, FlatList, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { IconButton, ShifterButton, ImageButton } from '../../components/buttons';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, PageKeys, THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, CUSTOM_FONTS, GET_PICTURE_BY_ID, RIDE_TYPE } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicHeader } from '../../components/headers';
import { DefaultText } from '../../components/labels';
import { appNavMenuVisibilityAction, updateBikeLoggedRideAction, screenChangeAction, clearRideAction, updateJournalAction } from '../../actions';
import { PostCard } from '../../components/cards';
import { getRecordRides, getRideByRideId, getPosts, handleServiceErrors } from '../../api';

const NUM_OF_DESC_LINES = 3;
class Journal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 1,
            isEditable: props.isEditable || false,
            showMoreSections: {}
        };
    }

    componentDidMount() {
        this.props.getPosts(this.props.personId, this.props.JOURNAL_POST_ID, undefined, 0);
    }

    showAppNavMenu = () => this.props.showAppNavMenu()

    onPressBackButton = () => Actions.pop();

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return `${dateInfo[0]} ${dateInfo[1]}, ${dateInfo[2]}`;
    }

    openPostForm = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.JOURNAL });

    journalKeyExtractor = item => item.id;

    onDescriptionLayout({ nativeEvent: { lines } }, id) {
        lines.length >= NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: true } }));
    }

    renderPostCard = ({ item, index }) => {
        return (
            <PostCard
                headerContent={
                    <View style={styles.rideCardHeader}>
                        <View />
                        {
                            this.state.isEditable ? <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: styles.headerIcon }} /> : null
                        }
                    </View>
                }
                image={item.pictureIds && item.pictureIds[0] ? `${GET_PICTURE_BY_ID}${item.pictureIds[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
                footerContent={
                    <View>
                        <View style={styles.postCardFtrIconCont}>
                            <IconButton title='0 Likes' titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-thumbs-up', type: 'Ionicons', style: { color: '#fff' } }} />
                            <IconButton title='0 Comments' titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff' } }} />
                        </View>
                        <View style={styles.postCardFtrTxtCont}>
                            <DefaultText style={styles.postCardFtrTitle}>{item.title}</DefaultText>
                            <DefaultText onTextLayout={(evt) => this.onDescriptionLayout(evt, item.id)} numberOfLines={NUM_OF_DESC_LINES}>{item.description}</DefaultText>{this.state.showMoreSections[item.id] ? <DefaultText>more</DefaultText> : null}
                            <DefaultText style={styles.postCardFtrDate}>{this.getFormattedDate(item.date)}</DefaultText>
                        </View>
                    </View>
                }
            />
        );
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getPosts(this.props.personId, this.props.JOURNAL_POST_ID, undefined, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
        });
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber }));
    }

    fetchErrorCallback = (er) => {
        this.setState({ isLoading: false });
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

    componentWillUnmount() {
        this.props.clearJournal();
    }

    render() {
        const { isEditable, journal } = this.props;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader title={isEditable ? 'My Journal' : 'Journal'}
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        rightIconProps={isEditable ? { reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconContStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm } : null}
                    />
                    <View style={{ flex: 1 }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            data={journal}
                            keyExtractor={this.journalKeyExtractor}
                            renderItem={this.renderPostCard}
                            initialNumToRender={4}
                            ListFooterComponent={this.renderFooter}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}
                        />
                    </View>
                </View>
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
            </View>
        )
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    const { id: JOURNAL_POST_ID } = state.PageState.postTypes[POST_TYPE.JOURNAL];
    const { currentBike: bike } = state.GarageInfo;
    const { ride } = state.RideInfo.present;
    const { journal } = state.Journal;
    return { user, hasNetwork, bike, ride, JOURNAL_POST_ID, journal };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        getPosts: (userId, postTypeId, spaceId, pageNumber, successCallback, errorCallback) => getPosts(userId, postTypeId, spaceId, pageNumber)
            .then(({ data, ...otherRes }) => {
                console.log("getPosts success: ", data, otherRes);
                dispatch(updateJournalAction({ updates: data, reset: !pageNumber }));
                typeof successCallback === 'function' && successCallback(data);
            })
            .catch(er => {
                console.log("getPosts error: ", er);
                typeof errorCallback === 'function' && errorCallback(er);
                handleServiceErrors(er, [userId, postTypeId, spaceId, pageNumber], getPosts, true);
            }),
        clearJournal: () => dispatch(updateJournalAction({ updates: null, reset: true }))
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Journal);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
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
        marginLeft: 5
    },
    rightIconContStyle: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5
    },
    postCardFtrIconTitle: {
        color: '#fff',
        marginLeft: 10
    },
    postCardFtrTitle: {
        fontSize: 13,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.3
    },
    postCardFtrDate: {
        marginTop: 6,
        fontSize: 9,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 0.9,
        color: '#8D8D8D'
    },
    postCardFtrIconCont: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 40,
        backgroundColor: '#585756'
    },
    postCardFtrTxtCont: {
        marginHorizontal: 26,
        marginVertical: 10
    }
})  