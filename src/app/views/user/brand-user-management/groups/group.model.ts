export interface Payload {
    message: string;
    data?: (UserGroup)[] | null;
}
export interface UserGroup {
    id: string;
    groupName: string;
    groupDesc: string;
    addedUsers?: (UserEntity)[] | null;
    moduleData?: (ModuleDataEntity)[] | null;
    default: boolean;
}
export interface UserGroupData {
    id: string;
    name: string;
    description: string;
    users?: (UserEntity)[] | null;
    moduleData?: (ModuleDataEntity)[] | null;
    is_default_group: boolean;
    status: string;
}
export interface UserEntity {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}
export interface ModuleDataEntity {
    module: string;
    allowedActions: AllowedActions;
    default: boolean;
}
export interface AllowedActions {
    fullAccess: boolean;
    readOnly: boolean;
    noAccess: boolean;
}

export interface GroupConfigEntity {
    privileges: string[];
    modules: string[];
    users: UserEntity[];
}
