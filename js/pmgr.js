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

let MAX_SHOW_GROUPS = 10;
let MAX_SHOW_PRINTERS = 8;
let MAX_SHOW_JOBS = 4;
let ID_ = 0;

let filterAlias = "", filterGrupo = "", filterModelo = "", filterTrabajo = "", filterLocalizacion = "", filterEstado = "", filterIP = "";

function update()
{
  generar_tabla();
  generar_tabla_grupos();
  generar_tabla_jobs();
  generar_select_printers();
  generar_select_grupos();
  
  document.getElementById('rmPrinterButton').disabled = (selected.length == 0);
  document.getElementById('editPrinterButton').disabled = (selected.length == 0);
  document.getElementById('printPrinterButton').disabled= (selected.length == 0);
  document.getElementById('cancelPrinterButton').disabled= (selected.length == 0);
  document.getElementById('rmGroupButton').disabled = (selectedGroup.length == 0);
  document.getElementById('editGroupButton').disabled = (selectedGroup.length == 0);
  document.getElementById('editGroupContentsButton').disabled = (selectedGroup.length == 0);
  document.getElementById('printGroupButton').disabled= (selectedGroup.length == 0);
  document.getElementById('cancelGroupButton').disabled= (selectedGroup.length == 0);
  document.getElementById('cancelJobsButton').disabled= (selectedJobs.length == 0);

  
  selectAllToggle(document.getElementById('selectAllPr'), tablaPrint.children[1].children, selected);
  selectAllToggle(document.getElementById('selectAllGr'), tablaGroup.children[1].children, selectedGroup);
  selectAllToggle(document.getElementById('selectAllJo'), tablaJobs.children[1].children, selectedJobs);
}

function generar_select_printers()
{
  let editPrSelect = document.getElementById('editPrintersGr');
  let addPrSelect = document.getElementById('addPrintersGr');

  let groupOptions = "";
  
  Pmgr.globalState.printers.forEach(g => groupOptions += `<option value="${g.alias}">${g.alias}</option>`);
  
  editPrSelect.innerHTML = groupOptions;
  addPrSelect.innerHTML = groupOptions;
  
  $("#editPrintersGr").multipleSelect('refresh');
  $("#addPrintersGr").multipleSelect('refresh');
}

function generar_select_grupos()
{
  let editSelect = document.getElementById('editGroupsPr');
  let addSelect = document.getElementById('addGroupsPr');
  let editGroupsGrCont = document.getElementById('editGroupsGrCont');

  let groupOptions = "";
  
  Pmgr.globalState.groups.forEach(g => groupOptions += `<option value="${g.name}">${g.name}</option>`);
  
  editSelect.innerHTML = groupOptions;
  addSelect.innerHTML = groupOptions;
  editGroupsGrCont.innerHTML = groupOptions;
  
  $("#editGroupsPr").multipleSelect('refresh');
  $("#addGroupsPr").multipleSelect('refresh');
  $("#editGroupsGrCont").multipleSelect('refresh');
}

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
      if(i < MAX_SHOW_PRINTERS)
      {
        myTable += `<span class="badge badge-pill badge-secondary">`;
        myTable += Pmgr.globalState.groups[j].name;
        myTable += `</span> `;
      }
      i++;
    }
  } 
  if(i >= MAX_SHOW_PRINTERS)
  {
    myTable += `<span class="badge badge-pill badge-secondary">+`;
    myTable += i - MAX_SHOW_PRINTERS + 1;
    myTable += `</span> `;
  }

  myTable += "</td>";
  myTable+="<td>"; 
  myTable += `<span class="badge badge-pill ${pillClass[printer.status]}">${printer.status}</span>`;
  myTable += "</td>";    
  myTable+="<td>";

  for (i = 0; i < printer.queue.length && i < MAX_SHOW_JOBS; i++)
  {
    let idG = Pmgr.globalState.jobs.findIndex(element => element.id == printer.queue[i]);

    if(idG >= 0)
    {
      myTable += `<span class="badge badge-pill badge-secondary">`;
      myTable += Pmgr.globalState.jobs[idG].fileName;
      myTable += `</span> `;
    }    
  }

  if(printer.queue.length > MAX_SHOW_JOBS)
  {
    myTable += `<span class="badge badge-pill badge-secondary">+`;
    myTable += printer.queue.length - MAX_SHOW_JOBS;
    myTable += `</span> `;
  }

  myTable += "</td>";
  myTable+="</tr>";

  return myTable;
}

function selectAllToggle(e, t, selectedArray)
{

  if(t.length > 0)
  {
    if(e.disabled)
    {
      e.disabled = false;
      e.innerText = "Seleccionar todo";
    }

    let selectAll = (e.innerText != "Deseleccionar todo");
    if(t.length == selectedArray.length && selectAll)
      e.innerText = "Deseleccionar todo";

    else if(t.length > selectedArray.length && !selectAll)
      e.innerText = "Seleccionar todo";
  }  
  else
  {
    if(!e.disabled)
    {
      e.disabled = true;
      e.innerText = "Tabla vacía";
    }
  }
}


//$("#tablePrinters").click(function(){
//  $(this).addClass('selected').siblings().removeClass('selected');     
//});

//cuando se pulsa myBtn se llama a myFunction
//document.getElementById("myBtn").onclick = function() {myFunction()};



//--------------------------------GENERA TABLA PRINTERS------------------------------------------
let tablaPrint = document.getElementById('tablePrinters'), 
selected = tablaPrint.getElementsByClassName('selected');

tablaPrint.onclick = highlightClick;
function highlightClick(e) {

  let target = e.target;

  if(target.classList[0] == "badge")
    target = target.parentNode;
  
  if(target.localName != "td")
    return;

  highlight(target.parentNode);
}

function highlight(e) {

  if (e.className == 'selected')
    e.className = '';
  else
    e.className = 'selected';

  selected = tablaPrint.getElementsByClassName('selected');

  selectAllToggle(document.getElementById('selectAllPr'), tablaPrint.children[1].children, selected);

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
    document.getElementById('nombreCa2').innerHTML = "" + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreIm').innerHTML = "" + arrayAux[1];  //Igual vale para poner los nombres
  }
  
  else if(selected.length > 1)
  {
    let text = "múltiples impresoras";
    document.getElementById('nombreEd').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreEl').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreEl2').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreCa').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreCa2').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreIm').innerHTML = text;  //Igual vale para poner los nombres
  }
}

$("#selectAllPr").click(function()
{
  let selectAll = (this.innerText != "Deseleccionar todo");

  let t = tablaPrint.children[1].children;
  for (let i = 0; i < t.length; i++) {
    if(t[i].className == "" && selectAll)
      highlight(t[i]);
    else if(t[i].className != "" && !selectAll)
      highlight(t[i]);
  }

  selectAllToggle(this, t, selected);
});

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

  input[1].children[0].children[1].value = "";
  input[3].children[0].children[1].value = "";
  document.getElementById('editStatePr').value = status;
  input[5].children[0].children[1].value = "";
  input[6].children[0].children[1].value = "";

  input[1].children[0].children[1].placeholder = alias;
  input[3].children[0].children[1].placeholder = model;
  input[5].children[0].children[1].placeholder = location;
  input[6].children[0].children[1].placeholder = ip;
  
});

$("#addPrinterButton").click(function()
{
  document.getElementById('confirmarAdPr').disabled = true;

  document.getElementById('aliasAdPr').value = "";
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
    
  if(pr != "") 
  {
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
  }
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

$("#confirmarElPr").click(function()
{
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
  myTable+= "<th headers=co-pr-id>ID</th>";
  myTable+= "<th headers=co-pr-alias>Alias</th>";
  myTable+= "<th headers=co-pr-model>Modelo</th>";
  myTable+= "<th headers=co-pr-local>Localización</th>";
  myTable+= "<th headers=co-pr-ip>IP</th>";
  myTable+= "<th headers=co-pr-groups>Grupos</th>";
  myTable+= "<th headers=co-pr-status>Estado</th>";
  myTable+= "<th headers=co-pr-jobs>Trabajos</th></tr></thead>";
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

tablaGroup.onclick = highlightGrClick;
function highlightGrClick(e)
{
  let target = e.target;

  let toggle = (target.className == 'selected');

  if(target.classList[0] == "badge")
    target = target.parentNode;
  
  if(target.localName != "td")
    return;  
    
  highlightGroup(target.parentNode);
}

function highlightGroup(e)
{

  if (e.className == 'selected')
    e.className = '';
  else
    e.className = 'selected';

  selectedGroup = tablaGroup.getElementsByClassName('selected');

  selectAllToggle(document.getElementById('selectAllGr'), tablaGroup.children[1].children, selectedGroup);

  document.getElementById('rmGroupButton').disabled = (selectedGroup.length == 0);
  document.getElementById('editGroupButton').disabled = (selectedGroup.length == 0);
  document.getElementById('printGroupButton').disabled= (selectedGroup.length == 0);
  document.getElementById('cancelGroupButton').disabled= (selectedGroup.length == 0);
  document.getElementById('editGroupContentsButton').disabled = (selectedGroup.length == 0);
  
  if(selectedGroup.length == 1)
  {
    let text = selectedGroup[0].innerText;
    let arrayAux= text.split("\t");
    document.getElementById('nombreEdG').innerHTML = "grupo " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreEdGCont').innerHTML = "grupo " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreElG').innerHTML = "grupo " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreEl2G').innerHTML = "el grupo " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreCaG').innerHTML = "grupo " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreCa2G').innerHTML = "grupo " + arrayAux[1];  //Igual vale para poner los nombres
    document.getElementById('nombreImG').innerHTML = "grupo " + arrayAux[1];  //Igual vale para poner los nombres
  }
  
  else if(selectedGroup.length > 1)
  {
    let text = "múltiples grupos";
    document.getElementById('nombreEdG').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreEdGCont').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreElG').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreEl2G').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreCaG').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreCa2G').innerHTML = text;  //Igual vale para poner los nombres
    document.getElementById('nombreImG').innerHTML = text;  //Igual vale para poner los nombres
  }
}

document.getElementById('editStatePr').onchange = editStatePr;

let editGroupsDisabledGr = false;

$("#editCleanGroupsGrCont").click(function()
{  
  editGroupsDisabledGr = !editGroupsDisabledGr;

  setCleanGroupsGr();
});

function setCleanGroupsGr()
{
  if(editGroupsDisabledGr)
  {
    document.getElementById('editCleanGroupsGrCont').textContent = "Cancelar limpiado de grupos";
    $("#editGroupsGrCont").multipleSelect('disable');
  }
  else
  {
    document.getElementById('editCleanGroupsGrCont').textContent = "Limpiar todos los grupos";
    $("#editGroupsGrCont").multipleSelect('enable');
  }
}

$("#editGroupContentsButton").click(function()
{
  let input = document.getElementById('editGrupoCont').children[0].children[0].children;
  
  let alias = "", model = "", location = "", ip = "", status = "";
        
  $("#editGroupsGrCont").multipleSelect('refresh');
  
  for(let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    let gr = Pmgr.globalState.groups.find(el => el.id == arrayAux[0]);

    gr.printers.forEach(pID =>{
      let pr = Pmgr.globalState.printers.find(el => el.id == pID);

      alias = (alias == "" || alias == pr.alias) ? pr.alias : "<múltiples valores>";
      let x = "WIP";
      model = (model == "" || model == pr.model) ? pr.model : "<múltiples valores>";
      status = (status == "" || status == pr.status) ? pr.status : "<múltiples valores>";
      location = (location == "" || location == pr.location) ? pr.location : "<múltiples valores>";
      ip = (ip == "" || ip == pr.ip) ? pr.ip : "<múltiples valores>";

    });
  }
  

  input[1].children[0].children[1].value = "";
  input[3].children[0].children[1].value = "";
  document.getElementById('editStateGrCont').value = status;
  input[5].children[0].children[1].value = "";
  input[6].children[0].children[1].value = "";

  input[1].children[0].children[1].placeholder = alias;
  input[3].children[0].children[1].placeholder = model;
  input[5].children[0].children[1].placeholder = location;
  input[6].children[0].children[1].placeholder = ip;
  
});

$("#confirmarEdGrCont").click(function()
{
  let alias = "", model = "", location = "", ip = "", status = "";
  
  let input = document.getElementById('editGrupoCont').children[0].children[0].children;

  let groupSel = $("#editGroupsGrCont").multipleSelect('getSelects');
    
  let idG = Pmgr.globalState.groups;

  for (let i = 0; i < selectedGroup.length; i++)
  {
    
    let text = selectedGroup[i].innerText;
    let arrayAux = text.split("\t");
    let group = idG.find(g => g.id == arrayAux[0]);

    let prIDs = [];

    group.printers.forEach(pID =>
    {
      if(prIDs.findIndex(sel => sel == pID) == -1)
      {
        prIDs.push(pID);

        if(editGroupsDisabledGr || (groupSel.length > 0 && selectedGroup.length > 0))
        {
          idG.forEach(g => {
            for(let i = 0; i < selectedGroup.length; i++)
            {
              
              let idG = g.printers.findIndex(element => pID == element);
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
      
        let pr = Pmgr.globalState.printers.find(el => el.id == pID);
    
        pr.alias = (alias == "" || alias == "<múltiples valores>") ? pr.alias : alias;
        pr.model = (model == "" || model == "<múltiples valores>") ? pr.model : model;
        pr.status = (status == "" || status == "<múltiples valores>") ? pr.status : status;
        pr.location = (location == "" || location == "<múltiples valores>") ? pr.location : location;
        pr.ip = (ip == "" || ip == "<múltiples valores>") ? pr.ip : ip;
    
        if(!editGroupsDisabledGr)
        {
          for(let j = 0; j < groupSel.length; j++)
          {
            pr.group = groupSel[j];
            
            idG.find(g => g.name == groupSel[j]).printers.push(pr.id);
          }
        }
      }
    });
  }

  
  editGroupsDisabledGr = false;

  setCleanGroupsGr();

  update();
});

$("#editGroupButton").click(function()
{
  let input = document.getElementById('editGrupo').children[0].children[0].children;
  
  let name = "";  

  if(selectedGroup.length == 1)
  {
    let text = selectedGroup[0].innerText;
    let arrayAux= text.split("\t");    
    let aux = document.getElementById('editPrintersGr').options;
    let gr = Pmgr.globalState.groups.find(el => el.id == arrayAux[0]);

    for (let i = 0; i < aux.length; i++)
    {
      let pr = Pmgr.globalState.printers.find(p => p.alias == aux[i].value);
      let id = gr.printers.findIndex(p => p == pr.id);

      aux[i].removeAttribute('selected');
      if(id >= 0)
        aux[i].setAttribute('selected', 'selected');
    }
  }
  
  $("#editPrintersGr").multipleSelect('refresh');
  
  for(let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");

    name = (name == "" || name == arrayAux[1]) ? arrayAux[1] : "<múltiples valores>";
  }

  input[1].children[0].children[1].value = "";

  input[1].children[0].children[1].placeholder = name;
  
});

$("#confirmarEdGr").click(function()
{
  let name = "";
  
  let input = document.getElementById('editGrupo').children[0].children[0].children;

  let groupSel = $("#editPrintersGr").multipleSelect('getSelects');
    
  let idG = Pmgr.globalState.groups;

  for (let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux = text.split("\t");
    let group = idG.find(g => g.id == arrayAux[0]);
      
    name = input[1].children[0].children[1].value;

    group.name = (name == "" || name == "<múltiples valores>") ? group.name : name;

    if(groupSel.length > 0 || (groupSel.length == 0 && selectedGroups.length == 1))
    {
      group.printers = [];
      for(let j = 0; j < groupSel.length; j++)
      {
        let pr = Pmgr.globalState.printers.find(el => el.alias == groupSel[j]);
        
        pr.group = group.name;
        group.printers.push(pr.id);
      }
    }
  }

  update();
});

$("#selectAllGr").click(function()
{
  let selectAll = (this.innerText != "Deseleccionar todo");

  let t = tablaGroup.children[1].children;
  for (let i = 0; i < t.length; i++) {
    if(t[i].className == "" && selectAll)
      highlightGroup(t[i]);
    else if(t[i].className != "" && !selectAll)
      highlightGroup(t[i]);
  }

  selectAllToggle(this, t, selectedGroup);
});

$("#confirmarCaGr").click(function()
{
  for(let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    let gr = Pmgr.globalState.groups.find(el => el.id == arrayAux[0]);

    gr.printers.forEach(id => {
      let pr = Pmgr.globalState.printers.find(el => el.id == id);

      if(pr.queue.length > 0)
      {
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
    });
  }

  update();
});

$("#addGroupButton").click(function()
{
  document.getElementById('confirmarAdGr').disabled = true;

  document.getElementById('aliasAdGr').value = "";
});

$("#aliasAdGr").on("change keyup paste", function()
{
  document.getElementById('confirmarAdGr').disabled = (this.value == "");
});

$("#confirmarAdGr").click(function(e)
{ 

  let alias = document.getElementById('aliasAdGr').value;

  let ids = []
  
  let printSel = $("#addPrintersGr").multipleSelect('getSelects');
  
  let idP = Pmgr.globalState.printers;
  
  for(let j = 0; j < printSel.length; j++)
  {    
    ids.push(idP.find(p => p.alias == printSel[j]).id);
  }

  let pr = new Pmgr.Group(
    ID_,
    alias,
    ids
  ); 

  Pmgr.globalState.groups.push(pr); 
        
  $("#addPrintersGr").multipleSelect('setSelects', []);

  ID_++;
  update();
});

$("#printG").click(function()
{
    document.getElementById('confirmarPrGr').disabled = true;
});

$("#filePrGr").on("change keyup paste", function()
{
  document.getElementById('confirmarPrGr').disabled = (this.value == "");
});

$("#confirmarPrGr").click(function(e)
{  
  let file = document.getElementById('filePrGr').value;

  let pr = "";
  
  for(let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    let auxGr = Pmgr.globalState.groups.find(el => el.id == arrayAux[0]);
    
    auxGr.printers.forEach(printer =>
    {
      let auxPr = Pmgr.globalState.printers.find(el => el.id == printer);

      if(pr == "" || pr.queue.length > auxPr.queue.length)
        pr = auxPr;
    });
  }
  if(pr != "") 
  {
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

    document.getElementById('filePrGr').value = "";

    update();
    ID_++;
  }
});

$("#confirmarElGr").click(function()
{  
  for (let i = 0; i < selectedGroup.length; i++)
  { 
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    //Pmgr.rmGroup(arrayAux[0]);

    let id = Pmgr.globalState.groups.findIndex(element => arrayAux[1] == element.name);

    if(id >= 0)
      Pmgr.globalState.groups.splice(id, 1);
  }

  update();
});

function generar_tabla_grupos(){

 let myTable= "<table class=table table-bordered mb-0 table-hover display>";

 myTable+= " <thead><tr>";
 myTable+= "<th headers=co-gr-id>ID</th>";
 myTable+= "<th headers=co-gr-name>Nombre</th>";
 myTable+= "<th headers=co-gr-printers>Impresoras</th></tr></thead>";
 myTable+= "<tbody>";

 for (let i = 0; i < Pmgr.globalState.groups.length ; i++) {
      myTable+="<tr><td>" +Pmgr.globalState.groups[i].id + "</td>";  
      myTable+="<td>" + Pmgr.globalState.groups[i].name + "</td>";
      myTable+="<td>";

      for(let p = 0; p < Pmgr.globalState.groups[i].printers.length && p < MAX_SHOW_GROUPS; ++p ){
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

tablaJobs.onclick = highlightJoClick;
function highlightJoClick(e)
{
  let target = e.target;

  let toggle = (target.className == 'selected');

  if(target.classList[0] == "badge")
    target = target.parentNode;
  
  if(target.localName != "td")
    return;  
    
  highlightJobs(target.parentNode);
}

function highlightJobs(e)
{
  let toggle = (e.className == 'selected');

  if (e.className == 'selected')
    e.className = '';
  else
    e.className = 'selected';

    selectedJobs = tablaJobs.getElementsByClassName('selected');

  if(toggle)
    selectAllToggle(document.getElementById('selectAllJo'), tablaJobs.children[1].children, selectedJobs);
  
  document.getElementById('cancelJobsButton').disabled = (selectedJobs.length == 0);
  
  if(selectedJobs.length == 1)
  {
    let text = selectedJobs[0].innerText;
    let arrayAux= text.split("\t");    
    document.getElementById('nombreCaJ').innerHTML = arrayAux[3];  //Igual vale para poner los nombres
  }
  
  else if(selectedJobs.length > 1)
  {
    let text = "múltiples trabajos";
    document.getElementById('nombreCaJ').innerHTML = text;  //Igual vale para poner los nombres
  }
}

$("#selectAllJo").click(function()
{
  let selectAll = (this.innerText != "Deseleccionar todo");

  let t = tablaJobs.children[1].children;
  for (let i = 0; i < t.length; i++) {
    if(t[i].className == "" && selectAll)
      highlightJobs(t[i]);
    else if(t[i].className != "" && !selectAll)
      highlightJobs(t[i]);
  }

  selectAllToggle(this, t, selectedJobs);
});

$("#confirmarCaJo").click(function()
{
  for(let i = 0; i < selectedJobs.length; i++)
  {
    let text = selectedJobs[i].innerText;
    let arrayAux= text.split("\t");
    let job = Pmgr.globalState.jobs.find(el => el.id == arrayAux[0]);
    let jobID = Pmgr.globalState.jobs.findIndex(j => j == job);
    
    if (jobID >= 0)
    {
      Pmgr.globalState.jobs.splice(jobID, 1);

      let pr = Pmgr.globalState.printers.find(el => el.id == job.printer);

      if(pr.status == Pmgr.PrinterStates.PRINTING && pr.queue.length == 0)
        pr.status = Pmgr.PrinterStates.PAUSED;

      let id = pr.queue.findIndex(j => job.id == j);

      if (id >= 0)
        pr.queue.splice(id, 1);
    }
  }

  update();

  //Pmgr.rmJob(arrayAux[0]);
  //generar_tabla_jobs();
});

function generar_tabla_jobs()
{
  let myTable= "<table class=table table-bordered mb-0 table-hover display>";

  myTable+= " <thead><tr>";
  myTable+= "<th headers=co-job-id>ID</th>";
  myTable+= "<th headers=co-job-printer>Impresora</th>";
  myTable+= "<th headers=co-job-prid>ID Impresora</th>";
  //myTable+= "<th headers=co-job-owner>Owner</th>";
  myTable+= "<th headers=co-job-file>Archivo</th></tr></thead>";
  myTable+= "<tbody>";

  for (let i = 0; i < Pmgr.globalState.jobs.length ; i++) {
    
    let pr = Pmgr.globalState.printers.find(p => p.id == Pmgr.globalState.jobs[i].printer);

    myTable+="<tr><td>" + Pmgr.globalState.jobs[i].id + "</td>";
    myTable+="<td>" + pr.alias + "</td>";
    myTable+="<td>" + Pmgr.globalState.jobs[i].printer + "</td>";
    //myTable+="<td>" + Pmgr.globalState.jobs[i].owner + "</td>";
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
      minPrinters = 5;
      maxPrinters = 6;
      minGroups = 4;
      maxGroups = 8;
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
function update(result) {
  try {
    // vaciamos un contenedor
    $("#accordionExample").empty();
    // y lo volvemos a rellenar con su nuevo contenido
    Pmgr.globalState.printers.forEach(m =>  $("#accordionExample").append(createPrinterItem(m)));
    generar_tabla(); 
    generar_tabla_grupos(); 
    generar_tabla_jobs(); 
  } catch (e) {
    console.log('Error actualizando', e);
  }
}

$(document).ready(function(){

  // funcion de actualización de ejemplo. Llámala para refrescar interfaz
  

  // Servidor a utilizar. También puedes lanzar tú el tuyo en local (instrucciones en Github)
  const serverUrl = "http://gin.fdi.ucm.es:3128/api/";
  Pmgr.connect(serverUrl);

  Pmgr.login("g1", "poggers").then(d => {
      if (d !== undefined) {
          update();

          let minPrinters= 5
          let maxPrinters = 12;
          let minGroups = 1;
          let maxGroups = 5 
          let jobCount = 22;
          
          
      } else {
          console.log("error de login");
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

window.populate = populate;
window.Pmgr = Pmgr;
window.createPrinterItem = createPrinterItem;








