import React from 'react';
import {
    View,
    Text,
    TextInput,
    Switch,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { Icon as NBIcon, Picker, DatePicker } from 'native-base';
import { WindowDimensions, ShortMonthNames, heightPercentageToDP, widthPercentageToDP } from '../../constants';
import { getFormattedDateFromISO } from '../../util';

const getKeyboardTypeForContentType = (contentType) => {
    if (contentType === 'telephoneNumber' || contentType === 'postalCode' || contentType === 'creditCardNumber') {
        return 'number-pad';
    } else if (contentType === 'emailAddress') {
        return 'email-address';
    }
}

export const LabeledInput = ({ hideKeyboardOnSubmit, inputValue, containerStyle, label, labelStyle, placeholder, placeholderColor, inputStyle, inputType, returnKeyType, returnKeyLabel, onChange, onSubmit, inputRef, onFocus, onBlur, editable }) => (
    <View style={[{ flexDirection: 'row', marginBottom: 10 }, containerStyle]}>
        {
            label
                ? <Text style={[{ alignSelf: 'center', marginRight: 10 }, labelStyle]}>{label}</Text>
                : null
        }
        <TextInput editable={editable} onFocus={onFocus && onFocus} onBlur={onBlur && onBlur} value={inputValue} blurOnSubmit={typeof hideKeyboardOnSubmit === 'undefined' ? true : hideKeyboardOnSubmit} secureTextEntry={inputType === 'password'} style={[{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#acacac' }, inputStyle]}
            placeholderTextColor={placeholderColor} placeholder={placeholder} textContentType={inputType} keyboardType={getKeyboardTypeForContentType(inputType)}
            onChangeText={onChange && onChange} onSubmitEditing={({ nativeEvent }) => onSubmit && onSubmit(nativeEvent.text)}
            returnKeyType={returnKeyType || 'done'} returnKeyLabel={returnKeyLabel} ref={(el) => inputRef && inputRef(el)} />
    </View>
);
export const LabeledInputPlaceholder = ({ hideKeyboardOnSubmit, inputValue, containerStyle, label, labelStyle, placeholder, placeholderColor, inputStyle, inputType, returnKeyType, returnKeyLabel, onChange, onSubmit, inputRef, onFocus, onBlur, editable, placeHolderStyle, secondLabelStyle, secondLabel, outerContainer }) => (
    <View style={[outerContainer]}>
        <View style={[{ flexDirection: 'row', marginBottom: 3 }, containerStyle]}>
            <TextInput editable={editable} onFocus={onFocus && onFocus} onBlur={onBlur && onBlur} value={inputValue} blurOnSubmit={typeof hideKeyboardOnSubmit === 'undefined' ? true : hideKeyboardOnSubmit} secureTextEntry={inputType === 'password'} style={[{ borderBottomWidth: 1, borderBottomColor: '#000', width:WindowDimensions.width }, inputStyle]}
                textContentType={inputType} keyboardType={getKeyboardTypeForContentType(inputType)}
                onChangeText={onChange && onChange} onSubmitEditing={({ nativeEvent }) => onSubmit && onSubmit(nativeEvent.text)}
                returnKeyType={returnKeyType || 'done'} returnKeyLabel={returnKeyLabel} ref={(el) => inputRef && inputRef(el)} />
        </View>
        {
            label ?

                <View style={{ flexDirection: 'row' }}>
                    <Text style={[labelStyle]}>{label}</Text>
                    {
                        secondLabel ?
                            <Text style={[secondLabelStyle]}>{secondLabel}</Text>
                            : null
                    }
                </View>
                :
                null
        }
    </View>
);
export const IconicInput = ({ inputColor, containerStyle, iconProps, placeholder, value, inputType, onChange, iconEnd, onFocusout }) => (
    <View style={[{ flexDirection: 'row', marginVertical: 10 }, containerStyle]}>
        {
            iconProps.onPress
                ? <TouchableOpacity style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} onPress={iconProps.onPress}>
                    <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                </TouchableOpacity>
                : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                </View>
        }
        <TextInput secureTextEntry={inputType === 'password'} style={{ flex: 10, borderBottomColor: '#D4D4D4', borderBottomWidth: 1, color: inputColor }}
            placeholder={placeholder} textContentType={inputType} value={value} onChangeText={(val) => onChange && onChange(val)} keyboardType={getKeyboardTypeForContentType(inputType)} onBlur={onFocusout} />
        {
            iconEnd
                ? iconEnd
                : null
        }
    </View>
);

// DOC: Controlled component, caller have to pass onValueChange function to persist the user selection
export const IconicList = ({ iconProps,outerContainer, values, selectedValue, placeholder, onChange, containerStyle, style, innerContainerStyle, labelPlaceHolder, labelPlaceHolderStyle, pickerStyle }) => {
    let options = selectedValue ? values : [{ label: placeholder || 'Select any', value: '' }, ...values];
    return (
        <View style={[outerContainer]}>
            <View style={[{ flexDirection: 'row' }, containerStyle]}>
                {
                    iconProps
                        ? <View style={{ paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                        </View>
                        : null
                }
                <View style={[innerContainerStyle]}>
                    <Picker
                        mode="dropdown"
                        iosIcon={<NBIcon name="ios-arrow-down-outline" />}
                        placeholder={placeholder}
                        placeholderStyle={{ color: "#a9a9a9", marginLeft: 0, paddingLeft: 0 }}
                        placeholderIconColor="#a9a9a9"
                        style={[{ width: iconProps ? WindowDimensions.width - 30 : WindowDimensions.width, borderBottomWidth: 1, borderBottomColor: '#000' }, pickerStyle]}
                        selectedValue={selectedValue}
                        onValueChange={onChange && onChange}
                    >
                        {
                            options.map((option, index) => <Picker.Item key={option.value} label={option.label} value={option.value} />)
                        }
                    </Picker>
                </View>
            </View>
            {
                labelPlaceHolder ?
                    <Text style={[labelPlaceHolderStyle]}>{labelPlaceHolder}</Text>
                    : null
            }
        </View>
    );
}

export const IconicSwitch = ({ iconProps, label, selectedValue, onChange }) => (
    <View style={{ flexDirection: 'row', marginVertical: 10 }}>
        <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
            <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, { flex: 1, marginRight: 10 }, iconProps.style]} />
        </View>
        <View style={{ flex: 1, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>{label}</Text>
            <Switch value={selectedValue} onValueChange={(value) => onChange(value)} style={{ alignSelf: 'center' }} />
        </View>
    </View>
);

// DOC: Controlled component, caller have to pass onValueChange function to persist the user selection
export const IconicDatePicker = ({ iconProps, outerContainer, selectedDate, datePickerStyle, selectedDateString, minDate, maxDate, placeholder, onChange, label, labelStyle }) => {
    let currentDate = new Date();
    return (
        <View style={[outerContainer]}> 
            <View style={{ flexDirection: 'row', marginVertical: 4 }}>
                {
                    iconProps
                        ? <View style={{ paddingLeft: 10, paddingRight: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <NBIcon name={iconProps.name} type={iconProps.type} style={[styles.formFieldIcon, iconProps.style]} />
                        </View>
                        : null
                }
                <DatePicker
                    defaultDate={selectedDate ? new Date(selectedDate) : currentDate}
                    minimumDate={minDate || new Date(currentDate.getFullYear() - 100, currentDate.getMonth() + 1, currentDate.getDay())}
                    maximumDate={maxDate || currentDate}
                    locale={"en"}
                    timeZoneOffsetInMinutes={undefined}
                    modalTransparent={false}
                    animationType={"fade"}
                    androidMode={"default"}
                    // placeHolderText={selectedDate ? getFormattedDateFromISO(new Date(selectedDate).toISOString(), '/') : placeholder ? placeholder : 'Select date'}
                    textStyle={[styles.datePickerDefaultStyles, datePickerStyle]}
                    placeHolderTextStyle={[styles.datePickerDefaultStyles, { color: selectedDate ? "black" : "#a9a9a9" }]}
                    onDateChange={onChange && onChange}
                />
            </View>
            {
                label ?
                    <Text style={[labelStyle]}>{label}</Text>
                    : null
            }
        </View>
    )
}

export const SearchBox = ({ value, hideIcon, onTextChange, onFocus, onPressClear, style, hideBoxStyle }) => (
    <View style={[styles.searchBox, style]}>
        <View style={[styles.inputWrapper, hideBoxStyle ? null : styles.boxStyle]}>
            <View style={{ flexDirection: 'row' }}>
                {
                    hideIcon
                        ? null
                        : <NBIcon name='search' type='FontAwesome' style={styles.icon} />
                }
                <TextInput onFocus={onFocus} style={styles.inputSearch} value={value} placeholder='Search here' onChangeText={onTextChange} />
                <NBIcon name='close' style={styles.icon} onPress={onPressClear} />
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    formFieldIcon: {
        fontSize: 20,
        color: '#999999'
    },
    datePickerDefaultStyles: {
        width: WindowDimensions.width,
        borderBottomColor: '#000',
        borderBottomWidth: 1,
        color: 'black'
    },
    searchBox: {
        flex: 1,
    },
    inputWrapper: {
        backgroundColor: '#fff',
        opacity: 0.9,
    },
    boxStyle: {
        borderRadius: 7,
        borderColor: '#000',
        borderWidth: 1,
    },
    inputSearch: {
        fontSize: 14,
        flex: 1,
        marginRight: 10,
        minHeight: 40,
        marginLeft: 5
    },
    label: {
        fontSize: 10,
        fontStyle: 'italic',
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 0,
    },
    icon: {
        color: '#000',
        fontSize: 18,
        alignSelf: 'center',
        paddingHorizontal: 10,
    }
});