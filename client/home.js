<ons-page>
    <ons-progress-bar id="loading-bar-home" value="0" indeterminate="indeterminate"></ons-progress-bar>
    <section>
        <p id="robot-state">
            Loading state...!
        </p>
        <div style="width:100%; text-align:center;">
            <p id="robot-state-details">
                <span id="robot-state-details-m2">Area: ???.?? m²</span>
                <span id="robot-state-details-time">Time: ??:??:??</span>
            </p>
        </div>
    </section>
    <hr style="width:98%; opacity: 0.3">

    <section id="robot-control-buttons">
        <ons-button id="start-button" class="button-margin" onclick="handleControlButton('start')" disabled style="width:40%"><ons-icon icon="fa-play"></ons-icon> Start</ons-button>
        <ons-button id="pause-button" class="button-margin" onclick="handleControlButton('pause')" disabled style="width:40%"><ons-icon icon="fa-pause"></ons-icon> Pause</ons-button>
        <br>
        <ons-button id="stop-button" class="button-margin" onclick="handleControlButton('stop')" disabled style="width:40%"><ons-icon icon="fa-stop"></ons-icon> Stop</ons-button>
        <ons-button id="home-button" class="button-margin" onclick="handleControlButton('home')" disabled style="width:40%"><ons-icon icon="fa-home"></ons-icon> Home</ons-button>
        <br>
        <ons-button id="spot-button" class="button-margin" onclick="handleControlButton('spot')" disabled style="width:40%"><ons-icon icon="fa-caret-down"></ons-icon> Spot</ons-button>
        <ons-button id="find-robot-button" class="button-margin" onclick="handleControlButton('find')" disabled style="width:40%"><ons-icon icon="fa-map-marker"></ons-icon> Find</ons-button>
        <br>
        <ons-button id="go-to-button" class="button-margin" onclick="handleGoToButton()" disabled style="width:40%"><ons-icon icon="fa-map-signs"></ons-icon> Go to </ons-button>
        <ons-button id="area-button" class="button-margin" onclick="handleAreaButton()" disabled style="width:40%"><ons-icon icon="fa-map"></ons-icon> Zones </ons-button>

        <br>
        <ons-button id="fanspeed-button" class="button-margin" onclick="handleFanspeedButton()" disabled style="width:40%"><ons-icon icon="fa-superpowers"></ons-icon> Unknown power</ons-button>
    </section>
    <hr style="width:98%; opacity: 0.3">

    <section style="margin: 10px 16px">
        <p id="battery-status-text">
            Battery: ??%
        </p>

        <p>
            <ons-progress-bar id="battery-status-bar" secondary-value="100"></ons-progress-bar>
        </p>
    </section>


    <script>
        var currentRefreshTimer;

        var startButton = document.getElementById("start-button");
        var pauseButton = document.getElementById("pause-button");
        var stopButton = document.getElementById("stop-button");
        var spotButton = document.getElementById("spot-button");
        var goToButton = document.getElementById("go-to-button");
        var areaButton = document.getElementById("area-button");
        var fanspeedButton = document.getElementById("fanspeed-button");
        var findRobotButton = document.getElementById("find-robot-button");
        var homeButton = document.getElementById("home-button");
        var batteryStatusText = document.getElementById('battery-status-text');
        var batteryStatusBar = document.getElementById('battery-status-bar');
        var robotState = document.getElementById('robot-state');
        var robotStateDetailsM2 = document.getElementById("robot-state-details-m2");
        var robotStateDetailsTime = document.getElementById("robot-state-details-time");
        var loadingBarHome = document.getElementById('loading-bar-home');

        var config = {};

        var BUTTONS = {
            "start": {
                button: startButton,
                url: "api/start_cleaning"
            },
            "pause": {
                button: pauseButton,
                url: "api/pause_cleaning"
            },
            "stop": {
                button: stopButton,
                url: "api/stop_cleaning"
            },
            "home": {
                button: homeButton,
                url: "api/drive_home"
            },
            "find": {
                button: findRobotButton,
                url: "api/find_robot"
            },
            "spot": {
                button: spotButton,
                url: "api/spot_clean"
            }
        };

        if (!ons.platform.isAndroid()) {
            var progressStyle = document.querySelectorAll('.progressStyle');
            for (progress of progressStyle) { //How Why Help
                progress.hasAttribute('modifier') ?
                    progress.setAttribute('modifier', progress.getAttribute('modifier') + ' ios') :
                    progress.setAttribute('modifier', 'ios');
            }
        }

        function handleControlButton(button) {
            var btn = BUTTONS[button];
            if (btn === undefined) {
                throw new Error("Invalid button");
            } else {
                btn.button.setAttribute("disabled", "disabled");

                loadingBarHome.setAttribute("indeterminate", "indeterminate");
                fn.request(btn.url, "PUT", function (err) {
                    if (err) {
                        btn.button.removeAttribute("disabled");
                        loadingBarHome.removeAttribute("indeterminate");
                        ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                    } else {
                        window.clearTimeout(currentRefreshTimer);
                        window.setTimeout(function () {
                            updateHomePage();
                        }, 500);
                    }
                })
            }
        }

        var fanspeedPresets = {
            1: "Whisper",
            38: "Quiet",
            60: "Balanced",
            75: "Turbo",
            100: "Max",
            105: "Mop"
        };

        function handleFanspeedButton() {
            window.clearTimeout(currentRefreshTimer);

            ons.openActionSheet({
                title: 'Select power mode',
                cancelable: true,
                buttons: [
                    ...Object.values(fanspeedPresets),
                    {
                        label: 'Cancel',
                        icon: 'md-close'
                    }
                ]
            }).then(function (index) {
                var level = Object.keys(fanspeedPresets)[index];

                if (level) {
                    loadingBarHome.setAttribute("indeterminate", "indeterminate");
                    fanspeedButton.setAttribute("disabled", "disabled");
                    fn.requestWithPayload("api/fanspeed", JSON.stringify({ speed: level }), "PUT", function (err, res) {
                        if (err) {
                            fanspeedButton.removeAttribute("disabled");
                            loadingBarHome.removeAttribute("indeterminate");
                            ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                        } else {
                            window.clearTimeout(currentRefreshTimer);
                            window.setTimeout(function () {
                                updateHomePage();
                            }, 150);
                        }
                    })
                } else {
                    window.setTimeout(function () {
                        updateHomePage();
                    }, 3000);
                }
            });
        }

        function handleGoToButton() {
            window.clearTimeout(currentRefreshTimer);
            var options = []

            for(var i=0; i < config.spots.length; i++){
                options.push(config.spots[i][0]);
            }

            options.push({
                        label: 'Cancel',
                        icon: 'md-close'
                    });

            ons.openActionSheet({
                title: 'Go to',
                cancelable: true,
                buttons: options
            }).then(function (index) {
                if(index > -1 && index < config.spots.length){
                    fn.requestWithPayload("api/go_to", JSON.stringify({
                        x: config.spots[index][1],
                        y: config.spots[index][2]
                        }), "PUT", function (err) {
                            if (err) {
                                ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: 1500 })
                            }
                            window.setTimeout(function () {
                                updateHomePage();
                            }, 3000);
                    });
                } else {
                    window.setTimeout(function () {
                                updateHomePage();
                            }, 3000);
                }
            });
        }

        function handleAreaButton() {
            window.clearTimeout(currentRefreshTimer);
            var options = []

            for(var i=0; i < config.areas.length; i++){
                options.push(config.areas[i][0]);
            }

            options.push({
                        label: 'Cancel',
                        icon: 'md-close'
                    });

            ons.openActionSheet({
                title: 'Clean area',
                cancelable: true,
                buttons: options
            }).then(function (index) {
                if(index > -1 && index < config.areas.length){
                    fn.requestWithPayload("api/start_cleaning_zone_by_name", JSON.stringify(
                        [config.areas[index][0]]
                        ), "PUT", function (err) {
                            if (err) {
                                ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: 1500 })
                            }
                            window.setTimeout(function () {
                                updateHomePage();
                            }, 3000);
                    });
                } else {
                    window.setTimeout(function () {
                                updateHomePage();
                            }, 3000);
                }
            });
        }

        function updateHomePage() {
            loadingBarHome.setAttribute("indeterminate", "indeterminate");
            fn.request("api/current_status", "GET", function (err, res) {
                loadingBarHome.removeAttribute("indeterminate");
                fanspeedButton.removeAttribute("disabled");
                findRobotButton.removeAttribute("disabled");
                spotButton.removeAttribute("disabled");

                if (err) {
                    ons.notification.toast(err, { buttonLabel: 'Dismiss', timeout: window.fn.toastErrorTimeout })
                } else {
                    if (res.battery) {
                        batteryStatusText.innerHTML = "Battery: " + res.battery + "%";
                        batteryStatusBar.value = res.battery;
                    }

                    robotState.innerHTML = res.human_state;
                    if (res.error_code) {
                        robotState.innerHTML +=
                            '<span class="robot-error"><ons-icon icon="fa-exclamation-triangle"></ons-icon> ' +
                            res.human_error +
                            ' <ons-icon icon="fa-exclamation-triangle"></ons-icon></span>';
                    }

                    if (res.in_cleaning === 1 || res.in_cleaning === 2 || ['SPOT_CLEANING', 'GOING_TO_TARGET'].indexOf(res.state) != -1) {
                        if (['IDLE', 'PAUSED', 'CHARGER_DISCONNECTED'].indexOf(res.state) != -1) {
                            pauseButton.setAttribute("disabled", "disabled");
                            startButton.removeAttribute("disabled");
                        } else {
                            pauseButton.removeAttribute("disabled");
                            startButton.setAttribute("disabled", "disabled");
                        }
                        spotButton.setAttribute("disabled", "disabled");
                    } else {
                        spotButton.removeAttribute("disabled");
                        pauseButton.setAttribute("disabled", "disabled");
                        if (res.state !== 6) {
                            startButton.removeAttribute("disabled");
                        } else {
                            pauseButton.removeAttribute("disabled");
                            startButton.setAttribute("disabled", "disabled");
                        }
                    }

                    if (['CHARGING', 'DOCKING', 'PAUSED', 'IDLE'].indexOf(res.state) != -1) {
                        stopButton.setAttribute("disabled", "disabled");
                    } else {
                        stopButton.removeAttribute("disabled");
                    }

                    if (['RETURNING_HOME', 'CHARGING', 'CHARGING_PROBLEM'].indexOf(res.state) != -1) {
                        homeButton.setAttribute("disabled", "disabled");
                    } else {
                        homeButton.removeAttribute("disabled");
                    }

                    robotStateDetailsM2.innerHTML = "Area: " + ("00" + (res.clean_area / 1000000).toFixed(2)).slice(-6) + " m²";
                    robotStateDetailsTime.innerHTML = "Time: " + window.fn.secondsToHms(res.clean_time);
                    fanspeedButton.innerHTML = "<ons-icon icon=\"fa-superpowers\"></ons-icon> " + (fanspeedPresets[res.fan_power] || `Custom ${res.fan_power}%`);

                    currentRefreshTimer = window.setTimeout(function () {
                        updateHomePage();
                    }.bind(this), 5000);
                }
            })
        }

        ons.getScriptPage().onShow = function () {
            /* check for area and go to configuration */
            fn.request("api/get_config", "GET", function (err, res) {
                config = res;
                if(config.spots)
                    if(config.spots.length > 0)
                        goToButton.removeAttribute("disabled");
                if(config.areas)
                    if(config.areas.length > 0)
                        areaButton.removeAttribute("disabled");
            });
            updateHomePage();
        };

        ons.getScriptPage().onHide = function () {
            window.clearTimeout(currentRefreshTimer);
        }

    </script>
    <style>
        #robot-state {
            text-align: center;
            font-size: 1.2em;
            font-weight: 500;
        }

        .robot-error {
            color: #eb5959;
            display: block;
        }

        #robot-control-buttons {
            text-align: center;
        }

            #robot-control-buttons > ons-button {
                margin: 5px;
                font-size: 1.2em;
            }

        #robot-state-details-m2 {
            margin-right: 5%;
        }

        #robot-state-details-time {
            text-align: right;
        }
    </style>

</ons-page>
