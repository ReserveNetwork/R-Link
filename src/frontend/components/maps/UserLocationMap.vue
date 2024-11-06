<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import mbTiles from '../../js/Leaflet.TileLayer.MBTiles';

export default {
  name: "UserLocationMap",
  data() {
    return {
      map: null,
      tileLayer: null,
      loading: false,
      center: [41.3851, 36.519],
      zoom: 2,
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
  },
  mounted() {
    this.map = new L.Map('map').fitWorld();

    this.tileLayer = mbTiles("assets/db/countries-raster.mbtiles", {
      minZoom: 0,
      maxZoom: 6,
    });

    this.tileLayer.addTo(this.map);

    this.tileLayer.on("databaseloaded", function (e) {
      console.log("MBTiles database loaded");
      this.loading = false;
    });

    this.tileLayer.on("databaseerror", function (e) {
      console.error(e.error);
      console.log("MBTiles database error: ", e.error);
      this.loading = false;
    });
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = [position.coords.latitude, position.coords.longitude];
      this.map.setView(this.center, this.zoom);
      L.marker(this.center).addTo(this.map);
    });
    this.getUserLocations();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
}
</script>

<template>
  <div class="w-full h-full">
    <div id="map" class="w-full h-screen" style="min-width: 600px; min-height: 600px;"></div>
    <div v-if="loading"
         class="absolute top-0 left-0 w-full h-full bg-white bg-opacity-75 flex items-center justify-center">
      <div class="text-2xl font-bold text-gray-800"></div>
    </div>
  </div>
</template>

<style scoped>

</style>