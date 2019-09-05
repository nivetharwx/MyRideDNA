package com.myridedna;

import android.app.Application;

import android.content.IntentFilter;
import com.facebook.react.ReactApplication;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.transistorsoft.rnbackgroundgeolocation.RNBackgroundGeolocation;
import io.rumors.reactnativesettings.RNSettingsPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.mapbox.rctmgl.RCTMGLPackage;

import com.reactnative.ivpusic.imagepicker.PickerPackage;
import io.rumors.reactnativesettings.receivers.GpsLocationReceiver;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new MainReactPackage(),
            new RNFirebasePackage(),
            new RNFirebaseMessagingPackage(),
            new RNFirebaseNotificationsPackage(),
            new RNBackgroundFetchPackage(),
            new RNBackgroundGeolocation(),
            new RNSettingsPackage(),
            new ReactNativeContacts(),
            new RCTMGLPackage(),
            new PickerPackage(),
          new RNDeviceInfo(), 
          new VectorIconsPackage(),
          new RNFusedLocationPackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    registerReceiver(new GpsLocationReceiver(), new IntentFilter("android.location.PROVIDERS_CHANGED"));
  }
}
