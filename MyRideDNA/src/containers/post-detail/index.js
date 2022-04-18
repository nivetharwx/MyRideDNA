import React, { Component } from 'react';
import { Alert, View, FlatList, StyleSheet, ScrollView, KeyboardAvoidingView, Text } from 'react-native';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { APP_COMMON_STYLES, THUMBNAIL_TAIL_TAG, GET_PICTURE_BY_ID, CUSTOM_FONTS, PageKeys, POST_TYPE, MEDIUM_TAIL_TAG, IS_ANDROID, heightPercentageToDP } from '../../constants';
import { BaseModal, GesturedCarouselModal } from '../../components/modal';
import { LinkButton, IconButton, BasicButton } from '../../components/buttons';
import { DefaultText } from '../../components/labels';
import { PostCard } from '../../components/cards';
import { deletePost, handleServiceErrors, getComments, addComment, deleteComment, addLike, unLike, getPostDetail } from '../../api';
import { apiLoaderActions, deleteJournalAction, resetErrorHandlingAction, updateLikeAndCommentAction, setCurrentFriendAction } from '../../actions';
import { getCurrentPostState } from '../../selectors';
import { LabeledInputPlaceholder } from '../../components/inputs';
import { Toast } from 'native-base';
import { getFormattedDateFromISO } from '../../util';
import { BasePage } from '../../components/pages';
import ImageViewer from 'react-native-image-viewing';
import { Icon as NBIcon } from 'native-base';

class PostDetail extends Component {
    _postType = 'post';
    constructor(props) {
        super(props);
        this.state = {
            showOptionsModal: false,
            commentText: '',
            showCommentBox: false,
            likesCount: (this.props.postData && this.props.postData.numberOfLikes) || 0,
            commentCount: (this.props.postData && this.props.postData.numberOfComments) || 0,
            isLike: (this.props.postData && this.props.postData.isLike) || false,
            pageNumber: 0,
            isLoading: false,
            hasRemainingList: false,
            isVisibleCommentMenu: false,
            enableDeleteOption: false,
            comments: [],
            selectedIndex: -1,
            isVisiblePictureModal: false,
            parentCommentId: null,
            showChildComments: {},
            numberOfComments: 0,
            mainParentCommentId: null,
            showDeleteModal: false
        };
    }

    componentDidMount() {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.props.getPostDetail(this.props.notificationBody.reference.tragetId, (res) => {
                this.setState({ likesCount: res.numberOfLikes, commentCount: res.numberOfComments, isLike: res.isLiked })
                Actions.refresh({ postData: res });
                this.fetchTopThreeComments();
            })
        }
        else {
            this.fetchTopThreeComments();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.postData && !this.props.postData) {
            Actions.pop();
            return;
        }

        if (prevProps.postData && (prevProps.postData.numberOfComments !== this.props.postData.numberOfComments)) {
            this.fetchTopThreeComments();
            this.setState({ commentCount: this.props.postData.numberOfComments })
        }

        if (prevProps.postData && (prevProps.postData.numberOfLikes !== this.props.postData.numberOfLikes)) {
            this.setState({ likesCount: this.props.postData.numberOfLikes })
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

    fetchTopThreeComments() {
        this.props.getComments(this.props.postData.id, this._postType, 0, 3, (res) => {
            this.setState({ comments: res.comments.length > 0 ? res.comments : null });
        }, (er) => { })
    }

    onChangeComment = (val) => this.setState({ commentText: val });

    showAppNavMenu = () => this.props.showAppNavMenu();

    openOptionsModal = () => this.setState({ showOptionsModal: true });

    hideOptionsModal = () => this.setState({ showOptionsModal: false });

    showCommentMenuModal = () => this.setState({ isVisibleCommentMenu: true });

    hideCommentMenuModal = () => this.setState({ isVisibleCommentMenu: false });

    onPressBackButton = () => Actions.pop();

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return `${dateInfo[0]} ${dateInfo[1]}, ${dateInfo[2]}`;
    }

    toggleLikeOrUnlike = () => {
        if (this.state.isLike) {
            this.props.unLike(this.props.postData.id, this.props.user.userId, this.props.isEditable, this.props.postData.numberOfLikes, (res) => {
                this.setState(prevState => ({ likesCount: prevState.likesCount - 1, isLike: false }))
            });
        } else {
            this.props.addLike(this.props.postData.id, this._postType, this.props.isEditable, this.props.postData.numberOfLikes, (res) => {
                this.setState(prevState => ({ likesCount: prevState.likesCount + 1, isLike: true }))
            });
        }
    }

    renderPostCard = () => {
        const { postData } = this.props;
        
        const { likesCount, commentCount, isLike } = this.state;
        return (<PostCard
            showLoader={this.props.apiCallsInProgress[postData.id]}
            pictureList={postData.pictureList.length > 0 ? postData.pictureList : null}
            image={postData.pictureList && postData.pictureList.length > 0 ? `${GET_PICTURE_BY_ID}${postData.pictureList[0].id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}` : null}
            placeholderImgHeight={220}
            imageHeight={220}
            onPress={(postData.pictureList && postData.pictureList.length > 0) ? this.onPressImage : null}
            footerContent={<View>
                <View style={styles.postCardFtrIconCont}>
                    <View style={styles.likesCont}>
                        <IconButton iconProps={{ name: 'like1', type: 'AntDesign', style: { color: isLike ? '#2B77B4' : '#fff', fontSize: 22 } }} onPress={this.toggleLikeOrUnlike} />
                        <LinkButton style={{ alignSelf: 'center' }} title={likesCount + ' Likes'} titleStyle={styles.postCardFtrIconTitle} onPress={this.openLikesPage} />
                    </View>
                    <IconButton title={`${commentCount} Comments`} titleStyle={styles.postCardFtrIconTitle} iconProps={{ name: 'ios-chatbubbles', type: 'Ionicons', style: { color: '#fff', fontSize: 22 } }} onPress={commentCount > 3 && this.openCommentPage} />
                </View>
                <View style={styles.postCardFtrTxtCont}>
                    {postData.description.length > 0 && <DefaultText> {postData.description}</DefaultText>}
                    <DefaultText style={styles.postCardFtrDate}>{this.getFormattedDate(postData.date)}</DefaultText>
                </View>
            </View>}
        />);
    }

    deletePost = () => {
        this.hideOptionsModal();
        this.props.deletePost(this.props.postData.id, () => {
            this.hideOptionsModal();
            this.hideDeleteModal();
            Actions.pop()
        })
    }

    updateData = (data) => {
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            Actions.refresh({ key: Math.random(), postData: data })
        }
    }

    openPostForm = () => {
        if (this.props.isLoadedPostTypes === false) {
            Toast.show({ text: 'Something went wrong. Please try again later' });
            this.setState({ showOptionsModal: false })
            return;
        }
        if (this.props.apiCallsInProgress[this.props.postData.id]) return;
        Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.JOURNAL, selectedPost: this.props.postData, currentBikeId: this.props.postData.metaData.spaceId, onUpdateSuccess: this.updateData });
        this.setState({ showOptionsModal: false })
    }

    postComment = () => {
        if (this.state.commentText.trim().length === 0) Toast.show({ text: 'Enter some text' });
        else {
            const parentCommentId = this.state.parentCommentId;
            const mainParentCommentId = this.state.mainParentCommentId
            let commentData = { text: this.state.commentText, referenceType: this.props.notificationBody ? this.props.notificationBody.reference.targetScreen === 'POST_DETAIL' ? 'post' : 'ride' : this.props.postType, userId: this.props.user.userId };
            if (parentCommentId) {
                commentData.parentCommentId = parentCommentId;
            }
            this.setState({ showCommentBox: false, commentText: '', parentCommentId: null, mainParentCommentId: null });
            this.props.addComment(this.props.notificationBody ? this.props.notificationBody.tragetId : this.props.postId, commentData, (res) => {
                if (parentCommentId) {
                    this.setState(prevState => ({
                        comments: this.state.comments.map(item => {
                            if (item.id === mainParentCommentId) {
                                const childCommentIndex = item.childComments ? item.childComments.findIndex(childCmnt => childCmnt.id === parentCommentId) : -1;
                                console.log('\n\n\n childCommentIndex : ', childCommentIndex)
                                return { ...item, childComments: item.childComments ? childCommentIndex > -1 ? [...item.childComments.slice(0, childCommentIndex), res.data, ...item.childComments.slice(childCommentIndex)] : [...item.childComments, res.data] : [res.data] }
                            }
                            else {
                                return item
                            }
                            // return item.id === mainParentCommentId ?
                            //     { ...item, childComments: item.childComments ? [res.data, ...item.childComments] : [res.data] }
                            //     : item
                        }), numberOfComments: prevState.numberOfComments + 1, commentCount: prevState.commentCount + 1
                    }),
                        () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
                }
                else {
                    this.setState(prevState => ({ comments: [res.data, ...prevState.comments,], numberOfComments: prevState.numberOfComments + 1, commentCount: prevState.commentCount + 1 }),
                        () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
                }
            }, (er) => { });
        }
    }

    deleteComment = (parentId, childId, isChildComment) => {
        this.props.deleteComment(isChildComment ? childId : parentId, this.props.user.userId, (res) => {
            console.log(res,'/// coment response')
            if (isChildComment) {
                this.setState(prevState => {
                    const comments = this.state.comments.map(item => {
                        return item.id === parentId
                            ? { ...item, childComments: item.childComments.filter(({ id }) => id !== childId) }
                            : item
                    });
                    return { comments: comments, commentCount: prevState.commentCount - res.data.deletedCommentsCount, enableDeleteOption: comments.length > 0, numberOfComments: prevState.numberOfComments - res.data.deletedCommentsCount }
                }, () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
            }
            else {
                this.setState(prevState => {
                    const comments = prevState.comments.filter(({ id }) => id !== parentId);
                    return { comments: comments, commentCount: prevState.commentCount - res.data.deletedCommentsCount, enableDeleteOption: comments.length > 0, numberOfComments: prevState.numberOfComments - res.data.deletedCommentsCount }
                }, () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
            }
        }, (er) => { })
    }

    getFormattedTime = (dateTime) => {
        const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        let period = time[0] < 12 ? 'AM' : 'PM';
        if (time[0] > 12) {
            time[0] = time[0] - 12;
        }
        return `${time.join(':')} ${period}`;
    }

    displayComments = (item, ischildComment, parentId, childId) => {
        console.log(item)
        const { enableDeleteOption } = this.state;
        const { isEditable } = this.props;
        return <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: ischildComment ? 70 : 17, marginRight: 27 }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                {enableDeleteOption && (isEditable && item.userId === this.props.user.userId) ? <IconButton style={{ marginRight: 10, alignSelf: 'center' }} iconProps={{ name: 'ios-close-circle', type: 'Ionicons', style: { color: '#CE0D0D', fontSize: 17 } }} onPress={() => this.deleteComment(parentId, childId, ischildComment)} /> : <View style={{ marginRight: 22 }} />}
                <View style={{ flex: 1 }}>
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoSlabBold }}>{item.userName}</DefaultText>
                    <DefaultText style={{ fontFamily: CUSTOM_FONTS.roboto, fontSize: 13 }}>{item.text}</DefaultText>
                    <LinkButton style={{ alignSelf: 'flex-end' }} title='Reply' titleStyle={styles.postCommentBtn} onPress={() => this.setState({ showCommentBox: true, parentCommentId: item.id, mainParentCommentId: parentId })} />
                </View>
            </View>
            <View >
                <DefaultText style={{ fontSize: 10 }}>{getFormattedDateFromISO(item.date)}, {this.getFormattedTime(item.date)}</DefaultText>
            </View>
        </View>
    }

    renderComments = ({ item }) => {
        const parentItem = item;
        return <View style={{ marginTop: 10 }}>
            {this.displayComments(parentItem, false, parentItem.id, null)}
            {item.childComments && item.childComments.length > 0 && !this.state.showChildComments[item.id] && <View style={{ flexDirection: 'row', marginLeft: 40 }}>
                <View style={styles.horizontaline}></View>
                <LinkButton style={{ marginHorizontal: 10 }} title={`View ${item.childComments.length} ${item.childComments.length === 1 ? 'reply' : 'replies'}`} titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 13 }]} onPress={() => this.setState({ showChildComments: { [item.id]: true } })} />
                <View style={styles.horizontaline}></View>
            </View>
            }
            {this.state.showChildComments[item.id] && <View style={{ flexDirection: 'row', marginLeft: 40 }}>
                <View style={styles.horizontaline}></View>
                <LinkButton style={{ marginHorizontal: 10 }} title={`Hide ${item.childComments.length} ${item.childComments.length === 1 ? 'reply' : 'replies'}`} titleStyle={[APP_COMMON_STYLES.optionBtnTxt, { fontSize: 13 }]} onPress={() => this.setState({ showChildComments: { [item.id]: false } })} />
                <View style={styles.horizontaline}></View>
            </View>
            }
            {this.state.showChildComments[item.id] && <FlatList
                keyboardShouldPersistTaps="handled"
                data={item.childComments}
                style={{ marginTop: 15 }}
                inverted={true}
                extraData={this.state}
                keyExtractor={this.commentKeyExtractor}
                renderItem={({ item: childItem, index }) => this.displayComments(childItem, true, parentItem.id, childItem.id)}
            />}
        </View>
    }

    commentKeyExtractor = item => item.id;

    componentWillUnmount() {
        if (!this.props.isEditable && this.props.postData) {
            const { isLike, likesCount, commentCount } = this.state;
            const updateData = {
                isLike: isLike, numberOfLikes: likesCount,
                numberOfComments: commentCount, id: this.props.postData.id
            };
            this.props.updatePostData(updateData);
        }
    }

    openCommentPage = () => Actions.push(PageKeys.COMMENTS, {
        postId: this.props.postData.id, isEditable: this.props.isEditable, postType: this._postType,
        onUpdate: (commentsCount) => {
            this.fetchTopThreeComments();
            this.setState(prevState => ({ commentCount: commentsCount }));
            this.props.updateCommentsCount(this.props.postData.id, commentsCount)
        },post:this.props.postData
    });

    updateLikeCount = (count) => this.setState({ likesCount: count })

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

    openLikesPage = () => Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: this.props.postData.id, type: this._postType, onDismiss: this.updateLikeCount, openFriendsProfile: this.openFriendsProfile });

    onPressImage = (index) => this.setState({ selectedIndex: index, isVisiblePictureModal: true });

    hidePictureModal = () => this.setState({ isVisiblePictureModal: false });

    openDeleteModal = () => this.setState({ showDeleteModal: true });

    hideDeleteModal = () => this.setState({ showDeleteModal: false });

    render() {
        const { showOptionsModal, comments, commentCount, isVisiblePictureModal, selectedIndex, showCommentBox, isVisibleCommentMenu, enableDeleteOption, showDeleteModal } = this.state;
        const { postData, isEditable, user, apiCallsInProgress, isLoadedPostTypes } = this.props;
        console.log(postData,'!postData')
        if (!postData) return <BasePage />;
        return <BasePage heading={postData.title} headerRightIconProps={isEditable && postData.userId === this.props.user.userId
            ? { name: 'options', type: 'SimpleLineIcons', style: { color: '#fff', fontSize: 20 }, onPress: this.openOptionsModal }
            : null
        }>
            {/* {isVisiblePictureModal && <GesturedCarouselModal  isVisible={isVisiblePictureModal} onCancel={this.hidePictureModal}
                pictureIds={postData.pictureList}
                isGestureEnable={true}
                isZoomEnable={true}
                initialCarouselIndex={selectedIndex}
            />} */}
            
               {
                isVisiblePictureModal && <ImageViewer FooterComponent={(img)=>{
                    return   ( <View style={{ height: 100,backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                            <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={postData.pictureList[img.imageIndex].description} numberOfLines={2}/>
                            <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+postData.pictureList.length}</Text>
                            </View>)
                }} HeaderComponent={()=>{
                   return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'row',justifyContent:'flex-end',alignItems:'flex-end'}}>
                       <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                       <NBIcon name='close' fontSize={20}  style={{ color: '#fff'}} onPress={this.hidePictureModal} />
                       </View>
                   </View>
               }} visible={isVisiblePictureModal} images={postData.pictureList.map(image=>{
                       return {
                           ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                       }
                   })} onRequestClose={this.hidePictureModal} imageIndex={0} />
               } 
            
            {showOptionsModal && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={showOptionsModal} onCancel={this.hideOptionsModal} onPressOutside={this.hideOptionsModal}>
                <View>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        {/* <LinkButton disabled={apiCallsInProgress[postData.id]} style={APP_COMMON_STYLES.optionBtn} title='EDIT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openPostForm} /> */}
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={this.openDeleteModal} />
                    </View>
                    {showDeleteModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showDeleteModal} onCancel={this.hideDeleteModal} >
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
            </BaseModal>}
            {isVisibleCommentMenu && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleCommentMenu} onCancel={this.hideCommentMenuModal} onPressOutside={this.hideCommentMenuModal}>
                <View style={APP_COMMON_STYLES.optionsContainer}>
                    <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE COMMENT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.setState({ enableDeleteOption: true, isVisibleCommentMenu: false })} />
                </View>
            </BaseModal>}
            <KeyboardAvoidingView keyboardVerticalOffset={20} behavior={IS_ANDROID ? null : 'padding'} style={styles.fill}>
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                    {this.renderPostCard()}
                    {
                        showCommentBox
                            ? <View style={{ marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 27 }}>
                                    <DefaultText style={[styles.label, { marginLeft: 15 }]}>{user.name}</DefaultText>
                                    <LinkButton style={{}} title='CLOSE' titleStyle={styles.postCommentBtn} onPress={() => this.setState({ showCommentBox: false, commentText: '' })} />
                                </View>
                                <LabeledInputPlaceholder
                                    containerStyle={{ borderBottomWidth: 0, flex: 0 }}
                                    inputValue={this.state.commentText} inputStyle={{ paddingBottom: 0, }}
                                    outerContainer={{ marginTop: IS_ANDROID ? null : heightPercentageToDP(3), padding: 5, borderWidth: 1, borderColor: '#707070', borderRadius: 10, marginTop: 5, marginHorizontal: 27, flex: 0 }}
                                    returnKeyType='done'
                                    onChange={this.onChangeComment}
                                    hideKeyboardOnSubmit={true}
                                    onSubmit={this.postComment} />
                                <LinkButton style={{ alignSelf: 'center', marginTop: 5 }} title='POST COMMENT' titleStyle={styles.postCommentBtn} onPress={this.postComment} />
                            </View>
                            : enableDeleteOption
                                ? <LinkButton style={{ alignSelf: 'flex-end', marginRight: 25, marginTop: 10 }} title='CLOSE' titleStyle={[styles.postCommentBtn]} onPress={() => this.setState({ enableDeleteOption: false })} />
                                : <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 27, marginTop: 10 }}>
                                    <IconButton style={{ alignSelf: 'flex-start', justifyContent: 'space-between', }} title='ADD COMMENT' titleStyle={styles.addComment} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { color: '#F5891F', fontSize: 20 } }} onPress={() => this.setState({ showCommentBox: true })} />
                                    {comments && <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#B4B4B4', fontSize: 20 } }} onPress={this.showCommentMenuModal} />}
                                </View>
                    }
                    {comments && <FlatList
                        contentContainerStyle={{ paddingBottom: 10 }}
                        showsVerticalScrollIndicator={false}
                        data={comments.slice(0, 3)}
                        inverted={true}
                        keyExtractor={this.commentKeyExtractor}
                        renderItem={this.renderComments}
                    />}
                    {commentCount > 3 && <LinkButton style={{ alignSelf: 'center', marginBottom: 10 }} title={'View All'} titleStyle={{ color: '#B4B4B4', fontSize: 15 }} onPress={this.openCommentPage} />}
                </ScrollView>
            </KeyboardAvoidingView>
        </BasePage>
    }
}

const mapStateToProps = (state, props) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi, apiCallsInProgress, postTypes } = state.PageState;
    const { comment } = state.Journal;
    if (props.postData || props.comingFrom === PageKeys.NOTIFICATIONS) {
        return { user, hasNetwork, lastApi, isRetryApi, comment, apiCallsInProgress, isLoadedPostTypes: Object.keys(postTypes).length > 0 };
    } else {
        return { user, hasNetwork, lastApi, isRetryApi, comment, apiCallsInProgress, postData: getCurrentPostState(state, props), isLoadedPostTypes: Object.keys(postTypes).length > 0 };
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        deletePost: (postId, successCallback) => deletePost(postId).then(res => {
            dispatch(apiLoaderActions(false));
            dispatch(deleteJournalAction({ id: postId }));
            successCallback()
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
        }).catch(er => {
            console.log('deletePost error : ', er.response);
            handleServiceErrors(er, [postId, successCallback], 'deletePost', true, true);
            dispatch(apiLoaderActions(false));
        }),
        addComment: (postId, commentData, successCallback, errorCallback) => addComment(postId, commentData).then(res => {
            console.log('addComment success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('addComment error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [postId, commentData, successCallback, errorCallback], 'addComment', true, true);
        }),
        deleteComment: (commentId, userId, successCallback, errorCallback) => deleteComment(commentId, userId).then(res => {
            console.log('deleteComment success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('deleteComment error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [commentId, userId, successCallback, errorCallback], 'deleteComment', true, true);
        }),
        addLike: (postId, postType, isEditable, numberOfLikes, successCallback) => addLike(postId, postType).then(res => {
            console.log('addLike sucess : ', res);
            successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            isEditable && dispatch(updateLikeAndCommentAction({ isUpdateLike: true, isLike: true, id: postId, isAdded: true }));
        }).catch(er => {
            handleServiceErrors(er, [postId, postType, isEditable, numberOfLikes, successCallback], 'addLike', true, true);
            console.log('addLike error : ', er)
        }),
        unLike: (postId, userId, isEditable, numberOfLikes, successCallback) => unLike(postId, userId).then(res => {
            console.log('unLike sucess : ', res);
            successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            isEditable && dispatch(updateLikeAndCommentAction({ isUpdateLike: true, isLike: true, id: postId, isAdded: false }));
        }).catch(er => {
            handleServiceErrors(er, [postId, userId, isEditable, numberOfLikes, successCallback], 'unLike', true, true);
            console.log('unLike error : ', er)
        }),
        updateCommentsCount: (postId, numberOfComments) => dispatch(updateLikeAndCommentAction({ id: postId, numberOfComments })),
        getPostDetail: (postId, successCallback) => getPostDetail(postId).then(res => {
            console.log('\n\n\n postDetail success : ', res)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            handleServiceErrors(er, [postId, successCallback], 'getPostDetail', true, true);
            console.log('postDetail error : ', er)
        }),
        getComments: (postId, postType, pageNumber, preference, successCallback, errorCallback) => getComments(postId, postType, pageNumber, preference).then(res => {
            console.log('getComments success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getComments error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [postId, postType, pageNumber, preference, successCallback, errorCallback], 'getComments', true, true);
        }),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(PostDetail);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#FFFFFF'
    },
    listContent: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    rideCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    likesCont: {
        flexDirection: 'row'
    },
    postCardFtrTxtCont: {
        marginHorizontal: 26,
        marginVertical: 10,
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
    },
    horizontaline: {
        borderBottomWidth: 1,
        borderColor: '#ADADAD',
        width: 40,
        alignSelf: 'center'
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
});