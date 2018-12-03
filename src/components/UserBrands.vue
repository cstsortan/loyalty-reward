<template>
<ion-app>
    <div v-if="coupons">
        <ion-row>
            <ion-col size="2" v-for="coupon in coupons" :key="coupon.id">
                <qrcode :value="coupon.id"></qrcode>
            </ion-col>
        </ion-row>
    </div>
    <div v-else>
        <ion-card>
            <ion-card-header>
                <ion-card-title>Create a new Brand</ion-card-title>
                <ion-card-subtitle>Enter a name for your new brand and the maximum amount of stamps per stamp-card needed for users to redeem</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
                <ion-item>
                    <ion-input @ionChange="newBrand.name=$event.target.value" :value="newBrand.name" required type="text" placeholder="Brand Name"></ion-input>
                </ion-item>
                <ion-item>
                    <ion-input @ionChange="newBrand.maxStamps=$event.target.value" :value="newBrand.maxStamps" required type="number" placeholder="Stamps Count"></ion-input>
                </ion-item>
                <ion-button @click="createBrand">
                    Create
                </ion-button>
            </ion-card-content>
        </ion-card>
        <div v-for="brand in userBrands" :key="brand.id">
            <ion-card>
                <ion-card-header>
                    <ion-card-title>
                        {{brand.name}}
                    </ion-card-title>
                    <ion-card-subtitle>
                        <ion-button @click="showCoupons(brand.id)" color="secondary">Show coupons</ion-button>
                    </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                    <div>Max Stamps: {{brand.maxStamps}}</div>
                    <ion-item>
                        <ion-label for="couponsCount">Number of Coupons</ion-label>
                        <ion-input :value="newCoupons[brand.id]" @ionChange="newCoupons[brand.id]=$event.target.value" type="number" name="CouponsCount" placeholder="e.g. 10"></ion-input>
                    </ion-item>
                    <ion-button @click="generateCoupons(brand.id)">
                        Generate coupons
                    </ion-button>
                </ion-card-content>
            </ion-card>
        </div>
    </div>

</ion-app>
</template>
<style>
qrcode {
    margin-top: 20px;
}
</style>

<script>
import {
    getUserBrands,
    createBrand,
    createCoupons,
    getCoupons
} from "@/services/firebase";
export default {
    data() {
        return {
            newBrand: {
                name: '',
                maxStamps: 10,
            },
            newCoupons: {},
            coupons: null,
        }
    },
    methods: {
        generateCoupons(brandId) {
            if (this.newCoupons[brandId] <= 0) return;
            createCoupons(brandId, this.newCoupons[brandId])
            this.newCoupons[brandId = 0] = 0
        },
        createBrand() {
            if (!this.newBrand.name || this.newBrand.maxStamps < 2) {
                return;
            }
            createBrand(this.newBrand);
            this.newBrand.name = '';
            this.newBrand.maxStamps = 10;
        },
        showCoupons(id) {
            getCoupons(id).then(coupons => {
                this.coupons = coupons
            });
        }
    },
    subscriptions: {
        userBrands: getUserBrands()
    },
    computed: {

    }
};
</script>
