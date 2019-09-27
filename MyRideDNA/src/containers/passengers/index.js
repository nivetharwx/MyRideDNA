import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, TouchableWithoutFeedback, StatusBar, FlatList, ScrollView, View, Keyboard, Alert, TextInput, Text } from 'react-native';
import { BasicHeader } from '../../components/headers';
import { heightPercentageToDP, widthPercentageToDP, APP_COMMON_STYLES, IS_ANDROID, PageKeys } from '../../constants';
import { Actions } from 'react-native-router-flux';
import { LabeledInput, IconicList, IconicDatePicker, IconicInput } from '../../components/inputs';
import { BasicButton, LinkButton } from '../../components/buttons';
import { DatePicker, Icon as NBIcon, Toast, ListItem, Left, Body, Right, Thumbnail } from 'native-base';
import { BaseModal } from '../../components/modal';
import { getPassengerList, deletePassenger } from '../../api';

class Passengers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPassenger: null,
            isVisibleOptionsModal: false
        };
    }

    componentDidMount() {
        this.props.getPassengerList(this.props.user.userId);
    }

    componentDidUpdate(prevProps, prevState) {

    }

    onPressBackButton = () => Actions.pop();

    showOptionsModal = (index) => {
        this.setState({ selectedPassenger: this.props.passengerList[index], isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ selectedPassenger: null, isVisibleOptionsModal: false })

    renderMenuOptions = () => {
        if (this.state.selectedPassenger === null) return;
        const options = [{ text: 'Edit Passenger', id: 'editPassenger', handler: () => this.openPassengerForm() }, { text: 'Remove Passenger', id: 'removePassenger', handler: () => this.showRemovePassengerConfirmation() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() }];
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

    openPassengerForm = () => {
        if (this.state.selectedPassenger) {
            const passengerIdx = this.props.passengerList.findIndex(passenger => passenger.passengerId === this.state.selectedPassenger.passengerId);
            Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx });
        }
        else {
            Actions.push(PageKeys.PASSENGER_FORM, { passengerIdx: -1 });
        }
        this.onCancelOptionsModal();
    }

    showRemovePassengerConfirmation = () => {
        const { passengerId, name } = this.state.selectedPassenger;
        setTimeout(() => {
            Alert.alert(
                'Confirmation to remove passenger',
                `Are you sure to remove ${name}?`,
                [
                    {
                        text: 'Yes', onPress: () => {
                            this.props.deletePassenger(passengerId);
                            this.onCancelOptionsModal();
                        }
                    },
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                ],
                { cancelable: false }
            );
        }, 100);
    }

    passengerKeyExtractor = (item) => {
        return item.passengerId
    }

    renderPassenger = ({ item, index }) => {
        return (
            // DOC: Removed native-base ListItem as TouchableNativeFeedback is not working in react-native 0.59.0
            <TouchableWithoutFeedback style={{ width: widthPercentageToDP(100), marginTop: 20 }} onLongPress={() => this.showOptionsModal(index)}>
                <View style={{ flex: 1, flexDirection: 'row', height: heightPercentageToDP(10) }}>
                    <View style={{ width: widthPercentageToDP(15), alignItems: 'center', justifyContent: 'center' }}>
                        {
                            item.groupProfilePictureThumbnail
                                ? <Thumbnail source={{ uri: 'Image URL' }} />
                                : <NBIcon active name="person" type='MaterialIcons' style={{ width: widthPercentageToDP(7) }} />
                        }
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' }}>
                        <Text>{item.name}</Text>
                    </View>
                    <View>
                        <Text note></Text>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    render() {
        const { user, passengerList } = this.props;
        const { isVisibleOptionsModal } = this.state;
        return (
            <View style={styles.fill}>
                <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                    <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                        {
                            this.renderMenuOptions()
                        }
                    </View>
                </BaseModal>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor='black' barStyle="light-content" />
                </View>
                <View style={styles.fill}>
                    <BasicHeader
                        title='Passengers'
                        leftIconProps={{ reverse: true, name: 'md-arrow-round-back', type: 'Ionicons', onPress: this.onPressBackButton }}
                        rightIconProps={{ reverse: true, name: 'md-add', type: 'Ionicons', onPress: this.openPassengerForm }}
                    />
                    <FlatList
                        contentContainerStyle={[styles.passengerList, { paddingBottom: passengerList.length > 0 ? heightPercentageToDP(8) : 0 }]}
                        data={passengerList}
                        keyExtractor={this.passengerKeyExtractor}
                        renderItem={this.renderPassenger}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { passengerList } = state.PassengerList;
    return { user, passengerList };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getPassengerList: (userId) => dispatch(getPassengerList(userId)),
        deletePassenger: (passengerId) => dispatch(deletePassenger(passengerId)),
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Passengers);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff'
    },
    form: {
        marginTop: APP_COMMON_STYLES.headerHeight,
    },
    formContent: {
        paddingTop: 20,
        flex: 1,
        justifyContent: 'space-around'
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
    },
    formFieldIcon: {
        color: '#999999'
    },
    addressInput: {
        width: '48%',
        borderBottomColor: '#D4D4D4',
        borderBottomWidth: 1
    },
    passengerList: {
        marginTop: APP_COMMON_STYLES.headerHeight
    },
});