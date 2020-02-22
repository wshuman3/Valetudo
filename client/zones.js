<ons-page id="zones-page">
    <div class="progress-bar-container"><ons-progress-bar id="loading-bar-zones" value="0"></ons-progress-bar></div>

    <ons-list-title style="margin-top:20px;">Configured zones</ons-list-title>
    <ons-list id="zones-list">
        <ons-list-item>No zones are configured yet.</ons-list-item>
    </ons-list>

    <ons-list-title style="margin-top:20px;">Configured goto locations</ons-list-title>
    <ons-list id="spot-list">
        <ons-list-item>No spots are configured yet.</ons-list-item>
    </ons-list>

    <ons-list-title style="margin-top:20px;">Forbidden markers</ons-list-title>
    <ons-list id="spot-list">
         <ons-list-item tappable class="locations-list-item" onclick="switchToForbiddenMarkersEdit()">
             <label><ons-icon icon="edit"></ons-icon></label>
             <label>Configure forbidden zones</label>
         </ons-list-item>
    </ons-list>

    <script>
        let loadingBarZones = document.getElementById('loading-bar-zones');
        let zonesList = document.getElementById('zones-list');
        let spotList = document.getElementById('spot-list');
        let zonesConfig = [];
        let spotConfig = [];

        function switchToMapZoneEdit(index) {
            loadingBarZones.setAttribute("indeterminate", "indeterminate");
            fn.request("api/map/latest", "GET", function (err, mapData) {
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                }
                loadingBarZones.removeAttribute("indeterminate");

                fn.pushPage({
                    'id': 'zones-configuration-map.html',
                    'title': 'Zone configuration map',
                    'data': {
                        'map': mapData,
                        'zonesConfig': zonesConfig,
                        'zoneToModify': index
                    }
                });
            });
        }

        function switchToMapSpotEdit(index) {
            loadingBarZones.setAttribute("indeterminate", "indeterminate");
            fn.request("api/map/latest", "GET", function (err, mapData) {
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                }
                loadingBarZones.removeAttribute("indeterminate");

                fn.pushPage({
                    'id': 'spot-configuration-map.html',
                    'title': 'Spot configuration map',
                    'data': {
                        'map': mapData,
                        'spotConfig': spotConfig,
                        'spotToModify': index
                    }
                });
            });
        }

        function switchToForbiddenMarkersEdit(index) {
            loadingBarZones.setAttribute("indeterminate", "indeterminate");
            fn.request("api/map/latest", "GET", function (err, mapData) {
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                }
                loadingBarZones.removeAttribute("indeterminate");

                fn.pushPage({
                    'id': 'forbidden-markers-configuration-map.html',
                    'title': 'Forbidden markers configuration map',
                    'data': {
                        'map': mapData
                    }
                });
            });
        }

        function deleteZone(index) {
            zonesConfig.splice(index, 1);

            saveZones();
        }

        function deleteSpot(index) {
            spotConfig.splice(index, 1);

            saveSpots();
        }

        function saveZones() {
            loadingBarZones.setAttribute("indeterminate", "indeterminate");

            fn.requestWithPayload("api/zones", JSON.stringify(zonesConfig), "PUT", function (err) {
                loadingBarZones.removeAttribute("indeterminate");
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                } else {
                    generateZonesList();
                }
            });
        }

        function saveSpots() {
            loadingBarZones.setAttribute("indeterminate", "indeterminate");

            fn.requestWithPayload("api/spots", JSON.stringify(spotConfig), "PUT", function (err) {
                loadingBarZones.removeAttribute("indeterminate");
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                } else {
                    generateSpotList();
                }
            });
        }

        function addNewZone() {
            const newZoneName = document.getElementById("add-zone-name").value;

            if(newZoneName.trim() === "") {
                ons.notification.toast("Please enter a zone name", { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
            } else {
                zonesConfig.push({
                    name: newZoneName,
                    coordinates: []
                });
            }

            saveZones();
        }

        function addNewSpot() {
            const newSpotName = document.getElementById("add-spot-name").value;

            if(newSpotName.trim() === "") {
                ons.notification.toast("Please enter a spot name", { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
            } else {
                spotConfig.push({
                    name: newSpotName,
                    coordinates: [25000, 25000]
                });
            }

            saveSpots();
        }

        function generateZonesList() {
            let out = "";
            zonesConfig.forEach((zone, index) => {
                out += `
                    <ons-list-item tappable class="locations-list-item" onclick="switchToMapZoneEdit(${index})">
                        <label>
                            <ons-icon icon="edit"></ons-icon>
                        </label>
                        <label>
                            ${zone.name}
                        </label>
                        <ons-button class="button-delete" onclick="event.stopPropagation(); deleteZone(${index});"><ons-icon icon="fa-trash"></ons-icon> Delete</ons-button>
                    </ons-list-item>
                `;
            });

            out += `
                <ons-list-item class="locations-list-item">
                    <label>
                        <ons-icon icon="edit"></ons-icon>
                    </label>
                    <ons-input id="add-zone-name" placeholder="Enter name for zone ...">

                    </ons-input>
                    <ons-button class="delete-button-right" onclick="addNewZone()"><ons-icon icon="fa-plus"></ons-icon> Add</ons-button>
                </ons-list-item>
            `;

            zonesList.innerHTML = out;
        }

        function generateSpotList() {
            let out = "";
            spotConfig.forEach((spot, index) => {
                out += `
                    <ons-list-item tappable class="locations-list-item" onclick="switchToMapSpotEdit(${index})">
                        <label>
                            <ons-icon icon="edit"></ons-icon>
                        </label>
                        <label>
                            ${spot.name}
                        </label>
                        <ons-button class="button-delete" onclick="event.stopPropagation(); deleteSpot(${index});"><ons-icon icon="fa-trash"></ons-icon> Delete</ons-button>
                    </ons-list-item>
                `;
            });

            out += `
                <ons-list-item class="locations-list-item">
                    <label>
                        <ons-icon icon="edit"></ons-icon>
                    </label>
                    <ons-input id="add-spot-name" placeholder="Enter name for spot ...">

                    </ons-input>
                    <ons-button class="delete-button-right" onclick="addNewSpot()"><ons-icon icon="fa-plus"></ons-icon> Add</ons-button>
                </ons-list-item>
            `;

            spotList.innerHTML = out;
        }

        ons.getScriptPage().onShow = function () {

            loadingBarZones.setAttribute("indeterminate", "indeterminate");

            /* check for area and go to configuration */

            const getZones = fetch("api/zones")
                .then(res => res.json())
                .then(res => {
                    zonesConfig = res;
                    generateZonesList();
                })
                .catch(err => {
                    console.error(err);
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout });
                });
            const getSpots = fetch("api/spots")
                .then(res => res.json())
                .then(res => {
                    spotConfig = res;
                    generateSpotList();
                })
                .catch(err => {
                    console.error(err);
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout });
                });

            Promise.all([getZones, getSpots]).then(_ => {
                loadingBarZones.removeAttribute("indeterminate");
            });
        };
    </script>
    <style>
        .locations-list-item > div {
            display: grid;
            gap: 1em;
            grid-template-columns: auto 1fr auto;
            width: 100%;
        }

        .button-delete {
            background-color: #f45942; /* Random nice red color :) */
        }
    </style>
</ons-page>