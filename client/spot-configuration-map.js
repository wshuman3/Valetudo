<ons-page id="spot-configuration-map-page">
    <ons-dialog id="rename-spot-dialog">
        <div style="text-align: left; padding: 10px;">
            <p>Edit spot name</p>
            <ons-input style="display: block;" id="rename-spot-input"></ons-input>
            <div style="text-align: center; padding-top: 20px" class="content-padded" ng-controller="ButtonsController">
                <ons-button onclick="hideRenameSpotDialog()">Cancel</ons-button>
                <ons-button onclick="renameSpot()">Save</ons-button>
            </div>
        </div>
    </ons-dialog>

    <div id="spot-configuration-container">
        <div class="spot-configuration-header">
            <ons-back-button>Spots</ons-back-button>
            <span id="spot-configuration-map-page-h1"></span>
        </div>

        <ons-progress-bar id="loading-bar-save-spot" value="0"></ons-progress-bar>
        <canvas id="spot-configuration-map"></canvas>
    </div>

    <div class="map-page-buttons">
        <ons-fab ripple id="spot-configuration-rename">
            <ons-icon icon="fa-i-cursor"></ons-icon>
        </ons-fab>
        <ons-fab ripple id="spot-configuration-save">
            <ons-icon icon="fa-save"></ons-icon>
        </ons-fab>
    </div>

    <script type="module">
        import { VacuumMap } from "./zone/js-modules/vacuum-map.js"
        const map = new VacuumMap(document.getElementById('spot-configuration-map'));
        const loadingBarSavespot = document.getElementById('loading-bar-save-spot');
        const saveButton = document.getElementById('spot-configuration-save');
        const renameButton = document.getElementById('spot-configuration-rename');
        const renameDialog = document.getElementById('rename-spot-dialog');
        const renameSpotInput = document.getElementById('rename-spot-input');

        const topPage = fn.getTopPage();
        const spotConfig = topPage.data.spotConfig;
        const spotToModify = topPage.data.spotToModify;

        map.initCanvas(topPage.data.map, {metaData: "forbidden"});

        updateSpotName();
        console.log(map);
        map.addSpot([spotConfig[spotToModify].coordinates[0], spotConfig[spotToModify].coordinates[1]]);

        saveButton.onclick = () => {
            saveSpot(true);
        }

        renameButton.onclick = () => {
            renameSpotInput.value = spotConfig[spotToModify].name;
            renameDialog.show();
        }

        function saveSpot(hide){
            const spotOnMap = map.getLocations().gotoPoints[0];
            spotConfig[spotToModify].coordinates = [spotOnMap.x, spotOnMap.y];

            loadingBarSavespot.setAttribute("indeterminate", "indeterminate");
            saveButton.setAttribute("disabled", "disabled");
            fn.requestWithPayload("api/spots", JSON.stringify(spotConfig), "PUT", function (err) {
                loadingBarSavespot.removeAttribute("indeterminate");
                saveButton.removeAttribute("disabled");
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                } else {
                    ons.notification.toast("Successfully saved spot!", { buttonLabel: 'Dismiss', timeout: window.fn.toastOKTimeout });
                    if(hide)fn.popPage();
                }
            });
        }

        function updateSpotName(){
            document.getElementById("spot-configuration-map-page-h1").innerText = `Editing spot: ${spotConfig[spotToModify].name}`;
        }

        function hideRenameSpotDialog(){
            renameDialog.hide();
        }

        function renameSpot(){
            var newSpotName = renameSpotInput.value.trim();
            if(newSpotName === "") {
                ons.notification.toast("Please enter a spot name", { buttonLabel: 'Dismiss', timeout: 1500 })
            } else {
                spotConfig[spotToModify].name = newSpotName;
                renameDialog.hide();
                saveSpot(false);
                updateSpotName();
            }
        }

        window.hideRenameSpotDialog = hideRenameSpotDialog;
        window.renameSpot = renameSpot;
    </script>

    <style>
        #spot-configuration-container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;

            height: 100%;
            width: 100%;
        }

        #spot-configuration-map {
            touch-action: none;
            height: 100%;
            width: 100%;
        }

        #spot-configuration-map-page-h1 {
            flex-grow: 1;
            text-align: center;
        }

        .spot-configuration-header {
            display: flex;
            align-items: center;
        }

        .spot-configuration-buttons {
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