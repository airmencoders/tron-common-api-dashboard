import React from 'react';
import Grid from "../Grid";
import {withPageStateHandler} from "../withPageStateHandler";
import {FullPageGridProps} from "./FullPageGridProps";

export default withPageStateHandler<FullPageGridProps>(Grid);