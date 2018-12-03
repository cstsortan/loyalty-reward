<template>
<ion-app>
    <ion-header>
        <ion-toolbar color="primary">
            <ion-buttons slot="start">
                <ion-back-button default-href="home" @click="goBack()"></ion-back-button>
            </ion-buttons>
            <ion-title>Stamper</ion-title>
        </ion-toolbar>
    </ion-header>
    <ion-content>
        <div v-if="state === views.scanning">
            <h3>Please scan your Stamp QR code with your camera!</h3>
            <qrcode-reader @detect="onDetect"></qrcode-reader>
            <div class="alternative">
                <p>Or</p>
                <ion-button @click="askStaff">Ask a staff member to stamp you</ion-button>
            </div>
        </div>
        <div v-if="state === views.checking" class="center">
            Checking...
            <ion-spinner></ion-spinner>
        </div>
        <div class="center" v-if="state === views.success">
            <ion-badge color="success">Success!!</ion-badge>
            <div class="center">
                <ion-icon class="successIcon" color="success" name="checkmark-circle"></ion-icon>
                Congratulations on your new stamp!
            </div>
        </div>
        <div v-if="state === views.fail">
            <div class="center">
                <ion-badge color="danger">
                    Error
                </ion-badge>
                <div class="center">
                    Sorry, there was a problem with this QRCode
                </div>
                <ion-button @click="tryAgain">Try again!</ion-button>
                <ion-button @click="askStaff">Ask staff member</ion-button>
            </div>
        </div>
        <div v-if="state === views.askstaff">
            <div class="center">
                <div>
                    Please ask a staff member to help!
                    You can show them this code and they
                    can stamp you instead!
                </div>
                <div>QRCODE_HERE</div>
            </div>
        </div>
    </ion-content>
</ion-app>
</template>

<style scoped>
.successIcon {
    font-size: 36px;
}

.center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 6rem;
}

.alternative {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 5em;
    padding: 1em;
    border-top: 1px #DCDCDC solid;
    border-bottom: 1px #DCDCDC solid;
}
</style>

<script>
import {
    QrcodeReader
} from 'vue-qrcode-reader';
import {
    checkStamp
} from '@/services/firebase';
// Something like an enum
const states = Object.freeze({
    scanning: "scanning",
    checking: "checking",
    success: "success",
    fail: "fail",
    askstaff: "askstaff",
});
export default {
    components: {
        QrcodeReader
    },
    data: function () {
        return {
            views: states,
            state: states.scanning,
        };
    },
    methods: {
        async onDetect(promise) {
            try {
                const {
                    content
                } = await promise;
                if (content) {
                    this.state = states.checking;
                    // Start the checking by invoking a callable function
                    // ......
                    console.log('Checking ', content)
                    const result = await checkStamp(content);
                    console.log(result)
                    if (result.data.success) {
                        this.state = states.success;
                    } else {
                        this.state = states.fail;
                    }
                }
            } catch (err) {
                console.log(err);
            }
        },
        tryAgain() {
            this.state = states.scanning;
        },
        askStaff() {
            this.state = states.askstaff;
        },
        goBack() {
            this.$router.push('/');
        }
    }
}
</script>
