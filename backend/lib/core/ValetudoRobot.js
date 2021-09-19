const {EventEmitter} = require("events");

const AttributeSubscriber = require("../entities/AttributeSubscriber");
const CallbackAttributeSubscriber = require("../entities/CallbackAttributeSubscriber");
const ConsumableDepletedValetudoEvent = require("../valetudo_events/events/ConsumableDepletedValetudoEvent");
const entities = require("../entities");
const {ConsumableStateAttribute, StatusStateAttribute} = require("../entities/state/attributes");
const {ErrorStateValetudoEvent} = require("../valetudo_events/events");

class ValetudoRobot {
    /**
     *
     * @param {object} options
     * @param {import("../Configuration")} options.config
     * @param {import("../ValetudoEventStore")} options.valetudoEventStore
     */
    constructor(options) {
        /** @private */
        this.eventEmitter = new EventEmitter();
        this.valetudoEventStore = options.valetudoEventStore;
        this.config = options.config;
        this.capabilities = {};

        this.state = new entities.state.RobotState({
            map: ValetudoRobot.DEFAULT_MAP
        });

        this.initInternalSubscriptions();
    }

    /**
     * @public
     */
    clearValetudoMap() {
        this.state.map = ValetudoRobot.DEFAULT_MAP;

        this.emitMapUpdated();
    }

    /**
     *
     * @param {import("./capabilities/Capability")} capability
     */
    registerCapability(capability) {
        if (!this.capabilities[capability.type]) {
            this.capabilities[capability.type] = capability;
        } else {
            throw new Error("Attempted to register more than one capability of type " + capability.type);
        }
    }

    /**
     * @public
     * @param {string} capabilityType
     * @returns {boolean}
     */
    hasCapability(capabilityType) {
        return this.capabilities[capabilityType] !== undefined;
    }

    /**
     * Always polls the latest state from the robot
     *
     * @returns {Promise<import("../entities/state/RobotState")>}
     */
    async pollState() {
        return this.state;
    }

    /**
     * Parses a state update and updates the internal state.
     * Updates might be partial
     *
     * @param {*} data
     */
    parseAndUpdateState(data) {

    }

    /**
     * @private
     */
    initInternalSubscriptions() {
        this.state.subscribe(
            new CallbackAttributeSubscriber((eventType, consumable) => {
                if (eventType !== AttributeSubscriber.EVENT_TYPE.DELETE) {
                    //@ts-ignore
                    if (consumable?.remaining?.value === 0) {
                        this.valetudoEventStore.raise(new ConsumableDepletedValetudoEvent({
                            type: consumable.type,
                            subType: consumable.subType
                        }));
                    }
                }
            }),
            {attributeClass: ConsumableStateAttribute.name}
        );

        this.state.subscribe(
            new CallbackAttributeSubscriber((eventType, status, prevStatus) => {
                if (
                    //@ts-ignore
                    (eventType === AttributeSubscriber.EVENT_TYPE.ADD && status.value === StatusStateAttribute.VALUE.ERROR) ||
                    (
                        eventType === AttributeSubscriber.EVENT_TYPE.CHANGE &&
                        //@ts-ignore
                        status.value === StatusStateAttribute.VALUE.ERROR &&
                        prevStatus &&
                        //@ts-ignore
                        prevStatus.value !== StatusStateAttribute.VALUE.ERROR
                    )
                ) {
                    this.valetudoEventStore.raise(new ErrorStateValetudoEvent({
                        message: status?.metaData?.error_description ?? "Unknown Error"
                    }));
                }
            }),
            {attributeClass: StatusStateAttribute.name}
        );
    }


    async shutdown() {

    }

    getManufacturer() {
        return "Valetudo";
    }

    getModelName() {
        return "ValetudoRobot";
    }

    /**
     * This method may be overridden to return robot-specific well-known properties
     * such as the firmware version
     *
     * @abstract
     * @returns {object}
     */
    getProperties() {
        return {};
    }

    /**
     * Basically used to log some more robot-specific information
     */
    startup() {}

    /**
     * @protected
     */
    emitStateUpdated() {
        this.eventEmitter.emit(ValetudoRobot.EVENTS.StateUpdated);
    }

    /**
     * @public
     * @param {() => void} listener
     */
    onStateUpdated(listener) {
        this.eventEmitter.on(ValetudoRobot.EVENTS.StateUpdated, listener);
    }

    /**
     * @protected
     */
    emitStateAttributesUpdated() {
        this.emitStateUpdated();

        this.eventEmitter.emit(ValetudoRobot.EVENTS.StateAttributesUpdated);
    }

    /**
     * @public
     * @param {() => void} listener
     */
    onStateAttributesUpdated(listener) {
        this.eventEmitter.on(ValetudoRobot.EVENTS.StateAttributesUpdated, listener);
    }

    /**
     * @protected
     */
    emitMapUpdated() {
        this.emitStateUpdated();

        this.eventEmitter.emit(ValetudoRobot.EVENTS.MapUpdated);
    }

    /**
     * @public
     * @param {() => void} listener
     */
    onMapUpdated(listener) {
        this.eventEmitter.on(ValetudoRobot.EVENTS.MapUpdated, listener);
    }

    /**
     *
     * This very badly named function is used for the implementation autodetection feature
     *
     * Returns true if the implementation thinks that it's the right one for this particular robot
     */
    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        return false;
    }
}

ValetudoRobot.EVENTS = {
    StateUpdated: "StateUpdated",
    StateAttributesUpdated: "StateAttributesUpdated",
    MapUpdated: "MapUpdated"
};

ValetudoRobot.DEFAULT_MAP = require("../res/default_map");

ValetudoRobot.WELL_KNOWN_PROPERTIES = {
    FIRMWARE_VERSION: "firmware_version"
};

module.exports = ValetudoRobot;
