import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, FlatList, ActivityIndicator, Animated, Text } from 'react-native';
import { heightPercentageToDP, CUSTOM_FONTS, PageKeys, APP_COMMON_STYLES, GET_PICTURE_BY_ID, THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG, POST_TYPE, MEDIUM_TAIL_TAG, IS_ANDROID } from '../../constants';
import { connect } from 'react-redux';
import { DefaultText } from '../../components/labels';
import { BasePage } from '../../components/pages';
import { BasicHeader } from '../../components/headers';
import { IconButton, ImageButton, LinkButton } from '../../components/buttons';
import { PostCard } from '../../components/cards';
import { Actions } from 'react-native-router-flux';
import { addLike, getFriendNewsFeed, handleServiceErrors, unLike } from '../../api';
import { resetErrorHandlingAction, setCurrentFriendAction } from '../../actions';
import { GesturedCarouselModal } from '../../components/modal';
import ImageViewer from 'react-native-image-viewing'
import { Icon as NBIcon } from 'native-base';
const NUM_OF_DESC_LINES = 3;
class NewsFeed extends Component {
    _postType = "post";
    _rideType = 'ride'
    constructor(props) {
        super(props);
        this.state = {
            newsFeeds: [],
            showMoreSections: {},
            pageNumber: 0,
            isLoading: false,
            spinValue: new Animated.Value(0),
            hasRemainingList: false,
            isVisiblePictureModal: false,
            selectedPictureList: null
        }
    }

    componentDidMount() {
        console.log("******************  User *********************",this.props.user.userId)
        this.props.getFriendNewsFeed(this.props.user.userId, 0, (res) => {
            this.setState(prevState => ({ newsFeeds: res.newsFeed, isLoading: false, pageNumber: res.newsFeed.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }))
        }, (er) => {
        });
    }


    openPostFormPage = () => {
        Actions.push(PageKeys.POST_FORM, {
            comingFrom: PageKeys.NEWS_FEED, postType: POST_TYPE.JOURNAL,
            onUpdateSuccess: () => {
                this.props.getFriendNewsFeed(this.props.user.userId, 0, (res) => {
                    console.log("HELLLOO.............................",res.newsFeed)
                    this.setState({ newsFeeds: res.newsFeed })
                }, (er) => {
                });
            }
        })
    }

    onDescriptionLayout({ nativeEvent: { lines } }, id) {
        if (!this.state.showMoreSections[id]) {
            lines.length >= NUM_OF_DESC_LINES && this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: { numberOfLines: 3, isVisibleMoreButton: true } } }));
        }
    }
    onPressMoreButton = (id) => {
        this.setState(prevState => ({ showMoreSections: { ...prevState.showMoreSections, [id]: { numberOfLines: null, isVisibleMoreButton: false } } }))
    }

    openFriendsProfile = (item, isLike) => {
        if (isLike) {
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
        else {
            if (item.details.creatorId === this.props.user.userId) {
                Actions.push(PageKeys.PROFILE, { tabProps: { activeTab: 0 } });
            }
            else {
                this.props.setCurrentFriend({ userId: item.details.creatorId });
                Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.details.creatorId });
            }
        }
    }

    openLikesPage(post) { Actions.push(PageKeys.LIKES, { hasNetwork: this.props.hasNetwork, id: post.details.id, type: this._postType, openFriendsProfile: (res) => this.openFriendsProfile(res, true) }); }

    toggleLikeOrUnlike = (item) => {
        if (item.isLike) {
            this.props.unLike(item.details.id, this.props.user.userId, (res) => {
                this.setState({
                    newsFeeds: this.state.newsFeeds.map(feed => {
                        return feed.details.id === item.details.id
                            ? { ...feed, isLike: false, numberOfLikes: feed.numberOfLikes - 1 }
                            : feed
                    })
                })
            });
        } else {
            this.props.addLike(item.details.id, this._postType, (res) => {
                this.setState({
                    newsFeeds: this.state.newsFeeds.map(feed => {
                        return feed.details.id === item.details.id
                            ? { ...feed, isLike: true, numberOfLikes: feed.numberOfLikes + 1 }
                            : feed
                    })
                })
            });
        }
    }

    openCommentPage(post) {
        Actions.push(PageKeys.COMMENTS, {
            creatorId:post.details.creatorId,
            userId:this.props.user.userId,
            postId: post.details.id, isEditable: post.details.creatorId === this.props.user.userId ? true : false, postType: this._postType,
            onUpdatesuccess: (commentsCount) => {
                this.setState({
                    newsFeeds: this.state.newsFeeds.map(feed => {
                        return feed.details.id === post.details.id
                            ? { ...feed, numberOfComments: commentsCount }
                            : feed
                    })
                })
            },post:post
        });
    }

    onPressImage = (item) => {
        this.setState({ isVisiblePictureModal: true, selectedPictureList: item },()=>{
            console.log(this.state.selectedPictureList,'//// picture list')

        })
    }

    hidePictureModal = () => this.setState({ isVisiblePictureModal: false, selectedPictureList: null });

    getFormattedDate = (isoDateString = new Date().toISOString(), joinBy = ' ') => {
        const dateInfo = new Date(isoDateString).toString().substr(4, 12).split(' ');
        return `${dateInfo[0]} ${dateInfo[1]}, ${dateInfo[2]}`;
    }

    getFormattedTime = (dateTime) => {
        // var dateFirst = new Date();
        // var dateSecond = new Date(dateTime);
        // var timeDiff = Math.abs(dateSecond.getTime() - dateFirst.getTime());
        // var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        // if (new Date(dateTime).toLocaleDateString() === new Date().toLocaleDateString()) {
        //     const time = new Date(dateTime).toTimeString().substring(0, 5).split(':');
        //     let period = time[0] < 12 ? 'AM' : 'PM';
        //     if (time[0] > 12) {
        //         time[0] = time[0] - 12;
        //     }
        //     return `${time.join(':')} ${period}`;
        // }
        // else if (diffDays > 0 && diffDays < 7) {
        //     return `${diffDays} day ago`
        // }
        // else {
        //     return `${Math.floor(diffDays / 7)} week ago`
        // }
        return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    renderPostCard = ({ item }) => {
        return (<PostCard
            showLoader={this.props.apiCallsInProgress[item.id]}
            headerContent={<View style={[styles.rideCardHeader, { height: 50, flexDirection: 'row', ...APP_COMMON_STYLES.testingBorderx }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <ImageButton pictureStyle={{ resizeMode: null }} imgStyles={{ height: 40, width: 40, borderRadius: 20, overflow: 'hidden' }} imageSrc={item.details.profilePicture ? { uri: `${GET_PICTURE_BY_ID}${item.details.profilePicture.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` } : require('../../assets/img/profile-pic-placeholder.png')} onPress={() => this.openFriendsProfile(item)} />
                    <DefaultText style={styles.userName}>{item.details.creatorName}</DefaultText>
                </View>
            </View>}
            numberOfpicture={item.details.pictureList && item.details.pictureList ? item.details.pictureList && item.details.pictureList.length : null}
            numberOfPicUploading={item.numberOfPicUploading || null}
            image={item.details.pictureList && item.details.pictureList.length > 0 ? `${GET_PICTURE_BY_ID}${item.details.pictureList[0].id.replace(THUMBNAIL_TAIL_TAG, PORTRAIT_TAIL_TAG)}` : null}
            // placeholderImgHeight={190}
            postTitle={item.details.title}
            postDescription={item.details.description}
            onPress={() => (item.details.pictureList && item.details.pictureList.length > 0) ? this.onPressImage(item.details.pictureList) : null}
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
                        item.details.pictureList && item.details.pictureList.length > 0
                            ? <View>
                                <DefaultText style={styles.postCardFtrTitle}>{item.details.title}</DefaultText>
                                <DefaultText onTextLayout={(evt) => this.onDescriptionLayout(evt, item.details.id)} numberOfLines={this.state.showMoreSections[item.details.id] ? this.state.showMoreSections[item.details.id].numberOfLines : NUM_OF_DESC_LINES}>{item.details.description}</DefaultText>{this.state.showMoreSections[item.details.id] && this.state.showMoreSections[item.details.id].isVisibleMoreButton ? <LinkButton onPress={() => this.onPressMoreButton(item.details.id)} title={'more'} /> : null}
                            </View>
                            : null
                    }
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <DefaultText style={styles.postCardFtrDate}>{this.getFormattedDate(item.details.date)}</DefaultText>
                        <DefaultText style={styles.postCardFtrDate}>{this.getFormattedTime(item.details.date)}</DefaultText>
                    </View>
                </View>
            </View>}
        // onPress={() => this.openPostDetailPage(item)}
        />);
    }

    _keyExtractor = item => item.id;

    loadMoreData = ({ distanceFromEnd }) => {
        if (this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            this.props.getFriendNewsFeed(this.props.user.userId, this.state.pageNumber, (res) => {
                this.setState(prevState => ({ newsFeeds: [...this.state.newsFeeds, ...res.newsFeed], isLoading: false, pageNumber: res.newsFeed.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }))
            }, (er) => {
            });
        });
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

    render() {
        // console.log("*************************** Nav Props *******************************",this.props.navigation)
        const { newsFeeds, isVisiblePictureModal, selectedPictureList } = this.state;
        return (
            // <BasePage heading={'Newsfeed - Coming Soon!'} >
            //     <View style={{ flex: 1 }}>
            //         <ScrollView keyboardShouldPersistTaps={'handled'} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            //             <View style={styles.contentBody}>
            //                 <View style={{ flex: 1, backgroundColor: '#000' }}></View>
            //                 <ImageBackground source={require('../../assets/img/profile-bg.png')} style={{ width: '100%', height: '100%', flex: 1 }}  ></ImageBackground>
            //                 <ImageBackground source={require('../../assets/img/newsfeed.png')} style={{ width: '100%', height: '100%', position: 'absolute', width: 320, height: 330, left: 50, top: 50 }}  ></ImageBackground>
            //                 <View style={styles.placeholderTextCont}>
            //                     <DefaultText style={styles.placeholderText}> A place to share photos,</DefaultText>
            //                     <DefaultText style={styles.placeholderText}> rides and legendary</DefaultText>
            //                     <DefaultText style={styles.placeholderText}> stories form the road</DefaultText>
            //                 </View>
            //             </View>
            //         </ScrollView>
            //     </View>
            // </BasePage>
            <BasePage defaultHeader={false} >
                <View style={{ flex: 1 }}>
                    <BasicHeader
                        title='Road Feed'
                        leftIconProps={this.props.comingFrom === PageKeys.PROFILE ? { reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton } : { reverse: true, name: 'ios-notifications', type: 'Ionicons', onPress: () => Actions.push(PageKeys.NOTIFICATIONS) }}
                        rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', containerStyle: styles.headerRtIconContainer, style: styles.addIcon, onPress: () => this.openPostFormPage() }}
                        notificationCount={this.props.notificationCount}
                    />
                    {isVisiblePictureModal && 
                    <ImageViewer HeaderComponent={()=>{
                      return <View style={{height:IS_ANDROID?heightPercentageToDP(6):heightPercentageToDP(10),display:'flex',flexDirection:'row',backgroundColor:'rgba(0, 0, 0, 0.37)',justifyContent:'flex-end',alignItems:'flex-end'}}>
                          <View style={{width:50,height:50,display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                          <NBIcon name='close' fontSize={30} style={{ color: '#fff' }} onPress={this.hidePictureModal} />
                          </View>
                      </View>
                  }} images={this.state.selectedPictureList.map(image=>{
                        return {
                            ...image,uri: `${GET_PICTURE_BY_ID}${image.id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}`
                        }
                    })} keyExtractor={(imgaeSrc,index)=>{
                        return index
                    }} visible={isVisiblePictureModal} onRequestClose={this.hidePictureModal} FooterComponent={(img)=>{
                        console.log(img)
                        return   <View style={{ height: 100,backgroundColor:'rgba(0, 0, 0, 0.37)',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                                <DefaultText style={{ fontSize: 16, color: 'white',marginLeft:20 }} text={this.state.selectedPictureList[img.imageIndex].description} numberOfLines={2}/>
                                <Text style={{ fontSize: 16, color: 'white',textAlign:'center',marginBottom:19, }} >{(img.imageIndex+1)+' / '+this.state.selectedPictureList.length}</Text>
                                </View>
                    }} imageIndex={0} />
                    // ${GET_PICTURE_BY_ID}${pictureIds[activeIndex].id.replace(THUMBNAIL_TAIL_TAG, MEDIUM_TAIL_TAG)}
                    // <GesturedCarouselModal isVisible={isVisiblePictureModal} onCancel={this.hidePictureModal}
                    //     pictureIds={selectedPictureList}
                    //     isGestureEnable={true}
                    //     isZoomEnable={true}
                    //     initialCarouselIndex={0}
                    // />
                    }
                    <View style={{ marginTop: APP_COMMON_STYLES.headerHeight }}>
                        <FlatList
                            contentContainerStyle={{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }}
                            keyboardShouldPersistTaps={'handled'}
                            data={newsFeeds}
                            extraData={this.state}
                            keyExtractor={this._keyExtractor}
                            renderItem={this.renderPostCard}
                            ListFooterComponent={this.renderFooter}
                            onEndReached={this.loadMoreData}
                            onEndReachedThreshold={0.1}
                        />
                    </View>
                </View>
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { apiCallsInProgress } = state.PageState;
    const notificationCount=state.NotificationList.notificationList.totalUnseen
    return { user, apiCallsInProgress,notificationCount };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getFriendNewsFeed: (userId, pageNumber, successCallback, errorCallback) => getFriendNewsFeed(userId, pageNumber)
            .then(res => {
                console.log('\n\n\n getFriendNewsFeed success : ', res.data);
                successCallback(res.data);
            })
            .catch(er => {
                console.log('\n\n\n getFriendNewsFeed error : ', er);
                errorCallback(er)
            }),
        addLike: (postId, postType, successCallback) => addLike(postId, postType).then(res => {
            console.log('addLike sucess : ', res)
            typeof successCallback === 'function' && successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            handleServiceErrors(er, [postId, postType, successCallback], 'addLike', true, true);
            console.log('addLike error : ', er)
        }),
        unLike: (postId, userId, successCallback) => unLike(postId, userId).then(res => {
            console.log('unLike sucess : ', res);
            typeof successCallback === 'function' && successCallback()
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            handleServiceErrors(er, [postId, userId, successCallback], 'unLike', true, true);
            console.log('unLike error : ', er)
        }),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(NewsFeed);

const styles = StyleSheet.create({
    contentBody: {
        height: heightPercentageToDP(100),
        backgroundColor: '#fff',
        flex: 1,
    },
    placeholderTextCont: {
        position: 'absolute',
        bottom: 250,
        left: 70,
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeholderText: {
        color: '#F5891F',
        fontSize: 22,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    headerRtIconContainer: {
        height: 27,
        width: 27,
        backgroundColor: '#F5891F',
        borderRadius: 13.5
    },
    addIcon: {
        color: '#fff',
        fontSize: 19
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
    }
});