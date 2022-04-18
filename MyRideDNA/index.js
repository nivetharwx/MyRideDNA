/** @format */

import { AppRegistry } from 'react-native';
import App from './src';
import { name as appName } from './app.json';
import bgMessaging from './src/bgMessaging'; // <-- Import the file you created in (2)



AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => bgMessaging)