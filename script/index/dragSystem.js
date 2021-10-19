function setup() {
    let documentList = document.getElementById('itemListContainer');

    let options = {
        handle: '.dragZone',
        animation: 150,
        forceFallback: true,
        dragClass: "sortable-drag",
    };
    Sortable.create(documentList, options);

}

setup();
