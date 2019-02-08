import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, FlatList, ImageBackground, Alert } from 'react-native';
import { BasicHeader } from '../../../components/headers';
import { BasicCard } from '../../../components/cards';
import { heightPercentageToDP, APP_COMMON_STYLES, widthPercentageToDP, PageKeys } from '../../../constants';
import { Actions } from 'react-native-router-flux';
import { BasicButton, IconButton } from '../../../components/buttons';
import { Icon as NBIcon } from 'native-base';
import { getGarageInfo, setBikeAsActive, deleteBike, updateGarageName } from '../../../api';

const HEADER_HEIGHT = heightPercentageToDP(8.5);
class MyGarageTab extends Component {
    spacelistRef = null;
    constructor(props) {
        super(props);
        this.state = {
            headerSearchMode: false,
            searchQuery: '',
        };
    }

    componentDidMount() {
        this.props.getGarageInfo(this.props.user.userId);
    }

    componentDidUpdate(prevProps, prevState) {
        // setTimeout(() => this.spacelistRef.scrollToEnd(), 300);
        // this.spacelistRef.scrollToEnd();
        if (prevProps.garage.garageId !== null) {
            if (this.props.garage.spaceList.length > prevProps.garage.spaceList.length) {
                this.spacelistRef.scrollToEnd();
            } else if (this.props.garage.activeBikeIndex !== prevProps.garage) {
                this.spacelistRef.scrollToIndex({ index: 0, viewPosition: 0 });
            }
        }
    }

    onChangeActiveBike(index) {
        const { garage } = this.props;
        const prevActiveBikeIndex = garage.spaceList.findIndex(bike => bike.isDefault);
        this.props.setBikeAsActive(this.props.user.userId, garage.spaceList[index], prevActiveBikeIndex, index);
    }

    openBikeForm = (index) => {
        Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: index });
    }

    onUpdateGarageName = (garageName) => {
        this.props.updateGarageName(garageName, this.props.garage.garageId);
    }

    onPressDeleteBike = (index) => {
        Alert.alert(
            'Delete confirmation',
            `Are you sure to delete ${this.props.garage.spaceList[index].name} from your list?`,
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'Delete', onPress: () => this.props.deleteBike(this.props.user.userId, this.props.garage.spaceList[index].spaceId, index) },
            ]
        );
    }

    render() {
        const { garage } = this.props;
        const { headerSearchMode, searchQuery } = this.state;
        return (
            <View style={styles.fill}>
                <BasicHeader headerHeight={HEADER_HEIGHT} title={garage.garageName}
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
                                media={item.picturesList[0] ? { uri: `data:image/jpeg;base64,${item.picturesList[0]}` } : require('../../../assets/img/bike_placeholder.png')}
                                mainHeading={item.name}
                                subHeading={`${item.make}-${item.model}, ${item.year}`}
                                notes={item.notes}
                            >
                                {
                                    item.isDefault
                                        ? <NBIcon name='md-star' type='Ionicons' />
                                        : <IconButton iconProps={{ name: 'md-star-outline', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.onChangeActiveBike(index)} />
                                }
                                <IconButton iconProps={{ name: 'edit', type: 'MaterialIcons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.openBikeForm(index)} />
                                <IconButton iconProps={{ name: 'md-trash', type: 'Ionicons', style: { color: APP_COMMON_STYLES.headerColor } }} onPress={() => this.onPressDeleteBike(index)} />
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
        marginTop: HEADER_HEIGHT,
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