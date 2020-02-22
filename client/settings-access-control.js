<ons-page id="settings-access-control">
    <ons-toolbar>
        <div class="left">
            <ons-back-button>Settings</ons-back-button>
        </div>
        <div class="center">Access Control Settings</div>
        <div class="right">
        </div>
    </ons-toolbar>
    <ons-progress-bar id="loading-bar-settings-access-control" value="0" indeterminate="indeterminate"></ons-progress-bar>
    <ons-list-title style="margin-top:20px;">HTTP Authentication Settings</ons-list-title>
    <ons-list>
        <ons-list-item>
	<div>
                     <ons-col>
                             <ons-col width="150px" vertical-align='center'>Enabled</ons-col>
                     </ons-col>
	</div>
            <label class="right" style="width:100%">
                <ons-row>
                     <ons-col>
                             <ons-col width="150px" vertical-align='center'><ons-checkbox id="settings-access-control-http-auth-input-enabled"></ons-checkbox></ons-col>
                     </ons-col>
                 </ons-row>
            </label>
        </ons-list-item>
        <ons-list-item>
            <label class="right" style="width:100%">
                <ons-row>
                     <ons-col>
                             <ons-input id="settings-access-control-http-auth-input-username" float maxlength="32" placeholder="Username" style="width:100%"></ons-input>
                     </ons-col>
                 </ons-row>
            </label>
        </ons-list-item>
        <ons-list-item>
            <label class="right" style="width:100%">
                <ons-row>
                     <ons-col>
                             <ons-input id="settings-access-control-http-auth-input-password" type="password" float maxlength="63" placeholder="Password" style="width:100%;"></ons-input>
                     </ons-col>
                 </ons-row>
            </label>
        </ons-list-item>
        <ons-list-item>
            <label class="right" style="width:100%">
                <ons-row>
                     <ons-col>
                             <ons-input id="settings-access-control-http-auth-input-password-confirm" type="password" float maxlength="63" placeholder="Password (again)" style="width:100%;"></ons-input>
                     </ons-col>
                 </ons-row>
            </label>
        </ons-list-item>
        <ons-list-item>
            <div class="center">
                <ons-button id="settings-access-control-ssh-keys-input-save-button" modifier="large" class="button-margin" onclick="handleHttpAuthSettingsSaveButton();">Save credentials</ons-button>
            </div>
        </ons-list-item>
    </ons-list>
    <ons-list-title style="margin-top:20px; display:none;" id="settings-access-control-ssh-keys-title">SSH Keys Settings</ons-list-title>
    <ons-list id="settings-access-control-ssh-keys-list" style="display:none;">
        <ons-list-item>
            <label class="right" style="width:100%">
                <ons-row>
                     <ons-col>
                         <textarea class="textarea" id="settings-access-control-ssh-keys-textarea" rows="5" placeholder="ssh-rsa ..." style="width:100%"></textarea>
                     </ons-col>
                 </ons-row>
            </label>
        </ons-list-item>
        <ons-list-item>
            <div class="center">
                <ons-button id="settings-access-control-ssh-keys-input-save-button" modifier="large" class="button-margin" onclick="handleSSHKeysSettingsSaveButton();">Save SSH keys</ons-button>
            </div>
        </ons-list-item>
        <ons-list-item>
            <label class="right" style="width:100%">
	    <ons-row>
		    <ons-col vertical-align='center'>Enter "confirm" below. Don't lock yourself out!</ons-col>
	    </ons-row>
                <ons-row>
                     <ons-col>
                             <ons-input id="settings-access-control-ssh-keys-input-disable-confirmation" float maxlength="32" placeholder="" style="width:100%"></ons-input>
                     </ons-col>
                 </ons-row>
            </label>
        </ons-list-item>
        <ons-list-item>
            <div class="center">
                <ons-button style="background-color:#ff0000" id="settings-access-control-ssh-keys-input-permanently-disable-button" modifier="large" class="button-margin" onclick="handleSSHKeysSettingsPermanentlyDisableButton();">Permanently disable SSH key upload</ons-button>
            </div>
        </ons-list-item>
    </ons-list>

    <script>
        var loadingBarSettingsAccessControl = document.getElementById('loading-bar-settings-access-control');
        var sshKeysTextArea = document.getElementById('settings-access-control-ssh-keys-textarea');
        var sshKeysInputDisableConfirmation = document.getElementById('settings-access-control-ssh-keys-input-disable-confirmation');
        var httpAuthInputEnabled = document.getElementById('settings-access-control-http-auth-input-enabled');
        var httpAuthInputUsername = document.getElementById('settings-access-control-http-auth-input-username');
        var httpAuthInputPassword = document.getElementById('settings-access-control-http-auth-input-password');
        var httpAuthInputPasswordConfirm = document.getElementById('settings-access-control-http-auth-input-password-confirm');

        var sshKeysInputSaveButton = document.getElementById('settings-access-control-ssh-keys-input-save-button');
        var sshKeysInputPermanentlyDisableButton = document.getElementById('settings-access-control-ssh-keys-input-permanently-disable-button');
        var httpAuthInputSaveButton = document.getElementById('settings-access-control-http-auth-input-save-button');

        var sshKeysTitle = document.getElementById('settings-access-control-ssh-keys-title');
        var sshKeysList = document.getElementById('settings-access-control-ssh-keys-list');

        ons.getScriptPage().onShow = function() {
            updateSettingsAccessControlPage();
        };

        function updateSettingsAccessControlPage() {
            loadingBarSettingsAccessControl.setAttribute("indeterminate", "indeterminate");
            fn.request("api/http_auth_config", "GET", function (err, res) {
                if (!err) {
                    httpAuthInputEnabled.checked = res.enabled;
                    httpAuthInputUsername.value = res.username;
                    httpAuthInputPassword.value = "";
                    fn.request("api/get_ssh_keys", "GET", function (err, res) {
                        if (!err) {
                            sshKeysTextArea.value = res;

                            sshKeysTitle.style.display = "block";
                            sshKeysList.style.display = "block";
                        }
		loadingBarSettingsAccessControl.removeAttribute("indeterminate");
                    });
                } else {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                }
            });
        }

        function handleSSHKeysSettingsSaveButton() {
            loadingBarSettingsAccessControl.setAttribute("indeterminate", "indeterminate");

            fn.requestWithPayload("api/set_ssh_keys", JSON.stringify({
                 keys: sshKeysTextArea.value
            }), "PUT", function (err) {
                 if (err) {
                     ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                    }
                loadingBarSettingsAccessControl.removeAttribute("indeterminate");
            });
        }
		function handleSSHKeysSettingsPermanentlyDisableButton() {
                    loadingBarSettingsAccessControl.setAttribute("indeterminate", "indeterminate");

                    fn.requestWithPayload("api/ssh_keys_permanently_disable", JSON.stringify({
                         confirmation: sshKeysInputDisableConfirmation.value
                    }), "PUT", function (err) {
                         if (err) {
                             ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
			 } else {
                                sshKeysTitle.style.display = "none";
                                sshKeysList.style.display = "none";
			 }
                loadingBarSettingsAccessControl.removeAttribute("indeterminate");
            });
        }

        function handleHttpAuthSettingsSaveButton() {
            loadingBarSettingsAccessControl.setAttribute("indeterminate", "indeterminate");

    if (httpAuthInputPassword.value !== httpAuthInputPasswordConfirm.value) return ons.notification.toast("Passwords don't match", { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout });

            fn.requestWithPayload("api/http_auth_config", JSON.stringify({
                 enabled: httpAuthInputEnabled.checked === true,
                 username: httpAuthInputUsername.value,
                 password: httpAuthInputPassword.value,
            }), "PUT", function (err) {
                 if (err) {
                     ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                    }
                loadingBarSettingsAccessControl.removeAttribute("indeterminate");
            });
        }
    </script>
</ons-page>