/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';
const { ipcRenderer } = require('electron');
import { config } from './utils.js';

let dev = process.env.NODE_ENV === 'dev';


class Splash {
    constructor() {
        this.splash = document.querySelector(".splash");
        this.splashMessage = document.querySelector(".splash-message");
        this.splashAuthor = document.querySelector(".splash-author");
        this.message = document.querySelector(".message");
        this.progress = document.querySelector("progress");
        document.addEventListener('DOMContentLoaded', () => this.startAnimation());
    }

    async startAnimation() {
        let splashes = [
            { "message": "Gracias por apoyar <3", "author": "Sunrize Game Studio's" },
            { "message": "Bienvenido a OneLife 2", "author": "Sunrize Game Studio's" },
            { "message": "Recuerda, reportar cualquier error", "author": "Sunrize Game Studio's" },
            { "message": "Compra vidas en www.sunrizestudios.com", "author": "Sunrize Game Studio's" },
            { "message": "Zuricatos!", "author": "Sunrize Game Studio's" },
            { "message": "Recuerda, reportar cualquier error", "author": "Sunrize Game Studio's" },
            { "message": "Estan prohibidos los dupeos", "author": "Sunrize Game Studio's" },
            { "message": "Una alma cuesta $20.35", "author": "Sunrize Game Studio's" },
            { "message": "Se vienen mas cosas...", "author": "Sunrize Game Studio's" }
        ];
        let splash = splashes[Math.floor(Math.random() * splashes.length)];
        this.splashMessage.textContent = splash.message;
        this.splashAuthor.children[0].textContent = "@" + splash.author;
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.splashAuthor.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(1000);
        this.maintenanceCheck();
    }

    async maintenanceCheck() {
        if (dev) return this.startLauncher();
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            else this.checkUpdate();
        }).catch(e => {
            console.error(e);
            return this.shutdown("No se detectó conexión a Internet,<br>Vuelva a intentarlo más tarde.");
        })
    }

    async checkUpdate() {
        this.setStatus(`Buscando actualizaciones...`);
        ipcRenderer.send('update-app');

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(`Actualización disponible !`);
            this.toggleProgress();
        })

        ipcRenderer.on('download-progress', (event, progress) => {
            this.setProgress(progress.transferred, progress.total);
        })

        ipcRenderer.on('update-not-available', () => {
            this.startLauncher();
        })
    }


    startLauncher() {
        this.setStatus(`Démarrage du launcher`);
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>Cerrando en 5s`);
        let i = 4;
        setInterval(() => {
            this.setStatus(`${text}<br>Cerrando en ${i--}s`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    }
})
new Splash();