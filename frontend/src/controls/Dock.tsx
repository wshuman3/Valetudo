import {Capability, useAutoEmptyDockManualTriggerMutation, useRobotStatusQuery} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {Box, Button, Grid, Icon, Paper, styled, Typography} from "@mui/material";
import {
    RestoreFromTrash as EmptyIcon
} from "@mui/icons-material";
import React from "react";

const Dock = (): JSX.Element => {
    const { data: status } = useRobotStatusQuery();

    const StyledIcon = styled(Icon)(({ theme }) => {
        return {
            marginRight: theme.spacing(1),
            marginLeft: -theme.spacing(1),
        };
    });

    const [triggerEmptySupported] = useCapabilitiesSupported(Capability.AutoEmptyDockManualTrigger);
    const {
        mutate: triggerDockEmpty,
        isLoading: emptyIsExecuting,
    } = useAutoEmptyDockManualTriggerMutation();

    if (status === undefined) {
        return (
            <Paper>
                <Box p={1}>
                    <Typography color="error">Error loading dock controls</Typography>
                </Box>
            </Paper>
        );
    }

    const { value: state } = status;

    return (
        <Paper>
            <Box px={2} py={1}>
                <Grid container direction="row" alignItems="center" spacing={1}>
                    <Grid item>
                        <Typography variant="subtitle1">Dock</Typography>
                    </Grid>
                    {
                        triggerEmptySupported &&
                        <Grid item xs>
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    disabled={emptyIsExecuting || state !== "docked"}
                                    variant="outlined"
                                    size="medium"
                                    color="inherit"
                                    onClick={() => {
                                        triggerDockEmpty();
                                    }}
                                >
                                    <StyledIcon as={EmptyIcon} /> Empty
                                </Button>
                            </Box>
                        </Grid>
                    }

                </Grid>
            </Box>
        </Paper>
    );
};

export default Dock;
