import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, FlatList, ImageBackground, Alert } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { BasicCard } from '../../../components/cards';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicButton, IconButton, LinkButton } from '../../../components/buttons';
import { Icon as NBIcon } from 'native-base';
import { getGarageInfo, setBikeAsActive, deleteBike, updateGarageName } from '../../../api';
import { BaseModal } from '../../../components/modal';

class MyGarageTab extends Component {
    spacelistRef = null;
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
            isVisibleOptionsModal: false,
            selectedBike: null
        };
    }

    componentDidMount() {
        this.props.getGarageInfo(this.props.user.userId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.garage.spaceList.length > 0) {
            if (prevProps.garage.garageId === null) {
                /*** TODO: Iterate spaceList and call API by passing pictureIdList
                 * Split the pictureIdList if it is more than 10 pictureIds
                 ***/
                return;
            }
            if (this.props.garage.spaceList.length > prevProps.garage.spaceList.length) {
                this.spacelistRef.scrollToEnd();
            } else if (this.props.garage.activeBikeIndex !== prevProps.garage) {
                this.spacelistRef.scrollToIndex({ index: 0, viewPosition: 0 });
            }
        }
    }

    onChangeActiveBike() {
        const { garage } = this.props;
        const { selectedBike } = this.state;
        this.onCancelOptionsModal();
        const prevActiveBikeIndex = garage.spaceList.findIndex(bike => bike.isDefault);
        const newActiveBikeIndex = garage.spaceList.findIndex(bike => bike.spaceId === selectedBike.spaceId);
        this.props.setBikeAsActive(this.props.user.userId, selectedBike, prevActiveBikeIndex, newActiveBikeIndex);
    }

    openBikeForm = () => {
        if (this.state.selectedBike) {
            Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: this.props.garage.spaceList.findIndex(bike => bike.spaceId === this.state.selectedBike.spaceId) });
            this.onCancelOptionsModal();
        } else {
            Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: -1 });
        }
    }

    onUpdateGarageName = (garageName) => {
        this.props.updateGarageName(garageName, this.props.garage.garageId);
    }

    showOptionsModal = (index) => {
        this.setState({ selectedBike: this.props.garage.spaceList[index], isVisibleOptionsModal: true });
    }

    onCancelOptionsModal = () => this.setState({ isVisibleOptionsModal: false, selectedBike: null })

    renderMenuOptions = () => {
        if (this.state.selectedBike === null) return;
        let options = [{ text: 'Edit', id: 'editBike', handler: () => this.openBikeForm() }];
        if (this.state.selectedBike.isDefault === false) {
            options.push({ text: 'Select as active', id: 'activeBike', handler: this.onChangeActiveBike() })
        }
        options.push({ text: 'Remove bike', id: 'removeBike', handler: () => this.onPressDeleteBike() }, { text: 'Close', id: 'close', handler: () => this.onCancelOptionsModal() });
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

    onPressDeleteBike = () => {
        const { selectedBike } = this.state;
        const index = this.props.garage.spaceList.findIndex(bike => bike.spaceId === selectedBike.spaceId);
        setTimeout(() => {
            Alert.alert(
                'Remove confirmation',
                `Are you sure to remove ${selectedBike.name} from your list?`,
                [
                    {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                    },
                    { text: 'Remove', onPress: () => this.props.deleteBike(this.props.user.userId, selectedBike.spaceId, index) },
                ]
            );
        }, 100);
        this.onCancelOptionsModal();
    }

    render() {
        const { garage, user } = this.props;
        const { headerSearchMode, searchQuery, isVisibleOptionsModal } = this.state;
        return (
            <View style={styles.fill}>
                <BaseModal isVisible={isVisibleOptionsModal} onCancel={this.onCancelOptionsModal} onPressOutside={this.onCancelOptionsModal}>
                    <View style={[APP_COMMON_STYLES.menuOptContainer, user.handDominance === 'left' ? APP_COMMON_STYLES.leftDominantCont : null]}>
                        {
                            this.renderMenuOptions()
                        }
                    </View>
                </BaseModal>
                <BasicHeader title={garage.garageName}
                    leftIconProps={{ name: 'md-add', type: 'Ionicons', onPress: this.openBikeForm, reverse: true }}
                    rightIconProps={{ name: 'search', type: 'FontAwesome', onPress: () => this.setState({ headerSearchMode: true }) }} searchbarMode={headerSearchMode}
                    searchValue={searchQuery} onChangeSearchValue={(val) => this.setState({ searchQuery: val })} onCancelSearchMode={() => this.setState({ headerSearchMode: false })}
                    onClearSearchValue={() => this.setState({ searchQuery: '' })}
                    hasEditableTitle={true} onSubmitTitleEditing={this.onUpdateGarageName} />
                <View style={styles.content}>
                    <FlatList
                        data={garage.spaceList}
                        keyExtractor={(item, index) => item.spaceId + ''}
                        showsVerticalScrollIndicator={false}
                        extraData={this.state}
                        ref={elRef => this.spacelistRef = elRef}
                        renderItem={({ item, index }) => {
                            return <BasicCard
                                isActive={false}
                                // FIXME: Change this based on pictureIdList
                                media={item.pictureList && item.pictureList[0] ? { uri: item.pictureList[0] } : require('../../../assets/img/bike_placeholder.png')}
                                mainHeading={item.name}
                                subHeading={`${item.make}-${item.model}, ${item.year}`}
                                notes={item.notes}
                                onLongPress={() => this.showOptionsModal(index)}
                            >
                                {/* {
                                    item.isDefault
                                        ? <NBIcon name='md-star' type='Ionicons' />
                                        : <IconButton iconProps={{ name: 'md-star-outline', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.onChangeActiveBike(index)} />
                                }
                                <IconButton iconProps={{ name: 'edit', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.openBikeForm(index)} />
                                <IconButton iconProps={{ name: 'md-trash', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.onPressDeleteBike(index)} /> */}
                            </BasicCard>
                        }}
                        getItemLayout={(data, index) => (
                            { length: heightPercentageToDP(60), offset: heightPercentageToDP(60) * index, index }
                        )}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const garage = { garageId, garageName, spaceList, activeBikeIndex } = state.GarageInfo;
    return { user, garage };
}
const mapDispatchToProps = (dispatch) => {
    return {
        getGarageInfo: (userId) => dispatch(getGarageInfo(userId)),
        updateGarageName: (garageName, garageId) => dispatch(updateGarageName(garageName, garageId)),
        setBikeAsActive: (userId, bike, prevActiveIndex, index) => dispatch(setBikeAsActive(userId, bike, prevActiveIndex, index)),
        deleteBike: (userId, bikeId, index) => dispatch(deleteBike(userId, bikeId, index)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyGarageTab);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        marginTop: APP_COMMON_STYLES.headerHeight,
        paddingTop: widthPercentageToDP(2),
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: heightPercentageToDP(7),
    },
    addBikeItem: {
        width: '100%',
        height: heightPercentageToDP(30),
    },
    submitBtn: {
        height: heightPercentageToDP(8.5),
    }
});