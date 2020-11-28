"use strict"

import * as Pmgr from './pmgrapi.js'


/**
 * Librería de cliente para interaccionar con el servidor de PrinterManager (prmgr).
 * Prácticas de IU 2020-21
 *
 * Para las prácticas de IU, pon aquí (o en otros js externos incluidos desde tus .htmls) el código
 * necesario para añadir comportamientos a tus páginas. Recomiendo separar el fichero en 2 partes:
 * - funciones que pueden generar cachos de contenido a partir del modelo, pero que no
 *   tienen referencias directas a la página
 * - un bloque rodeado de $(() => { y } donde está el código de pegamento que asocia comportamientos
 *   de la parte anterior con elementos de la página.
 *
 * Fuera de las prácticas, lee la licencia: dice lo que puedes hacer con él, que es esencialmente
 * lo que quieras siempre y cuando no digas que lo escribiste tú o me persigas por haberlo escrito mal.
 */

//
// PARTE 1:
// Código de comportamiento, que sólo se llama desde consola (para probarlo) o desde la parte 2,
// en respuesta a algún evento.
//


function createPrinterItem(printer) {
  const rid = 'x_' + Math.floor(Math.random()*1000000);
  const hid = 'h_'+rid;
  const cid = 'c_'+rid;

  // usar [] en las claves las evalua (ver https://stackoverflow.com/a/19837961/15472)
  const PS = Pmgr.PrinterStates;
  let pillClass = { [PS.PAUSED] : "badge-secondary",
                    [PS.PRINTING] : "badge-success",
                    [PS.NO_INK] : "badge-danger",
                    [PS.NO_PAPER] : "badge-danger" };

  let allJobs = printer.queue.map((id) =>
     `<span class="badge badge-secondary">${id}</span>`
  ).join(" ");

  return `
    <div class="card">
    <div class="card-header" id="${hid}">
        <h2 class="mb-0">
            <button class="btn btn-link" type="button"
                data-toggle="collapse" data-target="#${cid}",
                aria-expanded="false" aria-controls="#${rid}">
            <b class="pcard">${printer.alias}</b>
            <span class="badge badge-pill ${pillClass[printer.status]}">${printer.status}</span>
            <div class="small">
                ${printer.model} at ${printer.location}
            </div>
            </button>
        </h2>
    </div>

    <div id="${cid}" class="collapse hide" aria-labelledby="${hid}
        data-parent="#accordionExample">
        <div class="card-body pcard">
            ${allJobs}
    </div>
    </div>
    </div>
 `;
}
//$("#tablePrinters").click(function(){
//  $(this).addClass('selected').siblings().removeClass('selected');     
//});

//cuando se pulsa myBtn se llama a myFunction
//document.getElementById("myBtn").onclick = function() {myFunction()};



//--------------------------------GENERA TABLA PRINTERS------------------------------------------
  let tablaPrint = document.getElementById('tablePrinters'), 
selected = tablaPrint.getElementsByClassName('selected');

tablaPrint.onclick = highlight;
function highlight(e) {
  if (selected[0]) selected[0].className = '';
  e.target.parentNode.className = 'selected';

  document.getElementById('rmPrinterButton').disabled = false;
  document.getElementById('editPrinterButton').disabled = false;
  document.getElementById('printPrinterButton').disabled= false;
  document.getElementById('cancelPrinterButton').disabled= false;
  
  let text= selected[0].innerText;
  let arrayAux= text.split("\t");
  document.getElementById('nombreEd').innerHTML = arrayAux[1];  //Igual vale para poner los nombres
  document.getElementById('nombreEl').innerHTML = arrayAux[1];  //Igual vale para poner los nombres
  document.getElementById('nombreCa').innerHTML = arrayAux[1];  //Igual vale para poner los nombres
  
}

$("#confirmarElPr").click(function(){
  let text= selected[0].innerText;
  let arrayAux= text.split("\t");
  Pmgr.rmPrinter(arrayAux[0]);
  generar_tabla();
});

function generar_tabla(){

 let myTable= "<table class=table table-bordered mb-0 table-hover display>";

 myTable+= " <thead><tr>";
 myTable+= "<th headers=co-alias>ID</th>";
 myTable+= "<th headers=co-alias>Alias</th>";
 myTable+= "<th headers=co-modelo>Modelo</th>";
 myTable+= "<th headers=co-local>Localizacion</th>";
 myTable+= "<th headers=co-ip>IP</th>";
 myTable+= "<th headers=co-gr>Grupos</th>";
 myTable+= "<th headers=co-est>Estado</th></tr></thead>";
 myTable+= "<tbody>";

 for (let i = 0; i < Pmgr.globalState.printers.length ; i++) {
       myTable+="<tr><td>" + Pmgr.globalState.printers[i].id + "</td>";  
       myTable+="<td>" + Pmgr.globalState.printers[i].alias + "</td>";    
       myTable+="<td>" + Pmgr.globalState.printers[i].model + "</td>";  
       myTable+="<td>" + Pmgr.globalState.printers[i].location + "</td>";
       myTable+="<td>" + Pmgr.globalState.printers[i].ip + "</td>"; 
       myTable+="<td>" + Pmgr.globalState.printers[i].group + "</td>";
       myTable+="<td>" + Pmgr.globalState.printers[i].status + "</td>";    
       myTable+="</tr>";
 }
   
   myTable+="</tbody></table>";
   document.getElementById('tablePrinters').innerHTML = myTable;
}

//--------------------------------GENERA TABLA GRUPOS--------------------------------------------
let tablaGroup = document.getElementById('tableGroups'), 
selectedGroup = tablaGroup.getElementsByClassName('selected');

tablaGroup.onclick = highlightGroup;
function highlightGroup(e) {
  if (selectedGroup[0]) selectedGroup[0].className = '';
  e.target.parentNode.className = 'selected';

  document.getElementById('rmGroupButton').disabled = false;
  document.getElementById('editGroupButton').disabled = false;
  document.getElementById('printGroupButton').disabled= false;
  document.getElementById('cancelGroupButton').disabled= false;
  
  let text= selectedGroup[0].innerText;
  let arrayAux= text.split("\t");
  document.getElementById('nombreEdG').innerHTML = arrayAux[1];  //Igual vale para poner los nombres
  document.getElementById('nombreElG').innerHTML = arrayAux[1];  //Igual vale para poner los nombres
  document.getElementById('nombreCaG').innerHTML = arrayAux[1];  //Igual vale para poner los nombres
  
}

$("#confirmarElGr").click(function(){
  let text= selectedGroup[0].innerText;
  let arrayAux= text.split("\t");
  Pmgr.rmGroup(arrayAux[0]);
  generar_tabla_grupos();
});

function generar_tabla_grupos(){

 let myTable= "<table class=table table-bordered mb-0 table-hover display>";

 myTable+= " <thead><tr>";
 myTable+= "<th headers=co-alias>ID</th>";
 myTable+= "<th headers=co-alias>Nombre</th>";
 myTable+= "<th headers=co-est>Impresoras</th></tr></thead>";
 myTable+= "<tbody>";

 for (let i = 0; i < Pmgr.globalState.groups.length ; i++) {
       myTable+="<tr><td>" +Pmgr.globalState.groups[i].id + "</td>";  
       myTable+="<td>" + Pmgr.globalState.groups[i].name + "</td>";
       myTable+="<td>";
       for(let p=0; p<Pmgr.globalState.groups[i].printers.length; ++p ){
         myTable+=  Pmgr.globalState.printers[Pmgr.globalState.groups[i].printers[p]].alias ;
         myTable+= "--";
       }
       myTable+="</td></tr>";
 }

   myTable+="</tbody></table>";
   document.getElementById('tableGroups').innerHTML = myTable;
}


//--------------------------------GENERA TABLA JOBS------------------------------------------
let tablaJobs = document.getElementById('tableJobs'), 
selectedJobs = tablaJobs.getElementsByClassName('selected');

tablaJobs.onclick = highlightJobs;
function highlightJobs(e) {
  if (selectedJobs[0]) selectedJobs[0].className = '';
  e.target.parentNode.className = 'selected';

  document.getElementById('cancelJobsButton').disabled= false;
  
  let text= selectedJobs[0].innerText;
  let arrayAux= text.split("\t");
  document.getElementById('nombreCaJ').innerHTML = arrayAux[3];  //Igual vale para poner los nombres
  
}

$("#confirmarCaJo").click(function(){
  let text= selected[0].innerText;
  let arrayAux= text.split("\t");
  Pmgr.rmJob(arrayAux[0]);
  generar_tabla_jobs();
});

function generar_tabla_jobs(){
 let myTable= "<table class=table table-bordered mb-0 table-hover display>";

 myTable+= " <thead><tr>";
 myTable+= "<th headers=co-alias>ID</th>";
 myTable+= "<th headers=co-alias>Printer</th>";
 myTable+= "<th headers=co-modelo>Owner</th>";
 myTable+= "<th headers=co-est>FileName</th></tr></thead>";
 myTable+= "<tbody>";

 for (let i = 0; i < Pmgr.globalState.jobs.length ; i++) {
       myTable+="<tr><td>" +Pmgr.globalState.jobs[i].id + "</td>";  
       myTable+="<td>" + Pmgr.globalState.jobs[i].printer + "</td>";    
       myTable+="<td>" + Pmgr.globalState.jobs[i].owner + "</td>";
       myTable+="<td>" + Pmgr.globalState.jobs[i].fileName + "</td>";    
       myTable+="</tr>";
 }
   
   myTable+="</tbody></table>";
   document.getElementById('tableJobs').innerHTML = myTable;
}
// funcion para generar datos de ejemplo: impresoras, grupos, trabajos, ...
// se puede no-usar, o modificar libremente
async function populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount) {
      const U = Pmgr.Util;

      // genera datos de ejemplo
      minPrinters = minPrinters || 10;
      maxPrinters = maxPrinters || 20;
      minGroups = minGroups || 1;
      maxGroups = maxGroups || 7;
      jobCount = jobCount || 100;
      let lastId = 0;

      let printers = U.fill(U.randomInRange(minPrinters, maxPrinters),
          () => U.randomPrinter(lastId ++));

      let groups = U.fill(U.randomInRange(minPrinters, maxPrinters),
          () => U.randomGroup(lastId ++, printers, 50));

      let jobs = [];
      for (let i=0; i<jobCount; i++) {
          let p = U.randomChoice(printers);
          let j = new Pmgr.Job(lastId++,
            p.id,
            [
                U.randomChoice([
                    "Alice", "Bob", "Carol", "Daryl", "Eduardo", "Facundo", "Gloria", "Humberto"]),
                U.randomChoice([
                    "Fernández", "García", "Pérez", "Giménez", "Hervás", "Haya", "McEnroe"]),
                U.randomChoice([
                    "López", "Gutiérrez", "Pérez", "del Oso", "Anzúa", "Báñez", "Harris"]),
            ].join(" "),
            U.randomString() + ".pdf");
          p.queue.push(j.id);
          jobs.push(j);
      }

      if (Pmgr.globalState.token) {
          console.log("Updating server with all-new data");

          // FIXME: remove old data
          // FIXME: prepare update-tasks
          let tasks = [];
          for (let t of tasks) {
            try {
                console.log("Starting a task ...");
                await t().then(console.log("task finished!"));
            } catch (e) {
                console.log("ABORTED DUE TO ", e);
            }
          }
      } else {
          console.log("Local update - not connected to server");
          Pmgr.updateState({
            jobs: jobs,
            printers: printers,
            groups: groups
          });
      }
}

//
// PARTE 2:
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
// Generalmente de la forma $("selector").cosaQueSucede(...)
//
$(document).ready(function() { 
  
  // funcion de actualización de ejemplo. Llámala para refrescar interfaz
  function update(result) {
    try {
      // vaciamos un contenedor
      $("#accordionExample").empty();
      // y lo volvemos a rellenar con su nuevo contenido
      Pmgr.globalState.printers.forEach(m =>  $("#accordionExample").append(createPrinterItem(m)));
      // y asi para cada cosa que pueda haber cambiado
    } catch (e) {
      console.log('Error actualizando', e);
    }
  }


  // Servidor a utilizar. También puedes lanzar tú el tuyo en local (instrucciones en Github)
  const serverUrl = "http://localhost:8080/api/";
  Pmgr.connect(serverUrl);

  // ejemplo de login
  Pmgr.login("HDY0IQ", "cMbwKQ").then(d => {
    if (d !== undefined) {
        const u = Gb.resolve("HDY0IQ");
        console.log("login ok!", u);
    } else {
        console.log(`error en login (revisa la URL: ${serverUrl}, y verifica que está vivo)`);
        console.log("Generando datos de ejemplo para uso en local...")

        let minPrinters = 5; 
        let maxPrinters = 15; 
        let minGroups = 3;
        let maxGroups = 8; 
        let jobCount = 12;

        populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount);
        generar_tabla();
        generar_tabla_grupos();
        generar_tabla_jobs();
        update();
    }
  });
}); 


/*$(document).ready(function(){
  let minPrinters= 5
  let maxPrinters = 12;
  let minGroups = 1;
  let maxGroups = 5 
  let jobCount = 22;
  
  populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount);
  generar_tabla();
  generar_tabla_grupos();
  generar_tabla_jobs();
});*/
// cosas que exponemos para usarlas desde la consola
window.populate = populate
window.Pmgr = Pmgr;
window.createPrinterItem = createPrinterItem


