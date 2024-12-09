<script>
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import layers from 'protomaps-themes-base';
import { setLatLng } from '../../js/LocationUtils';

const ONLINE_ZOOM = 12;
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
      p: null,
      config: {
        allow_auto_resending_failed_messages_with_attachments: false,
        auto_announce_enabled: true,
        auto_announce_interval_seconds: 1800,
        auto_resend_failed_messages_when_announce_received: true,
        auto_send_failed_messages_to_propogation_node: false,
        avatar: null,
        display_name: "Anonymous Peer",
        location: null
      },
      bounds: [
          [25.281944, 34.592838],
          [44.892540, 43.161398]
      ]
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

          /**
          L.marker([latitude, longitude]).addTo(this.map)
              .bindPopup((l) => {
                const el = document.createElement("div");

                /**
                 * Get the peer data
                 * @param identityHash
                 * @returns {Promise<void>}
                */
          /*
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
        */
        }
      } catch (e) {
        console.log(e);
      }
    },
    async update() {
      await this.getUserLocations();
    },
    async onAutoReload() {
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
    async createMap() {
      try {
        this.map = new maplibregl.Map({
          container: 'map',
          style: "maplibre/tr.json",
          /*
          style: {
            "version": 8,
            "glyphs": 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
            "sprite": "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
            "sources": {
              "protomaps": {
                "type": "vector",
                "url": "pmtiles://turkiye6.pmtiles",
              }
            },
            "layers": layers("protomaps", "light"),
            /*"layers": [
              {
                "id": "background",
                "type": "background",
                "paint": {
                  "background-color": "#ccc"
                }
              },
              {
                "id": "buildings",
                "type": "fill",
                "source": "protomaps",
                "source-layer": "buildings"
              },
            ],
            
        "id": "protomaps"
          },
          */
          center: [35.087242, 38.877118], // starting position [lng, lat]
          hash: false, // sync page's url
          maxPitch: 0,
          //pitch: 45,
          zoom: 5.781372202368083, // starting zoom
          minZoom: 5.781372202368083,
          maxBounds: this.bounds,
        });
        let nav = new maplibregl.NavigationControl();
        this.map.addControl(nav, 'bottom-right');
        this.map.fitBounds(this.bounds);

        this.map.on('zoomend', (e) => {
          console.log(this.map.getZoom());
        });
      } catch (e) {
        console.error(e);
      }
    },
    async getConfig() {
      try {
        console.log("get config");
        const response = await window.axios.get("/api/v1/config");
        if (response.status === 200) {
          this.config = response.data.config;

          setTimeout(() => {
            this.setLocations()
          }, 3000);
        }
      } catch (e) {
        // do nothing if failed to load config
        console.log(e);
      }
    },
    setLocations() {
      if (this.map) {
        // set user location
        if (this.config !== null && this.config.location !== null) {
          const {latitude, longitude} = setLatLng(this.config.location);
          new maplibregl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(this.map);
        } else {
          console.log("set current location from geolocation");
        }
        /*
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

          this.zoom = this.getZoomOption();
          this.map.setView(this.center, this.zoom);
        });
        */
        console.log("Set Locations");
      }
    },
  },
  watch: {
  },
  beforeMount() {
    this.getConfig();
  },
  mounted() {
    let protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);

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
    <div id="map" class="w-full h-full" style="min-width: 600px; min-height: 600px;"></div>
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
