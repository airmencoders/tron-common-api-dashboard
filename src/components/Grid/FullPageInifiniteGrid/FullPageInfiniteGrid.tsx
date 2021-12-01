import React from 'react';
import {FullPageInfiniteGridProps} from "./FullPageInfiniteGridProps";
import InfiniteScrollGrid from "../InfiniteScrollGrid/InfiniteScrollGrid";
import {withPageStateHandler} from "../withPageStateHandler";

export default withPageStateHandler<FullPageInfiniteGridProps>(InfiniteScrollGrid);