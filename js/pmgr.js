"use strict"

import * as Pmgr from './pmgrapi.js'
let MAXPRINTERS = 10;
let impresoras = new Array();


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


let table = document.getElementById('tablePrinters'), 
selected = table.getElementsByClassName('selected');
table.onclick = highlight;
function highlight(e) {
  if (selected[0]) selected[0].className = '';
  e.target.parentNode.className = 'selected';

  document.getElementById('rmPrinterButton').disabled = false;
  document.getElementById('editPrinterButton').disabled = false;
  document.getElementById('printPrinterButton').disabled= false;
  document.getElementById('cancelPrinterButton').disabled= false;

  
}




function generar_tabla(){
 

 let myTable= "<table class=table table-bordered mb-0 table-hover display>";

 myTable+= " <thead><tr>";
 myTable+= "<th headers=co-alias>Alias</th>";
 myTable+= "<th headers=co-modelo>Modelo</th>";
 myTable+= "<th headers=co-local>Localizacion</th>";
 myTable+= "<th headers=co-ip>IP</th>";
 myTable+= "<th headers=co-gr>Grupos</th>";
 myTable+= "<th headers=co-est>Estado</th></tr></thead>";
 myTable+= "<tbody>";

 for (let i = 0; i < impresoras.length; i++) {
       //myTable+="<tr><td>" + impresoras[i].id + "</td>";  
       myTable+="<tr>";
       myTable+="<td>" + impresoras[i].alias + "</td>";    
       myTable+="<td>" + impresoras[i].modelo + "</td>";  
       myTable+="<td>" + impresoras[i].location + "</td>";
       myTable+="<td>" + impresoras[i].ip + "</td>"; 
       myTable+="<td>" + impresoras[i].groups + "</td>";
       myTable+="<td>" + impresoras[i].status + "</td>";    
       myTable+="</tr>";
 }
   
   myTable+="</tbody></table>";
   document.getElementById('tablePrinters').innerHTML = myTable;
}
// funcion para generar datos de ejemplo: impresoras, grupos, trabajos, ...
// se puede no-usar, o modificar libremente
async function populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount) {
      const U = Pmgr.Util;

      // genera datos de ejemplo
      minPrinters = minPrinters || 10;
      maxPrinters = maxPrinters || 20;
      minGroups = minGroups || 1;
      maxGroups = maxGroups || 3;
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
$(function() { 
  
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

        populate();
        update();
    }
  });
}); 


$(document).ready(function(){
  for(let id = 0; id < MAXPRINTERS; id++){
    impresoras.push(Pmgr.Util.randomPrinter(id));
  }
  generar_tabla();
});
// cosas que exponemos para usarlas desde la consola
window.populate = populate
window.Pmgr = Pmgr;
window.createPrinterItem = createPrinterItem


