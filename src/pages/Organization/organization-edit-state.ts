import { OrganizationDto, PersonDto } from '../../openapi';
import { PersonWithDetails } from '../../state/organization/organization-state';

export interface OrganizationEditState {
  leader: OrganizationLeaderState;
  parentOrg: OrganizationParentState;
  members: OrganizationMemberState;
  subOrgs: OrganizationSubOrgState;
}

interface OrganizationLeaderState {
  removed: boolean;
  newLeader?: PersonDto;
}

interface OrganizationParentState {
  removed: boolean;
  newParent?: OrganizationDto;
}

interface OrganizationMemberState {
  toRemove: PersonWithDetails[];
  toAdd: PersonWithDetails[];
}

interface OrganizationSubOrgState {
  toRemove: OrganizationDto[];
  toAdd: OrganizationDto[];
}

export function getDefaultOrganizationEditState(): OrganizationEditState {
  return {
    leader: {
      removed: false,
      newLeader: undefined
    },
    parentOrg: {
      removed: false,
      newParent: undefined
    },
    members: {
      toAdd: [],
      toRemove: []
    },
    subOrgs: {
      toAdd: [],
      toRemove: []
    }
  };
}