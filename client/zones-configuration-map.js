<ons-page id="zones-configuration-map-page">
    <ons-dialog id="rename-zone-dialog">
        <div style="text-align: left; padding: 10px;">
            <p>Edit zone name</p>
            <ons-input style="display: block;" id="rename-zone-input"></ons-input>
            <div style="text-align: center; padding-top: 20px" class="content-padded" ng-controller="ButtonsController">
                <ons-button onclick="hideRenameZoneDialog()">Cancel</ons-button>
                <ons-button onclick="renameZone()">Save</ons-button>
            </div>
        </div>
    </ons-dialog>

    <div id="zones-configuration-container">
        <div class="zones-configuration-header">
            <ons-back-button>Zones</ons-back-button>
            <span id="zones-configuration-map-page-h1"></span>
        </div>

        <ons-progress-bar id="loading-bar-save-zones" value="0"></ons-progress-bar>
        <canvas id="zone-configuration-map"></canvas>
    </div>

    <div class="map-page-buttons">
        <ons-fab ripple id="zones-configuration-add-zone">
            <ons-icon icon="fa-plus"></ons-icon>
        </ons-fab>
        <ons-fab ripple id="zones-configuration-rename">
            <ons-icon icon="fa-i-cursor"></ons-icon>
        </ons-fab>
        <ons-fab ripple id="zones-configuration-save">
            <ons-icon icon="fa-save"></ons-icon>
        </ons-fab>
    </div>

    <script type="module">
        import { VacuumMap } from "./zone/js-modules/vacuum-map.js"
        const map = new VacuumMap(document.getElementById('zone-configuration-map'));
        const loadingBarSaveZones = document.getElementById('loading-bar-save-zones');
        const saveButton = document.getElementById('zones-configuration-save');
        const renameButton = document.getElementById('zones-configuration-rename');
        const renameDialog = document.getElementById('rename-zone-dialog');
        const renameZoneInput = document.getElementById('rename-zone-input');

        const topPage = fn.getTopPage();
        const zonesConfig = topPage.data.zonesConfig;
        const zoneToModify = topPage.data.zoneToModify;

        map.initCanvas(topPage.data.map, {metaData: "forbidden", noGotoPoints: true});

        updateZoneName();
        for(let zone of zonesConfig[zoneToModify].coordinates) {
            map.addZone([zone[0], zone[1], zone[2], zone[3]], true);
        }

        document.getElementById("zones-configuration-add-zone").onclick = () => {
            map.addZone();
        }


        saveButton.onclick = () => {
            saveZone(true);
        }

        renameButton.onclick = () => {
            renameZoneInput.value = zonesConfig[zoneToModify].name;
            renameDialog.show();
        }

        function saveZone(hide){
            const zonesOnMap = map.getLocations().zones.map(zoneCoordinates => [...zoneCoordinates, 1]);
            zonesConfig[zoneToModify].coordinates = zonesOnMap;

            loadingBarSaveZones.setAttribute("indeterminate", "indeterminate");
            saveButton.setAttribute("disabled", "disabled");
            fn.requestWithPayload("api/zones", JSON.stringify(zonesConfig), "PUT", function (err) {
                loadingBarSaveZones.removeAttribute("indeterminate");
                saveButton.removeAttribute("disabled");
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                } else {
                    ons.notification.toast("Successfully saved zones!", { buttonLabel: 'Dismiss', timeout: window.fn.toastOKTimeout });
                    if(hide)fn.popPage();
                }
            });
        }

        function updateZoneName(){
            document.getElementById("zones-configuration-map-page-h1").innerText = `Editing zone: ${zonesConfig[zoneToModify].name}`;
        }

        function hideRenameZoneDialog(){
            renameDialog.hide();
        }

        function renameZone(){
            var newZoneName = renameZoneInput.value.trim();
            if(newZoneName === "") {
                ons.notification.toast("Please enter a spot name", { buttonLabel: 'Dismiss', timeout: 1500 })
            } else {
                zonesConfig[zoneToModify].name = newZoneName;
                renameDialog.hide();
                saveZone(false);
                updateZoneName();
            }
        }

        window.hideRenameZoneDialog = hideRenameZoneDialog;
        window.renameZone = renameZone;
    </script>
    <style>
        #zones-configuration-container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;

            height: 100%;
            width: 100%;
        }

        #zone-configuration-map {
            touch-action: none;
            height: 100%;
            width: 100%;
        }

        #zones-configuration-map-page-h1 {
            flex-grow: 1;
            text-align: center;
        }

        .zones-configuration-header {
            display: flex;
            align-items: center;
        }

        .zone-configuration-buttons {
            position: absolute;
            right: 1.5em;
            bottom: 1.5em;
            display: grid;
            grid-template-columns: auto;
            grid-template-rows: auto;
            grid-gap: 0.5em;
        }
    </style>
</ons-page>