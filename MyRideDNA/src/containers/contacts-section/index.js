import React, { PureComponent } from 'react';
import { View, StatusBar, Animated, Keyboard, FlatList, ActivityIndicator, Text, AppState, ScrollView, Alert, Share, NativeModules, TouchableOpacityBase, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { BasicHeader } from '../../components/headers';
import { Actions } from 'react-native-router-flux';
import { Icon as NBIcon, Tabs, Tab, TabHeading, ScrollableTab, Item, Toast, ListItem, Left, Body, Thumbnail, Right, CheckBox } from 'native-base';
import styles from './styles';
import { APP_COMMON_STYLES, widthPercentageToDP, heightPercentageToDP, IS_ANDROID, RELATIONSHIP, PageKeys, CUSTOM_FONTS, GET_PICTURE_BY_ID } from '../../constants';
import { IconLabelPair, DefaultText } from '../../components/labels';
import { IconButton, LinkButton, BasicButton } from '../../components/buttons';
import { HorizontalCard } from '../../components/cards';
import Contacts from 'react-native-contacts';
import Permissions from 'react-native-permissions';
import { searchForFriend, sendFriendRequest, sendInvitation, cancelFriendRequest, approveFriendRequest, rejectFriendRequest, handleServiceErrors, invitationStatus, getAllFriendsForGroup } from '../../api';
import { clearSearchFriendListAction, resetFriendRequestResponseAction, resetInvitationResponseAction, updateSearchListAction, updateFriendRequestResponseAction, updatePageNumberAction, resetErrorHandlingAction, replaceSearchListAction, setCurrentFriendAction } from '../../actions';
import { isValidEmailFormat } from '../../util';
import { LabeledInputPlaceholder, SearchBoxFilter } from '../../components/inputs';
import { Loader } from '../../components/loader';
import { BasePage } from '../../components/pages';
import { SearchMember } from './search-member';
import { BaseModal } from '../../components/modal';
import SendSMS from 'react-native-sms'

const CONTACTS_PER_PAGE = 10;
class ContactsSection extends PureComponent {
    searchQueryTimeout = null;
    filterProps = { searchType: 'fullSearch' };
    _allContacts = [];
    constructor(props) {
        super(props);
        this.state = {
            activeTab: 0,
            canSubmit: false,
            recieverEmail: '',
            hasOpenedSettings: false,
            searchName: '',
            selectedMember: null,
            userEnteredEmail: '',
            customMessage: '',
            spinValue: new Animated.Value(0),
            isLoading: false,
            selectedFriendList: [],
            deviceContacts: [],
            pageNumber: 0,
            hasRemainingList: false,
            isVisibleConfirmationModal: false,
            selectedContact: null,
            showRequestModal: false,
            selectedPerson: null,
            isMemberSelected: false,
            inviteText: 'MyRideDNA/Ayush \n use this link to download the app and start riding'
        };
    }

    async componentDidMount() {
        console.log(this.props.filter,'this.props.filter')
        if (this.props.comingFrom === PageKeys.GROUP) {
            this.filterProps = { searchType:'members' , groupId: this.props.groupId ? this.props.groupId : undefined };
            this.props.searchForFriend('', this.props.user.userId, this.state.pageNumber, 10, this.filterProps, this.props.addedMembers, (res)=>{

                this.setState(prevState => ({ isLoading: false, pageNumber:  1 , hasRemainingList: res.remainingList > 0 }));
            },(er)=>{
                this.setState({isLoading:false})
            });
            return;
        } else{
            this.filterProps={ searchType: 'fullSearch' }
            this.props.searchForFriend('', this.props.user.userId, this.state.pageNumber, 10, { searchType: 'fullSearch' }, this.props.addedMembers, (res)=>{
                console.log(res)
                this.setState(prevState => ({ isLoading: false, pageNumber:  1 , hasRemainingList: res.remainingList > 0 }));
            },(er)=>{
                this.setState({isLoading:false})
            });
           
        }
        
        AppState.addEventListener('change', this.handleAppStateChange);
        try {
            IS_ANDROID
                ? await Permissions.request(Permissions.PERMISSIONS.ANDROID.READ_CONTACTS)
                : await Permissions.request(Permissions.PERMISSIONS.IOS.CONTACTS);
            this.readDeviceContacts();
        } catch (er) {
            console.log("Error: ", er);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // if (prevProps.searchResults !== this.props.searchResults) {
        //     console.log('entered the update')
        //     // if ((this.state.searchName + '').trim() === '' && this.props.searchResults.length > 0) {
        //     //     this.props.searchForFriend('', this.props.user.userId, this.state.pageNumberAllFriends, 10, { searchType: 'friends' }, this.props.addedMembers, (res)=>{
        //     //         this.setState(prevState => ({ isLoading: false, pageNumberAllFriends:  prevState.pageNumberAllFriends + 1 , hasRemainingList: res.remainingList > 0 }));
        //     //     },(er)=>{
        //     //         this.setState({isLoading:false})
        //     //     });
        //     // }
        // }
        if (prevProps.friendRequestSuccess !== this.props.friendRequestSuccess) {
            if (this.props.friendRequestSuccess !== null) {
                Toast.show({
                    text: "Friend request sent successfully",
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                    onClose: () => this.props.clearFriendRequestResponse()
                });
                this.setState({ selectedMember: null, searchName: null, userEnteredEmail: '', customMessage: '', canSubmit: false });
            }
        } else if (prevProps.friendRequestError !== this.props.friendRequestError) {
            if (this.props.friendRequestError !== null) {
                Toast.show({
                    text: this.props.friendRequestError.userMessage,
                    buttonText: 'Okay',
                    position: 'bottom',
                    type: 'danger',
                    onClose: () => this.props.clearFriendRequestResponse()
                });
            }
        }
        if (prevProps.invitationSuccess !== this.props.invitationSuccess) {
            if (this.props.invitationSuccess !== null) {
                Toast.show({
                    text: "Request sent successfully",
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                    onClose: () => this.props.clearInvitationResponse()
                });
                this.setState({ selectedMember: null, searchName: null, userEnteredEmail: '', customMessage: '', canSubmit: false });
            }
        } else if (prevProps.invitationError !== this.props.invitationError) {
            if (this.props.invitationError !== null) {
                Toast.show({
                    text: this.props.invitationError.userMessage,
                    buttonText: 'Okay',
                    position: 'bottom',
                    type: 'danger',
                    onClose: () => this.props.clearInvitationResponse()
                });
            }
        }

        if (prevState.deviceContacts.length !== this.state.deviceContacts.length) {
            const invitationDetail = {
                userId: this.props.user.userId,
                emailIds: this.state.deviceContacts.map(contact => contact.email).filter(item => item)
            }
            this.props.invitationStatus(invitationDetail, (res) => {
                this.setState({ deviceContacts: this.state.deviceContacts.map(contact => { return { ...contact, status: res[contact.email] } }) })
            })
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

    readDeviceContacts = () => {
        // Contacts.getAll((err, allContacts) => {
        //     if (err === 'denied') {
        //         Toast.show({
        //             text: 'Please accept request to access your contacts',
        //             buttonText: 'OK',
        //             duration: 2000,
        //             onClose: async (e) => {
        //                 if (e === 'user') {
        //                     await Permissions.openSettings();
        //                     this.setState({ hasOpenedSettings: true });
        //                 }
        //             }
        //         });
        //         return;
        //     }
        //     const { contacts, omittedCount } = allContacts.reduce((contactInfoObj, contact) => {
        //         if (contact.emailAddresses.length === 0) {
        //             contactInfoObj.omittedCount += 1;
        //         } else {
        //             contactInfoObj.contacts.push({
        //                 id: contact.recordID,
        //                 thumbnailPath: contact.thumbnailPath,
        //                 email: contact.emailAddresses.length > 0 ? contact.emailAddresses[0].email : null,
        //                 name: contact.givenName ? contact.middleName ? contact.givenName + contact.middleName : contact.givenName : '',
        //                 note: contact.note
        //             })
        //         }
        //         return contactInfoObj;
        //     }, { contacts: [], omittedCount: 0 });
        //     this._allContacts = contacts.sort((a, b) => {
        //         if (a.name < b.name) return -1;
        //         if (a.name > b.name) return 1;
        //         return 0;
        //     });
        //     const newContacts = this._allContacts.slice(0, CONTACTS_PER_PAGE);
        //     // TODO: Call api to get information about new contacts
        //     setTimeout(() => this.setState({ deviceContacts: newContacts, pageNumber: 1 }), 300);
        //     // if (this._allContacts.length === 0) Toast.show({ text: 'There are no contacts with email id', duration: 2000 });
        //     // else if (omittedCount > 0) Toast.show({ text: `${omittedCount} contacts does not have email id`, duration: 2000 });
        // });
        Contacts.getAll()
            .then(allContacts => {
                console.log('\n\n\n allContacts : ', allContacts)
                const { contacts, omittedCount } = allContacts.reduce((contactInfoObj, contact) => {
                    if(contact.givenName=="Nitesh"){
                        console.log(contact.givenName)
                    }
                    if (contact.emailAddresses.length === 0 && contact.phoneNumbers.length === 0) {
                        contactInfoObj.omittedCount += 1;
                    } else {
                        contactInfoObj.contacts.push({
                            id: contact.recordID,
                            thumbnailPath: contact.thumbnailPath,
                            phoneNumber: contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].number : null,
                            email: contact.emailAddresses.length > 0 ? contact.emailAddresses[0].email : null,
                            name: contact.displayName?contact.displayName : (contact.givenName ? (contact.middleName ? contact.familyName ? contact.givenName +' '+ contact.middleName+' '+contact.familyName : contact.givenName +' '+ contact.middleName : contact.givenName ): ''),
                            note: contact.note
                        })
                    }
                    return contactInfoObj;
                }, { contacts: [], omittedCount: 0 });
                this._allContacts = contacts.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                console.log('\n\n\n  this._allContacts:', this._allContacts)
                // const newContacts = this._allContacts.slice(0, CONTACTS_PER_PAGE);
                // TODO: Call api to get information about new contacts
                // setTimeout(() => this.setState({ deviceContacts: newContacts, pageNumber: 1 }), 100);
                this.setState({ deviceContacts: this._allContacts, pageNumber: 1 })
                // if (this._allContacts.length === 0) Toast.show({ text: 'There are no contacts with email id', duration: 2000 });
                // else if (omittedCount > 0) Toast.show({ text: `${omittedCount} contacts does not have email id`, duration: 2000 });

            })
            .catch(e => {
                this.setState({ loading: false });
            });
    }

    handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            if (this.state.hasOpenedSettings) {
                this.setState({ hasOpenedSettings: false });
                this.readDeviceContacts();
            }
        }
       
    }

    contactKeyExtractor = (item) => item.id;

    renderDeviceContact = ({ item, index }) => {
        return <ListItem disabled={item.email === null} avatar style={{ marginLeft: 0 }}>
            <Left style={{ paddingLeft: 5 }}>
                {
                    item.thumbnailPath
                        ? <Thumbnail source={{ uri: item.thumbnailPath }} />
                        : <View style={{ alignItems: 'center', justifyContent: 'center', width: widthPercentageToDP(10), height: widthPercentageToDP(10), borderWidth: 2, borderColor: '#6B7663', borderRadius: widthPercentageToDP(5), backgroundColor: item.email === null ? '#6B7663' : '#FFF' }}>
                            <DefaultText style={{ color: item.email === null ? '#FFF' : '#6B7663', fontFamily: CUSTOM_FONTS.robotoBold }}>{item.name.charAt(0)}</DefaultText>
                        </View>
                }
            </Left>
            <Body>
                <DefaultText>{item.name}</DefaultText>
                {
                    item.note
                        ? <DefaultText note>{item.note}</DefaultText>
                        : null
                }
            </Body>
            <Right style={{ borderBottomWidth: 0 }}>

            </Right>
        </ListItem>
    }

    componentWillUnmount() {
        this.props.clearSearchResults();
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    onPressBackButton = () => {
        Actions.pop();
    }

    onChangeTab = ({ from, i }) => {
        this.setState({ activeTab: i });
    }

    searchResultsKeyExtractor = (item) => item.userId || item.id;

    selectCommunityMember = (index) => {
        Keyboard.dismiss();
        this.setState({
            selectedMember: this.props.searchResults[index],
            searchName: this.props.searchResults[index].name,
            canSubmit: true
        }, () => {
            this.props.clearSearchResults();
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
        return null
    }

    loadMoreContacts = ({ distanceFromEnd }) => {
        if (this._allContacts.length - this.state.deviceContacts.length === 0 || this.state.isLoading === true || distanceFromEnd < 0) return;
        this.setState({ isLoading: true }, () => {
            const newContacts = this._allContacts.slice(this.state.deviceContacts.length, (this.state.pageNumber + 1) * CONTACTS_PER_PAGE);
            // TODO: Call api to get information about new contacts
            setTimeout(() => this.setState(prevState => ({ deviceContacts: [...prevState.deviceContacts, ...newContacts], isLoading: false, pageNumber: prevState.pageNumber + 1 })), 300);
        });
    }

    loadMoreData = ({ distanceFromEnd }) => {
        console.log(distanceFromEnd)
        if (this.state.isLoading === true || !this.state.hasRemainingList ) return;
        this.setState({ isLoading: true });
        this.props.searchForFriend(this.state.searchName, this.props.user.userId, this.state.pageNumber, 10, this.filterProps, this.props.addedMembers, this.fetchSuccessCallback, this.fetchErrorCallback);
    }

    fetchSuccessCallback = (res) => {
        this.setState(prevState => ({ isLoading: false, pageNumber: res.userList.length > 0 ? prevState.pageNumber + 1 : prevState.pageNumber, hasRemainingList: res.remainingList > 0 }));
    }

    fetchErrorCallback = (er) => {
        this.setState({ isLoading: false });
    }

    onChangeSearchQuery = (val) => {
        this.setState({ searchQuery: val });
    }

    onClearUserEnteredEmail = () => this.setState({ userEnteredEmail: '', canSubmit: false });

    onClearCustomMessage = () => this.setState({ customMessage: '' });

    searchInCommunity = (val) => {
        clearTimeout(this.searchQueryTimeout);
        this.setState({ searchName: val });
        this.searchQueryTimeout = setTimeout(() => {
            // if (this.state.searchName !== '') {
                this.props.searchForFriend(val, this.props.user.userId, 0, 10, this.filterProps, this.props.addedMembers, (res)=>{
                    this.setState(prevState => ({ isLoading: false, pageNumber: 1 , hasRemainingList: res.remainingList > 0 }));
                },(er)=>{
                    this.setState({isLoading:false})
                });
            // } else {
            //     this.props.searchForFriend('', this.props.user.userId, 0, 10,this.filterProps, this.props.addedMembers, (res)=>{
            //         this.setState(prevState => ({ isLoading: false, pageNumber: 1 , hasRemainingList: res.remainingList > 0 }));
            //     },(er)=>{
            //         this.setState({isLoading:false})
            //     });
            // }
        }, 300);
    }

    onChangeEmail = (val) => this.setState({ userEnteredEmail: val });

    onChangeCustomMessage = (val) => this.setState({ customMessage: val });

    validateEmail = () => {
        if (this.state.userEnteredEmail !== '' && isValidEmailFormat(this.state.userEnteredEmail)) {
            this.setState({ canSubmit: true });
        }
    }

    sendInvitationOrRequest = () => {
        if (this.state.selectedMember !== null) {
            this.sendFriendRequest();
        } else {
            this.sendFriendInvitation();
        }
    }

    openChatPage = (person) => {
        person['isGroup'] = false;
        person['id'] = person.userId;
        Actions.push(PageKeys.CHAT, { chatInfo: person });
    }

    sendFriendRequest = (selectedMember = this.state.selectedMember) => {
        const { user } = this.props;
        const requestBody = {
            senderId: user.userId,
            senderName: user.name,
            senderNickname: user.nickname,
            senderEmail: user.email,
            userId: selectedMember.userId,
            name: selectedMember.name,
            nickname: selectedMember.nickname,
            email: selectedMember.email,
            actionDate: new Date().toISOString()
        };
        this.props.sendFriendRequest(requestBody);
    }

    cancelingFriendRequest = (item) => {
        this.props.cancelRequest(this.props.user.userId, item.userId, (res) => {
            this.hideRequestModal();
        }, (er) => {

        });
    }

    approvingFriendRequest = (item) => {
        this.props.approvedRequest(this.props.user.userId, item.userId, new Date().toISOString());
    }
    rejectingFriendRequest = (item) => {
        this.props.rejectRequest(this.props.user.userId, item.userId);
    }

    sendFriendInvitation = () => {
        if (!this.state.selectedContact.email) return;
        if (this.state.selectedContact.status === RELATIONSHIP.SENT_REQUEST || this.state.selectedContact.status === RELATIONSHIP.INVITED) {
            const contactedSelected = this.state.selectedContact
            this.setState({ isVisibleConfirmationModal: false, selectedContact: null }, () => {
                Toast.show({
                    text: `You have already sent Request to ${contactedSelected.name} `,
                    buttonText: 'Okay',
                    type: 'success',
                    position: 'bottom',
                });
            })
            return;
        }
        // TODO: Pass proper params customMessage, email, userId
        // TODO: Check this.state.customMessage add default message if empty
        const { user } = this.props;
        let invitationData = {
                 senderId: user.userId,
                 receiver: [
                     {
                         name:this.state.selectedContact.name,
                         email:this.state.selectedContact.email
                     }
                 ],
            senderEmail: user.email,
            senderName: user.name,
        }
        console.log('\n\n\n invitationData : ', invitationData)
        this.props.sendInvitation(invitationData, (res) => {
            console.log('res : ', res)
            this.setState({
                deviceContacts: this.state.deviceContacts.map(contact => {
                    return contact.email === this.state.selectedContact.email ?
                        { ...contact, status: res === RELATIONSHIP.SENT_REQUEST ? RELATIONSHIP.SENT_REQUEST : RELATIONSHIP.INVITED }
                        : contact
                }),
                isVisibleConfirmationModal: false,
                selectedContact: null
            })
        }, (er) => {
            this.setState({ isVisibleConfirmationModal: false })
        })
    }

    renderCommunityMember = ({ item, index }) => {
        return (
            <ListItem avatar onPress={() => this.selectCommunityMember(index)}>
                <Left style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {
                        item.profilePictureThumbnail
                            ? <Thumbnail source={{ uri: 'Image URL' }} />
                            : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(6), color: '#fff' }} />
                    }
                </Left>
                <Body>
                    <DefaultText style={{ color: '#fff' }}>{item.name}</DefaultText>
                    <DefaultText style={{ color: '#fff' }} note></DefaultText>
                </Body>
                <Right>

                </Right>
            </ListItem>
        );
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

    retryApiFunction = () => {
        this.state.spinValue.setValue(0);
        Animated.timing(this.state.spinValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear,
            useNativeDriver: true
        }).start(() => {
            if (this.props.hasNetwork === true) {
                this.props.searchForFriend(this.state.searchName, this.props.user.userId, this.props.pageNumber, 10, this.filterProps, this.props.addedMembers);
            }
        });

    }

    renderIconOnOffline = (spin) => {
        return (<View style={{ flex: 1, position: 'absolute', top: 23 }}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <IconButton iconProps={{ name: 'reload', type: 'MaterialCommunityIcons', style: { color: 'black', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(15), flex: 1, marginLeft: widthPercentageToDP(40) } }} onPress={this.retryApiFunction} />
            </Animated.View>
            <DefaultText style={{ marginLeft: widthPercentageToDP(13), fontSize: heightPercentageToDP(4.5) }}>No Internet Connection</DefaultText>
            <DefaultText style={{ marginTop: heightPercentageToDP(2), marginLeft: widthPercentageToDP(25) }}>Please connect to internet </DefaultText>
        </View>);
    }

    toggleFriendSelection = (index) => {
        let prevIndex = -1;
        // const searchFriendMemberId = this.props.filter ? this.props.searchResults.filter(p => p.relationship === this.props.filter)[index].userId : this.props.searchResults[index].userId;
        this.setState(prevState => {
            prevIndex = prevState.selectedFriendList.findIndex(selFriend => this.props.searchResults[index].userId === selFriend.userId);
            if (prevIndex === -1) {
                return {
                    selectedFriendList: [
                        ...prevState.selectedFriendList,
                        this.props.searchResults[index]
                    ]
                }
            } else {
                return {
                    selectedFriendList: [
                        ...prevState.selectedFriendList.slice(0, prevIndex),
                        ...prevState.selectedFriendList.slice(prevIndex + 1)
                    ]
                }
            }
        });
    }
    selectedMember = () => {
        this.props.selectedMembers(this.state.selectedFriendList);
        Actions.pop();
        this.setState({ selectedFriendList: [] });
    }

    getRightIconProps = (item) => {
        if (item.relationship === RELATIONSHIP.UNKNOWN) {
            return { righticonImage: require('../../assets/img/add-friend-from-community.png') }
        }
        else if (item.relationship === RELATIONSHIP.SENT_REQUEST) {
            return { righticonImage: require('../../assets/img/add-frnd-frm-comm-success.png'), imgBGColor: '#81BA41', imgStyles: { width: 23, height: 23 } }
        }
        else if (item.relationship === RELATIONSHIP.RECIEVED_REQUEST) {
            return { righticonImage: require('../../assets/img/accept-reject.png'), imgStyles: { width: 35, height: 35 } }
        }
        else {
            if (this.props.comingFrom && this.props.comingFrom === PageKeys.GROUP) {
                if (this.state.selectedFriendList.findIndex(selFriend => selFriend.userId === item.userId) === -1) {
                    return { righticonImage: require('../../assets/img/add-group-member.png'), imgStyles: { width: 35, height: 35 } }
                }
                else {
                    return { righticonImage: require('../../assets/img/confirmed-group-member.png'), imgBGColor: '#81BA41', imgStyles: { width: 35, height: 35 } }
                }
            }
            else {
                return { righticonImage: require('../../assets/img/chat-high-res.png') }
            }
        }
    }

    onPressRightIconProps = (item, index) => {
        if (item.relationship === RELATIONSHIP.UNKNOWN) {
            this.sendFriendRequest(item)
        }
        else if (item.relationship === RELATIONSHIP.SENT_REQUEST) {
            // Alert.alert(
            //     `Are you sure you want to cancel your friend request sent to ${item.name}? `,
            //     '',
            //     [
            //         {
            //             text: 'Confirm ', onPress: () => {
            //                 this.cancelingFriendRequest(item)
            //             }
            //         },
            //         { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            //     ],
            //     { cancelable: false }
            // )
            this.openRequestModal(item);
        }
        else if (item.relationship === RELATIONSHIP.RECIEVED_REQUEST) {
            Alert.alert(
                'Do you want to accept request ?',
                '',
                [
                    { text: 'cancel', onPress: () => { }, style: 'cancel' },
                    {
                        text: 'Accept ', onPress: () => {
                            this.approvingFriendRequest(item)
                        }
                    },
                    {
                        text: 'Reject', onPress: () => {
                            this.rejectingFriendRequest(item)
                        }
                    },
                ],
                { cancelable: false }
            )
        }
        else {
            if (this.props.comingFrom && this.props.comingFrom === PageKeys.GROUP) {
                this.toggleFriendSelection(index)
            }
            else {
                this.openChatPage(item)
            }
        }
    }

    getContactStatus = (item) => {
        switch (item.status) {
            case RELATIONSHIP.INVITED: return <LinkButton
            style={{ borderRadius: 30, alignItems: 'center', justifyContent: 'center', width: 74, height: 24, backgroundColor: '#81BA41' }}
            title={'SENT'} titleStyle={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#FFFFFF' }} onPress={() => this.showInviteModal(item)} />
            
            // case RELATIONSHIP.SENT_REQUEST: return <View style={{ backgroundColor: '#81BA41', borderRadius: 30, alignItems: 'center', justifyContent: 'center', width: 74, height: 24 }}>
            //     <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#FFFFFF' }} text={'REQUESTED'} />
            // </View>
            case RELATIONSHIP.SENT_REQUEST: return <LinkButton
                style={{ borderRadius: 30, alignItems: 'center', justifyContent: 'center', width: 74, height: 24, backgroundColor: '#81BA41' }}
                title={'REQUESTED'} titleStyle={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#FFFFFF' }} onPress={() => this.showInviteModal(item)} />

            case RELATIONSHIP.RECIEVED_REQUEST: return <View style={{ backgroundColor: '#81BA41', borderRadius: 30, alignItems: 'center', justifyContent: 'center', width: 74, height: 24 }}>
                <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#FFFFFF' }} text={'RECEIVED'} />
            </View>
            case RELATIONSHIP.FRIEND: return <View style={{ backgroundColor: '#81BA41', borderRadius: 30, alignItems: 'center', justifyContent: 'center', width: 74, height: 24 }}>
                <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#FFFFFF' }} text={'FRIEND'} />
            </View>
            default: return <LinkButton
                style={{ borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#585756', width: 74, height: 24 }}
                title={'INVITE'} titleStyle={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#585756' }} onPress={() => this.showInviteModal(item)} />
        }
    }

    openMemberDetail = (item, index) => {
        if (item.relationship === RELATIONSHIP.FRIEND) {
            this.props.setCurrentFriend({ userId: item.userId });
            Actions.push(PageKeys.FRIENDS_PROFILE, { frienduserId: item.userId });
        } else {
            Actions.push(PageKeys.PASSENGER_PROFILE, { isUnknown: true, person: item })
        }
    }

    getMembers = () => {
        return <SearchMember
            searchName={this.state.searchName}
            searchInCommunity={this.searchInCommunity}
            searchResults={this.props.searchResults}
            extraData={this.state}
            hasRemainingList={this.state.hasRemainingList}
            searchResultsKeyExtractor={this.searchResultsKeyExtractor}
            getRightIconProps={this.getRightIconProps}
            onPressRightIconProps={this.onPressRightIconProps}
            openMemberDetail={this.openMemberDetail}
            renderFooter={this.renderFooter}
            loadMoreData={this.loadMoreData}
        />
    }

    showInviteModal = (item) => this.setState({ isMemberSelected: true, selectedContact: item })

    sendFriendInvitationThroughSms = async () => {
        if (!this.state.selectedContact.phoneNumber) return;
        SendSMS.send({
            body: `Hi ${this.state.selectedContact.name}!\n${this.props.user.name} has invited you to join the MyRideDNA community.\n\nClick the link to download the MyRideDNA App.\n\nLet's Ride!\n\n- MyRideDNA Team`,
            recipients: [this.state.selectedContact.phoneNumber],
            successTypes: ['sent', 'queued'],
            allowAndroidSendWithoutReadPermission: true,
        }, (completed, cancelled, error) => {

            console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);

        });
    }

    hideInviteModal = () => this.setState({ isVisibleConfirmationModal: false, selectedContact: null })

    openRequestModal = (item) => this.setState({ showRequestModal: true, selectedPerson: item });

    hideRequestModal = () => this.setState({ showRequestModal: false, selectedPerson: null });

    onChangeInvite = (val) => this.setState({ inviteText: val });

    render() {
        const { searchName, deviceContacts, isVisibleConfirmationModal, selectedContact, activeTab, showRequestModal, selectedPerson, isMemberSelected, inviteText } = this.state;
        const { searchResults } = this.props;
        const spin = this.state.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });
        return (
            <BasePage defaultHeader={false}>
                <View style={styles.fill}>
                    <View style={styles.header}>
                        <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                            style={styles.headerIconCont} onPress={this.onPressBackButton} />
                        <View style={styles.titleContainer}>
                            <DefaultText style={styles.title} >{this.props.comingFrom && this.props.comingFrom === PageKeys.GROUP ? 'Add Group Member' : this.props.title || 'Add To Road Crew'}</DefaultText>
                            {this.state.selectedFriendList.length > 0 && <LinkButton style={{ width: 88, height: 24, borderRadius: 20, backgroundColor: '#F5891F', marginRight: 10, alignSelf: 'center', justifyContent: 'center' }} title='Done' titleStyle={styles.doneBtn} onPress={this.selectedMember} />}
                        </View>
                    </View>
                    {
                        showRequestModal && <BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={showRequestModal} onCancel={this.hideRequestModal} >
                            <View style={styles.deleteBoxCont}>
                                <DefaultText style={styles.deleteTitle}>Cancel Friend Request</DefaultText>
                                <DefaultText numberOfLines={3} style={styles.deleteText}>{`Are you sure you want to cancel your friend request sent to ${selectedPerson.name}?`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideRequestModal} />
                                    <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={() => this.cancelingFriendRequest(selectedPerson)} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    {
                        isVisibleConfirmationModal && selectedContact && < BaseModal containerStyle={{ justifyContent: 'center', alignItems: 'center' }} isVisible={isVisibleConfirmationModal} onCancel={this.hideConfirmationModal} >
                            <View style={styles.confirmationBoxCont}>
                                <DefaultText style={styles.confirmationTitle}>Invite Contact Name?</DefaultText>
                                <DefaultText numberOfLines={3} style={styles.confirmationText}>{`Do you want to invite ${selectedContact.name} to join MyRideDNA?`}</DefaultText>
                                <View style={styles.btnContainer}>
                                    <BasicButton title='CANCEL' style={[styles.actionBtn, { backgroundColor: '#8D8D8D' }]} titleStyle={styles.actionBtnTxt} onPress={this.hideConfirmationModal} />
                                    <BasicButton title='CONFIRM' style={styles.actionBtn} titleStyle={styles.actionBtnTxt} onPress={this.sendFriendInvitation} />
                                </View>
                            </View>
                        </BaseModal>
                    }
                    {
                        isMemberSelected && selectedContact && <BaseModal containerStyle={{}} isVisible={isMemberSelected} onCancel={this.hideInviteModal} >
                            <View>
                                <View style={[styles.InviteTextContainer, { minHeight: 100, flexDirection: 'row', marginTop: 20 }]}>
                                    <IconButton iconProps={{ name: 'link', type: 'AntDesign', style: { fontSize: 20, color: '#505050', alignSelf: 'flex-start', marginTop: 20, marginLeft: 20 } }} />
                                    <LabeledInputPlaceholder
                                        containerStyle={{ backgroundColor: '#F4F4F4', borderBottomWidth: 0 }}
                                        inputValue={inviteText}
                                        inputStyle={{ paddingBottom: 0 }}
                                        multiline={true}
                                        // inputRef={elRef => this.fieldRefs[1] = elRef}
                                        outerContainer={{ minHeight: 90, alignSelf: 'flex-start', marginRight: 20, marginLeft: 10 }}
                                        // returnKeyType='next'
                                        onChange={this.onChangeInvite} labelStyle={styles.labelStyle}
                                        hideKeyboardOnSubmit={true}
                                        onPress={this.onSubmit}
                                    />
                                </View>
                                <TouchableOpacity style={[styles.InviteTextContainer, { height: 50, marginTop: 30, flexDirection: 'row', }]} onPress={this.sendFriendInvitationThroughSms}>
                                    <IconButton iconProps={{ name: 'phone', type: 'FontAwesome', style: { fontSize: 20, color: '#505050', marginLeft: 20 } }} />
                                    <DefaultText style={{ marginLeft: 50, fontSize: 25, alignSelf: 'center' }}>{selectedContact.phoneNumber || ''}</DefaultText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.InviteTextContainer, { height: 50, marginTop: 30, flexDirection: 'row', backgroundColor: (selectedContact.status === RELATIONSHIP.SENT_REQUEST || selectedContact.status === RELATIONSHIP.INVITED) ? '#ADD8E6' : '#ffffff' }]} onPress={this.sendFriendInvitation}>
                                    <IconButton iconProps={{ name: 'mail', type: 'Ionicons', style: { fontSize: 25, color: '#505050', marginLeft: 20, marginTop: 10 } }} />
                                    <DefaultText style={{ marginLeft: 30, fontSize: 20, alignSelf: 'center' }}>{selectedContact.email || ''}</DefaultText>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={this.hideInviteModal}>
                                    <DefaultText style={{ fontSize: 16, letterSpacing: 1.1 }}>CANCEL</DefaultText>
                                </TouchableOpacity>
                            </View>
                        </BaseModal>
                    }
                    {
                        this.props.comingFrom === PageKeys.GROUP ?
                            this.getMembers()
                            :
                            <Tabs tabContainerStyle={[APP_COMMON_STYLES.tabContainer]} onChangeTab={this.onChangeTab} tabBarActiveTextColor='#fff' tabBarInactiveTextColor='#fff' tabBarUnderlineStyle={{ height: 0 }}>
                                <Tab heading='COMMUNITY' tabStyle={[styles.inActiveTab, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                                    {this.getMembers()}
                                    {
                                        this.props.hasNetwork === false && searchResults.length === 0 && <View style={{ flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: heightPercentageToDP(30), left: widthPercentageToDP(27), height: 100, }}>
                                            <IconButton iconProps={{ name: 'broadcast-tower', type: 'FontAwesome5', style: { fontSize: 60, color: '#505050' } }} />
                                            <DefaultText style={{ alignSelf: 'center', fontSize: 14 }}>Please Connect To Internet</DefaultText>
                                        </View>
                                    }
                                </Tab>
                                <Tab heading='CONTACTS' tabStyle={[styles.inActiveTab, styles.borderLeftWhite, styles.borderRightWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite, styles.borderRightWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}>
                                    <View style={{ flex: 1, marginHorizontal: widthPercentageToDP(8) }}>
                                        <SearchBoxFilter
                                            searchQuery={searchName} onChangeSearchValue={text => this.setState({ searchName: text })}
                                            placeholder='Name' outerContainer={{ marginTop: 30 }}
                                        />
                                        <View style={styles.plainTextContainer}>
                                            <DefaultText style={styles.plainText}>MY CONTACTS</DefaultText>
                                        </View>
                                        <FlatList
                                            keyboardShouldPersistTaps={'handled'}
                                            contentContainerStyle={[{ paddingBottom: this.state.hasRemainingList ? 40 : 0 }, styles.friendList]}
                                            showsVerticalScrollIndicator={false}
                                            data={this.state.searchName ? deviceContacts.filter(contact => contact.name.toLowerCase().includes(this.state.searchName.toLowerCase())) : deviceContacts}
                                            keyExtractor={this.searchResultsKeyExtractor}
                                            extraData={this.state}
                                            renderItem={({ item, index }) => (
                                                <View style={{ minWidth: widthPercentageToDP(81.5), paddingHorizontal: 10, height: 56, marginTop: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAEAEA' }}>
                                                    <View style={{ flex: 1, backgroundColor: '#EAEAEA', justifyContent: 'center' }}>
                                                        <DefaultText style={{ fontSize: 14, fontFamily: CUSTOM_FONTS.robotoBold, color: '#585756' }}>{item.name}</DefaultText>
                                                        {item.phoneNumber && <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#9A9A9A' }}>Phone no:- {item.phoneNumber}</DefaultText>}
                                                        {item.email && <DefaultText style={{ fontFamily: CUSTOM_FONTS.robotoBold, color: '#9A9A9A' }}>Email:- {item.email}</DefaultText>}
                                                    </View>
                                                    {this.getContactStatus(item)}
                                                </View>
                                            )}
                                            // ListFooterComponent={this.renderFooter}
                                            // onEndReached={this.loadMoreContacts}
                                            // onEndReachedThreshold={0.1}
                                        />
                                        {
                                            deviceContacts.length === 0 && activeTab === 1 && Alert.alert(
                                                'No contact found with email id',
                                                '',
                                                [
                                                    { text: 'ok', style: 'cancel' },
                                                ],
                                                { cancelable: false }
                                            )
                                        }
                                    </View>
                                </Tab>
                                {/* <Tab heading='FACEBOOK' tabStyle={[styles.inActiveTab, styles.borderLeftWhite]} activeTabStyle={[styles.activeTab, styles.borderLeftWhite]} textStyle={styles.tabText} activeTextStyle={styles.tabText}></Tab> */}
                            </Tabs>

                    }

                </View>
                <Loader isVisible={this.props.showLoader} />
            </BasePage >
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { pageNumber, hasNetwork, lastApi, isRetryApi, showLoader } = state.PageState;
    const { searchResults, friendRequestSuccess, friendRequestError, invitationSuccess, invitationError } = state.CommunitySearchList;
    return { user, searchResults, friendRequestSuccess, friendRequestError, invitationSuccess, invitationError, pageNumber, hasNetwork, lastApi, isRetryApi, showLoader };
};
const mapDispatchToProps = (dispatch) => {
    return {
        searchForFriend: (searchParam, userId, pageNumber, preference, filterProps, addedMembers = [], successCallback, errorCallback) => searchForFriend(searchParam, userId, pageNumber, preference, filterProps).then(res => {
            if (res.status === 200) {
                if (res.data.userList.length > 0) {
                    console.log('\n\n\n res.data.userList : ', res.data.userList)
                    typeof successCallback === 'function' && successCallback(res.data);
                    dispatch(updatePageNumberAction({ pageNumber: pageNumber }));
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                    // if (filterProps.searchType === 'members' || filterProps.searchType === 'friends') {
                    //     let filteredMembers = res.data.userList.filter(item => !addedMembers.some(member => member.memberId === item.userId))
                    //     dispatch(replaceSearchListAction({ results: filteredMembers, pageNumber }));
                    // }
                    // else {
                        dispatch(replaceSearchListAction({ results: res.data.userList, pageNumber }));
                    // }
                } else {
                    typeof successCallback === 'function' && successCallback(res.data);
                    dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
                }
            }
        }).catch(er => {
            typeof errorCallback === 'function' && errorCallback();
            console.log(`searchFriend: `, er.response || er);
            handleServiceErrors(er, [searchParam, userId, pageNumber, preference, filterProps, addedMembers = [], successCallback, errorCallback], 'searchForFriend', true, true);
        }),
        clearSearchResults: () => dispatch(clearSearchFriendListAction()),
        clearFriendRequestResponse: () => dispatch(resetFriendRequestResponseAction()),
        clearInvitationResponse: () => dispatch(resetInvitationResponseAction()),
        sendFriendRequest: (requestBody) => dispatch(sendFriendRequest(requestBody, (res) => {
            dispatch(updateSearchListAction({ userId: requestBody.userId, relationship: RELATIONSHIP.SENT_REQUEST }));
        }, (error) => {
            dispatch(updateFriendRequestResponseAction({ error: error.response.data || "Something went wrong" }));
        })),
        sendInvitation: (requestBody, successCallback, errorCallback) => dispatch(sendInvitation(requestBody, successCallback, errorCallback)),
        cancelRequest: (userId, personId, successCallback, errorCallback) => dispatch(cancelFriendRequest(userId, personId, (res) => {
            successCallback(res);
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }))
        }, (error) => {
            errorCallback(error);
        })),
        approvedRequest: (userId, personId, actionDate) => dispatch(approveFriendRequest(userId, personId, actionDate, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.FRIEND }));
        }, (error) => {
        })),
        rejectRequest: (userId, personId) => dispatch(rejectFriendRequest(userId, personId, (res) => {
            dispatch(updateSearchListAction({ userId: personId, relationship: RELATIONSHIP.UNKNOWN }));
        }, (error) => {
        })),
        invitationStatus: (invitationDetail, successCallback) => invitationStatus(invitationDetail).then(res => {
            console.log('invitationStatus success: ', res.data)
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
            typeof successCallback === 'function' && successCallback(res.data)
        }).catch(er => {
            console.log('invitationStatus error : ', er)
            handleServiceErrors(er, [invitationDetail, successCallback], 'invitationStatus', true, true);
        }),
        setCurrentFriend: (data) => dispatch(setCurrentFriendAction(data)),
        resetErrorHandling: (state) => dispatch(resetErrorHandlingAction({ comingFrom: 'contact_section', isRetryApi: state })),
        getAllFriendsForGroup: (userId, pageNumber, successCallback, errorCallback) => getAllFriendsForGroup(userId, pageNumber).then(res => {
            console.log('getAllFriendsForGroup sucess : ', res.data)
            typeof successCallback === 'function' && successCallback();
            dispatch(resetErrorHandlingAction({ comingFrom: 'api', isRetryApi: false }))
        }).catch(er => {
            handleServiceErrors(er, [userId, pageNumber, successCallback, errorCallback], 'getAllFriendsForGroup', true, true);
            console.log('addLike error : ', er)
        }),
        // updateSearchList:(userId, relationship) => dispatch(updateSearchListAction({userId, relationship}))
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(ContactsSection);