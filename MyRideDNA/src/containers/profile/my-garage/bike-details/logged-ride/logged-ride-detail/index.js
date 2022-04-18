import React, { Component } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, FlatList, Alert } from 'react-native';
import { connect } from 'react-redux';
import { editBikeListAction, updateCurrentBikeLikeAndCommentCountAction, resetErrorHandlingAction } from '../../../../../../actions';
import { Actions } from 'react-native-router-flux';
import { APP_COMMON_STYLES, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, CUSTOM_FONTS, MEDIUM_TAIL_TAG, PageKeys, IS_ANDROID, POST_TYPE } from '../../../../../../constants';
import { PostCard } from '../../../../../../components/cards';
import { DefaultText } from '../../../../../../components/labels';
import { ImageButton, LinkButton, IconButton } from '../../../../../../components/buttons';
import { getCurrentLoggedRideState } from '../../../../../../selectors';
import { getSpaces, addLike, unLike, addComment, deleteComment, getComments } from '../../../../../../api';
import { LabeledInputPlaceholder } from '../../../../../../components/inputs';
import { BasePage } from '../../../../../../components/pages';
import { getFormattedDateFromISO } from '../../../../../../util';
import { BaseModal } from '../../../../../../components/modal';

const CONTAINER_H_SPACE = 33.5;
export class LoggedRideDetails extends Component {
    _postType = 'ride';
    constructor(props) {
        super(props);
        this.state = {
            bikeList: [],
            rideDescription: props.currentRide.description || '',
            bikeId: props.currentRide.spaceId || null,
            privacyMode: !props.currentRide || props.currentRide.privacyMode,
            showCommentBox: false,
            comment: '',
            isVisibleCommentMenu: false,
            enableDeleteOption: false,
            rideComments: null,
            currentBikeName: '',
            likesCount: props.currentRide.numberOfLikes,
            commentCount: props.currentRide.numberOfComments,
            isLiked: props.currentRide.isLiked,
        }
    }

    componentDidMount() {
        if (this.props.isEditable) {
            getSpaces(this.props.user.userId, (bikeList) => {
                const bike = bikeList.find(({ spaceId }) => spaceId === this.props.currentRide.spaceId);
                const name = bike ? bike.name : '';
                this.setState({ bikeList: bikeList.reverse(), currentBikeName: name });
            }, (er) => console.log(er));
        }
        this.fetchTopThreeComments();
    }

    fetchTopThreeComments() {
        this.props.getComments(this.props.postData.id, this._postType, 0, 3, (res) => {
            this.setState({ postComments: res.comments.length > 0 ? res.comments : null });
        }, (er) => { })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentRide.currentRideIndex === -1) {
            Actions.pop();
            return;
        }
        if (prevProps.currentRide && (prevProps.currentRide.numberOfComments !== this.props.currentRide.numberOfComments)) {
            this.fetchTopThreeComments();
        }
        if (prevProps.currentRide && (prevProps.currentRide.numberOfLikes !== this.props.currentRide.numberOfLikes)) {
            this.setState({ likesCount: this.props.currentRide.numberOfLikes })
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

    showAppNavMenu = () => this.props.showAppNavMenu();

    getDistanceAsFormattedString(distance, distanceUnit) {
        if (!distance) {
            return '0 ' + distanceUnit;
        }
        if (distanceUnit === 'km') {
            return (distance / 1000).toFixed(2) + ' km';
        } else {
            return (distance * 0.000621371192).toFixed(2) + ' mi';
        }
    }

    getTimeAsFormattedString(timeInSeconds) {
        if (!timeInSeconds) return '0 m';
        const m = Math.floor(timeInSeconds / 60);
        const timeText = `${m} m`;
        return timeText;
    }

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return [dateInfo[0] + '.', (dateInfo[2] + '').slice(-2)].join(joinBy);
    }

    onChangeRideDescription = text => this.setState({ rideDescription: text });

    toggleLikeAction = () => {
        const { currentRide } = this.props;
        if (currentRide.isLiked) {
            this.props.unLike(currentRide.rideId, this.props.user.userId, currentRide.numberOfLikes, this.props.isEditable, (res) => {
                this.setState(prevState => ({ likesCount: prevState.likesCount - 1, isLiked: false }))
            });
        }
        else {
            this.props.addLike(currentRide.rideId, this._postType, currentRide.numberOfLikes, this.props.isEditable, (res) => {
                this.setState(prevState => ({ likesCount: prevState.likesCount + 1, isLiked: true }))
            });
        }
    }

    getFormattedTime = (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
    }

    openCommentPage = () => Actions.push(PageKeys.COMMENTS,
        {
            postId: this.props.currentRide.rideId, postType: this._postType,
            isEditable: this.props.isEditable, postData: this.props.currentRide,
            onUpdate: (commentsCount) => {
                this.setState(prevState => ({ commentCount: commentsCount }))
                this.props.updateCommentsCount(this.props.currentRide.rideId, commentsCount)
            },post:this.props.currentRide
        });

    openLikesPage = () => Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: this.props.currentRide.rideId, type: this._postType });

    onChangeComment = (val) => this.setState(prevState => ({ comment: val }));

    renderComments = ({ item, index }) => {
        const { enableDeleteOption } = this.state
        const { isEditable } = this.props;
        return <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', marginHorizontal: enableDeleteOption ? 14 : 27 }}>
                    {enableDeleteOption && item.userId === this.props.user.userId && <IconButton style={{ marginRight: enableDeleteOption ? 10 : 0, alignSelf: 'center' }} iconProps={{ name: 'ios-close-circle', type: 'Ionicons', style: { color: '#CE0D0D', fontSize: 17 } }} onPress={() => this.deleteComment(item)} />}
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoSlabBold, marginLeft: enableDeleteOption && (!isEditable && item.userId !== this.props.user.userId) ? 25 : 0 }}>{item.userName}</DefaultText>
                </View>
                <DefaultText style={{ fontSize: 10, marginHorizontal: 27 }}>{getFormattedDateFromISO(item.date)}, {this.getFormattedTime(item.date)}</DefaultText>
            </View>
            <View style={{ flexDirection: 'row', flex: 1, marginHorizontal: enableDeleteOption ? 40 : 27 }}>
                <DefaultText style={{ fontFamily: CUSTOM_FONTS.roboto, fontSize: 13, flex: 1 }}>{item.text}</DefaultText>
            </View>
        </View>
    }

    postComment = () => {
        if (this.state.comment.trim().length === 0) Toast.show({ text: 'Enter some text' });
        else {
            const { ...currentRide } = this.props.currentRide;
            const commentData = { text: this.state.comment, referenceType: this._postType, userId: this.props.user.userId };
            this.props.addComment(currentRide.rideId, commentData, currentRide.numberOfComments, this.props.isEditable,
                (res) => {
                    this.fetchTopThreeComments();
                    this.setState(prevState => ({ commentCount: prevState.commentCount + 1, showCommentBox: false, comment: '' }));
                }
            );
        }
    }

    deleteComment = (comment) => {
        const { ...currentRide } = this.props.currentRide;
        if (currentRide.numberOfComments === 1) this.setState({ enableDeleteOption: false });
        this.props.deleteComment(comment.id, this.props.user.userId, currentRide.rideId, currentRide.numberOfComments, this.props.isEditable,
            (res) => {
                this.fetchTopThreeComments();
                this.setState(prevState => ({ commentCount: prevState.commentCount - 1, enableDeleteOption: prevState.commentCount > 1 }));
            }
        );
    }

    showCommentMenuModal = () => this.setState({ isVisibleCommentMenu: true });

    hideCommentMenuModal = () => this.setState({ isVisibleCommentMenu: false });

    componentWillUnmount() {
        if (!this.props.isEditable) {
            const { isLiked, likesCount, commentCount } = this.state;
            const updateData = {
                isLiked: isLiked, numberOfLikes: likesCount,
                numberOfComments: commentCount, rideId: this.props.currentRide.rideId
            };
            this.props.updateLoggedRideData(updateData);
        }
    }

    render() {
        const { currentRide, isEditable, user } = this.props;
        const { bikeList, rideComments, isVisibleCommentMenu, rideDescription, privacyMode, showCommentBox, comment, enableDeleteOption, likesCount, commentCount, isLiked } = this.state;
        const BIKE_LIST = [];
        if (isEditable) {
            !currentRide.spaceId && BIKE_LIST.push({ label: 'SELECT A BIKE', value: null });
            bikeList.forEach(bike => BIKE_LIST.push({ label: bike.name, value: bike.spaceId }));
        }
        return (
            <BasePage heading={currentRide.name} showLoader={this.props.showLoader}>
                {isVisibleCommentMenu && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleCommentMenu} onCancel={this.hideCommentMenuModal} onPressOutside={this.hideCommentMenuModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE COMMENT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.setState({ enableDeleteOption: true, isVisibleCommentMenu: false })} />
                    </View>
                </BaseModal>}
                <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                    <ScrollView style={styles.fill} contentContainerStyle={{ paddingBottom: this.state.iOSKeyboardShown ? 35 : 0 }}>
                        <PostCard headerContent={<View style={styles.footerContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <ImageButton imageSrc={require('../../../../../../assets/img/distance.png')} imgStyles={styles.footerIcon} />
                                <DefaultText style={styles.footerText}>{this.getDistanceAsFormattedString(currentRide.totalDistance, this.props.user.distanceUnit)}</DefaultText>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <ImageButton imageSrc={require('../../../../../../assets/img/duration.png')} imgStyles={styles.footerIcon} />
                                <DefaultText style={styles.footerText}>{this.getTimeAsFormattedString(currentRide.totalTime)}</DefaultText>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <ImageButton imageSrc={require('../../../../../../assets/img/date.png')} imgStyles={styles.footerIcon} />
                                <DefaultText style={styles.footerText}>{this.getFormattedDate(currentRide.date)}</DefaultText>
                            </View>
                        </View>}
                            outerContainer={{ borderBottomWidth: 0, }}
                            image={currentRide.snapshotId ? `${GET_PICTURE_BY_ID}${currentRide.snapshotId.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` : null}
                            placeholderImage={require('../../../../../../assets/img/ride-placeholder-image.png')}
                            placeholderImgHeight={220}
                            placeholderBlur={6}
                            footerContent={<View>
                                <View style={styles.postCardFtrIconCont}>
                                    <View style={styles.likesCont}>
                                        <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: isLiked ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={this.toggleLikeAction} />
                                        <LinkButton style={{ alignSelf: 'center' }} title={likesCount + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={currentRide.numberOfLikes > 0 ? this.openLikesPage : null} />
                                    </View>
                                    <IconButton title={commentCount + ' Comments'} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={currentRide.numberOfComments > 3 && this.openCommentPage} />
                                </View>
                            </View>}
                        />
                        <View style={styles.container}>
                            <DefaultText style={styles.title}>RIDE DESCRIPTION</DefaultText>
                            <DefaultText style={[styles.dropdownPlaceholderTxt, { marginTop: 5, fontFamily: CUSTOM_FONTS.roboto }]} text={currentRide.description} />
                            <DefaultText style={[styles.dropdownPlaceholderTxt, { marginTop: 20 }]} text={this.state.currentBikeName} />
                            <DefaultText style={[styles.dropdownPlaceholderTxt, { marginTop: 10 }]} text={currentRide.privacyMode === 'private' ? 'ONLY ME' : 'ROAD CREW'} />
                        </View>
                        <View style={styles.hDivider} />
                        <View style={{ marginHorizontal: 0, marginTop: 0, paddingBottom: 20 }}>
                            {
                                showCommentBox
                                    ? <View style={{ marginTop: 10 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 27 }}>
                                            <DefaultText style={[styles.label, { marginLeft: 15 }]}>{user.name}</DefaultText>
                                            <LinkButton title='CLOSE' titleStyle={styles.postCommentBtn} onPress={() => this.setState({ showCommentBox: false, comment: '' })} />
                                        </View>
                                        <LabeledInputPlaceholder
                                            containerStyle={{ borderBottomWidth: 0, flex: 0 }}
                                            inputValue={comment} inputStyle={{ paddingBottom: 0, }}
                                            outerContainer={{ padding: 5, borderWidth: 1, borderColor: '#707070', borderRadius: 10, marginTop: 5, marginHorizontal: 27, flex: 0 }}
                                            returnKeyType='done'
                                            onChange={this.onChangeComment}
                                            hideKeyboardOnSubmit={true}
                                            onSubmit={this.postComment} />
                                        <LinkButton style={{ alignSelf: 'center', marginTop: 5 }} title='POST COMMENT' titleStyle={styles.postCommentBtn} onPress={this.postComment} />
                                    </View>
                                    : enableDeleteOption
                                        ? <LinkButton style={{ alignSelf: 'flex-end', marginRight: 25, marginTop: 10 }} title='CLOSE' titleStyle={[styles.postCommentBtn]} onPress={() => this.setState({ enableDeleteOption: false })} />
                                        : currentRide.privacyMode !== 'private' && <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 27, marginTop: 10 }}>
                                            <IconButton style={{ alignSelf: 'flex-start', justifyContent: 'space-between', }} title='ADD COMMENT' titleStyle={styles.addComment} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { color: '#F5891F', fontSize: 20 } }} onPress={() => this.setState({ showCommentBox: true })} />
                                            {rideComments && <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#B4B4B4', fontSize: 20 } }} onPress={this.showCommentMenuModal} />}
                                        </View>
                            }
                            {rideComments && <View>
                                <FlatList
                                    contentContainerStyle={{ paddingBottom: 10 }}
                                    showsVerticalScrollIndicator={false}
                                    data={rideComments}
                                    keyExtractor={this.commentKeyExtractor}
                                    renderItem={this.renderComments}
                                />
                            </View>}
                            {currentRide.numberOfComments > 3 && <LinkButton style={{ alignSelf: 'center', marginBottom: 10 }} title={'View All'} titleStyle={{ color: '#B4B4B4', fontSize: 15 }} onPress={this.openCommentPage} />}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BasePage>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { showLoader, hasNetwork, lastApi, isRetryApi } = state.PageState;;
    if (props.isEditable) {
        return { user, showLoader, hasNetwork, lastApi, isRetryApi, currentRide: getCurrentLoggedRideState(state, props) };
    }
    else {
        return { user, showLoader, hasNetwork, lastApi, isRetryApi };
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addLike: (rideId, postType, numberOfLikes, isEditable, successCallback) => addLike(rideId, postType).then(res => {
            console.log('addLike sucess : ', res);
            successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            isEditable && dispatch(updateCurrentBikeLikeAndCommentCountAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: true }))
        }).catch(er => {
            handleServiceErrors(er, [rideId, postType, numberOfLikes, isEditable, successCallback], 'addLike', true, true);
            console.log('addLike error : ', er)
        }),
        unLike: (rideId, userId, numberOfLikes, isEditable, successCallback) => unLike(rideId, userId).then(res => {
            console.log('unLike sucess : ', res);
            successCallback()
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            isEditable && dispatch(updateCurrentBikeLikeAndCommentCountAction({ isUpdateLike: true, isLiked: true, rideId, isAdded: false }))
        }).catch(er => {
            handleServiceErrors(er, [rideId, userId, numberOfLikes, isEditable, successCallback], 'unLike', true, true);
            console.log('unLike error : ', er)
        }),
        addComment: (rideId, commentData, numberOfComments, isEditable, successCallback) => addComment(rideId, commentData).then(res => {
            console.log('addComment success : ', res)
            successCallback()
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            isEditable && dispatch(updateCurrentBikeLikeAndCommentCountAction({ rideId, isAdded: true }));
        }).catch(er => {
            handleServiceErrors(er, [rideId, commentData, numberOfComments, isEditable, successCallback], 'addComment', true, true);
            console.log('addComment error : ', er)
        }),
        deleteComment: (commentId, userId, rideId, numberOfComments, isEditable, successCallback) => deleteComment(commentId, userId).then(res => {
            successCallback()
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            isEditable && dispatch(updateCurrentBikeLikeAndCommentCountAction({ rideId, isAdded: false }));
        }).catch(er => {
            handleServiceErrors(er, [commentId, userId, rideId, numberOfComments, isEditable, successCallback], 'deleteComment', true, true);
            console.log('deleteComment error : ', er)
        }),
        updateCommentsCount: (rideId, numberOfComments) => dispatch(updateCurrentBikeLikeAndCommentCountAction({ rideId, numberOfComments })),
        getComments: (postId, postType, pageNumber, preference) => getComments(postId, postType, pageNumber, preference).then(res => {
            console.log('getComments success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getComments error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [postId, postType, pageNumber, preference], 'getComments', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'logged_ride_detail', isRetryApi: state })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(LoggedRideDetails);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#585756',
        padding: 10,

    },
    footerIcon: {
        height: 23,
        width: 26,
    },
    footerText: {
        color: '#EAEAEA',
        fontSize: 15,
        fontFamily: CUSTOM_FONTS.robotoBold,
    },
    container: {
        marginHorizontal: CONTAINER_H_SPACE,
        marginTop: 30,
    },
    commentContainer: {
        marginHorizontal: 0,
        marginTop: 20,
        ...APP_COMMON_STYLES.testingBorder,
    },
    title: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
        letterSpacing: 1.2
    },
    description: {
        fontSize: 17,
        fontFamily: CUSTOM_FONTS.roboto
    },
    hDivider: {
        backgroundColor: '#C4C6C8',
        marginTop: 10,
        height: 1.5
    },
    dropdownPlaceholderTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        top: 3
    },
    grayBorderBtn: {
        borderWidth: 2,
        borderColor: '#9A9A9A',
        alignItems: 'center',
        width: 80,
        paddingVertical: 5,
        borderRadius: 22
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
    postCardFtrIconTitle: {
        color: '#fff',
        marginLeft: 10
    },
    postCardFtrIconCont: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 40,
        backgroundColor: '#585756'
    },
    submitBtn: {
        height: 35,
        backgroundColor: '#f69039',
        width: 213,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 30
    },
    likesCont: {
        flexDirection: 'row'
    },
    commentContainer: {
        marginTop: 13,
    },
    addComment: {
        fontSize: 11, fontFamily: CUSTOM_FONTS.robotoSlabBold,
        letterSpacing: 1.1,
        color: '#F5891F',
        marginLeft: 10
    },
    label: {
        fontSize: 12,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    postCommentBtn: {
        letterSpacing: 1.1,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        color: '#F5891F'
    }
})