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

let MAX_SHOW_GROUPS = 4;
let MAX_SHOW_PRINTERS = 4;
let ID_ = 0;

function update()
{
  generar_tabla();
  generar_tabla_grupos();
  generar_tabla_jobs();
  generar_select_grupos();
  
  document.getElementById('rmPrinterButton').disabled = (selected.length == 0);
  document.getElementById('editPrinterButton').disabled = (selected.length == 0);
  document.getElementById('printPrinterButton').disabled= (selected.length == 0);
  document.getElementById('cancelPrinterButton').disabled= (selected.length == 0);
  document.getElementById('rmGroupButton').disabled = (selectedGroup.length == 0);
  document.getElementById('editGroupButton').disabled = (selectedGroup.length == 0);
  document.getElementById('printGroupButton').disabled= (selectedGroup.length == 0);
  document.getElementById('cancelGroupButton').disabled= (selectedGroup.length == 0);
}

function generar_select_grupos()
{
  let editSelect = document.getElementById('editGroupsPr');
  let addSelect = document.getElementById('addGroupsPr');

  let groupOptions = "";
  
  Pmgr.globalState.groups.forEach(g => groupOptions += `<option value="${g.name}">${g.name}</option>`);
  
  editSelect.innerHTML = groupOptions;
  addSelect.innerHTML = groupOptions;
  
  $("#editGroupsPr").multipleSelect('refresh');
  $("#addGroupsPr").multipleSelect('refresh');
}

$("#editGroupsPr").multipleSelect();
$("#addGroupsPr").multipleSelect();

function createPrinterItem(printer) {

  if(printer.status == Pmgr.PrinterStates.PAUSED && printer.queue.length > 0)
    printer.status = Pmgr.PrinterStates.PRINTING;
  else if(printer.status == Pmgr.PrinterStates.PRINTING && printer.queue.length == 0)
    printer.status = Pmgr.PrinterStates.PAUSED;


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

  let myTable = "";
  
  myTable+="<tr><td>" + printer.id + "</td>";  
  myTable+="<td>" + printer.alias + "</td>";    
  myTable+="<td>" + printer.model + "</td>";  
  myTable+="<td>" + printer.location + "</td>";
  myTable+="<td>" + printer.ip + "</td>"; 
  myTable+="<td>";

  let i = 0;

  for (let j = 0; j < Pmgr.globalState.groups.length; j++)
  {
    let idG = Pmgr.globalState.groups[j].printers.findIndex(element => printer.id == element);
    if(idG >= 0)
    {
      if(i <= MAX_SHOW_PRINTERS)
      {
        myTable += `<span class="badge badge-pill badge-secondary">`;
        myTable += Pmgr.globalState.groups[j].name;
        myTable += `</span> `;
      }
      i++;
    }
  } 
  if(i > MAX_SHOW_PRINTERS)
  {
    myTable += `<span class="badge badge-pill badge-secondary">+`;
    myTable += i - MAX_SHOW_PRINTERS;
    myTable += `</span> `;
  }

  myTable += "</td>";
  myTable+="<td>"; 
  myTable += `<span class="badge badge-pill ${pillClass[printer.status]}">${printer.status}</span>`;
  myTable += "</td>";    
  myTable+="</tr>";

  return myTable;
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

  let target = e.target;
  
  if(target.localName != "td")
    return;

  if(target.classList[0] == "badge")
    target = target.parentNode;

  if (target.parentNode.className == 'selected')
    target.parentNode.className = '';
  else
    target.parentNode.className = 'selected';

  selected = tablaPrint.getElementsByClassName('selected');

  document.getElementById('rmPrinterButton').disabled = (selected.length == 0);
  document.getElementById('editPrinterButton').disabled = (selected.length == 0);
  document.getElementById('printPrinterButton').disabled= (selected.length == 0);
  document.getElementById('cancelPrinterButton').disabled= (selected.length == 0);
  
  if(selected.length == 1)
  {
    let text = selected[0].innerText;
    let arrayAux= text.split("\t");
    document.getElementById('nombreEd').innerHTML = "" + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreEl').innerHTML = "" + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreEl2').innerHTML = "la impresora " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreCa').innerHTML = "" + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreIm').innerHTML = "" + arrayAux[1];  //Igual vale para poner los nombres
  }
  
  else if(selected.length > 1)
  {
    let text = "múltiples impresoras";
    document.getElementById('nombreEd').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreEl').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreEl2').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreCa').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreIm').innerHTML = text;  //Igual vale para poner los nombres
  }
}

$("#confirmarCaPr").click(function()
{
  
  for(let i = 0; i < selected.length; i++)
  {
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    let pr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);

    if(pr.status == Pmgr.PrinterStates.PRINTING)
      pr.status = Pmgr.PrinterStates.PAUSED;

    let id = Pmgr.globalState.jobs.findIndex(j => j.printer == pr.id);
    while (id >= 0)
    {
      Pmgr.globalState.jobs.splice(id, 1);

      id = Pmgr.globalState.jobs.findIndex(j => j.printer == pr.id);
    }

    pr.queue = [];
  }

  update();
});

document.getElementById('editStatePr').onchange = editStatePr;

let editGroupsDisabled = false;

$("#editCleanGroups").click(function()
{  
  editGroupsDisabled = !editGroupsDisabled;

  setCleanGroups();
});

function setCleanGroups()
{
  if(editGroupsDisabled)
  {
    document.getElementById('editCleanGroups').textContent = "Cancelar limpiado de grupos";
    $("#editGroupsPr").multipleSelect('disable');
  }
  else
  {
    document.getElementById('editCleanGroups').textContent = "Limpiar todos los grupos";
    $("#editGroupsPr").multipleSelect('enable');
  }
}

$("#editPrinterButton").click(function()
{
  let input = document.getElementById('editImp').children[0].children[0].children;
  
  let alias = "", model = "", location = "", ip = "", status = "";

  if(selected.length == 1)
  {
    let gr = Pmgr.globalState.groups;
    let text = selected[0].innerText;
    let arrayAux= text.split("\t");    
    let aux = document.getElementById('editGroupsPr').options;
    let pr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);
    
    let id = 0;

    gr.forEach(g => {   
      let idG = g.printers.findIndex(element => arrayAux[0] == element);
      aux[id].removeAttribute('selected');
      if(idG >= 0)
        aux[id].setAttribute('selected', 'selected');
      id++;
    });
  }
  
        
  $("#editGroupsPr").multipleSelect('refresh');
  
  for(let i = 0; i < selected.length; i++)
  {
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    let pr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);

    alias = (alias == "" || alias == pr.alias) ? pr.alias : "<múltiples valores>";
    let x = "WIP";
    model = (model == "" || model == pr.model) ? pr.model : "<múltiples valores>";
    status = (status == "" || status == pr.status) ? pr.status : "<múltiples valores>";
    location = (location == "" || location == pr.location) ? pr.location : "<múltiples valores>";
    ip = (ip == "" || ip == pr.ip) ? pr.ip : "<múltiples valores>";
  }
  

  input[1].children[0].children[1].value = alias;
  input[2].children[0].children[1].value = "WIP";
  input[3].children[0].children[1].value = model;
  document.getElementById('editStatePr').value = status;
  input[5].children[0].children[1].value = location;
  input[6].children[0].children[1].value = ip;
  
});

$("#addImp").click(function()
{
    document.getElementById('confirmarAdPr').disabled = true;
});

$("#aliasAdPr").on("change keyup paste", function()
{
  document.getElementById('confirmarAdPr').disabled = (this.value == "");
});

$("#confirmarAdPr").click(function(e)
{

  let alias = document.getElementById('aliasAdPr').value;

  let pr = new Pmgr.Printer(
    ID_,
    alias,
    "",
    "",
    "",
    [],
    Pmgr.PrinterStates.PAUSED
  );  

  Pmgr.globalState.printers.push(pr);  
  
  let groupSel = $("#addGroupsPr").multipleSelect('getSelects');
  
  let idG = Pmgr.globalState.groups;
  
  for(let j = 0; j < groupSel.length; j++)
  {
    pr.group = groupSel[j];
    
    idG.find(g => g.name == groupSel[j]).printers.push(pr.id);
  }
        
  $("#addGroupsPr").multipleSelect('setSelects', []);

  document.getElementById('aliasAdPr').value = "";

  update();
  ID_++;
});

$("#print").click(function()
{
    document.getElementById('confirmarPrPr').disabled = true;
});

$("#filePrPr").on("change keyup paste", function()
{
  document.getElementById('confirmarPrPr').disabled = (this.value == "");
});

$("#confirmarPrPr").click(function(e)
{
  
  let file = document.getElementById('filePrPr').value;

  let pr = "";
  
  for(let i = 0; i < selected.length; i++)
  {
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    let auxPr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);

    if(pr == "" || pr.queue.length > auxPr.queue.length)
      pr = auxPr;
  }  
    

  let job = new Pmgr.Job(
    ID_,
    pr.id,
    "",
    file
  );

  pr.queue.push(job.id);

  Pmgr.globalState.jobs.push(job);
  

  if(pr.status == Pmgr.PrinterStates.PAUSED)
    pr.status = Pmgr.PrinterStates.PRINTING;

  document.getElementById('filePrPr').value = "";

  update();
  ID_++;
});

$("#confirmarEdPr").click(function()
{  

  let alias = "", model = "", location = "", ip = "", status = "";
  
  let input = document.getElementById('editImp').children[0].children[0].children;

  let groupSel = $("#editGroupsPr").multipleSelect('getSelects');  
    
  let idG = Pmgr.globalState.groups;

  if(editGroupsDisabled || selected.length == 1 || (groupSel.length > 0 && selected.length > 1))
  {
    idG.forEach(g => {
      for(let i = 0; i < selected.length; i++)
      {
        let text = selected[i].innerText;
        let arrayAux = text.split("\t");
        
        let idG = g.printers.findIndex(element => arrayAux[0] == element);
        if(idG >= 0)
          g.printers.splice(idG, 1);
      }
    });
  }
  

  alias = input[1].children[0].children[1].value;
  model = input[3].children[0].children[1].value;
  status = document.getElementById('editStatePr').value;
  location = input[5].children[0].children[1].value;
  ip = input[6].children[0].children[1].value;

  for(let i = 0; i < selected.length; i++)
  {
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    let pr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);

    pr.alias = (alias == "" || alias == "<múltiples valores>") ? pr.alias : alias;
    let x = "WIP";
    pr.model = (model == "" || model == "<múltiples valores>") ? pr.model : model;
    pr.status = (status == "" || status == "<múltiples valores>") ? pr.status : status;
    pr.location = (location == "" || location == "<múltiples valores>") ? pr.location : location;
    pr.ip = (ip == "" || ip == "<múltiples valores>") ? pr.ip : ip;

    if(!editGroupsDisabled)
    {
      for(let j = 0; j < groupSel.length; j++)
      {
        pr.group = groupSel[j];
        
        idG.find(g => g.name == groupSel[j]).printers.push(pr.id);
      }
    }
  }

  
  editGroupsDisabled = false;

  setCleanGroups();

  update();
});


$("#confirmarElPr").click(function(){

  for (let i = 0; i < selected.length; i++)
  { 
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    //Pmgr.rmPrinter(arrayAux[0]);

    let id = Pmgr.globalState.printers.findIndex(element => arrayAux[1] == element.alias);

    if(id >= 0)
      Pmgr.globalState.printers.splice(id, 1);

    
    for (let j = 0; j < Pmgr.globalState.groups.length; j++)
    {
      let idG = Pmgr.globalState.groups[j].printers.findIndex(element => arrayAux[0] == element);
      if(idG >= 0)
        Pmgr.globalState.groups[j].printers.splice(idG, 1);
    }
  }

  update();
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
    myTable += createPrinterItem(Pmgr.globalState.printers[i])
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

      for(let p = 0; p < Pmgr.globalState.groups[i].printers.length && p <= MAX_SHOW_GROUPS; ++p ){
        let aux = Pmgr.globalState.groups[i].printers[p];
        let print = Pmgr.globalState.printers.find(element => element.id == aux);
        myTable +=  `<span class="badge badge-pill badge-secondary">${print.alias}</span> `;
        //myTable += "--";
      }
      
      if(Pmgr.globalState.groups[i].printers.length > MAX_SHOW_GROUPS)
      {
        myTable += `<span class="badge badge-pill badge-secondary">+`;
        myTable += Pmgr.globalState.groups[i].printers.length - MAX_SHOW_GROUPS;
        myTable += `</span> `;
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


//--------------------------------OTRAS COSAS--------------------------------------------
// funcion para generar datos de ejemplo: impresoras, grupos, trabajos, ...
// se puede no-usar, o modificar libremente
async function populate(minPrinters, maxPrinters, minGroups, maxGroups, jobCount) {
      const U = Pmgr.Util;

      // genera datos de ejemplo
      minPrinters = 3;
      maxPrinters = 3;
      minGroups = 3;
      maxGroups = 16;
      jobCount = jobCount || 100;
      /*
      minPrinters = minPrinters || 10;
      maxPrinters = maxPrinters || 20;
      minGroups = minGroups || 1;
      maxGroups = maxGroups || 7;
      jobCount = jobCount || 100;
      */

      let printers = U.fill(U.randomInRange(minPrinters, maxPrinters),
          () => U.randomPrinter(ID_ ++));

      let groups = U.fill(U.randomInRange(minGroups, maxGroups),
          () => U.randomGroup(ID_ ++, printers, 50));

      let jobs = [];
      for (let i=0; i<jobCount; i++) {
          let p = U.randomChoice(printers);
          let j = new Pmgr.Job(ID_++,
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
  function update_(result) {
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


