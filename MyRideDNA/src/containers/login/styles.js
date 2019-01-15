import { WindowDimensions } from '../../constants'

const LOGIN_BUTTON_HEIGHT = 100;

export const LoginStyles = {
    loginBackground: {
        height: '100%',
        width: '100%'
    },
    loginScreen: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: '10%',
        justifyContent: 'flex-end',
        marginVertical: 60
    },
    loginForm: {
        backgroundColor: 'white',
        height: 200,
    },
    loginButtonContainer: {
        marginTop: -(LOGIN_BUTTON_HEIGHT / 2),
        position: 'absolute',
        zIndex: 10,
        alignSelf: 'center'
    },
    loginButton: {
        backgroundColor: '#EB861E',
        alignSelf: 'center',
        width: 100,
        height: 100,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        paddingTop: 10,
        paddingBottom: 10,
        color: '#fff',
        textAlign: 'center'
    }
}