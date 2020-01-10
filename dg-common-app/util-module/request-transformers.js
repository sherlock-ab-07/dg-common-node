const {dbTableColMap, dbDownloadTableMapper, tableKeyMap, tableDefaultSortMap} = require("../util-module/db-constants");
const {arrayNotEmptyCheck, objectHasPropertyCheck, notNullCheck} = require('../util-module/data-validators');
const {getDownloadMapperAccessor} = require('../repository-module/data-accesors/common-accessor');

const mongoWhereInCreator = (data) => {
    return {'$in': data}
};

const filterQueryCreator = (filterQuery, colName) => {
    filterQuery = filterQuery.replace('{0}', `fs.${dbTableColMap['filterset'][colName]}`);
    return filterQuery;
};

const excelColCreator = async () => {
    let downloadMapperResponse, finalResponse = {}, keysArray = [];
    downloadMapperResponse = await getDownloadMapperAccessor([]);
    if (objectHasPropertyCheck(downloadMapperResponse, 'rows') && arrayNotEmptyCheck(downloadMapperResponse.rows)) {
        const cols = [];
        downloadMapperResponse.rows.forEach(item => {
            cols.push({
                header: item['localized_key'],
                key: item['mapping_key']
            });
            keysArray.push(item['mapping_key']);
        });
        finalResponse['cols'] = cols;
        finalResponse['keysArray'] = keysArray;
    }
    return finalResponse;
};

const insertQueryCreator = (req, tableName, insertQuery) => {
    let columns = '', values = 'values', keysArray = [], modifiedInsertQuery, valuesArray = [], finalResponse = {},
        counter = 0;
    Object.keys(req).map((key) => {
            if (notNullCheck(dbTableColMap[tableName][key])) {
                keysArray.push(key)
            }
        }
    );
    keysArray.forEach((key, index) => {
        // console.log(key);
        // console.log(dbTableColMap[tableName][key]);
        if (index === 0) {
            columns = `(${dbTableColMap[tableName][key]}`;
            values = `${values} ($${counter + 1}`;
            counter++;
        } else if (index === keysArray.length - 1) {
            columns = `${columns},${dbTableColMap[tableName][key]})`;
            values = `${values}, $${counter + 1})`;
            counter++;
        } else {
            columns = `${columns},${dbTableColMap[tableName][key]}`;
            values = `${values}, $${counter + 1}`;
            counter++;
        }
        valuesArray.push(req[key]);
    });
    modifiedInsertQuery = `${insertQuery} ${tableName} ${columns} ${values} RETURNING ${tableKeyMap[tableName]['key']}`;
    // modifiedInsertQuery = `${insertQuery} ${tableName} ${columns} ${values}`;
    finalResponse['valuesArray'] = valuesArray;
    finalResponse['modifiedInsertQuery'] = modifiedInsertQuery;
    // console.log(modifiedInsertQuery);
    // console.log(valuesArray);
    // console.log(finalResponse);
    return finalResponse;
};

const updateQueryCreator = (table, fields, whereCondition) => {
    let responseObj, query = `update ${table} set `, presentFields = [];
    fields.forEach((field) => {
        if (notNullCheck(dbTableColMap[table][field])) {
            presentFields.push(field);
        }
    });
    presentFields.forEach((field, index) => {
        // counter++;
        if (index === presentFields.length - 1) {
            query = `${query} ${dbTableColMap[table][field]} = $${index + 1} where ${whereCondition} = $${index + 2}`;
        } else {
            query = `${query} ${dbTableColMap[table][field]} = $${index + 1} ,`;
        }
    });
    responseObj = {
        presentFields, query
    };
    // console.log(responseObj);
    return responseObj;
};

const mongoUpdateQueryCreator = (obj) => {
    let request = {$set: {}};
    if (notNullCheck(obj)) {
        Object.keys(obj).forEach(key => {
            request.$set[key] = obj[key];
        });
    }
    return request;
};

const requestInModifier = (itemArray, query, isLanguage) => {
    let modifiedQuery = query;
    if (arrayNotEmptyCheck(itemArray)) {
        itemArray.forEach((item, index) => {
            const paramNumber = isLanguage ? index + 2 : index + 1;
            if (index === 0 && itemArray.length === 1) {
                modifiedQuery = `${modifiedQuery} ($${paramNumber})`;
            } else if (index === 0) {
                modifiedQuery = `${modifiedQuery} ($${paramNumber},`;
            } else if (index === (itemArray.length - 1)) {
                modifiedQuery = `${modifiedQuery} $${paramNumber})`;
            } else {
                modifiedQuery = `${modifiedQuery} $${paramNumber},`;
            }
        });
    }
    return modifiedQuery;
};
const excelRowsCreator = (list, table, keysArray) => {
    let returnObj = {}, ids = [], finalResponse = {};
    if (objectHasPropertyCheck(list, 'rows') && arrayNotEmptyCheck(list.rows)) {
        list.rows.forEach(item => {
            returnObj[item[tableKeyMap[table]['key']]] = {};
            keysArray.forEach((key) => {
                returnObj[item[tableKeyMap[table]['key']]][key] = item[dbDownloadTableMapper[table][key]];
            });
            ids.push(`${item[tableKeyMap[table]['key']]}`);
        });
    }
    finalResponse['rows'] = returnObj;
    finalResponse['ids'] = ids;
    return finalResponse;
};

const sortWithPaginationQueryCreator = (sortBy, sortOrder, offset, limit, table) => {
    let query;
    offset = offset || 0;
    limit = limit || 10;
    sortBy = notNullCheck(sortBy) ? sortBy : tableDefaultSortMap[table].sortBy;
    sortOrder = notNullCheck(sortOrder) ? sortOrder : tableDefaultSortMap[table].sortOrder;
    query = `order by ${sortBy} ${sortOrder} nulls last offset ${offset} limit ${limit}`;
    return query;
};
const skipFieldsCreator = (setFields, skipValue) => {
    if (notNullCheck(setFields)) {
        delete setFields[skipValue];
    }
    return setFields;
};
const pgDataFilterQueryCreator = (keyArray, valueArray) => {
    let filterQuery = ``;
    if (arrayNotEmptyCheck(keyArray) && arrayNotEmptyCheck(valueArray)) {
        keyArray.forEach((value, index) => {
            if (index === keyArray.length -1) {
                filterQuery = `${value} = ${valueArray[index]}`;
            } else {
                filterQuery = `${value} = ${valueArray[index]} and `;
            }
        });
    }
    return filterQuery;
};
module.exports = {
    pgDataFilterQueryCreator,
    filterQueryCreator,
    skipFieldsCreator,
    mongoWhereInCreator,
    requestInModifier,
    insertQueryCreator,
    excelColCreator,
    excelRowsCreator,
    updateQueryCreator,
    mongoUpdateQueryCreator,
    sortWithPaginationQueryCreator
};