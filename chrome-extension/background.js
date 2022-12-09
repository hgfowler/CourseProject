chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("addListeners()");

    if(request.message === "insert") {
        let insert_request = insert_records(request.payload);
        insert_request.then(res => {
            chrome.runtime.sendMessage({
                message: 'insert_success',
                payload: res
            });
        });
    } else if(request.message === "getall") {
        let get_request = get_all_records();
        get_request.then(res => {
            chrome.runtime.sendMessage({
                message: 'get_all_success',
                payload: res
            });
        });
    } else if(request.message === "get") {
        let get_request = get_record(request.payload);
        get_request.then(res => {
            chrome.runtime.sendMessage({
                message: 'get_success',
                payload: res
            });
        });
    } else if(request.message === "delete") {
        let delete_request = delete_database();
        delete_request.then(res => {
            chrome.runtime.sendMessage({
                message: 'delete_success',
                payload: res
            });
        });
    }
});

let db = null;

function create_database() {
    console.log("create_database()");
    var request = window.indexedDB.open('RecipeDB');

    request.onerror = function (event) {
        console.log("Problem opening DB.");
    }

    request.onupgradeneeded = function (event) {
        db = event.target.result;

        let objectStore = db.createObjectStore('recipes', {
            keyPath: 'link'
        });

        objectStore.transaction.oncomplete = function (event) {
            console.log("ObjectStore Created.");
        }
    }

    request.onsuccess = function (event) {
        db = event.target.result;
        console.log("DB OPENED.");
        //insert_records(recipes_example);

        db.onerror = function (event) {
            console.log("FAILED TO OPEN DB.")
        }
    }
}

function delete_database() {
    console.log("delete_database()");
    var request = window.indexedDB.deleteDatabases('RecipeDB');

    request.onerror = function (event) {
        console.log("Problem deleting DB.");
    }

    request.onsuccess = function (event) {
        console.log("DB DELETED.");

        db.onerror = function (event) {
            console.log("FAILED TO DELETE DB.")
        }
    }
}

function insert_records(records) {
    console.log("insert_records()");
    if (db) {
        // can be added to an array of tables
        var insert_transaction = db.transaction("recipes", "readwrite");
        var objectStore = insert_transaction.objectStore("recipes");

        return new Promise((resolve, reject) => {
            insert_transaction.oncomplete = function () {
                console.log("ALL INSERT TRANSACTIONS COMPLETE.");
                resolve(true);
            }

            insert_transaction.onerror = function () {
                console.log("PROBLEM INSERTING RECORDS.")
                resolve(false);
            }

            records.forEach(recipe => {
                let request = objectStore.add(recipe);

                request.onsuccess = function () {
                    console.log("Added: ", recipe);
                }
            });
        });
    }
}

function get_all_records() {
    console.log("get_all_records()");
    if (db) {
        var get_transaction = db.transaction("recipes", "readonly");
        var objectStore = get_transaction.objectStore("recipes");

        return new Promise((resolve, reject) => {
            get_transaction.oncomplete = function () {
                console.log("ALL GET ALL TRANSACTIONS COMPLETE.");
            }

            get_transaction.onerror = function () {
                console.log("PROBLEM GETTING ALL RECORDS.")
            }

            let request = objectStore.getAll();

            request.onsuccess = function (event) {
                resolve(event.target.result);
            }
        });
    }
}

function get_record(recipe) {
    console.log("get_record()");
    if (db) {
        var get_transaction = db.transaction("recipes", "readonly");
        var objectStore = get_transaction.objectStore("recipes");

        return new Promise((resolve, reject) => {
            get_transaction.oncomplete = function () {
                console.log("ALL GET TRANSACTIONS COMPLETE.");
            }

            get_transaction.onerror = function () {
                console.log("PROBLEM GETTING RECORDS.")
            }

            let request = objectStore.get(recipe);

            request.onsuccess = function (event) {
                resolve(event.target.result);
            }
        });
    }
}

create_database();