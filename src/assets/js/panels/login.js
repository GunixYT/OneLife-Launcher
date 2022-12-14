/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { database, changePanel, addAccount, accountSelect } from '../utils.js';
const { Mojang } = require('minecraft-java-core');
const { ipcRenderer } = require('electron');

class Login {
    static id = "login";
    async init(config) {
        this.config = config
        this.database = await new database().init();
        if (this.config.online) this.getOnline()
        else this.getOffline()
    }

    getOnline() {
        console.log(`Initializing microsoft Panel...`)
        console.log(`Initializing offline Panel...`)
        console.log(`Initializing mojang Panel...`)
        this.loginMicrosoft();
        this.loginOffline();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    loginMicrosoft() {
        let microsoftBtn = document.querySelector('.microsoft')
        let mojangBtn = document.querySelector('.mojang')
        let cancelBtn = document.querySelector('.cancel-login')

        microsoftBtn.addEventListener("click", () => {
            microsoftBtn.disabled = true;
            mojangBtn.disabled = true;
            cancelBtn.disabled = true;
            ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(account_connect => {
                if (!account_connect) {
                    microsoftBtn.disabled = false;
                    mojangBtn.disabled = false;
                    cancelBtn.disabled = false;
                    return;
                }

                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    refresh_token: account_connect.refresh_token,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        demo: account_connect.meta.demo
                    }
                }

                let profile = {
                    uuid: account_connect.uuid,
                    skins: account_connect.profile.skins || [],
                    capes: account_connect.profile.capes || []
                }

                this.database.add(account, 'accounts')
                this.database.add(profile, 'profile')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("home");

                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;
                cancelBtn.style.display = "none";
            }).catch(err => {
                console.log(err)
                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;

            });
        })
    }

    loginOffline() {
        let mailInput = document.querySelector('.Mail')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let infoLogin = document.querySelector('.info-login')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')

        mojangBtn.innerHTML = "Offline"

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
        })

        loginBtn.addEventListener("click", () => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            infoLogin.innerHTML = "Conectando...";


            if (mailInput.value == "") {
                infoLogin.innerHTML = "Ingrese su nombre de usuario"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                return
            }

            if (mailInput.value.length < 5) {
                infoLogin.innerHTML = "Su nombre debe tener mas de 5 caracteres"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                return
            }

            if (mailInput.value.length > 14) {
                infoLogin.innerHTML = "Su nombre debe tener menos de 14 caracteres"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                return
            }

            if (mailInput.value == "GunixYT") {
                infoLogin.innerHTML = "No puedes usar ese nombre"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                return
            }
            

            if (mailInput.value.indexOf(' ') > -1) {
                infoLogin.innerHTML = "No uses espacios"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                return
            }

            if (mailInput.value.indexOf("@") > -1 || mailInput.value.indexOf("#") > -1 || mailInput.value.indexOf('"') > -1 || mailInput.value.indexOf('%') > -1 || mailInput.value.indexOf('$') > -1 || mailInput.value.indexOf('&') > -1 || mailInput.value.indexOf("'") > -1 || mailInput.value.indexOf("(") > -1 || mailInput.value.indexOf(")") > -1 || mailInput.value.indexOf("*") > -1 || mailInput.value.indexOf("+") > -1 || mailInput.value.indexOf(",") > -1 || mailInput.value.indexOf("-") > -1 || mailInput.value.indexOf(".") > -1 || mailInput.value.indexOf("/") > -1 || mailInput.value.indexOf(":") > -1 || mailInput.value.indexOf(";") > -1 || mailInput.value.indexOf("=") > -1 || mailInput.value.indexOf("?") > -1 || mailInput.value.indexOf("?") > -1 || mailInput.value.indexOf("[") > -1 || mailInput.value.indexOf(']') > -1 || mailInput.value.indexOf('^') > -1 || mailInput.value.indexOf('`') > -1 || mailInput.value.indexOf('{') > -1 || mailInput.value.indexOf('}') > -1 || mailInput.value.indexOf('~') > -1 || mailInput.value.indexOf('|') > -1 || mailInput.value.indexOf('\\') > -1 || mailInput.value.indexOf('\\') > -1) {
                infoLogin.innerHTML = "No uses un caracter especial"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                return
            }

            Mojang.getAuth(mailInput.value).then(async account_connect => {
                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    user_properties: account_connect.user_properties,
                    meta: {
                        type: account_connect.meta.type,
                        offline: account_connect.meta.offline
                    }
                }

                this.database.add(account, 'accounts')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("home");

                cancelMojangBtn.disabled = false;
                cancelMojangBtn.click();
                mailInput.value = "";
                loginBtn.disabled = false;
                mailInput.disabled = false;
                loginBtn.style.display = "block";
                infoLogin.innerHTML = "&nbsp;";
            }).catch(err => {
                console.log(err)
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                infoLogin.innerHTML = 'Direcci??n de correo o contrase??a no v??lidos'
            })
        })
    }
}

export default Login;