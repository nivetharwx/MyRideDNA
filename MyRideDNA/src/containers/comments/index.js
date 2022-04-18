import React, { Component } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { heightPercentageToDP, APP_COMMON_STYLES, CUSTOM_FONTS, IS_ANDROID, widthPercentageToDP, PageKeys } from '../../constants';
import { LinkButton, IconButton } from '../../components/buttons';
import { connect } from 'react-redux';
import { getComments, addComment, deleteComment, handleServiceErrors } from '../../api';
import { DefaultText } from '../../components/labels';
import { Toast } from 'native-base';
import { BaseModal } from '../../components/modal';
import { LabeledInputPlaceholder } from '../../components/inputs';
import { getFormattedDateFromISO } from '../../util';
import { BasePage } from '../../components/pages';
import { resetErrorHandlingAction } from '../../actions';

class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasRemainingList: false,
            showCommentBox: false,
            enableDeleteOption: false,
            commentText: '',
            isVisibleCommentMenu: false,
            pageNumber: 0,
            isLoading: false,
            comments: [],
            parentCommentId: null,
            showChildComments: {},
            numberOfComments: 0,
            mainParentCommentId: null
        }
    }

    componentDidMount() {        
        console.log("****************** comp did mount *************")
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.fetchComments(this.props.notificationBody.tragetId, this.props.notificationBody.reference.targetScreen === 'POST_DETAIL' ? 'post' : 'ride', this.state.pageNumber, 15,);
        }
        else {
            this.fetchComments(this.props.postId, this.props.postType, this.state.pageNumber, 15,);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("*********************** COmp did Update********  prevProps ,     ***********",prevProps.hasNetwork,prevProps.isRetryApi)
        console.log("*********************** COmp did Update********   , prevState    ***********",prevState)
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS && (this.props.notificationData && this.state.comments.some(item => item.id === this.props.notificationData.id) === false)) {
            this.setState(prevState = ({ comments: [this.props.notificationData, ...this.state.comments], numberOfComments: prevState.numberOfComments + 1 }), () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments))
        }
        if (prevProps.hasNetwork === false && this.props.hasNetwork === true) {
            // this.retryApiFunc();
            this.fetchComments(this.props.postId, this.props.postType, this.state.pageNumber, 15,);
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

    // retryApiFunction=()=>{

    // }


    fetchComments(postId, postType, pageNumber, preference) {
        this.props.getComments(postId, postType, pageNumber, preference, (data) => {
            data.comments.length > 0
                ? this.setState(prevState => ({
                    isLoading: false,
                    pageNumber: prevState.pageNumber + 1,
                    hasRemainingList: data.remainingList > 0,
                    comments: prevState.pageNumber === 0 ? data.comments : [...prevState.comments, ...data.comments],
                    numberOfComments: data.numberOfComments
                }))
                : this.setState({ isLoading: false, hasRemainingList: false });
        }, (er) => { })
    }

    commentKeyExtractor = (item) => item.id;

    onChangeComment = (val) => this.setState({ commentText: val });

    showCommentMenuModal = () => this.setState({ isVisibleCommentMenu: true });

    hideCommentMenuModal = () => this.setState({ isVisibleCommentMenu: false });

    postComment = () => {
        if (this.state.commentText.trim().length === 0) Toast.show({ text: 'Enter some text' });
        else {
            const parentCommentId = this.state.parentCommentId;
            const mainParentCommentId = this.state.mainParentCommentId
            let commentData = { text: this.state.commentText, referenceType: this.props.notificationBody ? this.props.notificationBody.reference.targetScreen === 'POST_DETAIL' ? 'post' : 'ride' : this.props.postType, userId: this.props.user.userId };
            if (parentCommentId) {
                commentData.parentCommentId = parentCommentId;
            }
            console.log('\n\n\n parentCommentId : ', parentCommentId)
            console.log('\n\n\n mainParentCommentId : ', mainParentCommentId)
            this.setState({ showCommentBox: false, commentText: '', parentCommentId: null, mainParentCommentId: null });
            this.props.addComment(this.props.notificationBody ? this.props.notificationBody.tragetId : this.props.postId, commentData, (res) => {
                if (parentCommentId) {
                    this.setState(prevState => ({
                        comments: this.state.comments.map(item => {
                            if(item.id === mainParentCommentId){
                                const childCommentIndex = item.childComments?item.childComments.findIndex(childCmnt=>childCmnt.id === parentCommentId):-1;
                                console.log('\n\n\n childCommentIndex : ', childCommentIndex)
                                return   { ...item, childComments: item.childComments ?childCommentIndex>-1 ?[...item.childComments.slice(0,childCommentIndex),res.data,...item.childComments.slice(childCommentIndex)]:[...item.childComments, res.data] : [res.data] }
                            }
                            else{
                                return item
                            }
                            // return item.id === mainParentCommentId ?
                            //     { ...item, childComments: item.childComments ? [res.data, ...item.childComments] : [res.data] }
                            //     : item
                        }), numberOfComments: prevState.numberOfComments + 1
                    }),
                        () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
                }
                else {
                    this.setState(prevState => ({ comments: [res.data, ...prevState.comments,], numberOfComments: prevState.numberOfComments + 1 }),
                        () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
                }
            }, (er) => { });
        }
    }

    deleteComment = (parentId, childId, isChildComment) => {
        this.props.deleteComment(isChildComment ? childId : parentId, this.props.user.userId, (res) => {
            console.log('\n\n\n res.data : ', res.data)
            if (isChildComment) {
                this.setState(prevState => {
                    const comments = this.state.comments.map(item => {
                        return item.id === parentId
                            ? { ...item, childComments: item.childComments.filter(({ id }) => id !== childId) }
                            : item
                    });
                    return { comments: comments, enableDeleteOption: comments.length > 0, numberOfComments: prevState.numberOfComments - res.data.deletedCommentsCount }
                }, () => this.props.onUpdatesuccess && this.props.onUpdatesuccess(this.state.numberOfComments));
            }
            else {
                this.setState(prevState => {
                    const comments = prevState.comments.filter(({ id }) => id !== parentId);
                    return { comments: comments, enableDeleteOption: comments.length > 0, numberOfComments: prevState.numberOfComments - res.data.deletedCommentsCount }
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

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.hasRemainingList === false || this.state.isLoading === true || distanceFromEnd < 0) return;
        if (this.props.comingFrom === PageKeys.NOTIFICATIONS) {
            this.setState({ isLoading: true }, () => this.fetchComments(this.props.notificationBody.tragetId, this.props.notificationBody.reference.targetScreen === 'POST_DETAIL' ? 'post' : 'ride', this.state.pageNumber, 15,));

        }
        else {
            this.setState({ isLoading: true }, () => this.fetchComments(this.props.postId, this.props.postType, this.state.pageNumber, 15,));
        }

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
        return null;
    }

    displayComments = (item, ischildComment, parentId, childId) => {
    //     console.log("+++++++++++++  ITEM +++++++++++++++++++++", item.userId)
    //   console.log("******************ENABLE DEL @@@@****************",this.props.userId)
    //   console.log("******************ENABLE DEL &&&&&****************",this.props.creatorId)
    //   console.log("******************ENABLE DEL ****************",this.props.post)
        const { enableDeleteOption } = this.state;
        const { isEditable,post } = this.props;
        return <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: ischildComment ? 70 : 17, marginRight: 27 }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
                {enableDeleteOption && ((this.props.user.userId ===  this.props.creatorId) ||(this.props.user.userId===item.userId))? <IconButton style={{ marginRight: 10, alignSelf: 'center' }} iconProps={{ name: 'ios-close-circle', type: 'Ionicons', style: { color: '#CE0D0D', fontSize: 17 } }} onPress={() => this.deleteComment(parentId, childId, ischildComment)} /> : <View style={{ marginRight: 22 }} />}
                {/* {enableDeleteOption && ((post.userId?post.userId:post.creatorId) === (this.props.user.userId)|| item.userId === this.props.user.userId) ? <IconButton style={{ marginRight: 10, alignSelf: 'center' }} iconProps={{ name: 'ios-close-circle', type: 'Ionicons', style: { color: '#CE0D0D', fontSize: 17 } }} onPress={() => this.deleteComment(parentId, childId, ischildComment)} /> : <View style={{ marginRight: 22 }} />} */}
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



    render() {
        const { user } = this.props;
        console.log("***************************** NotificationData ************************",this.props.creatorId,this.props.userId)
        const { showCommentBox, enableDeleteOption, isVisibleCommentMenu, comments } = this.state;
        return (
            <BasePage heading={'Comments'} rootContainerSafePadding={20}>
                {isVisibleCommentMenu && <BaseModal containerStyle={APP_COMMON_STYLES.optionsModal} isVisible={isVisibleCommentMenu} onCancel={this.hideCommentMenuModal} onPressOutside={this.hideCommentMenuModal}>
                    <View style={APP_COMMON_STYLES.optionsContainer}>
                        <LinkButton style={APP_COMMON_STYLES.optionBtn} title='DELETE COMMENT' titleStyle={APP_COMMON_STYLES.optionBtnTxt} onPress={() => this.setState({ enableDeleteOption: true, isVisibleCommentMenu: false })} />
                    </View>
                </BaseModal>}
                <View style={{}}>
                    {
                        showCommentBox
                            ? <View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 27 }}>
                                    <DefaultText style={[styles.label, { marginLeft: 15 }]}>{user.name}</DefaultText>
                                    <LinkButton style={{}} title='CLOSE' titleStyle={styles.postCommentBtn} onPress={() => this.setState({ showCommentBox: false, commentText: '', parentCommentId: null, mainParentCommentId: null })} />
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
                                ? <LinkButton style={[{ alignSelf: 'flex-end', marginRight: 25 }, styles.contentBody]} title='CLOSE' titleStyle={[styles.postCommentBtn]} onPress={() => this.setState({ enableDeleteOption: false })} />
                                : <View style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 27 }, styles.contentBody]}>
                                    <IconButton style={{ alignSelf: 'flex-start', justifyContent: 'space-between', }} title='ADD COMMENT' titleStyle={styles.addComment} iconProps={{ name: 'ios-add-circle', type: 'Ionicons', style: { color: '#F5891F', fontSize: 20 } }} onPress={() => this.setState({ showCommentBox: true })} />
                                    { comments && comments.length > 0 && <IconButton iconProps={{ name: 'options', type: 'SimpleLineIcons', style: { color: '#B4B4B4', fontSize: 20 } }} onPress={this.showCommentMenuModal} />}
                                </View>
                    }
                    {comments && comments.length > 0 && <FlatList
                        keyboardShouldPersistTaps="handled"
                        style={{ marginTop: 30, marginBottom: 50 }}
                        contentContainerStyle={{ paddingTop: 50 }}
                        data={comments}
                        inverted={true}
                        extraData={enableDeleteOption}
                        keyExtractor={this.commentKeyExtractor}
                        renderItem={this.renderComments}
                        ListFooterComponent={this.renderFooter}
                        onEndReached={this.loadMoreData}
                        onEndReachedThreshold={0.1}
                    />}
                    {
                        this.props.hasNetwork === false && ((comments && comments.length === 0 || !comments)) && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(20), left: widthPercentageToDP(27), height: 100, }}>
                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                        </View>
                    }

                </View>
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork, lastApi, isRetryApi } = state.PageState
    return { user, hasNetwork, lastApi, isRetryApi };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getComments: (postId, postType, pageNumber, preference, successCallback, errorCallback) => getComments(postId, postType, pageNumber, preference).then(res => {
            console.log('getComments success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res.data)
        }).catch(er => {
            console.log('getComments error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [postId, postType, pageNumber, preference, successCallback, errorCallback], 'getComments', true, true);
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
            console.log('deleteComment success : ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }));
            successCallback(res)
        }).catch(er => {
            console.log('deleteComment error : ', er)
            errorCallback(er)
            handleServiceErrors(er, [commentId, userId, successCallback, errorCallback], 'deleteComment', true, true);
        }),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'chat_search', isRetryApi: state })),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Comment);
const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    thumbnail: {
        height: 40,
        width: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    name: {
        alignSelf: 'center',
        color: '#1D527C',
        fontFamily: CUSTOM_FONTS.robotoBold,
        fontSize: 14,
        marginLeft: 10
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
    }
});