import {Component, ViewChild} from '@angular/core';
import {Nav, Platform, LoadingController} from 'ionic-angular';
//import { Splashscreen } from 'ionic-native';

import { Page1 } from '../pages/page1/page1';
import { SettingsPage } from '../pages/settings/settings';
import { LoginPage } from '../pages/login/login';
import { AlbumsPage } from '../pages/albums/albums';

import { Storage } from '@ionic/storage';
import { Auth } from '../providers/auth';
import { IpfsProvider } from "../providers/ipfs";
import { PhotoLibrary } from 'ionic-native';



@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any;
    loader: any;
    status: string = "offline";
    pages: Array<{title: string, component: any}>;

    constructor(public platform: Platform, public storage: Storage, public auth: Auth, public loadingCtl: LoadingController, public ipfs: IpfsProvider) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [];
        // used for an example of ngFor and navigation
        this.pages.push({title: 'Home', component: Page1});
        this.pages.push({title: 'Albums', component: AlbumsPage});

        this.pages.push({title: 'Settings', component: SettingsPage});
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // StatusBar.styleDefault();
            // Splashscreen.hide();

            this.ipfs.getNode().then((node)=>{
                node.id((err, id)=>{console.log(id)})
                this.status = node.isOnline() ? "online": "offline";

                this.fetchFiles();
            });



            this.showLoader();

            this.storage.ready().then(() => {

                this.auth.loginWithToken().then((isLoggedIn) => {
                    if (isLoggedIn) {
                        this.rootPage = Page1;


                    } else {
                        this.rootPage = LoginPage;
                    }
                    this.hideLoader();
                });

            });

        });

    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(page.component);
    }

    showLoader() {
        this.loader = this.loadingCtl.create({
            content: "please wait"
        });
        this.loader.present();
    }

    hideLoader() {
        this.loader.dismiss();
    }

    logout() {
        this.auth.logout().then(() => {
            this.nav.setRoot(LoginPage);
        });
    }

    fetchFiles(){
      PhotoLibrary.requestAuthorization().then(() => {
        PhotoLibrary.getLibrary().subscribe({
          next: library => {
            library.forEach(function(libraryItem) {
              console.log(libraryItem.id);          // ID of the photo
              console.log(libraryItem.photoURL);    // Cross-platform access to photo
              console.log(libraryItem.thumbnailURL);// Cross-platform access to thumbnail
              console.log(libraryItem.fileName);
              console.log(libraryItem.width);
              console.log(libraryItem.height);
              console.log(libraryItem.creationDate);
              console.log(libraryItem.latitude);
              console.log(libraryItem.longitude);
              console.log(libraryItem.albumIds);    // array of ids of appropriate AlbumItem, only of includeAlbumsData was used
            });
          },
          error: err => {},
          complete: () => { console.log("could not get photos"); }
        });
      })
        .catch(err => console.log("permissions weren't granted"));
    }

}
