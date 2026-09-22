import type { SensorSocketStatus } from '~/types/sensor';
import { defineStore } from 'pinia';

export const useSystemStore = defineStore('system', {
  state: () => ({
    socketStatus: 'disabled' as SensorSocketStatus,
    sensorReady: false,
    calibrationReady: false,
    lastMessageAt: null as number | null,
    lastError: null as string | null,
  }),

  getters: {
    installationReady: state => state.sensorReady && state.calibrationReady,
  },

  actions: {
    setSocketStatus(status: SensorSocketStatus, error: string | null = null) {
      this.socketStatus = status;
      this.lastError = error;
    },

    setSensorHealth(sensorReady: boolean, calibrationReady: boolean) {
      this.sensorReady = sensorReady;
      this.calibrationReady = calibrationReady;
    },

    markMessageReceived(timestamp = Date.now()) {
      this.lastMessageAt = timestamp;
    },
  },
});
