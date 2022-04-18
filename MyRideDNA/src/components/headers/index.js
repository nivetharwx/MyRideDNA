import React from 'react';
import {
    SafeAreaView,
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    TextInput,
    TouchableHighlight
} from 'react-native';
import { Icon as NBIcon, Thumbnail } from 'native-base';
import { WindowDimensions, APP_COMMON_STYLES, widthPercentageToDP, IS_ANDROID, heightPercentageToDP, CUSTOM_FONTS } from '../../constants';
import { IconButton } from '../buttons';
import { DefaultText } from '../labels';
import { CountComponent } from '../count';

const THUMBNAIL_SIZE = IS_ANDROID ? heightPercentageToDP(6.5) : heightPercentageToDP(8);

export class BasicHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchbarAnim: new Animated.Value(-WindowDimensions.width),
            searchbarMode: props.searchbarMode,
            titleEditingMode: false
        }
    }

    componentDidUpdate() {
        if (this.props.searchbarMode != this.state.searchbarMode) {
            this.animateHeader(this.props.searchbarMode);
        }
    }

    toggleTitleEditingMode = () => this.setState(prevState => ({ titleEditingMode: !prevState.titleEditingMode }));

    onTitleSubmit = ({ nativeEvent }) => {
        this.props.onSubmitTitleEditing && this.props.onSubmitTitleEditing(nativeEvent.text);
        this.setState({ titleEditingMode: false });
    }

    animateHeader = (showSearchbar) => {
        if (showSearchbar === false) {
            Animated.timing(this.state.searchbarAnim, {
                toValue: -WindowDimensions.width,
                duration: 300,
                useNativeDriver: true
            }).start(() => this.setState({ searchbarMode: showSearchbar }));
        } else {
            this.setState({ searchbarMode: showSearchbar }, () => {
                Animated.timing(this.state.searchbarAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true
                }).start()
            });
        }
    }

    render() {
        const { leftComponent, leftComponentStyle, leftIconProps, title, rightIconProps, onCancelSearchMode, rightComponent,
            searchValue, onChangeSearchValue, hasEditableTitle, style, searchIconProps, thumbnail, titleStyle, showShadow = true, titleNumberOfLines } = this.props;
        const { searchbarAnim, searchbarMode, titleEditingMode } = this.state;

        const searchCancelAnim = searchbarAnim.interpolate({
            inputRange: [-WindowDimensions.width, 0],
            outputRange: [0, 1]
        });
        const searchClearAnim = searchbarAnim.interpolate({
            inputRange: [-WindowDimensions.width, 0],
            outputRange: [0, 1]
        });

        return (
            <View style={[styles.header, style, showShadow ? styles.shadowStyle : null]}>
                {
                    searchbarMode === false || searchbarMode === undefined
                        ? <View style={{ flex: 1, flexDirection: 'row' }}>
                            {
                                leftComponent
                                    ? <View style={[{ alignSelf: 'center', marginHorizontal: 20 }, leftComponentStyle]}>{leftComponent}</View>
                                    : leftIconProps
                                        // ? <View style={{ marginLeft: 17, alignItems: 'center', justifyContent: 'center' }}>
                                        //     <TouchableOpacity style={leftIconProps.reverse ? styles.iconPadding : null} onPress={leftIconProps.onPress}>
                                        //         <NBIcon name={leftIconProps.name} type={leftIconProps.type} style={[{
                                        //             fontSize: 27,
                                        //             color: leftIconProps.reverse ? 'black' : 'white'
                                        //         }, leftIconProps.style]} />
                                        //     </TouchableOpacity>
                                        // </View>
                                        ? thumbnail
                                            ? thumbnail.picture
                                                ? <TouchableHighlight underlayColor='rgba(0,0,0,0.3)' style={styles.buttonArea} onPress={leftIconProps.onPress}>
                                                    <View style={[leftIconProps.reverse ? styles.iconThumbPadding : null, { flexDirection: 'row', }]}>
                                                        <NBIcon name={leftIconProps.name} type={leftIconProps.type} style={[{
                                                            fontSize: 25,
                                                            color: '#ffffff'
                                                        }, leftIconProps.style]} />
                                                        <Thumbnail style={styles.thumbnail} source={{ uri: thumbnail.picture }} />
                                                    </View>
                                                </TouchableHighlight>
                                                : <TouchableHighlight underlayColor='rgba(0,0,0,0.3)' style={styles.buttonArea} onPress={leftIconProps.onPress}>
                                                    <View style={styles.iconThumbPadding}>
                                                        <NBIcon name={leftIconProps.name} type={leftIconProps.type} style={[{
                                                            fontSize: 25,
                                                            color: '#ffffff'
                                                        }, leftIconProps.style]} />
                                                        <View style={styles.groupIconStyle}>
                                                            <NBIcon name='user' type='FontAwesome' style={{ color: 'white', fontSize: 25, alignSelf: 'center', paddingTop: 3 }} />
                                                        </View>
                                                    </View>
                                                </TouchableHighlight>
                                            : <View style={{ marginLeft: 14, alignItems: 'center', justifyContent: 'center' }}>
                                                <TouchableOpacity style={leftIconProps.reverse ? styles.iconPadding : null} onPress={leftIconProps.onPress}>
                                                    <NBIcon name={leftIconProps.name} type={leftIconProps.type} style={[{
                                                        fontSize: 25,
                                                        color: leftIconProps.reverse ? 'black' : 'white'
                                                    }, leftIconProps.style]} />
                                                </TouchableOpacity>
                                                {
                                                        this.props.notificationCount&&this.props.notificationCount>0?
                                                        <CountComponent notificationCount={this.props.notificationCount} left={22} />:null
                                                    }
                                            </View>
                                        : null
                            }
                            {
                                // thumbnail
                                //     ? thumbnail.picture
                                //         ? <Thumbnail style={styles.thumbnail} source={{ uri: thumbnail.picture }} />
                                //         : <View style={styles.groupIconStyle}>
                                //             <IconButton iconProps={{ name: 'user', type: 'FontAwesome', style: { color: 'white', width: widthPercentageToDP(13), fontSize: heightPercentageToDP(5), marginLeft: widthPercentageToDP(7), marginTop: heightPercentageToDP(0.8) } }} />
                                //         </View>
                                //     : null
                            }
                            <View style={{ flex: 1, alignSelf: 'center', marginHorizontal: leftIconProps ? 0 : 20 }}>
                                {
                                    titleEditingMode === false
                                        ? hasEditableTitle
                                            ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <DefaultText numberOfLines={titleNumberOfLines} style={[{ color: 'white', fontSize: 20, letterSpacing: 0.2, fontFamily: CUSTOM_FONTS.gothamBold }, titleStyle]}>
                                                    {title}
                                                </DefaultText>
                                                <IconButton style={{ paddingHorizontal: 0 }} onPress={this.toggleTitleEditingMode} iconProps={{ name: 'edit', type: 'MaterialIcons', style: { color: '#fff' } }} />
                                            </View>
                                            : <DefaultText numberOfLines={titleNumberOfLines} style={[{ color: 'white', fontSize: 20, letterSpacing: 0.2, marginLeft: leftIconProps ? 16 : 0, fontFamily: CUSTOM_FONTS.gothamBold }, titleStyle]}>
                                                {title}
                                            </DefaultText>
                                        : <View style={{ flexDirection: 'row', marginRight: rightIconProps ? 20 : 0, justifyContent: 'space-between', alignItems: 'center' }}>
                                            <IconButton style={{ marginRight: '8%' }} onPress={this.toggleTitleEditingMode} iconProps={{ name: 'md-arrow-round-back', type: 'Ionicons', style: { color: '#fff' } }} />
                                            <TextInput style={{ flex: 1, color: '#fff', borderBottomColor: '#fff', borderBottomWidth: 2, fontSize: 16 }} defaultValue={title} maxLength={20} onSubmitEditing={this.onTitleSubmit} />
                                        </View>
                                }
                            </View>
                            {
                                searchIconProps
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                        <TouchableOpacity style={searchIconProps.reverse ? styles.iconPadding : null} onPress={searchIconProps.onPress && searchIconProps.onPress}>
                                            <NBIcon name={searchIconProps.name} type={searchIconProps.type} style={[{
                                                fontSize: 25,
                                                color: searchIconProps.reverse ? 'black' : 'white'
                                            }, searchIconProps.style]} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    : null
                            }
                            {
                                rightComponent
                                    ? <View style={{ alignSelf: 'center', marginHorizontal: 20 }}>{rightComponent}</View>
                                    : rightIconProps
                                        ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                                            <TouchableOpacity style={[rightIconProps.reverse ? styles.iconPadding : null, rightIconProps.containerStyle]} onPress={rightIconProps.onPress && rightIconProps.onPress}>
                                                <NBIcon name={rightIconProps.name} type={rightIconProps.type} style={[{
                                                    fontSize: 25,
                                                    color: rightIconProps.reverse ? 'black' : 'white'
                                                }, rightIconProps.style]} />
                                            </TouchableOpacity>
                                        </Animated.View>
                                        : null
                            }
                        </View>
                        : <Animated.View style={{ flex: 1, flexDirection: 'row', transform: [{ translateX: searchbarAnim }] }}>
                            <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: searchCancelAnim }}>
                                <IconButton onPress={onCancelSearchMode} iconProps={{
                                    name: 'md-arrow-round-back', type: 'Ionicons', style: {
                                        fontSize: 25,
                                        color: 'white'
                                    }
                                }} />
                            </Animated.View>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <TextInput style={{ color: '#fff', borderBottomColor: '#fff', borderBottomWidth: 2, marginRight: this.props.onClearSearchValue ? 0 : 10 }}
                                    value={searchValue} onChangeText={onChangeSearchValue} autoFocus={true}
                                />
                            </View>
                            {
                                this.props.onClearSearchValue
                                    ? <Animated.View style={{ marginHorizontal: 20, alignItems: 'center', justifyContent: 'center', opacity: searchClearAnim }}>
                                        <IconButton onPress={this.props.onClearSearchValue} iconProps={{
                                            name: 'close-circle', type: 'MaterialCommunityIcons', style: {
                                                fontSize: 25,
                                                color: 'white'
                                            }
                                        }} />
                                    </Animated.View>
                                    : null
                            }
                        </Animated.View>
                }
            </View>
        );

    }
}

export class SearchHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            widthAnim: new Animated.Value(20)
        }
    }
    render() {
        const { widthAnim } = this.state;
        return (
            <SafeAreaView style={styles.header}>
                <TouchableOpacity>
                    <NBIcon name='menu' type='MaterialIcons' style={{ color: '#fff' }} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <NBIcon name='search' type='FontAwesome' style={{ color: '#fff' }} />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
}


const styles = StyleSheet.create({
    header: {
        position: 'absolute',
        // alignItems: 'center',
        top: 0,
        left: 0,
        width: '100%',
        backgroundColor: APP_COMMON_STYLES.headerColor,
        flexDirection: 'row',
        height: APP_COMMON_STYLES.headerHeight,
    },
    shadowStyle: {
        elevation: 30,
        shadowOffset: { width: 0, height: 8 },
        shadowColor: '#000000',
        shadowOpacity: 0.9,
        shadowRadius: 5,
        zIndex: 900
    },
    iconPadding: {
        padding: 5,
        backgroundColor: 'white',
        borderRadius: 19,
        height: 33,
        width: 33,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonArea: {
        marginLeft: 10,
        borderRadius: 20,
        overflow: 'hidden',
        height: 40,
        width: 65,
        alignSelf: 'center'
    },
    iconThumbPadding: {
        flex: 1,
        flexDirection: 'row',
        padding: 3,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    thumbnail: {
        // marginHorizontal: 10,
        // height: THUMBNAIL_SIZE,
        // width: THUMBNAIL_SIZE,
        // borderRadius: THUMBNAIL_SIZE / 2,
        marginLeft: 3,
        height: 35,
        width: 35,
        borderRadius: 17.5,
        alignSelf: 'center'
    },
    groupIconStyle: {
        // marginHorizontal: 10,
        // height: THUMBNAIL_SIZE,
        // width: THUMBNAIL_SIZE,
        // borderRadius: THUMBNAIL_SIZE / 2,
        marginLeft: 3,
        height: 35,
        width: 35,
        borderRadius: 17.5,
        alignSelf: 'center',
        backgroundColor: '#6b6b6b'
    },
})