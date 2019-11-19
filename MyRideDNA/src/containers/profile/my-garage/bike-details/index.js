import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, ScrollView, FlatList, ImageBackground, Image, StatusBar } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton } from '../../../../components/buttons';

class BikeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bike: props.bike || {}
        };
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    openBikeForm = () => {
        Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: this.props.garage.spaceList.findIndex(item => item.spaceId === this.state.bike.spaceId) });
    }

    componentWillUnmount() {

    }

    render() {
        const { user } = this.props;
        const { bike } = this.state;
        return (
            <View style={styles.fill}>
                <View style={APP_COMMON_STYLES.statusBar}>
                    <StatusBar translucent backgroundColor={APP_COMMON_STYLES.statusBarColor} barStyle="light-content" />
                </View>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                        style={styles.headerIconCont} onPress={() => Actions.pop()} />
                    <View style={{ flex: 1, flexDirection: 'column', marginLeft: 17, justifyContent: 'center', alignSelf: 'center' }}>
                        <Text style={styles.heading}>
                            {user.name}
                        </Text>
                        {
                            user.nickname ?
                                <Text style={{ color: 'rgba(189, 195, 199, 1)', fontWeight: 'bold' }}>
                                    {user.nickname.toUpperCase()}
                                </Text>
                                : null
                        }

                    </View>
                </View>
                <ScrollView>
                    <View style={[styles.bikePic, styles.bikeBtmBorder, bike.isDefault ? styles.activeBorder : null]}>
                        <Image source={bike.pictureList && bike.pictureList[0] ? { uri: bike.pictureList[0] } : require('../../../../assets/img/bike_placeholder.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
                    </View>
                    <ImageBackground source={require('../../../../assets/img/odometer-small.png')} style={{ position: 'absolute', marginTop: styles.bikePic.height - 55.5, alignSelf: 'center', height: 111, width: 118, justifyContent: 'center' }}>
                        <Text style={{ textAlign: 'center', color: '#fff', fontSize: 20, fontFamily: 'RobotoSlab-Regular_Bold' }}>0</Text>
                    </ImageBackground>
                    <View style={styles.odometerLblContainer}>
                        <Text style={[styles.odometerLbl, { marginRight: 72, textAlign: 'right' }]}>TOTAL</Text>
                        <Text style={[styles.odometerLbl, { marginLeft: 72 }]}>MILES</Text>
                    </View>
                    <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                        <IconButton iconProps={{ name: 'account-edit', type: 'MaterialCommunityIcons', style: { fontSize: 26, color: '#f69039' } }}
                            style={{ alignSelf: 'flex-end' }} onPress={this.openBikeForm} />
                        <Text style={styles.title}>{bike.name}</Text>
                        <Text style={styles.subtitle}>{`${bike.make || ''}${bike.model ? ' - ' + bike.model : ''}${bike.notes ? '    |    ' + bike.notes.length <= 17 ? bike.notes : bike.notes.substring(0, 17) + '...' : ''}`}</Text>
                    </View>
                    {bike.isDefault ? <View style={styles.activeLabelCont}><View style={styles.activeIndicator} /><Text style={styles.activeBikeTxt}>Active Bike</Text></View> : null}
                    <View style={{ marginHorizontal: 20, flex: 1 }}>
                        <View style={{ backgroundColor: '#B1B1B1', height: 1.5, marginTop: 8 }} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    const garage = { garageId, garageName, spaceList, activeBikeIndex } = state.GarageInfo;
    return { user, hasNetwork, garage };
}
const mapDispatchToProps = (dispatch) => {
    return {
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(BikeDetails);

const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: '#fff',
    },
    pageContent: {

    },
    header: {
        height: APP_COMMON_STYLES.headerHeight,
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 999
    },
    headerIconCont: {
        paddingHorizontal: 0,
        width: widthPercentageToDP(9),
        height: widthPercentageToDP(9),
        borderRadius: widthPercentageToDP(9) / 2,
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginLeft: 17
    },
    heading: {
        fontSize: widthPercentageToDP(6),
        color: 'white',
        fontWeight: 'bold',
        backgroundColor: 'transparent',
    },
    rightIconPropsStyle: {
        height: widthPercentageToDP(7),
        width: widthPercentageToDP(7),
        backgroundColor: '#F5891F',
        borderRadius: widthPercentageToDP(3.5),
        marginRight: 17,
        alignSelf: 'center'
    },
    imgContainer: {
        width: widthPercentageToDP(100),
        height: 175,
        borderBottomWidth: 4
    },
    bikePic: {
        height: 232,
        width: widthPercentageToDP(100),
    },
    bikeBtmBorder: {
        borderBottomWidth: 4,
        borderBottomColor: APP_COMMON_STYLES.headerColor
    },
    activeBorder: {
        borderBottomColor: APP_COMMON_STYLES.infoColor
    },
    activeLabelCont: {
        marginTop: 16,
        marginLeft: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    activeIndicator: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: APP_COMMON_STYLES.infoColor
    },
    odometerLblContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 5
    },
    odometerLbl: {
        flex: 1,
        color: '#6E6E6E',
        letterSpacing: 2.2,
        fontSize: 12,
        fontFamily: 'RobotoSlab-Regular_Bold',
    },
    title: {
        marginTop: 10,
        fontSize: 19,
        fontFamily: 'Roboto-Bold'
    },
    subtitle: {
        marginTop: 5,
        fontSize: 12,
        fontFamily: 'Roboto'
    },
    activeBikeTxt: {
        color: '#585756',
        letterSpacing: 0.6,
        fontSize: 11,
        marginLeft: 4
    }
});