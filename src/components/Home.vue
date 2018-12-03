<template>
<ion-app>
    <ion-tabs>
        <ion-tab label="Home" icon="home">
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-title>Home</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content padding>
                <div v-for="card in stampCards" :key="card.id">
                    <ion-card>
                        <ion-card-header>
                            <ion-title>
                                {{card.brand.name}}
                            </ion-title>
                        </ion-card-header>
                        <ion-card-content>
                            <ion-item>
                                <ion-subtitle v-if="card.stampsCount < card.brand.maxStamps">
                                    {{card.stampsCount}} / {{card.brand.maxStamps}}
                                </ion-subtitle>
                                <ion-button color="success" v-else>
                                    Redeem
                                </ion-button>
                            </ion-item>
                        </ion-card-content>
                    </ion-card>
                </div>
                <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                    <router-link to="/stamper">
                        <ion-fab-button>
                            <ion-icon name="aperture"></ion-icon>
                        </ion-fab-button>
                    </router-link>
                </ion-fab>

            </ion-content>
        </ion-tab>

        <ion-tab label="Map" icon="map">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Map</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content padding>
                <h1>Map Content</h1>
                <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                    <router-link to="/stamper">
                        <ion-fab-button>
                            <ion-icon name="aperture"></ion-icon>
                        </ion-fab-button>
                    </router-link>
                </ion-fab>
            </ion-content>
        </ion-tab>

        <ion-tab label="Camera" icon="camera">
            <ion-header>
                <ion-toolbar color="primary">
                    <ion-title>Camera</ion-title>
                </ion-toolbar>
            </ion-header>
            <ion-content padding>
                <h1>Camera Content</h1>
                <ion-fab vertical="bottom" horizontal="end" slot="fixed">
                    <router-link to="/stamper">
                        <ion-fab-button>
                            <ion-icon name="aperture"></ion-icon>
                        </ion-fab-button>
                    </router-link>
                </ion-fab>
            </ion-content>
        </ion-tab>
    </ion-tabs>
</ion-app>
</template>

<script>
import {
    getStampCards
} from "@/services/firebase";
export default {
    subscriptions: {
        stampCards: getStampCards()
    }
};
</script>
