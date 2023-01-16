const { invoke } = window.__TAURI__.tauri;
let greetInputEl;
var data = {id: 132, text: "Gohar", children: []};
let json;

async function to_tree(path_search) {
  json = await invoke("toTree",  {path: path_search});
  try{
    data = JSON.parse(json);
  } catch(err) {
    console.log(err.message)
  }
  
}
// window.addEventListener("DOMContentLoaded", () => {
//   to_tree("/home/abdelaziz/Downloads").then(() => { 
//     $('#tree').jstree({
//   'core' : {
//   'data' : data
//   // {
//   //   'url' :
//   // }
//   }
//   })

//   // $('#tree').jstree().core.data = data;
//   // $('#tree').jstree("refresh");
//   // $('#tree').jstree(true).redraw(true);
//   });


window.addEventListener("DOMContentLoaded", () => {
    greetInputEl = document.querySelector("#input-path");
        document.querySelector('#input-path').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
              to_tree(greetInputEl.value).then(() => { 
              
                $('#tree').jstree({
                'core' : {
                'data' : data
                // {
                //     
                //   }
                }
              });
              
              // $('#tree').jstree();
              // $('#tree').jstree.core.data = data;
              $('#tree').jstree(true).refresh();
              // $('#tree').jstree(true).redraw(true);
            });
              
            }
        });
});



