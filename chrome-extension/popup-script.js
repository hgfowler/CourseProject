var saveContextForm = document.getElementById("save-context");
var searchRecipesForm = document.getElementById("search-recipes");
var getAllRecipes = document.getElementById("get-all-recipes");
var resultsTable = document.getElementById("results");
var getAll = false;

saveContextForm.addEventListener('submit', (event) => {
    event.preventDefault();
    //   var data = new FormData(saveContextForm);
    var url = document.getElementById("recipe-url").value;
    var list = document.getElementById("ingredients-list").value;
    console.log("url: " + url);
    console.log("list: " + list);

    if(url && list) {
        console.log("sending to DB");
        chrome.runtime.sendMessage({
            message: 'insert',
            payload: [{
                "link": url,
                "ingredients": list
            }]
        });
    } else {
        // show error
    }

});

searchRecipesForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Getting recipe matches from DB");
    getAll = false;
    while(resultsTable.rows.length > 1) {
        resultsTable.deleteRow(1);
    }

    chrome.runtime.sendMessage({
        message: 'getall'
    });
});

getAllRecipes.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log("Getting all recipes from DB");
    getAll = true;
    while(resultsTable.rows.length > 1) {
        resultsTable.deleteRow(1);
    }

    chrome.runtime.sendMessage({
        message: 'getall'
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("onMessage.addListener()");
    console.log(request.message);
    if(request.message === "insert_success") {
        if(request.payload) {

        }
    } else if(request.message === "get_all_success") {
        if(request.payload) {
            console.log(request.payload);
            if (getAll) {
                populate_table(request.payload);
            } else {
                var queryString = document.getElementById("ingredients-query").value;
                find_best_matches(queryString, request.payload);
            }
        }
    } else if(request.message === "delete_success") {
        if(request.payload) {
            console.log(request.payload);
        }
    }
});

function listToArray(list) {
    if(list.includes(",")) {
        return list.trim().split(",");
    } else {
        return list.trim().split(" ");
    }
}

function getMatches(queryString, results) {
    console.log("getMatches()");
    var queryArray = listToArray(queryString);

    // loop in reverse so removing records doesn't mess up the index
    for (let i = results.length-1; i >= 0; i--) {
        var list = results[i].ingredients
        var listArray = listToArray(list);
        const intersection = queryArray.filter(element => listArray.includes(element));

        if(intersection.length == 0) {
            // if there are no matching ingredients remove the recipe
            results.splice(i, 1);
        } else {
            results[i]["match_count"] = intersection.length;
            // how many ingredients are in the recipe that aren't in the query
            results[i]["non_match_count"] = listArray.length - intersection.length;
        }
    }
    return results;
}

function find_best_matches(queryString, results) {
    console.log("find_best_matches");
    var temp = queryString;
    console.log(temp);

    var resultsArray = getMatches(queryString, results);
    console.log(resultsArray);

    resultsArray.sort(function(a,b) {
        return a.non_match_count - b.non_match_count;
    });
    console.log(resultsArray);

    populate_table(resultsArray);
}

function populate_table(results) {
    console.log("populate_table");

    for (let i = 0; i < results.length; i++) {
        let row = resultsTable.insertRow();
        let url = row.insertCell(0);
        url.innerHTML = results[i].link;
        let ingredients = row.insertCell(1);
        ingredients.innerHTML = results[i].ingredients;
    }
    resultsTable.style.display = "inline";
}