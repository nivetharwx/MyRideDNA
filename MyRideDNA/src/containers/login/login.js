import React from 'react';
import { View, ScrollView, Image, ImageBackground, TextInput,Text, Linking } from 'react-native';
import { IconButton, LinkButton } from '../../components/buttons';
import { CUSTOM_FONTS } from '../../constants/index';
import { LoginStyles } from './styles';
import { Item, Icon as NBIcon } from 'native-base';
import { DefaultText } from '../../components/labels';

export const LoginScreen = (props) => (
    <ScrollView scrollEnabled={false} style={{ flex: 1, backgroundColor: '#FFFFFF' }} keyboardShouldPersistTaps='handled'>
        <View style={LoginStyles.logo}>
            <ImageBackground source={require('../../assets/img/logo-sky-bg.jpg')} style={{ width: null, height: null, flex: 1, justifyContent: 'center', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 250, height: 100, marginTop: 30 }}><Image source={require('../../assets/img/logo-high-res.png')} style={{ width: null, height: null, flex: 1, resizeMode: 'contain' }} /></View>
            </ImageBackground>
        </View>
        <View style={LoginStyles.loginForm}>
            <Item style={LoginStyles.itemContainer}>
                <NBIcon name='email' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput placeholderTextColor={'#9A9A9A'} style={LoginStyles.item} textContentType='emailAddress' keyboardType='email-address' placeholder='Email' onChangeText={props.onEmailChange} />
            </Item>
            <Item style={LoginStyles.itemContainer}>
                <NBIcon name='vpn-key' type='MaterialIcons' style={{ color: '#0083CA' }} />
                <TextInput placeholderTextColor={'#9A9A9A'} style={LoginStyles.item} secureTextEntry={!props.isVisiblePassword} textContentType='password' keyboardType='default' placeholder='Password' onChangeText={props.onPasswordChange} returnKeyType={'done'} onSubmitEditing={props.onSubmit} />
                <IconButton onPress={props.togglePasswordVisibility} style={LoginStyles.visibileIconCont} iconProps={{ name: props.isVisiblePassword ? 'eye-off' : 'eye', type: 'MaterialCommunityIcons', style: LoginStyles.visibleIcon }} />
            </Item>
        </View>
        <View style={LoginStyles.bottomContainer}>
            <View style={LoginStyles.loginButtonContainer}>
                <View style={LoginStyles.loginButtoninnerContainer}>
                    <LinkButton style={LoginStyles.loginButton} title='LOGIN' titleStyle={LoginStyles.loginButtonText} onPress={props.onSubmit} />
                </View>
            </View>
            <View style={LoginStyles.linkPairContainer}>
                <LinkButton title={`Forgot Password`} titleStyle={LoginStyles.linkPairText} onPress={props.onForgotPasswordPress} />
                <LinkButton title='Sign up' titleStyle={LoginStyles.linkPairText} onPress={props.onSignupPress} />
            </View>
            <ImageBackground style={{ flex: 1, height: null, width: null }} source={require('../../assets/img/login-bottom.png')}>
                <View style={[LoginStyles.socialSiteIconContainer, { paddingTop: 50 }]}>
                    <LinkButton onPress={props.doGoogleLogin} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 9, width: 210, borderRadius: 5 }}>
                        <View style={{ height: 23, width: 23 }}>
                            <Image source={require('../../assets/img/google-logo.png')} style={{ flex: 1, height: null, width: null }} />
                        </View>
                        <DefaultText text={'Continue with Google'} style={{ marginLeft: 7, color: '#575555', fontSize: 14 }} fontFamily={CUSTOM_FONTS.robotoBold} />
                    </LinkButton>
                    <Text style={LoginStyles.footerText}>By logging in to MyRideDNA, you agree to the <Text onPress={()=>{
                        Linking.openURL('https://mrdna-test.point2value.com/terms-and-conditions')
                    }} style={{color:'#F5891F'}}>Terms of Service</Text> and <Text style={{color:'#F5891F'}} >Privacy Policy</Text>.</Text>
                    {/* <IconButton onPress={props.doFacebookLogin} style={{ marginTop: 15, backgroundColor: '#FFFFFF', padding: 7, width: 210, borderRadius: 5 }} iconProps={{ name: 'facebook-official', type: 'FontAwesome', style: { height: 30, width: 30, color: '#3B5998' } }}
                        title={'Continue with Facebbok'}
                        titleStyle={{ fontFamily: CUSTOM_FONTS.robotoBold, marginLeft: 7, color: '#575555', fontSize: 14 }}
                    /> */}
                </View>
            </ImageBackground>
        </View>
    </ScrollView>
);