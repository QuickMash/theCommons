"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge, ipcRenderer } = require('electron');
const VALID_SEND_CHANNELS = ['toMain', 'window-minimize', 'window-toggle-maximize', 'window-close'];
const VALID_RECEIVE_CHANNELS = ['fromMain', 'themes-directory-changed', 'login-data-loaded'];
const VALID_INVOKE_CHANNELS = ['toMainInvoke', 'LoadThemes', 'SaveTheme', 'getTheme', 'loginCache', 'getLoginData', 'clearLoginData'];
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        send: (channel, data) => {
            if (VALID_SEND_CHANNELS.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            if (VALID_RECEIVE_CHANNELS.includes(channel)) {
                ipcRenderer.on(channel, (_event, ...args) => func(...args));
            }
        },
        invoke: (channel, data) => {
            if (VALID_INVOKE_CHANNELS.includes(channel)) {
                return ipcRenderer.invoke(channel, data);
            }
        }
    }
});
contextBridge.exposeInMainWorld('electronAPI', {
    loadThemes: () => ipcRenderer.invoke('LoadThemes'),
    saveTheme: (name, css) => ipcRenderer.invoke('SaveTheme', name, css),
    getTheme: (name) => ipcRenderer.invoke('getTheme', name),
    loginCache: (data) => ipcRenderer.invoke('loginCache', data),
    getLoginData: () => ipcRenderer.invoke('getLoginData'),
    clearLoginData: () => ipcRenderer.invoke('clearLoginData'),
    loginDataLoaded: (callback) => {
        ipcRenderer.on('login-data-loaded', (_event, ...args) => callback(...args));
    },
    onThemesChanged: (callback) => {
        ipcRenderer.on('themes-directory-changed', (_event, ...args) => callback(...args));
    }
});
