import {Rank, RankBranchTypeEnum} from '../../openapi/models';

export type RankStateModel = {
  [ranks in RankBranchTypeEnum]?: Rank[];
};
