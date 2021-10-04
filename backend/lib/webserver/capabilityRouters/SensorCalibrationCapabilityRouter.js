const escapeHtml = require("escape-html");

const Logger = require("../../Logger");

const CapabilityRouter = require("./CapabilityRouter");

class SensorCalibrationCapabilityRouter extends CapabilityRouter {

    initRoutes() {
        this.router.get("/", async (req, res) => {
            res.json(await this.capability.getSensors());
        });

        this.router.put("/:type/:sub_type?", async (req, res) => {
            //This is only required because typescript doesn't understand optional parameters
            //error TS2551: Property 'sub_type' does not exist on type 'RouteParameters<"/:type/:sub_type?">'. Did you mean 'sub_type?'?
            const parameters = {
                type: req.params.type,
                //@ts-ignore
                sub_type: req.params.sub_type ?? undefined
            };

            if (req.body && req.body.action) {
                if (req.body.action === "calibrate") {
                    try {
                        await this.capability.calibrateSensor(parameters.type, parameters.sub_type);
                        res.sendStatus(200);
                    } catch (e) {
                        Logger.warn("Error while calibrating sensor " + parameters.type + " " + parameters.sub_type, e);
                        res.status(500).json(e.message);
                    }
                } else {
                    res.status(400).send(`Invalid action "${escapeHtml(req.body.action)}" in request body`);
                }
            } else {
                res.status(400).send("Missing action in request body");
            }
        });
    }
}

module.exports = SensorCalibrationCapabilityRouter;
