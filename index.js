let str = {
    sep: "`"
};

module.exports = {
    arrayConcat: arrays => [].concat(...arrays),
    arrayToObject: (array, field = "id") => {
        let object = {};
        if (Array.isArray(array)) {
            array.forEach(item => {
                if (Object.prototype.hasOwnProperty.call(item, field)) {
                    object[item[field]] = item;
                }
            });
        }

        return object;
    },
    clone: object => {
        let cache = [];

        return JSON.parse(
            JSON.stringify(object, (ignore, value) => {
                if (typeof value === "object" && value !== null) {
                    if (cache.indexOf(value) > -1) {
                        return false;
                    }
                    cache.push(value);
                }

                return value;
            })
        );
    },
    escape: value => str.sep + value + str.sep,
    filterObjects: (array, check) => {
        if (!array) return false;

        return array.filter(issue => {
            return Object.keys(check).some(item => {
                if (!Array.isArray(check[item])) check[item] = [check[item]];
                if (!Object.prototype.hasOwnProperty.call(issue, item)) {
                    return false;
                }

                return check[item].some(value => value === issue[item]);
            });
        });
    },
    getHistoryColumns: (tbl_config, columns = {}) => {
        let columns_final = {};

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
    },
    getPostColumns: Database => {
        let columns = {};
        columns[Database.tbl_config.getUpper("created")] = {
            default: `${module.exports.getTime(Database)}`,
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
                default: `${module.exports.getTime(Database)}`,
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
    },
    getPreColumns: Database => {
        let columns = {};
        columns[Database.tbl_config.getUpper("id")] = {
            constraint: {
                primary: {
                    auto: true
                }
            },
            type: "INTEGER"
        };

        return columns;
    },
    getTime: (Database, is_insert = false) => {
        let system = Database.sys_config.getSystem();

        if (system === "sqlite") {
            return "(STRFTIME('%s', 'now'))";
        }
        if (system === "mysql") {
            return is_insert ? "NOW()" : "CURRENT_TIMESTAMP";
        }

        console.error(`Unsupported System: "${system}"`);
    },
    isPromise: object => {
        return Object.prototype.toString.call(object) === "[object Promise]";
    },
    str,
    ucfirst: value => value.substr(0, 1).toUpperCase() + value.substr(1),
    ucwords: words => {
        let is_array = Array.isArray(words);
        if (!is_array) {
            words = words.split(" ");
        }

        words = words.map(part => module.exports.ucfirst(part));

        return is_array ? words : words.join(" ");
    },
    unescape: value => {
        if (value.substr(0, 1) === str.sep && value.substr(-1) === str.sep) {
            value = value.substr(1);

            return value.substr(0, value.length - 1);
        }

        return value;
    }
};

module.exports.str.sep_single = `${str.sep}, ${str.sep}`;
module.exports.str.sep_new = `${str.sep}, NEW.${str.sep}`;
module.exports.str.sep_old = `${str.sep}, OLD.${str.sep}`;
module.exports.str.sep_com1 = `(NEW.${str.sep}`;
module.exports.str.sep_com2 = `${str.sep} != OLD.${str.sep}`;
module.exports.str.sep_com3 = `${str.sep}) OR `;
module.exports.str.sep_com4 = `${str.sep} IS NOT NULL AND OLD.${str.sep}`;
module.exports.str.sep_com5 = `${str.sep} IS NULL) OR `;
module.exports.str.sep_com6 = `${str.sep} IS NULL AND OLD.${str.sep}`;
module.exports.str.sep_com7 = `${str.sep} IS NOT NULL)`;
