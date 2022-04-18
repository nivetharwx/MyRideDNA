import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground,Image } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { APP_COMMON_STYLES, widthPercentageToDP, CUSTOM_FONTS } from '../../constants';
import { connect } from 'react-redux';
import { DefaultText } from '../../components/labels';
import { BasePage } from '../../components/pages';

class Vest extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }
    onPressBackButton = () => {
        Actions.pop()
    }

    render() {
        const { user } = this.props;
        return (
            <BasePage heading={'My Vest'} >
                <View style={styles.contentBody}>
                    <Image source={require('../../assets/img/vest.png')} style={styles.containerImage}  >
                    
                    </Image> 
                    <View style={styles.textContainer}>
                        <DefaultText style={styles.bigText}>MY VEST</DefaultText>
                        <DefaultText style={styles.smallText}>Soon you will be able to </DefaultText>
                        <DefaultText style={styles.smallText}>add pins to your vest and </DefaultText>
                        <DefaultText style={styles.smallText}>keep track of the events </DefaultText>
                        <DefaultText style={styles.smallText}>you have attented </DefaultText>
                    </View>
                </View>
            </BasePage>
        );
    }
}
const mapStateToProps = (state) => {
    const { user } = state.UserAuth;
    return { user };
}
const mapDispatchToProps = (dispatch) => {
    return {
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Vest);

const styles = StyleSheet.create({
    contentBody: {
        backgroundColor: '#fff',
        // backgroundColor: 'yellow',
        alignItems:'center',
        flex:1
    },
    containerImage: {
        width: widthPercentageToDP(100),
        height: widthPercentageToDP(190),
        position: 'absolute',
        
    },
    textContainer: {
        position: 'absolute',
        display:'flex',
        justifyContent:'center',
        height:'100%',
        width:'100%',
        alignItems:'center'
    },
    bigText: {
        color: '#a1a1a1',
        fontSize: 110,
        fontFamily: CUSTOM_FONTS.dinCondensed,
        
    },
    smallText: {
        color: '#DFDEDE',
        fontSize: 23,
        marginTop: 20,
        marginLeft: 10,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
    }
});