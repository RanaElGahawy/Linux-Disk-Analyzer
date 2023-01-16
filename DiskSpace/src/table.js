const { invoke } = window.__TAURI__.tauri;
let greetInputEl;
var tabledata;
let json;

async function to_table(path_search) {
    json = await invoke("table", {path: path_search}); 
    try{
        tabledata = JSON.parse(json);
    } catch(err) {
        console.log(err.message)
    }
}


window.addEventListener("DOMContentLoaded", () => {
    to_table("/home/abdelaziz").then(() =>{
        var table = new Tabulator("#table", {
            data:tabledata,           //load row data from array
            layout:"fitColumns",      //fit columns to width of table
            responsiveLayout:"hide",  //hide columns that dont fit on the table
            addRowPos:"top",          //when adding a new row, add it to the top of the table
            history:true,             //allow undo and redo actions on the table
            pagination:"local",       //paginate the data
            paginationSize:7,         //allow 7 rows per page of data
            paginationCounter:"rows", //display count of paginated rows in footer
            movableColumns:true,      //allow column order to be changed
            initialSort:[             //set the initial sort order of the data
                {column:"name", dir:"asc"},
            ],
            columnDefaults:{
                tooltip:true,         //show tool tips on cells
            },
            columns:[                 //define the table columns
                {title: "Name", field: "name", editor:"input", headerFilter: "input"},
                {title: "Disk Size", field:"disk_size", hozAlign:"left", editor:true, headerFilter: "input"},
                {title: "IsDirectory", field:"is_directory", editor:"select", editorParams:{values:["male", "female"]},headerFilter: "input"},
                {title: "Modified Time", field:"modified_time", hozAlign:"center", editor:true, headerFilter: "input"},
                {title: "Modified Data", field:"modified_date", editor:"input", headerFilter: "input"},
                {title: "Created Time", field:"created_time", sorter:"date", hozAlign:"center", headerFilter: "input"},
                {title: "Created Date", field:"created_date",   hozAlign:"center", sorter:"boolean", editor:true, headerFilter: "input"},
                {title: "Accessed Time", field:"accessed_time", sorter:"time", hozAlign:"center", headerFilter: "input"},
                {title: "Accessed Date", field:"accessed_date",  hozAlign:"center", sorter:"date", editor:true, headerFilter: "input"},
            ],
        });

    });

});
console.log(tabledata);


window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#input-path");
    document.querySelector('#input-path').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
        to_table(greetInputEl.value).then(() =>{
            var table = new Tabulator("#table", {
                data:tabledata,           //load row data from array
                layout:"fitColumns",      //fit columns to width of table
                responsiveLayout:"hide",  //hide columns that dont fit on the table
                addRowPos:"top",          //when adding a new row, add it to the top of the table
                history:true,             //allow undo and redo actions on the table
                pagination:"local",       //paginate the data
                paginationSize:7,         //allow 7 rows per page of data
                paginationCounter:"rows", //display count of paginated rows in footer
                movableColumns:true,      //allow column order to be changed
                initialSort:[             //set the initial sort order of the data
                    {column:"name", dir:"asc"},
                ],
                columnDefaults:{
                    tooltip:true,         //show tool tips on cells
                },
                columns:[                 //define the table columns
                    {title: "Name", field: "name", editor:"input", headerFilter: "input"},
                    {title: "Disk Size", field:"disk_size", hozAlign:"left", editor:true, headerFilter: "input"},
                    {title: "IsDirectory", field:"is_directory", editor:"select", editorParams:{values:["male", "female"]},headerFilter: "input"},
                    {title: "Modified Time", field:"modified_time", hozAlign:"center", editor:true, headerFilter: "input"},
                    {title: "Modified Data", field:"modified_date", editor:"input", headerFilter: "input"},
                    {title: "Created Time", field:"created_time", sorter:"date", hozAlign:"center", headerFilter: "input"},
                    {title: "Created Date", field:"created_date",   hozAlign:"center", sorter:"boolean", editor:true, headerFilter: "input"},
                    {title: "Accessed Time", field:"accessed_time", sorter:"time", hozAlign:"center", headerFilter: "input"},
                    {title: "Accessed Date", field:"accessed_date",  hozAlign:"center", sorter:"date", editor:true, headerFilter: "input"},
                ],
            });
    
        });
    }
    });
});



