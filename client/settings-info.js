<ons-page id="settings-info-page">
    <ons-toolbar>
        <div class="left">
            <ons-back-button>Settings</ons-back-button>
        </div>
        <div class="center">Info</div>
        <div class="right">
        </div>
    </ons-toolbar>
    <ons-progress-bar id="loading-bar-settings-info" value="0" indeterminate="indeterminate"></ons-progress-bar>

    <ons-list-title style="margin-top:5px;">System</ons-list-title>
    <ons-list>
        <ons-list-item>
            <div class="left">
                Firmware version:
            </div>
            <div class="right" id="info_fw_version">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Firmware build:
            </div>
            <div class="right" id="info_fw_build">
                ???
            </div>
        </ons-list-item>
    </ons-list>
    <ons-list-title style="margin-top:5px;">App Locale</ons-list-title>
    <ons-list>
        <ons-list-item>
            <div class="left">
                Name:
            </div>
            <div class="right" id="app_locale_name">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Bom:
            </div>
            <div class="right" id="app_locale_bom">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Location:
            </div>
            <div class="right" id="app_locale_location">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Language:
            </div>
            <div class="right" id="app_locale_language">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Timezone:
            </div>
            <div class="right" id="app_locale_timezone">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Logserver:
            </div>
            <div class="right" id="app_locale_logserver">
                ???
            </div>
        </ons-list-item>
    </ons-list>
    <ons-list-title style="margin-top:5px;">Valetudo</ons-list-title>
    <ons-list>
        <ons-list-item>
            <div class="left">
                Running Valetudo version:
            </div>
            <div class="right" id="info_valetudo_version">
                ???
            </div>
        </ons-list-item>
        <ons-list-item>
            <div class="left">
                Newest Valetudo version:
            </div>
            <div class="right" id="info_newest_valetudo_version">
                <ons-button modifier="large" class="button-margin" onclick="checkNewValetudoVersion();">Check for new Valuto Version</ons-button>
            </div>
        </ons-list-item>
        <ons-list-item id="info_valetudo_update_url_list" style="display: none;">
            <div class="left">
                Newest Version URL:
            </div>
            <div class="right" id="info_valetudo_update_url">
                ???
            </div>
        </ons-list-item>
    </ons-list>




    <script>
        var loadingBarSettingsInfo = document.getElementById('loading-bar-settings-info');
        ons.getScriptPage().onShow = function() {
            updateSettingsInfoPage();
        };
        function updateSettingsInfoPage() {
            loadingBarSettingsInfo.setAttribute("indeterminate", "indeterminate");
            fn.request("api/get_fw_version", "GET", function (err, res) {
                loadingBarSettingsInfo.removeAttribute("indeterminate");
                if (!err) {
                    document.getElementById('info_fw_version').innerHTML = res.version;
                    document.getElementById('info_fw_build').innerHTML = res.build;
                    document.getElementById('info_valetudo_version').innerHTML = res.valetudoVersion;
                } else {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                }
                updateAppLocale();
            });
        }
        function updateAppLocale() {
            loadingBarSettingsInfo.setAttribute("indeterminate", "indeterminate");
            fn.request("api/get_app_locale", "GET", function (err, res) {
                loadingBarSettingsInfo.removeAttribute("indeterminate");
                if (!err) {
                    var appLocale = res[0];
                    document.getElementById('app_locale_name').innerHTML = appLocale.name;
                    document.getElementById('app_locale_bom').innerHTML = appLocale.bom;
                    document.getElementById('app_locale_location').innerHTML = appLocale.location;
                    document.getElementById('app_locale_language').innerHTML = appLocale.language;
                    document.getElementById('app_locale_timezone').innerHTML = appLocale.timezone;
                    document.getElementById('app_locale_logserver').innerHTML = appLocale.logserver;
                } else {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                }
            });
        }

        function checkNewValetudoVersion() {
            loadingBarSettingsInfo.setAttribute("indeterminate", "indeterminate");
            fn.request("https://api.github.com/repos/Hypfer/Valetudo/releases", "GET", function (err, res) {
                loadingBarSettingsInfo.removeAttribute("indeterminate");
                if (!err) {
                    try {
                        var info_valetudo_newest_release = res[0];
                        document.getElementById('info_newest_valetudo_version').innerHTML = info_valetudo_newest_release.tag_name;
                        document.getElementById('info_valetudo_update_url').innerHTML = '<a href="'+info_valetudo_newest_release.html_url+'">'+info_valetudo_newest_release.html_url+'</a>';
                        if( document.getElementById('info_valetudo_version').innerHTML != info_valetudo_newest_release.tag_name)
                        {
                                document.getElementById('info_valetudo_update_url_list').style.display = ""; //make entry visible if newer version is availiable
                        }
                    } catch (e) {
                        ons.notification.toast(e, { buttonLabel: 'Dismiss', timeout: 1500 });
                    }
                } else {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: 1500 });
                }
            });
        }
    </script>
</ons-page>