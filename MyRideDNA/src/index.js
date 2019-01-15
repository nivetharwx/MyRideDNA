import React, { Component } from 'react';
import Navigation from './navigation';
import RNFetchBlob from 'rn-fetch-blob';

// DOC: Without this map matching api of mapbox was throwing error (Invalid query param)
global.Blob = RNFetchBlob.polyfill.Blob;
global.Fetch = RNFetchBlob.polyfill.Fetch;
global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;

export default class App extends Component {
    render() {
        return (
            <Navigation />
        )
    }
}