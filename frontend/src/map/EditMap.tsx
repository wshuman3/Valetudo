import Map, {MapProps, MapState} from "./Map";
import {Capability, RawMapEntityType} from "../api";
import {ActionsContainer} from "./Styled";
import SegmentLabelMapStructure from "./structures/map_structures/SegmentLabelMapStructure";
import SegmentActions from "./actions/edit_map_actions/SegmentActions";
import CuttingLineClientStructure from "./structures/client_structures/CuttingLineClientStructure";
import ModeSwitchAction, {mode} from "./actions/edit_map_actions/ModeSwitchAction";
import VirtualWallClientStructure from "./structures/client_structures/VirtualWallClientStructure";
import VirtualRestrictionActions from "./actions/edit_map_actions/VirtualRestrictionActions";
import NoGoAreaClientStructure from "./structures/client_structures/NoGoAreaClientStructure";
import NoMopAreaClientStructure from "./structures/client_structures/NoMopAreaClientStructure";


interface EditMapProps extends MapProps {
    supportedCapabilities: {
        [Capability.CombinedVirtualRestrictions]: boolean,

        [Capability.MapSegmentEdit]: boolean,
        [Capability.MapSegmentRename]: boolean
    }
}

interface EditMapState extends MapState {
    segmentNames: Record<string, string>,
    cuttingLine: CuttingLineClientStructure | undefined,

    virtualWalls: Array<VirtualWallClientStructure>,
    noGoAreas: Array<NoGoAreaClientStructure>,
    noMopAreas: Array<NoMopAreaClientStructure>,

    currentMode: mode;
}

class EditMap extends Map<EditMapProps, EditMapState> {
    protected pendingVirtualRestrictionsStructuresUpdate = false;

    constructor(props: EditMapProps) {
        super(props);

        this.state = {
            selectedSegmentIds: [],
            segmentNames: {},
            cuttingLine: undefined,

            virtualWalls: [],
            noGoAreas: [],
            noMopAreas: [],

            currentMode: "segments"
        };

        if (
            !this.props.supportedCapabilities[Capability.MapSegmentEdit] &&
            !this.props.supportedCapabilities[Capability.MapSegmentRename]
        ) {
            this.setMode("virtual_restrictions");
        }
    }

    protected updateDrawableComponents(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.drawableComponentsMutex.take(async () => {
                this.drawableComponents = [];

                await this.mapLayerRenderer.draw(this.props.rawMap, this.props.theme);
                this.drawableComponents.push(this.mapLayerRenderer.getCanvas());

                this.updateStructures(this.state.currentMode);

                this.updateState();

                this.drawableComponentsMutex.leave();

                resolve();
            });
        });

    }

    private updateStructures(mode: mode) : void {
        this.structureManager.updateMapStructuresFromMapData({
            metaData: this.props.rawMap.metaData,
            size: this.props.rawMap.size,
            pixelSize: this.props.rawMap.pixelSize,
            layers: this.props.rawMap.layers,
            entities: this.props.rawMap.entities.filter(e => {
                switch (e.type) {
                    case RawMapEntityType.ChargerLocation:
                        return true;
                    default:
                        return false;
                }
            })
        });

        if (mode === "virtual_restrictions") {
            // remove all segment labels
            this.structureManager.getMapStructures().forEach(s => {
                if (s.type === SegmentLabelMapStructure.TYPE) {
                    this.structureManager.removeMapStructure(s);
                }
            });
        }
    }

    private setMode(mode: mode) : void {
        this.pendingVirtualRestrictionsStructuresUpdate = false;

        this.updateStructures(mode);

        // We need to update those here, because updating them in updateStructures would null the editing process on each new map update
        //🍝
        this.updateVirtualRestrictionClientStructures(mode !== "virtual_restrictions");

        this.updateState(mode);

        this.draw();
    }


    protected updateState(mode? : mode) : void {
        const segmentNames = {} as Record<string, string>;
        const selectedSegmentIds = [] as Array<string>;

        this.structureManager.getMapStructures().forEach(s => {
            if (s.type === SegmentLabelMapStructure.TYPE) {
                const label = s as SegmentLabelMapStructure;

                if (label.selected) {
                    selectedSegmentIds.push(label.id);

                    segmentNames[label.id] = label.name ?? label.id;
                }
            }
        });


        this.setState({
            selectedSegmentIds: selectedSegmentIds,
            segmentNames: segmentNames,
            cuttingLine: this.structureManager.getClientStructures().find(s => {
                if (s.type === CuttingLineClientStructure.TYPE) {
                    return true;
                }
            }) as CuttingLineClientStructure,

            virtualWalls: this.structureManager.getClientStructures().filter(s => {
                if (s.type === VirtualWallClientStructure.TYPE) {
                    return true;
                }
            }) as Array<VirtualWallClientStructure>,
            noGoAreas: this.structureManager.getClientStructures().filter(s => {
                if (s.type === NoGoAreaClientStructure.TYPE) {
                    return true;
                }
            }) as Array<NoGoAreaClientStructure>,
            noMopAreas: this.structureManager.getClientStructures().filter(s => {
                if (s.type === NoMopAreaClientStructure.TYPE) {
                    return true;
                }
            }) as Array<NoMopAreaClientStructure>,

            currentMode: mode ?? this.state.currentMode
        });
    }

    private updateVirtualRestrictionClientStructures(remove: boolean) : void {
        if (remove) {
            this.structureManager.getClientStructures().forEach(s => {
                switch (s.type) {
                    case VirtualWallClientStructure.TYPE:
                    case NoGoAreaClientStructure.TYPE:
                    case NoMopAreaClientStructure.TYPE:
                        this.structureManager.removeClientStructure(s);
                }
            });
        } else {
            this.props.rawMap.entities.forEach(e => {
                switch (e.type) {
                    case RawMapEntityType.VirtualWall: {
                        const p0 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[0], y: e.points[1]});
                        const p1 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[2], y: e.points[3]});

                        this.structureManager.addClientStructure(new VirtualWallClientStructure(
                            p0.x, p0.y,
                            p1.x, p1.y,
                            false
                        ));
                        break;
                    }
                    case RawMapEntityType.NoGoArea: {
                        const p0 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[0], y: e.points[1]});
                        const p1 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[2], y: e.points[3]});
                        const p2 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[4], y: e.points[5]});
                        const p3 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[6], y: e.points[7]});


                        this.structureManager.addClientStructure(new NoGoAreaClientStructure(
                            p0.x, p0.y,
                            p1.x, p1.y,
                            p2.x, p2.y,
                            p3.x, p3.y,
                            false
                        ));
                        break;
                    }
                    case RawMapEntityType.NoMopArea: {
                        const p0 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[0], y: e.points[1]});
                        const p1 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[2], y: e.points[3]});
                        const p2 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[4], y: e.points[5]});
                        const p3 = this.structureManager.convertCMCoordinatesToPixelSpace({x: e.points[6], y: e.points[7]});


                        this.structureManager.addClientStructure(new NoMopAreaClientStructure(
                            p0.x, p0.y,
                            p1.x, p1.y,
                            p2.x, p2.y,
                            p3.x, p3.y,
                            false
                        ));
                        break;
                    }

                }
            });
        }
    }

    private clearSegmentStructures() : void {
        this.structureManager.getMapStructures().forEach(s => {
            if (s.type === SegmentLabelMapStructure.TYPE) {
                const label = s as SegmentLabelMapStructure;

                label.selected = false;
            }
        });

        this.structureManager.getClientStructures().forEach(s => {
            if (s.type === CuttingLineClientStructure.TYPE) {
                this.structureManager.removeClientStructure(s);
            }
        });

        this.updateState();

        this.draw();
    }

    protected onMapUpdate() : void {
        if (this.pendingVirtualRestrictionsStructuresUpdate) {
            this.updateVirtualRestrictionClientStructures(true);
            this.updateVirtualRestrictionClientStructures(false);

            this.pendingVirtualRestrictionsStructuresUpdate = false;
        }
    }

    protected renderAdditionalElements(): JSX.Element {
        return <>
            {
                this.props.supportedCapabilities[Capability.CombinedVirtualRestrictions] &&
                (
                    this.props.supportedCapabilities[Capability.MapSegmentEdit] ||
                    this.props.supportedCapabilities[Capability.MapSegmentRename]
                ) &&
                    <ModeSwitchAction
                        currentMode={this.state.currentMode}
                        setMode={(mode) => {
                            this.clearSegmentStructures();

                            this.setMode(mode);
                        }}
                    />
            }


            <ActionsContainer>
                {
                    (
                        this.props.supportedCapabilities[Capability.MapSegmentEdit] ||
                        this.props.supportedCapabilities[Capability.MapSegmentRename]
                    ) &&
                    this.state.currentMode === "segments" &&

                    <SegmentActions
                        selectedSegmentIds={this.state.selectedSegmentIds}
                        segmentNames={this.state.segmentNames}
                        cuttingLine={this.state.cuttingLine}
                        convertPixelCoordinatesToCMSpace={(coordinates => {
                            return this.structureManager.convertPixelCoordinatesToCMSpace(coordinates);
                        })}
                        supportedCapabilities={{
                            [Capability.MapSegmentEdit]: this.props.supportedCapabilities[Capability.MapSegmentEdit],
                            [Capability.MapSegmentRename]: this.props.supportedCapabilities[Capability.MapSegmentRename]
                        }}
                        onAddCuttingLine={() => {
                            const currentCenter = this.getCurrentViewportCenterCoordinatesInPixelSpace();

                            const p0 = {
                                x: currentCenter.x -15,
                                y: currentCenter.y -15
                            };
                            const p1 = {
                                x: currentCenter.x +15,
                                y: currentCenter.y +15
                            };

                            this.structureManager.addClientStructure(new CuttingLineClientStructure(
                                p0.x, p0.y,
                                p1.x, p1.y,
                                true
                            ));

                            this.updateState();

                            this.draw();
                        }}
                        onClear={() => {
                            this.clearSegmentStructures();
                        }}
                    />
                }
                {
                    (
                        this.props.supportedCapabilities[Capability.MapSegmentEdit] ||
                        this.props.supportedCapabilities[Capability.MapSegmentRename]
                    ) &&
                    this.state.currentMode === "virtual_restrictions" &&

                    <VirtualRestrictionActions
                        virtualWalls={this.state.virtualWalls}
                        noGoAreas={this.state.noGoAreas}
                        noMopAreas={this.state.noMopAreas}

                        convertPixelCoordinatesToCMSpace={(coordinates => {
                            return this.structureManager.convertPixelCoordinatesToCMSpace(coordinates);
                        })}

                        onAddVirtualWall={() => {
                            const currentCenter = this.getCurrentViewportCenterCoordinatesInPixelSpace();

                            const p0 = {
                                x: currentCenter.x -15,
                                y: currentCenter.y -15
                            };
                            const p1 = {
                                x: currentCenter.x +15,
                                y: currentCenter.y +15
                            };

                            this.structureManager.addClientStructure(new VirtualWallClientStructure(
                                p0.x, p0.y,
                                p1.x, p1.y,
                                true
                            ));

                            this.updateState();

                            this.draw();
                        }}
                        onAddNoGoArea={() => {
                            const currentCenter = this.getCurrentViewportCenterCoordinatesInPixelSpace();

                            const p0 = {
                                x: currentCenter.x -15,
                                y: currentCenter.y -15
                            };
                            const p1 = {
                                x: currentCenter.x +15,
                                y: currentCenter.y -15
                            };
                            const p2 = {
                                x: currentCenter.x +15,
                                y: currentCenter.y +15
                            };
                            const p3 = {
                                x: currentCenter.x -15,
                                y: currentCenter.y +15
                            };


                            this.structureManager.addClientStructure(new NoGoAreaClientStructure(
                                p0.x, p0.y,
                                p1.x, p1.y,
                                p2.x, p2.y,
                                p3.x, p3.y,
                                true
                            ));

                            this.updateState();

                            this.draw();
                        }}
                        onAddNoMopArea={() => {
                            const currentCenter = this.getCurrentViewportCenterCoordinatesInPixelSpace();

                            const p0 = {
                                x: currentCenter.x -15,
                                y: currentCenter.y -15
                            };
                            const p1 = {
                                x: currentCenter.x +15,
                                y: currentCenter.y -15
                            };
                            const p2 = {
                                x: currentCenter.x +15,
                                y: currentCenter.y +15
                            };
                            const p3 = {
                                x: currentCenter.x -15,
                                y: currentCenter.y +15
                            };

                            this.structureManager.addClientStructure(new NoMopAreaClientStructure(
                                p0.x, p0.y,
                                p1.x, p1.y,
                                p2.x, p2.y,
                                p3.x, p3.y,
                                true
                            ));

                            this.updateState();

                            this.draw();
                        }}
                        onRefresh={() => {
                            this.updateVirtualRestrictionClientStructures(true);
                            this.updateVirtualRestrictionClientStructures(false);

                            this.draw();
                        }}
                        onSave={() => {
                            this.pendingVirtualRestrictionsStructuresUpdate = true;
                        }}
                    />
                }
            </ActionsContainer>
        </>;
    }
}

export default EditMap;
