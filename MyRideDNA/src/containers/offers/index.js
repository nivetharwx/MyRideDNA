import React, { Component } from 'react';
import { View, StyleSheet, ImageBackground, ScrollView, Image } from 'react-native';
import { CUSTOM_FONTS } from '../../constants';
import { connect } from 'react-redux';
import { BasePage } from '../../components/pages';
import { DefaultText } from '../../components/labels';

class Offers extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <BasePage heading={'Offers'}>
                <ScrollView contentContainerStyle={{ flex: 1 }} >
                    <View style={styles.contentBody}>
                        <View style={{ width:'100%', backgroundColor: '#000',height:'40%'}}></View>
                        <ImageBackground source={require('../../assets/img/profile-bg.png')} style={{ width:'100%',height:'100%' }} >
                        <View style={styles.textCont}>
                            <DefaultText style={styles.textStyle} >The best deals are right </DefaultText>
                            <DefaultText style={[styles.textStyle]}>around the corner</DefaultText>
                        </View>
                        </ImageBackground>
                        <View style={{ position: 'absolute', width: '90%', height: '50%', alignSelf:'center',marginTop:'10%',display:"flex",justifyContent:'center',alignItems:'center'}}>
                        <Image source={require('../../assets/img/offers.png')} resizeMode='contain' ></Image>
                        </View>    
                    </View>
                </ScrollView>
            </BasePage >
        );
    }
}
const mapStateToProps = (state) => {
    return {};
}
const mapDispatchToProps = (dispatch) => {
    return {}
}
export default connect(mapStateToProps, mapDispatchToProps)(Offers);

const styles = StyleSheet.create({
    contentBody: {
        backgroundColor: '#fff',
        flex: 1,    
        flexDirection:'column'
    },
    textCont: {
        top: 150
    },
    textStyle: {
        color: '#F5891F',
        fontSize: 22,
        fontFamily: CUSTOM_FONTS.robotoSlabBold,
        alignSelf: 'center'
    }
});