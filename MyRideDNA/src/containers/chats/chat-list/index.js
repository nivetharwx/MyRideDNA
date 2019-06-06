import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TextInput, Animated, Text, Alert, Keyboard, FlatList, View, ImageBackground, ActivityIndicator,StatusBar } from 'react-native';
import { IconButton, LinkButton } from '../../../components/buttons';
import { widthPercentageToDP, heightPercentageToDP, PageKeys, APP_COMMON_STYLES } from '../../../constants';
import { ListItem, Left, Thumbnail, Body, Right, Icon as NBIcon, CheckBox, Toast } from 'native-base';
import { BasicHeader } from '../../../components/headers';

const CREATE_GROUP_WIDTH = widthPercentageToDP(9);
class ChatList extends Component {
    createSecAnim = new Animated.Value(CREATE_GROUP_WIDTH / 2);
    borderWidthAnim = new Animated.Value(0);
    defaultBtmOffset = widthPercentageToDP(8);
    constructor(props) {
        super(props);
        this.defaultBtmOffset = widthPercentageToDP(props.user.handDominance === 'left' ? 20 : 8);
        this.state = {
            selectedFriendList: [],
            isRefreshing: false,
            searchFriendList: [],
            newGroupName: null,
            kbdBtmOffset: this.defaultBtmOffset,
            isVisibleOptionsModal: false,
            selectedGroup: null,
            isLoading: false,
            isLoadingData: false,
        };
    }

    componentDidMount() {
        // this.props.getFriendGroups(this.props.user.userId, true);
      
    }

   

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.friendGroupList !== this.props.friendGroupList) {
        //     if (prevState.isRefreshing === true) {
        //         this.setState({ isRefreshing: false });
        //     }
        //     if (this.isAddingGroup) {
        //         /** TODO: Open group details page with last group added
        //          *  this.props.friendGroupList[this.props.friendGroupList.length - 1]
        //          **/
        //     }
        // }
        // if (this.props.refreshContent === true && prevProps.refreshContent === false) {
        //     // this.props.getFriendGroups(this.props.user.userId, true);
        //     this.props.getFriendGroups(this.props.user.userId, true, 0, (res) => {
        //     }, (err) => {
        //     });
        // }
    }
    onPullRefresh = () => {
        this.setState({ isRefreshing: true });
        // this.props.getFriendGroups(this.props.user.userId, false);
        this.props.getFriendGroups(this.props.user.userId, false, 0, (res) => {
        }, (err) => {
        });
    }

    
    componentWillUnmount() {
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedGroup: null })

    openGroupInfo = (index) => {
        this.state.isVisibleOptionsModal && this.setState({ isVisibleOptionsModal: false });
        if (this.borderWidthAnim.__getValue() > 0) {
            this.closeCreateGroupSection(() => Actions.push(PageKeys.GROUP, { grpIndex: index }));
        } else {
            Actions.push(PageKeys.GROUP, { grpIndex: index });
        }
    }



   
    renderGroup = ({ item, index }) => {
        return (
            <ListItem style={{ marginTop: 20 }} avatar onLongPress={() => this.showOptionsModal(index)} onPress={() => this.openGroupInfo(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.groupProfilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="group" type='FontAwesome' style={{ width: widthPercentageToDP(6) }} />
                    }
                </Left>
                <Body>
                    <Text>{item.groupName}</Text>
                    <Text note></Text>
                </Body>
                <Right>
                    <Text note></Text>
                </Right>
            </ListItem>
        );
    }



  

    groupKeyExtractor = (item) => item.groupId;

    friendKeyExtractor = (item) => item.userId;

    memberKeyExtractor = (item) => item.memberId;

   
    loadMoreData = () => {
        if (this.state.isLoadingData && this.state.isLoading === false) {
            this.setState({ isLoading: true, isLoadingData: false })
            this.props.getFriendGroups(this.props.user.userId, false, this.props.pageNumber, (res) => {
                this.setState({ isLoading: false })
            }, (err) => {
                this.setState({ isLoading: false })
            });
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
        return null
    }

    render() {
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={{ flex: 1 }}>
                    <BasicHeader title='Chat' rightIconProps={{ name: 'md-exit', type: 'Ionicons', style: { fontSize: widthPercentageToDP(8), color: '#fff' }, onPress: this.onPressLogout }} />
                    <ImageBackground source={require('../../../assets/img/profile-bg.png')} style={styles.backgroundImage} />    
                  </View>  
            </View>
        )
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return {user};
};
const mapDispatchToProps = (dispatch) => {
    return {
        createFriendGroup: (newGroupInfo) => dispatch(createFriendGroup(newGroupInfo)),
  
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChatList);

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    createGrpContainer: {
        position: 'absolute',
        // bottom: widthPercentageToDP(20),
        marginRight: widthPercentageToDP(20),
        marginLeft: widthPercentageToDP(12.5),
        width: 0,
    },
    createGrpActionSec: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    createGroupIcon: {
        marginLeft: -CREATE_GROUP_WIDTH / 2,
        backgroundColor: '#81BB41',
        justifyContent: 'center',
        alignItems: 'center'
    },
    createGrpChildSize: {
        width: CREATE_GROUP_WIDTH,
        height: CREATE_GROUP_WIDTH,
        borderRadius: CREATE_GROUP_WIDTH / 2,
    },
    memberList: {
        marginHorizontal: widthPercentageToDP(5),
        paddingTop: widthPercentageToDP(5)
    },
    backgroundImage: {
        height: null,
        width: null,
        flex: 1,
        alignItems: 'center',
        paddingTop: heightPercentageToDP(5)
    },
});


{/* <ListItem avatar>
                <Left>
                    {
                        item.groupProfilePictureThumbnail
                            ? < Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="group" type='FontAwesome' />
                    }
                </Left>
                <Body>
                    <Text>{item.groupName}</Text>
                    <Text note></Text>
                </Body>
                <Right>
                    <Text note>3</Text>
                </Right>
            </ListItem> */}