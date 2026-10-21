export interface SqlHelpersConfig {
    escapeChar?: string;
    reserveIdentifiers?: string[];
    ar_aliased_tables?: string[];
    dbprefix?: string;
    swap_pre?: string;
    escapeString?: (text: any) => string;
}

export class sqlHelpers {
    constructor(config: SqlHelpersConfig);
    object2boleandSql(valores: Record<string, any>, literal?: boolean): string;
    protectIdentifiersBolean(text: string): string;
    filterSqlI(sql: any, except?: string[]): any;
    escapeIdentifiers(item: string): string;
    protectIdentifiers(item: string, prefixSingle?: boolean, protectIdentifiers?: boolean, fieldExists?: boolean): string;
    formatVarInsert(value: any, key?: string): string;
    campos(campos: string[]): string;
}

export default sqlHelpers;
