import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ScrollView, ImageBackground, Image, StatusBar, FlatList, Text } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys, CUSTOM_FONTS, heightPercentageToDP, POST_TYPE } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton, ShifterButton, LinkButton } from '../../../../components/buttons';
import { appNavMenuVisibilityAction } from '../../../../actions';
import { DefaultText } from '../../../../components/labels';

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

    showAppNavMenu = () => this.props.showAppNavMenu();

    openBikeForm = () => {
        Actions.push(PageKeys.ADD_BIKE_FORM, { bikeIndex: this.props.garage.spaceList.findIndex(item => item.spaceId === this.state.bike.spaceId) });
    }

    componentWillUnmount() {

    }

    addStoryFromRoad = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.STORIES_FROM_ROAD });

    addWish = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.WISH_LIST });

    addCustomization = () => Actions.push(PageKeys.POST_FORM, { comingFrom: Actions.currentScene, postType: POST_TYPE.CUSTOMIZATION });

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
                    <View style={styles.headingContainer}>
                        <DefaultText style={styles.heading}>
                            {user.name}
                        </DefaultText>
                        {
                            user.nickname ?
                                <DefaultText style={styles.subheading}>
                                    {user.nickname.toUpperCase()}
                                </DefaultText>
                                : null
                        }

                    </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.bikePic, styles.bikeBtmBorder, bike.isDefault ? styles.activeBorder : null]}>
                        <Image source={bike.picture && bike.picture.data ? { uri: bike.picture.data } : require('../../../../assets/img/bike_placeholder.png')} style={{ height: null, width: null, flex: 1, borderRadius: 0 }} />
                    </View>
                    <ImageBackground source={require('../../../../assets/img/odometer-small.png')} style={{ position: 'absolute', marginTop: styles.bikePic.height - 55.5, alignSelf: 'center', height: 111, width: 118, justifyContent: 'center' }}>
                        <DefaultText style={styles.miles}>114,526</DefaultText>
                    </ImageBackground>
                    <View style={styles.odometerLblContainer}>
                        <DefaultText style={styles.odometerLbl}>TOTAL</DefaultText>
                        <DefaultText style={styles.odometerLbl}>MILES</DefaultText>
                    </View>
                    <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                        <IconButton iconProps={{ name: 'account-edit', type: 'MaterialCommunityIcons', style: { fontSize: 26, color: '#f69039' } }}
                            style={{ alignSelf: 'flex-end' }} onPress={this.openBikeForm} />
                        <DefaultText style={styles.title}>{bike.name}</DefaultText>
                        <DefaultText style={styles.subtitle}>{`${bike.make || ''}${bike.model ? ' - ' + bike.model : ''}${bike.notes ? '    |    ' + bike.notes.length <= 17 ? bike.notes : bike.notes.substring(0, 17) + '...' : ''}`}</DefaultText>
                    </View>
                    {bike.isDefault ? <View style={styles.activeLabelCont}><View style={styles.activeIndicator} /><DefaultText style={styles.activeBikeTxt}>Active Bike</DefaultText></View> : null}
                    <View style={{ marginHorizontal: 20, flex: 1 }}>
                        <View style={styles.hDivider} />
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <LinkButton style={styles.sectionLinkBtn}>
                                    <DefaultText style={styles.sectionLinkTxt}>My Ride</DefaultText>
                                    <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                </LinkButton>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => null} />
                            </View>
                            <FlatList style={styles.list} />
                        </View>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <LinkButton style={styles.sectionLinkBtn}>
                                    <DefaultText style={styles.sectionLinkTxt}>Wish List</DefaultText>
                                    <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                </LinkButton>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => null} />
                            </View>
                            <FlatList style={styles.list} />
                        </View>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <LinkButton style={styles.sectionLinkBtn}>
                                    <DefaultText style={styles.sectionLinkTxt}>Logged Rides</DefaultText>
                                    <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                </LinkButton>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={() => null} />
                            </View>
                            <FlatList style={styles.list} />
                        </View>
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <LinkButton style={styles.sectionLinkBtn}>
                                    <DefaultText style={styles.sectionLinkTxt}>Stories from the Road</DefaultText>
                                    <DefaultText style={[styles.sectionLinkTxt, { color: APP_COMMON_STYLES.infoColor, marginLeft: 8 }]}>[see all]</DefaultText>
                                </LinkButton>
                                <IconButton style={styles.addBtnCont} iconProps={{ name: 'md-add', type: 'Ionicons', style: { fontSize: 10, color: '#fff' } }} onPress={this.addStoryFromRoad} />
                            </View>
                            <View style={styles.greyBorder} />
                        </View>
                    </View>
                    <LinkButton style={styles.fullWidthImgLink}>
                        <ImageBackground source={require('../../../../assets/img/my-photos.png')} style={styles.imgBG}>
                            <DefaultText style={styles.txtOnImg}>Photos</DefaultText>
                        </ImageBackground>
                    </LinkButton>
                </ScrollView>
                {/* Shifter: - Brings the app navigation menu */}
                <ShifterButton onPress={this.showAppNavMenu} size={18} alignLeft={this.props.user.handDominance === 'left'} />
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
        showAppNavMenu: () => dispatch(appNavMenuVisibilityAction(true)),
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
    headingContainer: {
        flex: 1,
        marginLeft: 17,
        justifyContent: 'center',
        alignSelf: 'center'
    },
    heading: {
        fontSize: 20,
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 0.2
    },
    subheading: {
        color: '#C4C4C4',
        fontFamily: CUSTOM_FONTS.gothamBold,
        letterSpacing: 1.08
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
        justifyContent: 'center',
        marginTop: 5
    },
    odometerLbl: {
        color: '#6E6E6E',
        letterSpacing: 2.2,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        marginHorizontal: 72
    },
    title: {
        marginTop: 10,
        fontSize: 19,
        fontFamily: CUSTOM_FONTS.robotoBold
    },
    subtitle: {
        marginTop: 5,
    },
    activeBikeTxt: {
        color: '#585756',
        letterSpacing: 0.6,
        fontSize: 12,
        marginLeft: 4
    },
    miles: {
        letterSpacing: 0.3,
        textAlign: 'center',
        color: '#fff',
        fontSize: 22,
        fontFamily: CUSTOM_FONTS.dinCondensedBold
    },
    list: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE',
        flexGrow: 0
    },
    sectionLinkBtn: {
        paddingHorizontal: 0,
        flexDirection: 'row'
    },
    sectionLinkTxt: {
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        fontSize: 12,
        paddingBottom: 7,
        letterSpacing: 1.8
    },
    addBtnCont: {
        height: 14,
        width: 14,
        borderRadius: 7,
        backgroundColor: '#a8a8a8',
        marginRight: 10
    },
    section: {
        marginTop: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    greyBorder: {
        borderTopWidth: 13,
        borderTopColor: '#DCDCDE',
    },
    fullWidthImgLink: {
        flex: 1,
        paddingHorizontal: 0,
        marginTop: 20,
        borderTopWidth: 9,
        borderTopColor: '#f69039',
        elevation: 20,
        height: heightPercentageToDP(30)
    },
    imgBG: {
        flex: 1,
        height: null,
        width: null,
        justifyContent: 'center',
        paddingLeft: 20
    },
    txtOnImg: {
        color: '#fff',
        fontSize: 18,
        letterSpacing: 2.7,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    },
    hDivider: {
        backgroundColor: '#B1B1B1',
        height: 1.5,
        marginTop: 8
    }
});