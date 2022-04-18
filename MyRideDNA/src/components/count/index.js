import React from 'react' 
import { View } from 'react-native'
import { CUSTOM_FONTS, widthPercentageToDP } from '../../constants'
import { DefaultText } from '../labels'

export const CountComponent=({notificationCount,left})=>{
        return (
            <View style={{width:25,height:25,backgroundColor:'white',position:'absolute',top:8,left:left,borderRadius:25,display:"flex",justifyContent:'center',alignItems:'center'}}>
                <View style={{width:23,height:23,backgroundColor:'#F5891F',borderRadius:23,display:"flex",justifyContent:"center",alignItems:'center'}}>
                    <DefaultText style={{ color: '#fff', fontFamily: CUSTOM_FONTS.roboto, fontSize: widthPercentageToDP(3) }}>{+notificationCount>99?'+99':notificationCount}</DefaultText>
                </View>
            </View>
        )
}   

