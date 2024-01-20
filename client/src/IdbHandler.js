export default class IdbHandler {
    /** 
     * constructor creates the DataBase if not availaible and then creates 
     * ObjectStores which is like tables or objectStoreCollections
     * @param {string} db_name
     * @param {object} schema - schema of the data base 
     * @param {bool} generateKey
    */
    constructor({
        db_name, schema, version = 1, generateKey, keyPath,
        onOpen = function () { }, onVersionChange = function () { }
    }) {
        this.defaultStuff();
        this.db_name = db_name;
        this.version = version;
        this.schema = schema;
        this.objectStoreCollections = Object.keys(this.schema);
        this.DEFAULT_KEY = "default_"; // {type_: dataType, default_: defaultValue}
        this.TYPE_KEY = "type_"
        this.LOCALE_STORAGE_DEFAULT_KEY = "IdbHandler_" + this.db_name;
        this.objectStoreDefaultProperty = localStorage[this.LOCALE_STORAGE_DEFAULT_KEY] || {};
        this.errorHandler();
        if (typeof this.objectStoreDefaultProperty === "string") this.objectStoreDefaultProperty =
            JSON.parse(this.objectStoreDefaultProperty)
        var request = window.indexedDB.open(this.db_name, this.version);
        request.onupgradeneeded = (event) => {
            // console.log(this.db)
            this.db = event.target.result;
            var objStore = null;
            if (this.objectStoreCollections)
                this.objectStoreCollections.map(objectStoreCollection => {
                    if (!this.db.objectStoreNames.contains(objectStoreCollection)) {
                        if (generateKey)
                            objStore = this.db.createObjectStore(objectStoreCollection,
                                { keyPath: "_id", autoIncrement: true });
                        else {
                            if (!keyPath) { throw new Error("keyPath parameter is need to be set if generateKey is false") }
                            objStore = this.db.createObjectStore(objectStoreCollection, { keyPath, autoIncrement: false });
                        }
                    }
                    else { objStore = event.target.transaction.objectStore(objectStoreCollection) }
                    var indexes = objStore.indexNames;
                    for (let i in Object.values(indexes)) {
                        if (!Object.keys(this.schema[objectStoreCollection]).includes(indexes[i])) {
                            console.log(indexes)
                            objStore.deleteIndex(indexes[i]);
                        }
                    }
                    for (let key in this.schema[objectStoreCollection]) {
                        if (this.typeChecker(this.schema[objectStoreCollection][key]) === "Object" &&
                            this.schema[objectStoreCollection][key].hasOwnProperty(this.DEFAULT_KEY)) {
                            this.objectStoreDefaultProperty[objectStoreCollection] = {};
                            this.objectStoreDefaultProperty[objectStoreCollection][key] = {}
                            this.objectStoreDefaultProperty[objectStoreCollection][key][this.TYPE_KEY] =
                                this.schema[objectStoreCollection][key][this.TYPE_KEY].name;
                            this.objectStoreDefaultProperty[objectStoreCollection][key][this.DEFAULT_KEY] =
                                this.schema[objectStoreCollection][key][this.DEFAULT_KEY];
                            localStorage[this.LOCALE_STORAGE_DEFAULT_KEY] =
                                JSON.stringify(this.objectStoreDefaultProperty)
                            continue;
                        }
                        if (Object.values(indexes).includes(key)) continue
                        objStore.createIndex(key, key);
                    }
                });
            var currentObjectStores = Object.values(this.db.objectStoreNames)
            for (let k in currentObjectStores) {
                if (!this.objectStoreCollections.includes(currentObjectStores[k])) {
                    this.db.deleteObjectStore(currentObjectStores[k]);
                }

            }
        }
        request.onsuccess = (event) => {
            this.db = event.target.result;
            onOpen(this);

            // console.log(this.db);

            this.db.onversionchange = () => {
                this.db.close();
                onVersionChange();
                // let confirm = window.confirm("Database is outdated, please let us reload the page.")
                // if(confirm){window.location.reload()}
            };
            // console.log("Succeeded!")
        }
        request.onerror = function (event) {
            throw new Error(request.error.message)
        }
    }
    static IDB_RANGE_BOUND = "bound";
    errorHandler() {
        if (!this.schema || this.typeChecker(this.schema) !== "Object") throw new Error("schema is not set or it's not the right format!")
    }
    defaultStuff() { /* checking if indexedDB is supported on the browser */
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        if (!window.indexedDB) {
            console.warn(
                "Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available."
            );
        }
    }
    typeChecker(variable) {
        if (typeof (variable) === "object" && Array.isArray(variable)) {
            return "Array";
        }
        else if (typeof (variable) === "object" && !Array.isArray(variable)) {
            return "Object";
        }
        else {
            let t = typeof (variable)
            return capitalize(t);
        }
    }
    insertDefaultValue(objStoreName, obj) {
        if (!this.objectStoreDefaultProperty.hasOwnProperty(objStoreName)) return obj
        for (let key in this.objectStoreDefaultProperty[objStoreName]) {
            if (obj.hasOwnProperty(key)) continue;
            this.objectStoreDefaultProperty[objStoreName][key][this.TYPE_KEY] === Array ?
                obj[key] = eval('(' + this.objectStoreDefaultProperty[objStoreName][key][this.TYPE_KEY] + ')')(
                    ...this.objectStoreDefaultProperty[objStoreName][key][this.DEFAULT_KEY]
                ) :
                obj[key] = eval('(' + this.objectStoreDefaultProperty[objStoreName][key][this.TYPE_KEY] + ')')(
                    this.objectStoreDefaultProperty[objStoreName][key][this.DEFAULT_KEY]
                )
        }
        return obj;
    }
    objectStore(objStoreName) {
        if (!this.db.objectStoreNames.contains(objStoreName)) {
            throw new Error(objStoreName + " is not a valid objectStore name, please check your schema!")
        }
        let that = this;
        function insertOne(item, callback) {
            return new Promise((res, rej) => {
                if (that.typeChecker(item) !== "Object") throw new Error("you must pass an argument of type object")
                let transaction = that.db.transaction(objStoreName, "readwrite")
                let store = transaction.objectStore(objStoreName)
                transaction.oncomplete = function (event) {
                    // console.log("COMPLETED")
                }

                for (let key in item) {
                    if (!that.schema[objStoreName].hasOwnProperty(key) || that.typeChecker(item[key]) !== that.schema[objStoreName][key].name) {
                        transaction.abort();
                        throw new Error(`type of ${key} property does not match the schema!!!`)
                    }
                    that.schema[objStoreName][key] === Array ?
                        item[key] = that.schema[objStoreName][key](...item[key]) :
                        item[key] = that.schema[objStoreName][key](item[key]);

                }
                item = that.insertDefaultValue(objStoreName, item);
                for (let [k_schema, v_schema] of Object.entries(that.schema[objStoreName])) {
                    if (!item.hasOwnProperty(k_schema)) {
                        item[k_schema] = v_schema();
                    }
                }
                let request = store.add(item);
                request.onsuccess = function () {
                    if (callback) {
                        const save = (callback) => {
                            item = { _id: request.result, ...item }
                            var request_ = store.put({ _id: request.result, ...item });
                            request_.onsuccess = () => { if (callback) callback(undefined, item) }
                            request_.onerror = () => { if (callback) callback(request_.error, undefined) }
                        }
                        callback(undefined, item, save);
                        res({
                            data: item,
                            save
                        })
                    }
                }
                request.onerror = function (event) {
                    if (callback) callback(request.error, undefined)
                    rej(request.error);
                }
            })
        }
        function insertMany(items, callback) {
            return new Promise((res, rej) => {
                let transaction = that.db.transaction(objStoreName, "readwrite")
                let store = transaction.objectStore(objStoreName)
                transaction.oncomplete = function () { } // On All Transactions complete
                if (!Array.isArray(items)) items = [items];
                items.map(item => {
                    for (let key in item) {
                        if (!that.schema[objStoreName].hasOwnProperty(key) || that.typeChecker(item[key]) !== that.schema[objStoreName][key].name) {
                            transaction.abort();
                            rej(`type of ${key} property does not match the schema!!!`)
                            throw new Error(`type of ${key} property does not match the schema!!!`)
                        }
                        that.schema[objStoreName][key] === Array ?
                            item[key] = that.schema[objStoreName][key](...item[key]) :
                            item[key] = that.schema[objStoreName][key](item[key])
                        item = that.insertDefaultValue(objStoreName, item) || item;
                        for (let [k_schema, v_schema] of Object.entries(that.schema[objStoreName])) {
                            if (!item.hasOwnProperty(k_schema)) {
                                item[k_schema] = v_schema();
                            }
                        }
                    }
                    let request = store.add(item);
                    console.log("items: ", items)
                    console.log("request.add item: ", item)
                    request.onsuccess = function () {
                        if (callback) {
                            const save = (callback) => {
                                let request_;
                                for (let i in item) {
                                    // console.log(`request.put: item ${item}, i:${i}`)
                                    request_ = store.put(item);
                                    request_.onsuccess = () => {
                                        if (callback) callback(undefined, item[i])
                                    }
                                    request_.onerror = () => {
                                        if (callback) callback(request_.error, undefined)
                                        transaction.abort();
                                    }
                                }
                            }
                            callback(undefined, items, save)
                            res({
                                item: items,
                                save
                            })
                        }
                    }
                    request.onerror = function () {
                        if (callback) callback(request.error || "error")
                        rej(request.error || 'error');
                    }
                }
                )
            })
        }
        /**
         * 
         * @param {Object} item 
         * @param {Function} callback the callback to be called
         * @returns {Promise<Object>}  
         */
        function findOne(item, callback) {
            let transaction = that.db.transaction(objStoreName, "readonly");
            let store = transaction.objectStore(objStoreName);
            let index = {};
            let keys = Object.keys(item);
            let values = Object.values(item);
            if (!keys.length <= 0) {
                let target;
                let request = store.index(keys[0]).get(values[0])
                request.onsuccess = (event) => {
                    target = event.target.result;
                    for (let i = 1; i < keys.length; i++) {
                        let break_ = false;
                        for (let key in target) {
                            let value = target[key];
                            if (key === keys[i]) {
                                if (!(value === values[i])) {
                                    target = undefined;
                                    break_ = true;
                                    break
                                }
                            }
                        }
                        if (break_) break
                    }
                    const save = (callback) => {
                        var _request = that.db.transaction(objStoreName, "readwrite").objectStore(objStoreName)
                            .put(target);
                        _request.onsuccess = () => {
                            if (callback)
                                callback(undefined, target);
                        }
                        _request.onerror = () => {
                            if (callback)
                                callback(_request.error, undefined)
                        }
                    }
                    callback(undefined, target, save)
                }
            }
        }
        function findMany(items, { useCursor = false }, callback) {
            let transaction = that.db.transaction(objStoreName, "readonly");
            let store = transaction.objectStore(objStoreName);
            // let index = {};
            if (!items) return
            let keys = Object.keys(items);
            let values = Object.values(items);
            if (!keys.length <= 0) {
                if (useCursor) {
                    const request = store.index(keys[0]).openCursor(values[0]);
                    request.onsuccess = (e) => {
                        const cursor = e.target.result;
                        if (cursor) {
                            for (let e in keys) {

                            }
                        }
                    }
                }
                else if (!useCursor) {
                    let target;
                    let request = store.index(keys[0]).getAll(values[0]) // get all records that has index[0] of value[0]
                    request.onsuccess = (event) => {
                        target = event.target.result;
                        for (let i = 1; i < keys.length; i++) {
                            // loop throuch each element in target array, (in this case each element is an object)
                            // if a key in an element does not match with the specified value (values[i])
                            // then we remove it from target list then move on to the next element
                            for (let a = 0; a < target.length; a++) {
                                let break_ = false;
                                let element = target[a] || null
                                for (let key in element) {
                                    let value = element[key];
                                    if (key === keys[i]) {
                                        if (!(value === values[i])) {
                                            target.splice(a, 1) // Mistake ?!
                                            break_ = true;
                                            break
                                        }
                                    }
                                }
                                if (break_) break
                            }
                        }
                        if (callback) {
                            const save = (callback) => {
                                for (let i in target) {
                                    let request_ = store.put(target)
                                    request_.onsuccess = () => {
                                        if (callback) callback(undefined, target)
                                    }
                                    request_.onerror = () => {
                                        if (callback) callback(request_.error, undefined)
                                        transaction.abort();
                                    }

                                }
                            }
                            callback(undefined, target, save)
                        }
                    }
                }
            }
        }
        function findById(id, callback) {
            if (callback) if (typeof callback != "function") { throw new Error("callback must be a function") }
            var transaction = that.db.transaction(objStoreName);
            var store = transaction.objectStore(objStoreName);
            transaction.oncomplete = () => {
                // console.log("COMPLETED");
            }
            let request = store.get(id);
            request.onsuccess = (event) => {
                if (callback) {
                    const save = (callback) => {
                        var _request = store.put(event.target.result);
                        _request.onsuccess = (e) => {
                            if (callback)
                                callback(undefined, e.target.result/*target*/);
                        }
                        _request.onerror = (e) => {
                            if (callback)
                                callback("error", undefined)
                        }
                    }
                    callback(undefined, event.target.result, save)
                }
            }
            request.onerror = (event) => {
                if (callback)
                    callback("error");
            }
        }
        /**
         * 
         * @param {string} key - key of the schema you are search for.
         * @param {string} filter_string  -
         * @param {Array} filter_values -
         * @param {Function} callback -
         */
        function findByFilter(key, filter_string, filter_values, callback) {
            if (!filter_string && callback) callback(null)
            const objectStore = that.db.transaction(objStoreName).objectStore(objStoreName);
            const index = objectStore.index(key);

            if (filter_string === IdbHandler.IDB_RANGE_BOUND) {
                try {
                    let filter = IDBKeyRange.bound(...filter_values, false, true);
                    const request = index.getAll(filter);
                    request.onsuccess = (e) => {
                        callback(null, e.target.result)
                    }
                }
                catch (e) {
                    throw new Error("Error has been caught, something wrong with filter_values: " + e.message)
                }

            }
        }
        /**
         * Updates one record/item on the IndexedDB.
         * @type {Function}
         * @param {Object} item 
         * @param {Function} callback @param 
         * @param {bool} addIfnotFound true if you want to add the item if it wasn't in the database, otherwise set it to false
         * @returns {void}
         */
        function updateOne(item, callback, addIfnotFound = false) {
            let transaction = that.db.transaction(objStoreName);
            let store = transaction.objectStore(objStoreName);
            let keys = Object.keys(item); // keys of the item
            let values = Object.values(item); // values of the item
            if (keys.length > 0) {
                let target;
                let index = store.index(keys[0]);
                let request = index.get(values[0]);
                request.onsuccess = (event) => {
                    target = event.target.result;
                    if (!target && callback) {
                        if (addIfnotFound) {
                            request = store.add(item); // add item to the store
                            request.onsuccess = () => { }
                            request.onerror = () => {
                                if (callback) callback(request.error);
                            }
                        }
                        else callback("Not found");
                        return;
                    }
                    for (let i = 1; i < keys.length; i++) {
                        let break_ = false;
                        for (let key in target) {
                            let value = target[key];
                            if (key === keys[i]) {
                                if (!(value === values[i])) {
                                    target = undefined;
                                    break_ = true;
                                    break
                                }
                            }
                        }
                        if (break_) break
                    }
                    const save = (callback) => {
                        var _request = that.db.transaction(objStoreName, "readwrite").objectStore(objStoreName)
                            .put(target);
                        _request.onsuccess = () => {
                            if (callback)
                                callback(undefined, target);
                        }
                        _request.onerror = () => {
                            if (callback)
                                callback(_request.error, undefined)
                        }
                    }
                    callback(undefined, target, save)
                }
            }
        }
        /**
         * Updates one records/items on the IndexedDB.
         * @type {Function}
         * @param {Array<Object>} items 
         * @param {Function} callback @param 
         * @param {bool} addIfnotFound true if you want to add the item if it wasn't in the database, otherwise set it to false
         * @returns {void}
         */
        function updateMany(items, callback, addIfnotFound = false) {
            let transaction = addIfnotFound ? that.db.transaction(objStoreName, "readwrite") : that.db.transaction(objStoreName);
            transaction.onerror = (e) => {
                e.preventDefault();
            }
            let store = transaction.objectStore(objStoreName);
            for (let item of items) {
                let keys = Object.keys(item); // keys of the item
                let values = Object.values(item); // values of the item
                if (keys.length > 0) {
                    let target;
                    let index = store.index(keys[0]);
                    let request = index.get(values[0])
                    request.onsuccess = (event) => {
                        target = event.target.result;
                        if (!target && callback) {

                            if (addIfnotFound) {
                                request = store.add(item); // add item to the store
                                request.onsuccess = () => {
                                    if (callback) callback(null, item);
                                }
                                request.onerror = () => {
                                    if (callback) callback(request.error);
                                }
                            }
                            else callback("Error: Not found");
                            return;
                        }
                        for (let i = 1; i < keys.length; i++) {
                            let break_ = false;
                            for (let key in target) {
                                /*
                                text in { text : "111"} 
                                */
                                let value = target[key];
                                if (key === keys[i]) {
                                    if (!(value === values[i])) {
                                        target = undefined;
                                        break_ = true;
                                        break
                                    }
                                }
                            }
                            if (break_) break
                        }

                        const save = (callback) => {
                            var _request = that.db.transaction(objStoreName, "readwrite").objectStore(objStoreName)
                                .put(target);
                            _request.onsuccess = () => {
                                if (callback)
                                    callback(undefined, target);
                            }
                            _request.onerror = () => {
                                if (callback)
                                    callback(_request.error, undefined)
                            }
                        }
                        if (target) {
                            callback(null, target, save)
                        }
                        // here we checking if target is not been found in db and if addIfnotFound is true
                        // then we're gonna add it to the database
                        else if (!target && addIfnotFound) {
                            request = store.add(item);
                            request.onsuccess = () => {
                                callback?.call(null, null, item);
                            }
                        }

                    }
                    request.onerror = () => {
                        console.log(request.error);
                    }
                }
            }
        }
        function deleteMany(items, callback) {
            if (!items) throw new Error("items are not set");
            const transaction = that.db.transaction(objStoreName, "readwrite");
            const objectStore = transaction.objectStore(objStoreName);
            for (let i = 0; i < items.length; i++) {
                // let target;
                // for (let key in items[i]) {
                //     const index = objectStore.index(key);
                //     const request = index.get(i);
                //     request.onsuccess = (e) => {

                //     }
                // }
                const request = objectStore.delete(items[i].order);
                request.onsuccess = () => {
                    if (callback) callback(null)
                }
            }

        }
        function length(callback) {
            const objectStore = that.db.transaction(objStoreName, "readonly").objectStore(objStoreName);
            const request = objectStore.count();
            request.onsuccess = () => {
                callback(null, request.result);
            }
            request.onerror = () => {
                callback(request.error);
            }

        }
        return { insertOne, insertMany, updateOne, updateMany, findOne, findMany, findById, findByFilter, deleteMany, length }
    }
    deleteDB() {
        var request = window.indexedDB.deleteDatabase(this.db_name)
        request.onsuccess = () => {
            delete localStorage[this.LOCALE_STORAGE_DEFAULT_KEY]
        }
        request.onerror = function () {
            throw new Error(request.error)
        }
    }
}
const capitalize = function (str) {
    // if(typeof String != "string") throw new Error("argument given is not a string");
    let arr = str.split(" ");
    let arr2 = [];
    for (let i = 0; i < arr.length; i++) {
        arr2.push(arr[i].charAt(0).toUpperCase() + arr[i].slice(1).toLowerCase())
    }
    return arr2.join(" ");
};
