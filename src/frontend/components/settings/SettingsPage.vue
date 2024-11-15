<template>
  <div class="flex flex-col flex-1 overflow-hidden min-w-full sm:min-w-[500px]">
    <div class="overflow-y-auto space-y-2 p-2">

      <!-- my identity -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">
          <div class="my-auto mr-auto">My Identity</div>
          <div class="my-auto">
            <button class="my-auto inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500" @click.stop="onIdentityChange()" type="button">
              Save Identity
            </button>
          </div>
        </div>
        <div class="divide-y text-gray-900">
          <div class="p-2">
            <div class="text-sm text-gray-700">
              <label for="display-name" class="text-sm font-medium text-gray-900">Display Name</label>
              <input v-model="config.display_name" type="text" placeholder="Display Name"
                         class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"> 
            </div>
          </div>

          <!-- show identity hash and lxmf address -->
          <div class="p-2">
            <div class="text-sm text-gray-700">
              <div class="font-medium text-gray-900">Identity Hash</div>
              <div>{{ config.identity_hash }}</div>
            </div>
          </div>

          <div class="p-2">
            <div class="text-sm text-gray-700">
              <div class="font-medium text-gray-900">LXMF Address</div>
              <div>{{ config.lxmf_address_hash }}</div>
            </div>
          </div>
          <!-- end identity hash -->
        </div>
      </div>

      <!-- announce -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">Announce</div>
        <div class="divide-y text-gray-900">
          <div class="p-2">
            <label for="announce-interval" class="text-sm font-medium text-gray-900">
              Announce Interval Seconds
            </label>
            <select v-model="config.auto_announce_interval_seconds" @change="onAnnounceIntervalSecondsChange"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
              <option value="0">Disabled</option>
              <option value="900">Every 15 Minutes</option>
              <option value="1800">Every 30 Minutes</option>
              <option value="3600">Every 1 Hour</option>
              <option value="10800">Every 3 Hours</option>
              <option value="21600">Every 6 Hours</option>
              <option value="43200">Every 12 Hours</option>
              <option value="86400">Every 24 Hours</option>
            </select>
            <div class="text-sm text-gray-700">
              <span v-if="config.last_announced_at">
                Last announced: {{ formatSecondsAgo(config.last_announced_at) }}
              </span>
              <span v-else>Last announced: Never</span>
            </div>
          </div>
        </div>
      </div>
      <!-- announce end -->

      <!-- avatar -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">Avatar</div>
        <div class="divide-y text-gray-900">

          <div class="p-2">
            <div class="text-sm text-gray-700">
              <ul class="list-disc list-inside">
                <li>Choose an avatar to represent you in the app.</li>
                <li>Avatars are stored on the RLink server and are publicly accessible.</li>
              </ul>
            </div>
          </div>

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <img v-if="config.avatar" :src="`data:image/webp;base64,${config.avatar}`"
                     class="w-10 h-10 rounded-full" alt="Avatar">
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                     stroke="currentColor" class="size-10">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <div class="ml-2">
                <label for="avatar" class="text-sm font-medium text-gray-900">Change Avatar</label>
                <input id="avatar" type="file" @change="onAvatarChange" class="text-sm text-gray-900">
              </div>
              <!-- Delete avatar if set -->
              <div v-if="config.avatar" class="ml-auto">
                <button @click="deleteAvatar" type="button"
                        class="inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
                  Delete
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- interfaces -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">Interfaces</div>
        <div class="divide-y text-gray-900">

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="config.show_suggested_community_interfaces"
                       @change="onShowSuggestedCommunityInterfacesChange" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Show Community Interfaces</label>
            </div>
            <div class="text-sm text-gray-700">When enabled, community interfaces will be shown on the Add Interface
              page.
            </div>
          </div>

        </div>
      </div>

      <!-- messages -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">Messages</div>
        <div class="divide-y text-gray-900">

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="config.auto_resend_failed_messages_when_announce_received"
                       @change="onAutoResendFailedMessagesWhenAnnounceReceivedChange" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Auto resend</label>
            </div>
            <div class="text-sm text-gray-700">When enabled, failed messages will auto resend when an announce is
              received from the intended destination.
            </div>
          </div>

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="config.allow_auto_resending_failed_messages_with_attachments"
                       @change="onAllowAutoResendingFailedMessagesWithAttachmentsChange" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Allow resending with attachments</label>
            </div>
            <div class="text-sm text-gray-700">When enabled, failed messages that have attachments are allowed to auto
              resend.
            </div>
          </div>

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="config.auto_send_failed_messages_to_propagation_node"
                       @change="onAutoSendFailedMessagesToPropagationNodeChange" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Auto send to propagation node</label>
            </div>
            <div class="text-sm text-gray-700">When enabled, messages that fail to send will be sent to the configured
              propagation node.
            </div>
          </div>

        </div>
      </div>

      <!-- propagation nodes -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">
          <div class="my-auto mr-auto">Propagation Nodes</div>
          <div class="my-auto">
            <RouterLink :to="{ name: 'propagation-nodes' }"
                        class="my-auto inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
              Browse Nodes
            </RouterLink>
          </div>
        </div>
        <div class="divide-y text-gray-900">

          <div class="p-2">
            <div class="text-sm text-gray-700">
              <ul class="list-disc list-inside">
                <li>When you send a message, the intended recipient may be offline and your message will fail to send.
                </li>
                <li>Instead, messages can be sent to propagation nodes, which store the messages and allow recipients to
                  retrieve them when they're next online.
                </li>
                <li>Propagation nodes automatically peer and sync messages with each other, creating an encrypted,
                  distributed message store.
                </li>
                <li>By default, propagation nodes store messages for up to 30 days. If the recipient hasn't retrieved it
                  by then, the message will be lost.
                </li>
                <li>At this time, delivery reports are unavailable for messages sent to propagation nodes.</li>
              </ul>
            </div>
          </div>

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="config.lxmf_local_propagation_node_enabled"
                       @change="onLxmfLocalPropagationNodeEnabledChange" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Local Propagation Node</label>
            </div>
            <div class="text-sm text-gray-700">When enabled, RLink will run a Propagation Node and announce it with
              the following address for other clients to use.
            </div>
            <div class="flex">
              <input disabled v-model="config.lxmf_local_propagation_node_address_hash" type="text"
                     class="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            </div>
          </div>

          <div class="p-2">
            <div class="text-sm font-medium text-gray-900">Preferred Propagation Node</div>
            <div class="flex">
              <input v-model="config.lxmf_preferred_propagation_node_destination_hash"
                     @input="onLxmfPreferredPropagationNodeDestinationHashChange" type="text"
                     placeholder="Destination Hash. e.g: a39610c89d18bb48c73e429582423c24"
                     class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            </div>
            <div class="text-sm text-gray-700">This is the propagation node your messages will be sent to and retrieved
              from.
            </div>
          </div>

          <div class="p-2">
            <div class="text-sm font-medium text-gray-900">Auto Sync Interval</div>
            <div class="flex">
              <select v-model="config.lxmf_preferred_propagation_node_auto_sync_interval_seconds"
                      @change="onLxmfPreferredPropagationNodeAutoSyncIntervalSecondsChange"
                      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                <option value="0">Disabled</option>
                <option value="900">Every 15 Minutes</option>
                <option value="1800">Every 30 Minutes</option>
                <option value="3600">Every 1 Hour</option>
                <option value="10800">Every 3 Hours</option>
                <option value="21600">Every 6 Hours</option>
                <option value="43200">Every 12 Hours</option>
                <option value="86400">Every 24 Hours</option>
              </select>
            </div>
            <div class="text-sm text-gray-700">
              <span v-if="config.lxmf_preferred_propagation_node_last_synced_at">Last Synced: {{
                  formatSecondsAgo(config.lxmf_preferred_propagation_node_last_synced_at)
                }}</span>
              <span v-else>Last Synced: Never</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Telemetry -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">Telemetry</div>
        <div class="divide-y text-gray-900">

          <div class="p-2">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input v-model="config.telemetry_enabled" @change="onTelemetryEnabledChange" type="checkbox"
                       class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300">
              </div>
              <label class="ml-2 text-sm font-medium text-gray-900">Telemetry Enabled</label>
            </div>
            <div class="text-sm text-gray-700">When enabled, telemetry data will be sent to the RLink team to help
              improve the app.
            </div>
          </div>
        </div>
      </div>

      <!-- Location -->
      <div class="bg-white rounded shadow">
        <div class="flex border-b border-gray-300 text-gray-700 p-2 font-semibold">
          <div class="my-auto mr-auto">Location</div>
          <div class="my-auto">
              <button @click.stop="getCurrentLocation" type="button" v-if="latitude === '' || longitude === ''"
              class="my-auto inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
              Get Location
            </button>
            <button @click.stop="onLocationChange" type="button" v-else
              class="my-auto inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500">
              Save Location
            </button>
          </div>
        </div>
        <div class="divide-y text-gray-900">
          <div class="p-2">
            <label for="latitude" class="text-sm font-medium text-gray-900">Latitude</label>
            <input v-model="latitude" type="text" placeholder="Latitude"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
          </div>
          <div class="p-2">
            <label for="longitude" class="text-sm font-medium text-gray-900">Longitude</label>
            <input v-model="longitude" type="text" placeholder="Longitude"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
          </div>
        </div>
      </div>
      <!-- Location end -->
    </div>
  </div>
</template>

<script>
import Utils from "../../js/Utils";
import WebSocketConnection from "../../js/WebSocketConnection";
import pako from "pako";

export default {
  name: 'SettingsPage',
  data() {
    return {
      config: {
        avatar: null,
        auto_announce_interval_seconds: null,
        auto_resend_failed_messages_when_announce_received: null,
        allow_auto_resending_failed_messages_with_attachments: null,
        auto_send_failed_messages_to_propagation_node: null,
        display_name: null,
        show_suggested_community_interfaces: null,
        identity_hash: null,
        lxmf_address_hash: null,
        lxmf_local_propagation_node_enabled: null,
        lxmf_preferred_propagation_node_destination_hash: null,
        telemetry_enabled: null,
        location: null,
      },
      latitude: '',
      longitude: ''
    };
  },
  beforeUnmount() {

    // stop listening for websocket messages
    WebSocketConnection.off("message", this.onWebsocketMessage);

  },
  mounted() {

    // listen for websocket messages
    WebSocketConnection.on("message", this.onWebsocketMessage);

    this.getConfig();

  },
  methods: {
    async onWebsocketMessage(message) {
      const json = JSON.parse(message.data);
      switch (json.type) {
        case 'config': {
          this.config = json.config;
          break;
        }
      }
    },
    async getConfig() {
      try {
        const response = await window.axios.get("/api/v1/config");
        this.config = response.data.config;
        this.setLatLng();
      } catch (e) {
        // do nothing if failed to load config
        console.log(e);
      }
    },
    async updateConfig(config) {
      try {
        const response = await window.axios.patch("/api/v1/config", config);
        this.config = response.data.config;
        this.setLatLng();
      } catch (e) {
        alert("Failed to save config!");
        console.log(e);
      }
    },
    async onAnnounceIntervalSecondsChange() {
      await this.updateConfig({
        "auto_announce_interval_seconds": this.config.auto_announce_interval_seconds,
      });
    },
    async onAutoResendFailedMessagesWhenAnnounceReceivedChange() {
      await this.updateConfig({
        "auto_resend_failed_messages_when_announce_received": this.config.auto_resend_failed_messages_when_announce_received,
      });
    },
    async onAllowAutoResendingFailedMessagesWithAttachmentsChange() {
      await this.updateConfig({
        "allow_auto_resending_failed_messages_with_attachments": this.config.allow_auto_resending_failed_messages_with_attachments,
      });
    },
    async onAutoSendFailedMessagesToPropagationNodeChange() {
      await this.updateConfig({
        "auto_send_failed_messages_to_propagation_node": this.config.auto_send_failed_messages_to_propagation_node,
      });
    },
    async onShowSuggestedCommunityInterfacesChange() {
      await this.updateConfig({
        "show_suggested_community_interfaces": this.config.show_suggested_community_interfaces,
      });
    },
    async onLxmfPreferredPropagationNodeDestinationHashChange() {
      await this.updateConfig({
        "lxmf_preferred_propagation_node_destination_hash": this.config.lxmf_preferred_propagation_node_destination_hash,
      });
    },
    async onLxmfLocalPropagationNodeEnabledChange() {
      await this.updateConfig({
        "lxmf_local_propagation_node_enabled": this.config.lxmf_local_propagation_node_enabled,
      });
    },
    async onLxmfPreferredPropagationNodeAutoSyncIntervalSecondsChange() {
      await this.updateConfig({
        "lxmf_preferred_propagation_node_auto_sync_interval_seconds": this.config.lxmf_preferred_propagation_node_auto_sync_interval_seconds,
      });
    },
    async onIdentitySettingsChange() {
      await this.updateConfig({
        "display_name": this.config.display_name,
      });
    },
    async onLocationChange() {
      // check location 
      if (!this.isValidCoordinates(this.latitude, this.longitude)) {
        alert("Please! check the coordinates. It's not valid!");
        return;
      }

      this.config.location = `${this.latitude}, ${this.longitude}`;
      await this.updateConfig({
        "location": this.config.location
      });
    },
    async onTelemetryEnabledChange() {
      await this.updateConfig({
        "telemetry_enabled": this.config.telemetry_enabled,
      });
    },
    async deleteAvatar() {
      await this.updateConfig({
        "avatar": null,
      });
    },
    async onAvatarChange(event) {
      if (!event.target.files[0]) {
        return;
      }
      // max 2 Kb
      if (event.target.files[0].size > 1024 * 2) {
        alert(`Avatar must be less than ${1024 * 2} Kb!`);
        return;
      }

      try {
        await this.convertToBase64(event.target.files[0]);
        console.log(this.config.avatar);
        await this.updateConfig({
          "avatar": this.config.avatar,
        });
      } catch (e) {
        alert("Failed to save avatar!");
        console.log(e);
      }
    },
    async convertToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.config.avatar = reader.result.split(",")[1];
          resolve();
        };
        reader.onerror = error => reject(error);
      });
    },
    formatSecondsAgo: function (seconds) {
      return Utils.formatSecondsAgo(seconds);
    },
    setLatLng() {
      if (this.config.location) {
        const locArr = this.config.location.split(",");
        if (locArr.length < 2) return;

        this.latitude = locArr[0];
        this.longitude = locArr[1];
      }
    },
    /**
    * Validates latitude and longitude coordinates, allowing null values
    * @param {number|null} latitude - Latitude coordinate (-90 to 90)
    * @param {number|null} longitude - Longitude coordinate (-180 to 180)
    * @returns {boolean} - True if coordinates are valid or null, false otherwise
    */
    isValidCoordinates(latitude, longitude) {
    // Check if both values are null
      if (latitude === null && longitude === null) {
        return true;
      }

      // Check if only one value is null (invalid state)
      if ((latitude === null && longitude !== null) || 
        (latitude !== null && longitude === null)) {
        return false;
      }

      // Check if values are numbers
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return false;
      }

      // Check if values are finite (not NaN, Infinity, or -Infinity)
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return false;
      }

      // Validate latitude range (-90 to 90)
      if (latitude < -90 || latitude > 90) {
        return false;
      }

      // Validate longitude range (-180 to 180)
      if (longitude < -180 || longitude > 180) {
        return false;
      }
      return true;
    },
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
        });
      } else {
        DialogUtils.alert("Geolocation is not supported by this browser.");
      }
    }
  },
}
</script>
