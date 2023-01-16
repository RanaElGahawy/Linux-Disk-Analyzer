// const { invoke } = window.__TAURI__.tauri;
// var data = {name: "hello", description: "", value: 1, children: []};
// let json;

// async function to_pie_chart() {
//   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//   json = await invoke("toPieChart");
  
//   try{
//     data = JSON.parse(json);
//   } catch(err) {
//     console.log(err.message)
//   }
  
// }

// window.addEventListener("DOMContentLoaded", () => {
//     to_pie_chart().then(() => console.log(data));
// });

// // function descFn(charactersCount, linesCount) {
// //   return `${charactersCount} characters, ${linesCount} lines of code.`
// // }

// // var data = {
// //   name: "",
// //   description: "djnskds",
// //   value: 48333,
// //   children: [
// //     {
// //       name: "docs",
// //       description: "ksdmdkls",
// //       value: 3423,
// //       children: [
// //         {
// //           name: "conf-py",
// //           description: "skdmla/sd",
// //           value: 232,
// //           children: [],
// //         },
// //         {
// //           name: "flaskdocext-py",
// //           description: "dknsld",
// //           value: 32,
// //           children: [],
// //         }
// //       ],
// //     },
// //     {
// //       name: "examples",
// //       description: "sdkmaslkdnm",
// //       value: 641,
// //       children: [],
// //     }
// //   ],
// // }
