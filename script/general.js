let addedItem = {};

let abortEvent = new AbortController();

let alreadyAvailable;

const inputEventCustom = new InputEvent('editData');

let availableItem = [];

Object.size = function(obj) {
    let size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};



