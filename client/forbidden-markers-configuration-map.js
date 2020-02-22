<ons-page id="forbidden-markers-configuration-map-page">
    <div id="forbidden-markers-configuration-container">
        <div class="forbidden-markers-configuration-header">
            <ons-back-button>Forbidden Markers</ons-back-button>
            <span id="forbidden-markers-configuration-map-page-h1"></span>
        </div>

        <ons-progress-bar id="loading-bar-save-markers" value="0"></ons-progress-bar>
        <canvas id="forbidden-markers-configuration-map"></canvas>
    </div>

    <div class="map-page-buttons">
        <ons-fab ripple id="forbidden-markers-configuration-add-wall">
            <ons-icon icon="fa-ellipsis-v"></ons-icon>
        </ons-fab>
        <ons-fab ripple id="forbidden-markers-configuration-add-zone">
            <ons-icon icon="fa-window-close-o"></ons-icon>
        </ons-fab>
        <ons-fab ripple id="forbidden-markers-configuration-save">
            <ons-icon icon="fa-save"></ons-icon>
        </ons-fab>
    </div>

    <script type="module">
        import { VacuumMap } from "./zone/js-modules/vacuum-map.js"
        const map = new VacuumMap(document.getElementById('forbidden-markers-configuration-map'));
        const loadingBarSaveMarkers = document.getElementById('loading-bar-save-markers');
        const saveButton = document.getElementById('forbidden-markers-configuration-save');

        const topPage = fn.getTopPage();
        map.initCanvas(topPage.data.map, {metaData: false, noGotoPoints: true});
        window.fn.map = map;

        if (topPage.data.map.no_go_areas)
        for (let zone of topPage.data.map.no_go_areas) {
            map.addForbiddenZone([zone[0], zone[1], zone[2], zone[3], zone[4], zone[5], zone[6], zone[7]], true, true);
        }

        if (topPage.data.map.virtual_walls)
        for (let wall of topPage.data.map.virtual_walls) {
            map.addVirtualWall([wall[0], wall[1], wall[2], wall[3]], true, true);
        }

        document.getElementById("forbidden-markers-configuration-map-page-h1").innerText = 'Editing markers';

        document.getElementById("forbidden-markers-configuration-add-wall").onclick = () => {
            map.addVirtualWall(null, false, true);
        }

        document.getElementById("forbidden-markers-configuration-add-zone").onclick = () => {
            map.addForbiddenZone(null, false, true);
        }

        saveButton.onclick = () => {
            const persistentData = {virtual_walls: map.getLocations().virtualWalls, no_go_areas: map.getLocations().forbiddenZones};
            loadingBarSaveMarkers.setAttribute("indeterminate", "indeterminate");
            saveButton.setAttribute("disabled", "disabled");
            fn.requestWithPayload("api/persistent_data", JSON.stringify(persistentData), "PUT", function (err) {
                loadingBarSaveMarkers.removeAttribute("indeterminate");
                saveButton.removeAttribute("disabled");
                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                } else {
                    ons.notification.toast("Successfully saved forbidden markers!", { buttonLabel: 'Dismiss', timeout: window.fn.toastOKTimeout });
                    fn.popPage();
                }
            });
        }
    </script>
    <style>
        #forbidden-markers-configuration-container {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;

            height: 100%;
            width: 100%;
        }

        #forbidden-markers-configuration-map {
            touch-action: none;
            height: 100%;
            width: 100%;
        }

        #forbidden-markers-configuration-map-page-h1 {
            flex-grow: 1;
            text-align: center;
        }

        .forbidden-markers-configuration-header {
            display: flex;
            align-items: center;
        }

        .forbidden-markers-configuration-buttons {
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