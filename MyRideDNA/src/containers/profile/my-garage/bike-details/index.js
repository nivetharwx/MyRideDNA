import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, FlatList, ImageBackground } from 'react-native';
import { APP_COMMON_STYLES, widthPercentageToDP, PageKeys } from '../../../../constants';
import { Actions } from 'react-native-router-flux';
import { IconButton } from '../../../../components/buttons';

class BikeDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    render() {
        const { user } = this.props;
        return (
            <View style={styles.fill}>
                <View style={styles.header}>
                    <IconButton iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { fontSize: 27 } }}
                        style={styles.headerIconCont} onPress={() => Actions.pop()} />
                    <View style={{ flex: 1, flexDirection: 'column', marginLeft: 17, justifyContent: 'center', alignSelf: 'center' }}>
                        <Text style={styles.title}>
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
                <View style={styles.pageContent}>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    const { hasNetwork } = state.PageState;
    return { user, hasNetwork };
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
        paddingTop: 5,
        alignItems: 'center',
        justifyContent: 'center',
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
    title: {
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
    }
});