import React, { Component } from 'react';
import {Text, View, FlatList, StyleSheet, Alert, ActivityIndicator, Animated } from 'react-native';
import { connect } from 'react-redux';
import { BasicButton, IconButton, ImageButton, LinkButton } from '../../components/buttons';
import { APP_COMMON_STYLES, PageKeys, THUMBNAIL_TAIL_TAG, POST_TYPE, PORTRAIT_TAIL_TAG, CUSTOM_FONTS, GET_PICTURE_BY_ID, heightPercentageToDP, widthPercentageToDP, MEDIUM_TAIL_TAG, IS_ANDROID } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { DefaultText } from '../../components/labels';
import { appNavMenuVisibilityAction, screenChangeAction, updateJournalAction, apiLoaderActions, resetErrorHandlingAction, deleteJournalAction, updateLikeAndCommentAction, setCurrentFriendAction } from '../../actions';
import { PostCard } from '../../components/cards';
import { getPosts, handleServiceErrors, getFriendsPosts, deletePost, addLike, unLike } from '../../api';
import { BaseModal, GesturedCarouselModal } from '../../components/modal';
import { BasePage } from '../../components/pages';
import { Toast } from 'native-base'
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base'

const NUM_OF_DESC_LINES = 3;
class Journal extends Component {
    _postType = 'post';
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            spinValue: new Animated.Value(0),
            pageNumber: 0,
            isEditable: props.isEditable || false,
            showMoreSections: {},
            showOptionsModal: false,
            selectedJournal: null,
            friendsJournal: [],
            hasRemainingList: false,
            isVisiblePictureModal: false,
            selectedPictureList: null,
            showDeleteModal:false
        };
    }

    componentDidMount() {
        if (this.state.isEditable) {
            if (this.props.isLoadedPostTypes) {
                this.props.getPosts(this.props.personId, this.props.postTypes[POST_TYPE.JOURNAL].id, this.props.spaceId ? this.props.spaceId : undefined, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
            }
        } else {
            if (this.props.isLoadedPostTypes) {
                this.getFriendsPosts(this.props.user.userId, this.props.postTypes[POST_TYPE.JOURNAL].id, this.props.personId, this.props.spaceId ? this.props.spaceId : undefined, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback)
            }
        }
    }

loaderData=()=>{
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

    componentDidUpdate(prevProps, prevState) {

//         if(this.props.hasNetwork===true){
//   this.loaderData();
//         }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            // this.retryApiFunc();
            // this.loaderData();
            this.renderFooter();
            this.retryApiFunction();
        }

        if (prevProps.isRetryApi === false && this.props.isRetryApi === true) {
            if (Actions.currentScene === this.props.lastApi.currentScene) {
                Alert.alert(
                    'Something went wrong ',
                    '',
                    [
                        {
                            text: 'Retry ', onPress: () => {
                                // this.retryApiFunc();
                                this.retryApiFunction();
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





retryApiFunction=()=>{


    if (this.state.isEditable) {
        if (this.props.isLoadedPostTypes) {
            this.props.getPosts(this.props.personId, this.props.postTypes[POST_TYPE.JOURNAL].id, this.props.spaceId ? this.props.spaceId : undefined, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
        }
    } else {
        if (this.props.isLoadedPostTypes) {
            this.getFriendsPosts(this.props.user.userId, this.props.postTypes[POST_TYPE.JOURNAL].id, this.props.personId, this.props.spaceId ? this.props.spaceId : undefined, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback)
        }
    }
}
 


    retryApiFunc = () => {
        if (this.props.lastApi && this.props.lastApi.currentScene === Actions.currentScene) {
            this.props[`${this.props.lastApi.api}`](...this.props.lastApi.params)
        }
    }

    getFriendsPosts(userId, postTypeId, friendId, spaceId, pageNumber) {
        this.props.getFriendsPosts(userId, postTypeId, friendId, spaceId, pageNumber, (data) => {
            this.setState(prevState => {
                return {
                    friendsJournal: [...(prevState.friendsJournal || []), ...data.posts],
                    hasRemainingList: data.remainingList > 0,
                    isLoading: false,
                    pageNumber: data.posts.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber
                }
            });
        }, (er) => { })
    }

    onPressBackButton = () => Actions.pop();

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return `${dateInfo[0]} ${dateInfo[1]}, ${dateInfo[2]}`;
    }

    openPostForm = () => {
        if (this.props.isLoadedPostTypes === false) {
            Toast.show({ text: 'Something went wrong. Please try again later' });
            return;
        }
        if (this.state.selectedJournal && this.props.apiCallsInProgress[this.state.selectedJournal.id]) return;
        if (this.state.selectedJournal) {
            Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.JOURNAL, selectedPost: this.state.selectedJournal, currentBikeId: this.state.selectedJournal.metaData ? this.state.selectedJournal.metaData.spaceId : null, isEditable: true });
            this.setState({ showOptionsModal: false, selectedJournal: null })
        } else {
            Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.JOURNAL, currentBikeId: this.props.spaceId ? this.props.spaceId : null, isEditable: false });
        }
    }

    journalKeyExtractor = item => item.id;

    onDescriptionLayout({ nativeEvent: { lines } }, id) {
        if (!this.state.showMoreSections[id]) {
            lines.length >= NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: { numberOfLines: 3, isVisibleMoreButton: true } } }));
        }
    }

    onPressMoreButton = (id) => {
        this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: { numberOfLines: null, isVisibleMoreButton: false } } }))
    }

    updatePostData = (item) => {
        const updatedIndx = this.state.friendsJournal.findIndex(post => post.id === item.id);
        const updateFriendsPost = { ...this.state.friendsJournal[updatedIndx], ...item }
        this.setState({ friendsJournal: [...this.state.friendsJournal.slice(0, updatedIndx), updateFriendsPost, ...this.state.friendsJournal.slice(updatedIndx + 1)] })
    }

    openPostDetailPage = (item) => {
        if (this.props.apiCallsInProgress[item.id]) return;
        Actions.push(PageKeys.POST_DETAIL, {
            isEditable: this.state.isEditable, postId: item.id, postType: POST_TYPE.JOURNAL,
            ...(!this.props.isEditable && { postData: item, updatePostData: this.updatePostData })
        });
    }

    toggleLikeOrUnlike = (item) => {
        if (item.isLike) {
            this.props.unLike(item.id, this.props.user.userId, this.props.isEditable, item.numberOfLikes, (res) => {
                this.setState(prevState => ({
                    friendsJournal: prevState.friendsJournal.map(post => {
                        return post.id === item.id ? { ...post, numberOfLikes: item.numberOfLikes - 1, isLike: false } : post;
                    })
                }));
            });
        } else {
            this.props.addLike(item.id, this._postType, this.props.isEditable, item.numberOfLikes, (res) => {
                this.setState(prevState => ({
                    friendsJournal: prevState.friendsJournal.map(post => {
                        return post.id === item.id ? { ...post, numberOfLikes: item.numberOfLikes + 1, isLike: true } : post;
                    })
                }));
            });
        }
    }

    openCommentPage(post) {
        Actions.push(PageKeys.COMMENTS, {
            postId: post.id, isEditable: this.props.isEditable, postType: this._postType,
            onUpdatesuccess: (commentsCount) => {
                this.props.isEditable
                    ? this.props.updateCommentsCount(post.id, commentsCount)
                    : this.setState(prevState => ({
                        friendsJournal: prevState.friendsJournal.map(item => {
                            return post.id === item.id ? { ...item, numberOfComments: commentsCount } : item;
                        })
                    }));
            },post:post
        });
    }

    openFriendsProfile = (item) => {
        if (item.userId === this.props.user.userId) {
            Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
        }
        else if (item.isFriend) {
            this.props.setCurrentFriend({ userId: item.userId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.userId });
        }
        else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: { ...item, userId: item.userId } })
        }
    }

    openLikesPage(post) { Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: post.id, type: this._postType }); }

    renderPostCard = ({ item }) => {
        console.log(item," item detail ")
        return (<PostCard
            showLoader={this.props.apiCallsInProgress[item.id]}
            headerContent={<View style={[styles.rideCardHeader, { height: 70, flexDirection: 'row', ...APP_COMMON_STYLES.testingBorderx }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={{ height: 40, width: 40, borderRadius: 20, overflow: 'hidden' }} imageSrc={this.props.isEditable && this.props.user.profilePictureId ? { uri: `${GET_PICTURE_BY_ID}${this.props.user.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : this.props.person && this.props.person.profilePictureId ? { uri: `${GET_PICTURE_BY_ID}${this.props.person.profilePictureId.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : require('../../assets/img/profile-pic-placeholder.png')} onPress={() => this.openFriendsProfile(this.props.isEditable ? item : this.props.person)} />
                    <DefaultText style={styles.userName}>{this.props.isEditable ? this.props.user.name : this.props.person && this.props.person.name}</DefaultText>
                </View>
                {this.state.isEditable && <IconButton style={{ marginLeft: 'auto' }} iconProps={{ name: 'options', type: 'SimpleLineIcons', style: styles.headerIcon }} onPress={() => this.showOptionsModal(item)} />}
            </View>}
            numberOfpicture = {item.pictureList && item.pictureList?item.pictureList && item.pictureList.length:null}
            numberOfPicUploading={item.numberOfPicUploading || null}
            image={item.pictureList && item.pictureList[0] ? `${GET_PICTURE_BY_ID}${item.pictureList[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
            // placeholderImgHeight={190}
            postTitle={item.title}
            postDescription={item.description}
            onPress={() => (item.pictureList && item.pictureList.length > 0) ? this.onPressImage(item.pictureList) : null}
            footerContent={<View>
                <View style={styles.postCardFtrIconCont}>
                    <View style={styles.likesCont}>
                        <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: item.isLike ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={() => this.toggleLikeOrUnlike(item)} />
                        <LinkButton style={{ alignSelf: 'center' }} title={item.numberOfLikes + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={() => item.numberOfLikes > 0 && this.openLikesPage(item)} />
                    </View>
                    <IconButton title={item.numberOfComments + ' Comments'} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={() => this.openCommentPage(item)} />
                </View>
                <View style={styles.postCardFtrTxtCont}>
                    {
                        (item.pictureList && item.pictureList.length > 0)
                            ? <View>
                                <DefaultText style={styles.postCardFtrTitle}>{item.title}</DefaultText>
                                <DefaultText onTextLayout={(evt) => this.onDescriptionLayout(evt, item.id)} numberOfLines={this.state.showMoreSections[item.id] ? this.state.showMoreSections[item.id].numberOfLines : NUM_OF_DESC_LINES}>{item.description}</DefaultText>{this.state.showMoreSections[item.id] && this.state.showMoreSections[item.id].isVisibleMoreButton ? <LinkButton onPress={() => this.onPressMoreButton(item.id)} title={'more'} /> : null}
                            </View>
                            : null
                    }

                    <DefaultText style={styles.postCardFtrDate}>{this.getFormattedDate(item.date)}</DefaultText>
                </View>
            </View>}
        // onPress={() => this.openPostDetailPage(item)}
        />);
    }

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            if (this.props.isEditable) {
                if (this.props.isLoadedPostTypes) {
                    this.props.getPosts(this.props.personId, this.props.postTypes[POST_TYPE.JOURNAL].id, this.props.spaceId ? this.props.spaceId : undefined, this.state.pageNumber, this.fetchSuccessCallback, this.fetchErrorCallback);
                }
            } else {
                if (this.props.isLoadedPostTypes) {
                    this.getFriendsPosts(this.props.user.userId, this.props.postTypes[POST_TYPE.JOURNAL].id, this.props.personId, this.props.spaceId ? this.props.spaceId : undefined, this.state.pageNumber);
                }
            }
        });
    }

    fetchSuccessCallback = (res) => this.setState(prevState => ({ isLoading: false, pageNumber: res.posts.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }));

    fetchErrorCallback = (er) => this.setState({ isLoading: false });

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
        return null;
    }

    componentWillUnmount() { this.props.clearJournal(); }

    showOptionsModal = (item) => this.setState({ showOptionsModal: true, selectedJournal: item });

    hideOptionsModal = () => this.setState({ showOptionsModal: false, selectedJournal: null });

    deletePost = () => {
        const journalId = this.state.selectedJournal.id;
        this.props.deletePost(journalId,(res)=>{
            this.hideDeleteModal();
        this.hideOptionsModal()
    }) 
    }

    onPressImage = (item) => {
        this.setState({ isVisiblePictureModal: true, selectedPictureList: item })
    }

    hidePictureModal = () => this.setState({ isVisiblePictureModal: false, selectedPictureList: null });

    openDeleteModal = () => this.setState({ showDeleteModal: true });

    hideDeleteModal = () => this.setState({ showDeleteModal: false  });

    render() {
        const { isEditable, journal, apiCallsInProgress, isLoadedPostTypes } = this.props;
        const { showOptionsModal, friendsJournal, selectedJournal, isVisiblePictureModal, selectedPictureList, showDeleteModal } = this.state;
        return (
            <BasePage heading={isEditable ? 'Stories From The Road' : 'Stories From The Road'}
                headerRightIconProps={isEditable ? { reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.rightIconContStyle, style: { color: '#fff', fontSize: 19 }, onPress: this.openPostForm } : null}
            >
                {/* {isVisiblePictureModal && <GesturedCarouselModal isVisible={isVisiblePictureModal} onCancel={this.hidePictureModal}
                    pictureIds={selectedPictureList}
                    isGestureEnable={true}
                    isZoomEnable={true}
                    initialCarouselIndex={0}
                />} */}
                {
                 isVisiblePictureModal && <ImageViewer FooterComponent={(img)=>{
                    return   ( <View style={{ height: 100,backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                            <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={selectedPictureList[img.imageIndex].description} numberOfLines={2}/>
                            <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+selectedPictureList.length}</Text>
                            </View>)
                }} HeaderComponent={()=>{
                    return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                        <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',}}>
                        <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.hidePictureModal} />
                        </View>
                    </View>
                }} visible={isVisiblePictureModal} onRequestClose={this.hidePictureModal} images={selectedPictureList.map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} imageIndex={0} />
                }
                <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                    <View>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton disabled={selectedJournal && apiCallsInProgress[selectedJournal.id]} style={APP_COMMON_STYLES.optionBtn} title='Edit' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} />
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='Delete Post' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeleteModal} />
                    </View>
                   { showDeleteModal  &&  <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Delete Post</DefaultText>
                                <DefaultText numberOfLines={3} style={styles.deleteText}>Are you sure you want to delete this post? You will not be able to undo this action</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideDeleteModal} />
                                    <BasicButton title='Delete' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.deletePost} />
                                </View>
                            </View>
                </BaseModal>
                }
                </View> 
                </BaseModal>
                <View style={{ flex: 1 }}>
                    <FlatList
                        contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }}
                        showsVerticalScrollIndicator={false}
                        data={this.props.isEditable ? journal : friendsJournal}
                        keyExtractor={this.journalKeyExtractor}
                        renderItem={this.renderPostCard}
                        initialNumToRender={4}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />
                    {
                        this.props.hasNetwork === false && (this.props.isEditable ? ((journal && journal.length === 0) || !journal) : ((friendsJournal && friendsJournal.length === 0) || !friendsJournal)) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                        </View>
                    }
                </View>
            </BasePage>
        )
    }
}
const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi, apiCallsInProgress, postTypes } = state.PageState;
    // const { id: JOURNAL_POST_ID } = state.PageState.postTypes[POST_TYPE.JOURNAL];
    const { currentBike: bike } = state.GarageInfo;
    const { ride } = state.RideInfo.present;
    return {
        user, apiCallsInProgress, hasNetwork, lastApi, isRetryApi, bike, ride, postTypes, isLoadedPostTypes: Object.keys(postTypes).length > 0,
        ...(props.isEditable && { journal: state.Journal.journal })
    };
}
const mapDispatchToProps = (dispatch) => {
    return {
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
        changeScreen: (screenKey) => dispatch(screenChangeAction(screenKey)),
        getPosts: (userId, postTypeId, spaceId, pageNumber, successCallback, errorCallback) => getPosts(userId, postTypeId, spaceId, pageNumber)
            .then(({ data, ...otherRes }) => {
                console.log("getPosts success: ", data, otherRes);
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
                dispatch(updateJournalAction({ updates: data.posts, reset: !pageNumber }));
                typeof successCallback === 'function' && successCallback(data);
            })
            .catch(er => {
                console.log("getPosts error: ", er);
                typeof errorCallback === 'function' && errorCallback(er);
                handleServiceErrors(er, [userId, postTypeId, spaceId, pageNumber, successCallback, errorCallback], 'getPosts', true, true);
            }),
        deletePost: (postId, successCallback) => deletePost(postId).then(res => {
            if (res.status === 200) {
                console.log('deletePost : ', res.data);
                dispatch(apiLoaderActions(false));
                dispatch(deleteJournalAction({ id: postId }));
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res)
            }
        }).catch(er => {
            console.log('deletePost error : ', er.response);
            handleServiceErrors(er, [postId], 'deletePost', true, true);
            dispatch(apiLoaderActions(false));
        }),
        clearJournal: () => dispatch(updateJournalAction({ updates: null, reset: true })),
        addLike: (postId, postType, isEditable, numberOfLikes, successCallback) => addLike(postId, postType).then(res => {
            console.log('addLike sucess : ', res)
            isEditable
                ? dispatch(updateLikeAndCommentAction({ isUpdateLike: true, isLike: true, id: postId, isAdded: true }))
                : typeof successCallback === 'function' && successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            handleServiceErrors(er, [postId, postType, isEditable, numberOfLikes, successCallback], 'addLike', true, true);
            console.log('addLike error : ', er)
        }),
        unLike: (postId, userId, isEditable, numberOfLikes, successCallback) => unLike(postId, userId).then(res => {
            console.log('unLike sucess : ', res);
            isEditable
                ? dispatch(updateLikeAndCommentAction({ isUpdateLike: true, isLike: true, id: postId, isAdded: false }))
                : typeof successCallback === 'function' && successCallback()
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            handleServiceErrors(er, [postId, userId, isEditable, numberOfLikes, successCallback], 'unLike', true, true);
            console.log('unLike error : ', er)
        }),
        updateCommentsCount: (postId, numberOfComments) => dispatch(updateLikeAndCommentAction({ id: postId, numberOfComments })),
        getFriendsPosts: (userId, postTypeId, friendId, spaceId, pageNumber, successCallback, errorCallback) => getFriendsPosts(userId, postTypeId, friendId, spaceId, pageNumber).then(res => {
            if (res.status === 200) {
                dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                successCallback(res.data)
            }
        }).catch(er => {
            console.log('getFriendsPosts error : ', er.response);
            errorCallback(er)
            handleServiceErrors(er, [userId, postTypeId, friendId, spaceId, pageNumber, successCallback, errorCallback], 'getFriendsPosts', true, true);
            dispatch(apiLoaderActions(false));
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'journal', isRetryApi: state })),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Journal);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    rideCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 26
    },
    userName: {
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
        color: '#585756',
        alignSelf: 'center',
        padding: 10
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
        backgroundColor: '#ADADAD'
    },
    likesCont: {
        flexDirection: 'row'
    },
    postCardFtrTxtCont: {
        marginHorizontal: 26,
        marginVertical: 10
    },
    deleteBoxCont: {
        height: 263,
        width: 327,
        backgroundColor: '#F4F4F4',
        borderRadius: 20,
        padding: 31,
        paddingRight: 40
    },
    deleteTitle: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 20
    },
    deleteText: {
        color: '#585756',
        fontFamily: CUSTOM_FONTS.roboto,
        fontSize: 17,
        letterSpacing: 0.17,
        marginTop: 30
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    actionBtn: {
        height: 35,
        backgroundColor: '#2B77B4',
        width: 125,
        alignSelf: 'center',
        borderRadius: 20,
        marginTop: 20
    },
    actionBtnTxt: {
        letterSpacing: 1.4,
        fontSize: 14,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
})  