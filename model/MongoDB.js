/**
 * Created by Jay on 2015/8/24.
 */

var dbOption = {
    w:-1,
    logger:{
        doDebug:true,
        debug:function(msg,obj){
            console.log('[debug]',msg);
        },
        log:function(msg,obj){
            console.log('[log]',msg);
        },
        error:function(msg,obj){
            console.log('[error]',msg);
        }
    }
};


var dbMap = {};

var defaultDB;

function open(host, port, name, option, callBack, asDefault) {
    var auth = option ? option.auth : null;

    var driver = option && option.driver ? option.driver : "native";
    var poolSize = option && option.server && option.server.poolSize ? option.server.poolSize : 'default';

    var newDB;
    var done = function(err) {
        if (newDB) {
            dbMap[name] = newDB;
            if (asDefault) defaultDB = newDB;
            console.log("Database connection[" + name + "] init completed.   [default:" + asDefault + ", driver: " + driver + ", poolSize: " + poolSize + "]");
        }

        if (callBack) callBack(err, newDB);
    }

    var uri, opt = cloneObject(option);
    if (host.indexOf("mongodb://") == 0) {
        uri = host;
    } else {
        uri = "mongodb://" + host + ":" + port + "/" + name;
    }
    if (option.args && !isEmpty(option.args)) {
        var tmp = [];
        for (var prop in option.args) {
            tmp.push(prop + "=" + option.args[prop]);
        }
        tmp = tmp.join("&");
        if (uri.indexOf("?") < 0) uri += "?";
        uri += tmp;
    }

    if (option && option.driver == "mongoose") {
        var mongoose = require("mongoose");
        mongoose.Promise = global.Promise;
        newDB = mongoose.createConnection(uri, opt);
        newDB.__driver = mongoose;
        process.nextTick(done);
    } else {
        var MongoClient = require("mongodb").MongoClient;
        MongoClient.connect(uri, opt, function (err, db) {
            if (db) {
                newDB = db;
                newDB.__driver = require("mongodb");
            }
            done(err);
        });
    }
}

function getDBByName(dbName) {
    return dbName ? dbMap[dbName] : defaultDB;
}

function insert(dbName, target, data, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }
        db.collection(target).insertOne(data, function(err, res){
            if (err) console.error(err);
            if (callBack) return callBack(err, res);
            err ? reject(err) : resolve(res);
        });
    });
}

function insertList(dbName, target, list, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        db.collection(target).insert(list, function(err, res){
            if (callBack) return callBack(err, res);
            err ? reject(err) : resolve(res);
        });
    });
}

function find(dbName, target, filter, fields, sort, pagination, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);
        var args = [];
        args.push(filter ? filter : {});
        var opt = {};
        if (fields) opt.fields = fields;
        if (sort) opt.sort = sort;
        if (pagination)  {
            opt.limit = pagination.num;
            if (pagination.index > 0) opt.skip = pagination.index * opt.limit;
        }
        args.push(opt);
        args.push(function(err1, cursor) {
            if (err1) {
                console.error(target + ".find failed ==> ", err1);
                if (callBack) return callBack(err1);
                return reject(err1);
            }
            cursor.toArray(function(err2, items) {
                if (err2) console.error(target + ".find.toArray failed ==> ", err2);
                //console.log(target + ".find complete ==> items.length: " + (items ? items.length : 0));
                if (callBack) return callBack(err2, items);
                err2 ? reject(err2) : resolve(items);
            });
        });
        targetCol.find.apply(targetCol, args);
    });
}

function findOne(dbName, target, filter, fields, callBack) {
    callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    fields = fields && typeof fields == "object" ? fields : null;

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);
        var args = [];
        args.push(filter ? filter : {});
        if (fields) args.push(fields);
        args.push(function(err, obj) {
            if (err) console.error(target + ".findOne failed ==> ", err);
            if (callBack) return callBack(err, obj);
            err ? reject(err) : resolve(obj);
        });
        targetCol.findOne.apply(targetCol, args);
    });
}

function findPage(dbName, target, filter, fields, sort, pagination, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);

        filter = filter ? filter : {};
        pagination = pagination || { index:0, num:20 };

        var cursor = targetCol.find(filter, {fields:fields});
        cursor.count(function(err, totalNum) {
            if (err) {
                console.error(target + ".count failed ==> ", err);
                if (callBack) return callBack(err);
                return reject(err);
            } else {
                if (sort) {
                    cursor = cursor.sort(sort);
                }
                var pageIndex = pagination.index || 0;
                var pageSize = pagination.num || 20;
                cursor.skip(parseInt(pageIndex) * parseInt(pageSize)).limit(parseInt(pageSize)).toArray(function(err, items) {
                    if (err) console.error(target + ".find.sort.skip.limit.toArray failed ==> ", err);
                    var result = items ? { list:items, totalNum:totalNum, pageIndex:pageIndex, pageSize:pageSize } : null;
                    if (callBack) return callBack(err, result);
                    err ? reject(err) : resolve(result);
                });
            }
        });
    });
}

function count(dbName, target, filter, callBack) {
    callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    filter = filter && typeof filter == "object" ? filter : {};

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);
        targetCol.count(filter ? filter : {}, function(err, count) {
            if (err) console.error(target + ".count failed ==> ", err);
            if (callBack) return callBack(err, count);
            err ? reject(err) : resolve(count);
        });
    });
}

/*
*
* db.Test.aggregate
 ([
 {$unwind:'$list'},
 {$match:{ 'list.id':1 }},
 {$group:{_id:'$_id', score:{$push:'$list'}}}
 ])
*
* */

function aggregate(dbName, target, operation, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);
        targetCol.aggregate(operation, function(err, res) {
            if (err) console.error(target + ".aggregate failed ==> err: " + err + "      args: ", operation ? JSON.stringify(operation) : "null");
            if (callBack) return callBack(err, res);
            err ? reject(err) : resolve(res);
        });
    });
}

function processUpdateParams(params) {
    var changes = {};
    var hasSets = false;
    var sets;
    if (params["$set"]) {
        sets = params["$set"];
        hasSets = true;
    } else {
        sets = {};
    }

    for (var key in params) {
        if (key == "$set") continue;

        if (key.charAt(0) == "$") {
            changes[key] = params[key];
        } else {
            sets[key] = params[key];
            hasSets = true;
        }
    }
    if (hasSets) {
        changes["$set"] = sets;
    }
    return changes;
}

function update(dbName, target, filter, params, option, callBack) {
    callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    option = option && typeof option == "object" ? option : {};

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }
        var targetCol = db.collection(target);

        var changes = processUpdateParams(params);
        targetCol.update(filter,
            changes,
            {upsert:option && option.upsert ? true : false, multi:option && option.multi ? true : false, w:1},
            function(err, result) {
                if (err) console.error(target + ".update failed ==> " + err);
                result = result ? result.result : { ok: 1, nModified: 0, n: 0 };
                if (callBack) return callBack(err, result);
                err ? reject(err) : resolve(result);
            });
    });
}

function findOneAndUpdate(dbName, target, filter, params, option, callBack) {
    callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    option = option && typeof option == "object" ? option : {};

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);

        var changes = processUpdateParams(params);

        option = option ? JSON.parse(JSON.stringify(option)) : { upsert:false, new:false };
        option.projection = option.fields;
        option.returnOriginal = !option.new;
        delete option["fields"];

        targetCol.findOneAndUpdate(filter, changes, option,
            function(err, result) {
                if (err) console.error(target + ".findOneAndUpdate failed ==> " + err);
                var doc = null;
                try {
                    if (typeof result == "object") {
                        doc = result.value;
                    }
                } catch (exp) {
                    doc = null;
                }
                if (callBack) return callBack(err, doc);
                err ? reject(err) : resolve(doc);
            });
    });
}

function findOneAndDelete(dbName, target, filter, options) {
    var callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);

        options = options ? JSON.parse(JSON.stringify(options)) : { upsert:false };
        options.projection = options.fields;
        delete options["fields"];

        targetCol.findOneAndDelete(filter, options,
            function(err, result) {
                if (err) console.error(target + ".findOneAndDelete failed ==> " + err);
                var doc = null;
                try {
                    if (typeof result == "object") {
                        doc = result.value;
                    }
                } catch (exp) {
                    doc = null;
                }
                if (callBack) return callBack(err, doc);
                err ? reject(err) : resolve(doc);
            });
    });
}

function ensureIndex(dbName, target, key, option, callBack) {
    var callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;
    option = typeof option === "object" ? option : null;

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);

        var indexes;
        if (typeof key == 'object') {
            indexes = key;
        } else {
            indexes = {};
            indexes[key] = 1;
        }
        targetCol.ensureIndex(indexes, option, function(err, result) {
            if (callBack) return callBack(err, result);
            err ? reject(err) : resolve(result);
        });
    });
}

function getIndexes(dbName, target, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        var targetCol = db.collection(target);
        
        targetCol.indexInformation(function(err, result) {
            if (callBack) return callBack(err, result);
            err ? reject(err) : resolve(result);
        });
    });
}

function remove(dbName, target, filters, options) {
    var callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        options = options || { single:false };

        var targetCol = db.collection(target);
        if (typeof filters == "object" && !(filters instanceof Array)) {
            filters = [ filters ];
        }
        targetCol.remove.apply(targetCol, filters.concat([options,
            function(err, result) {
                if (err) console.error(target + ".update failed ==> " + err);
                result = result ? result.result : { ok: 1, n: 0 };
                if (callBack) return callBack(err, result);
                err ? reject(err) : resolve(result);
            }]));
    });
}

function listAllCollections(dbName, callBack) {
    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        db.collections(function(err, result) {
            if (callBack) return callBack(err, result);
            err ? reject(err) : resolve(result);
        });
    });
}

function close(dbName, delay) {
    var callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    return new Promise(function (resolve, reject) {
        var db = getDBByName(dbName);
        if (!db) {
            var err = createNotOpenErr(dbName);
            if (callBack) return callBack(err);
            return reject(err);
        }

        delay = delay >= 0 ? delay : 500;

        var isDefaultDB = defaultDB == db;
        db.close(function(err) {
            setTimeout(function() {
                if (err) {
                    console.error(err);
                } else {
                    delete dbMap[dbName];
                    if (isDefaultDB) defaultDB = undefined;
                    console.log("DBModel connection[" + dbName + "] has been closed.");
                }
                if (callBack) return callBack(err);
                err ? reject(err) : resolve();
            }, delay);
        });
    });
}

function closeAll(callBack) {
    return new Promise(function (resolve, reject) {
        var dbs = [];
        for (var dbName in dbMap) {
            dbs.push(dbName);
        }

        var closed = 0;
        dbs.forEach(function(dbName) {
            close(dbName, function(err) {
                err && console.error(`close db error: ${err}`);
                closed ++;
                if (closed >= dbs.length) {
                    if (callBack) return callBack();
                    resolve();
                }
            });
        });

        if (dbs.length <= 0) {
            process.nextTick(function() {
                if (callBack) return callBack();
                resolve();
            });
        }
    });
}

function isOpen(dbName) {
    return dbMap[dbName] ? true : false;
}

function createNotOpenErr(dbName) {
    return new Error("MongoDB connection[" + dbName + "] is not opened.");
}


exports.getDBByName = getDBByName;
exports.open = open;
exports.close = close;
exports.closeAll = closeAll;
exports.isOpen = isOpen;
exports.insert = insert;
exports.insertList = insertList;
exports.find = find;
exports.findOne = findOne;
exports.findPage = findPage;
exports.aggregate = aggregate;
exports.ensureIndex = ensureIndex;
exports.getIndexes = getIndexes;
exports.listAllCollections = listAllCollections;
exports.count = count;
exports.update = update;
exports.findOneAndUpdate = findOneAndUpdate;
exports.findOneAndDelete = findOneAndDelete;
exports.remove = remove;

