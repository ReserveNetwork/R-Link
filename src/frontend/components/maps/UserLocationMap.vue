<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import mbTiles from '../../js/Leaflet.TileLayer.MBTiles';
import Ping from "ping.js";

const ONLINE_MAX_ZOOM = 36;
const OFFLINE_MAX_ZOOM = 5;
const RADIUS = 5000;
const OPACITY = 0.5;
const FILL_COLOR = "#f03";
const COLOR = 'red';

export default {
  name: "UserLocationMap",
  data() {
    return {
      map: null,
      tileLayer: null,
      loading: false,
      center: [41.3851, 36.519],
      zoom: 2,
      isShowingControls: true,
      autoReload: false,
      reloadInterval: null,
      isUpdating: false,
      locations: [],
      onLine: false,
      p: null,
      config: null,
    };
  },
  methods: {
    // get the user's location
    async getUserLocations() {
      try {
        const response = await window.axios.get(`/api/v1/announces`, {
          params: {
            aspect: "telemetry.location",
            limit: 100,
          },
        })

        const userLocations = response.data.announces;
        for (const userLocation of userLocations) {
          if (this.locations[userLocation.identity_hash]) {
            continue;
          }

          this.locations[userLocation.identity_hash] = userLocation;

          const appData = userLocation["display_name"];
          const latitude = appData.split(",")[0];
          const longitude = appData.split(",")[1];

          L.marker([latitude, longitude]).addTo(this.map)
              .bindPopup((l) => {
                const el = document.createElement("div");

                /**
                 * Get the peer data
                 * @param identityHash
                 * @returns {Promise<void>}
                 */
                const getData = async (identityHash) => {
                  const response = await window.axios.get(`/api/v1/announces`, {
                    params: {
                      aspect: "lxmf.delivery",
                      limit: 100,
                      identity_hash: identityHash,
                    },
                  });
                  if (response.data.announces.length > 0) {
                    const announce = response.data.announces[0];
                    el.innerHTML = `${announce.display_name}`;
                  }
                };
                getData(userLocation.identity_hash);
                return el;
              });
        }
      } catch (e) {
        console.log(e);
      }
    },
    async update() {
      await this.getUserLocations();
    },
    async onAutoReload() {
      await this.isConnectionUp();
      // do nothing if auto reload disabled
      if (!this.autoReload) {
        return;
      }

      // do nothing if already updating
      if (this.isUpdating) {
        return;
      }

      // auto reload
      try {
        this.isUpdating = true;
        await this.update();
      } finally {
        this.isUpdating = false;
      }

    },
    async isConnectionUp() {
      try {
        this.p.ping("https://www.google.com", (err, duration, payload) => {
          if (err) {
            this.onLineStatus(false);
          } else {
            this.onLineStatus(true);
          }
        }).catch((e) => {
          console.error(e);
        });
      } catch (e) {
        console.error(e);
        this.onLineStatus(false);
      }
    },
    onLineStatus(isUp) {
      console.log("onLineStatus", isUp);
      this.onLine = isUp;
    },
    async createMap() {
      try {
        await this.isConnectionUp();
        this.map = new L.Map('map').fitWorld();

        if (this.onLine) {
          this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            minZoom: 2,
            maxZoom: 48,
          });
          this.setLocations();
        } else {
          this.tileLayer = mbTiles("assets/db/countries-raster.mbtiles", {
            minZoom: 0,
            maxZoom: 6,
          });
        }

        this.tileLayer.addTo(this.map);

        if (!this.onLine) {
          this.tileLayer.on("databaseloaded", function () {
            console.log("MBTiles database loaded");
            this.loading = false;
          });
          this.tileLayer.on("databaseerror", function (e) {
            console.error("MBTiles error", e.error);
            this.loading = false;

          });

          this.setLocations();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getConfig() {
      try {
        const response = await window.axios.get("/api/v1/config");
        this.config = response.data.config;
      } catch (e) {
        // do nothing if failed to load config
        console.log(e);
      }
    },
    setLocations() {
      if (this.map) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.center = [position.coords.latitude, position.coords.longitude, position.coords.altitude];
          this.zoom = this.getZoomOption();
          L.marker(this.center).bindPopup("You are here").addTo(this.map);
          L.circle(this.center, {
            color: COLOR,
            fillColor: FILL_COLOR,
            fillOpacity: OPACITY,
            radius: RADIUS,
          }).addTo(this.map);

          this.map.setView(this.center, this.zoom);
        }, (error) => {
          console.error(error);

          if (this.config.location) {
            const latitude = this.config.location.split(",")[0];
            const longitude = this.config.location.split(",")[1];
            this.center = [latitude, longitude];
            console.log(latitude, longitude);
          } else {
            this.center = [41.3851, 36.519];
          }

          L.marker(this.center).bindPopup("You are here").addTo(this.map);
          L.circle(this.center, {
            color: COLOR,
            fillColor: FILL_COLOR,
            fillOpacity: OPACITY,
            radius: RADIUS,
          }).addTo(this.map);

          this.zoom = this.getZoomOption();
          this.map.setView(this.center, this.zoom);
        });
      }
    },
    getZoomOption() {
      if (this.onLine) {
        return ONLINE_MAX_ZOOM;
      }
      return OFFLINE_MAX_ZOOM;
    }
  },
  watch: {
    onLine(value) {
      if (!this.map) {
        return;
      }
      this.tileLayer.remove();
      if (value) {
        this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          minZoom: 2,
          maxZoom: 48,
        });
      } else {
        this.tileLayer = mbTiles("assets/db/countries-raster.mbtiles", {
          minZoom: 0,
          maxZoom: 6,
        });
      }
      this.tileLayer.addTo(this.map);
    }
  },
  mounted() {
    this.getConfig();
    this.p = new Ping({
      favicon: "",
    });

    void this.createMap().then(() => {
      this.getUserLocations();
    });

    this.reloadInterval = setInterval(this.onAutoReload, 5000);
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
    clearInterval(this.reloadInterval);
  },
}
</script>

<template>
  <div class="w-full h-full relative">
    <div id="map" class="w-full h-screen" style="min-width: 600px; min-height: 600px;"></div>
    <div v-if="loading"
         class="absolute top-0 left-0 w-full h-full bg-white bg-opacity-75 flex items-center justify-center">
      <div class="text-2xl font-bold text-gray-800"></div>
    </div>
    <!-- controls -->
    <div class="absolute flex bottom-0 left-0 bg-gray-100 p-2" style="z-index: 9999">
      <div class="bg-white rounded shadow min-w-52">
        <div @click="isShowingControls = !isShowingControls" class="flex text-gray-700 p-2 cursor-pointer">
          <div class="my-auto">Reserve Network</div>
          <div class="flex ml-auto">
            <button @click.stop="update" type="button"
                    class="my-auto inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-1 py-0.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                   stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
              </svg>
            </button>
          </div>
        </div>
        <div v-if="isShowingControls" class="divide-y text-gray-900 border-t border-gray-300">
          <div class="px-1 py-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="autoReload" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Auto Update (5 sec)</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>