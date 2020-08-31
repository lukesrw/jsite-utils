import * as Generic from "./interfaces/generic";

let strings: {
    sep: string;
    sep_single?: string;
    sep_new?: string;
    sep_old?: string;
    sep_com1?: string;
    sep_com2?: string;
    sep_com3?: string;
    sep_com4?: string;
    sep_com5?: string;
    sep_com6?: string;
    sep_com7?: string;
} = {
    sep: "`"
};

export function arrayToObject(array: Generic.Object[], field = "id") {
    let object: Generic.Object = {};
    if (Array.isArray(array)) {
        array.forEach(item => {
            if (Object.prototype.hasOwnProperty.call(item, field)) {
                object[item[field]] = item;
            }
        });
    }

    return object;
}

export function getHistoryColumns(tbl_config: Generic.Object, columns = {}) {
    let columns_final: Generic.Object = {};

    /**
     * History table pre-columns (id)
     */
    columns_final[tbl_config.getUpper("id", "__history", "__last")] = {
        type: "INTEGER"
    };
    columns_final[tbl_config.getUpper("id", "__history")] = {
        constraint: {
            primary: {
                auto: true
            }
        },
        type: "INTEGER"
    };
    columns_final[tbl_config.getUpper("id", "__history", "__next")] = {
        type: "INTEGER"
    };

    columns_final = Object.assign(columns_final, columns);

    /**
     * History table post-columns (scd)
     */
    columns_final[tbl_config.getUpper("scd", "__start")] = "DATETIME";
    columns_final[tbl_config.getUpper("scd", "__end")] = "DATETIME";
    columns_final[tbl_config.getUpper("scd", "__duration")] = "INTEGER";
    columns_final[tbl_config.getUpper("scd", "__event")] = {
        constraint: {
            null: true
        },
        type: "CHAR(6)"
    };

    return columns_final;
}

export function getTime(Database: Generic.Object, is_insert = false) {
    let system = Database.sys_config.getSystem();

    if (system === "sqlite") {
        return "(STRFTIME('%s', 'now'))";
    }
    if (system === "mysql") {
        return is_insert ? "NOW()" : "CURRENT_TIMESTAMP";
    }

    console.error(`Unsupported System: "${system}"`);

    return false;
}

export function getPostColumns(Database: Generic.Object) {
    let columns: Generic.Object = {};
    columns[Database.tbl_config.getUpper("created")] = {
        default: `${getTime(Database)}`,
        nullable: false,
        type: "DATETIME"
    };
    columns[Database.tbl_config.getUpper("created_desc")] = {
        constraint: {
            default: "'No Description'",
            nullable: false
        },
        type: "VARCHAR(127)"
    };
    columns[Database.tbl_config.getUpper("updated")] = {
        constraint: {
            default: `${getTime(Database)}`,
            nullable: false
        },
        type: "DATETIME"
    };
    columns[Database.tbl_config.getUpper("updated_desc")] = {
        constraint: {
            default: "'No Description'",
            nullable: false
        },
        type: "VARCHAR(127)"
    };

    return columns;
}
export function getPreColumns(Database: Generic.Object) {
    let columns: Generic.Object = {};

    columns[Database.tbl_config.getUpper("id")] = {
        constraint: {
            primary: {
                auto: true
            }
        },
        type: "INTEGER"
    };

    return columns;
}

export function isPromise(object: any) {
    return Object.prototype.toString.call(object) === "[object Promise]";
}

export function unescape(value: string) {
    if (value.substr(0, 1) === strings.sep && value.substr(-1) === strings.sep) {
        value = value.substr(1);

        return value.substr(0, value.length - 1);
    }

    return value;
}

strings.sep_single = `${strings.sep}, ${strings.sep}`;
strings.sep_new = `${strings.sep}, NEW.${strings.sep}`;
strings.sep_old = `${strings.sep}, OLD.${strings.sep}`;
strings.sep_com1 = `(NEW.${strings.sep}`;
strings.sep_com2 = `${strings.sep} != OLD.${strings.sep}`;
strings.sep_com3 = `${strings.sep}) OR `;
strings.sep_com4 = `${strings.sep} IS NOT NULL AND OLD.${strings.sep}`;
strings.sep_com5 = `${strings.sep} IS NULL) OR `;
strings.sep_com6 = `${strings.sep} IS NULL AND OLD.${strings.sep}`;
strings.sep_com7 = `${strings.sep} IS NOT NULL)`;

export const str = strings;
