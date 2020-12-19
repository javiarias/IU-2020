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


function endsWith(str, suffix) {
  return str.match(suffix+"$")==suffix;
}

function validateIP(ipaddress) 
{
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
  {
    return (true)
  }
  //alert("You have entered an invalid IP address!")
  return (false)
}

$('.dropdown-toggle').on('click', function(event) {
  $('.dropdown-menu').slideToggle();
  event.stopPropagation();
});

$('.dropdown-menu').on('click', function(event) {
  event.stopPropagation();
});

$(window).on('click', function() {
  $('.dropdown-menu').slideUp();
});

document.getElementById('filePrPr').ondrop = dropHandler;
document.getElementById('filePrPr').ondragover = dragOverHandler;
document.getElementById('filePrGr').ondrop = dropHandler;
document.getElementById('filePrGr').ondragover = dragOverHandler;

function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  let fileName = "";

  //si se da más de un archivo, solo cogemos el último

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file')
      {
        var file = ev.dataTransfer.items[i].getAsFile();
        fileName = file.name;
        console.log('... file[' + i + '].name = ' + file.name);
      }
    }
  } else {

    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++)
    {
      fileName = ev.dataTransfer.files[i].name;
      console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
    }
  }

  ev.target.value = fileName;

  let pdf = endsWith(fileName, ".pdf");

  //haciendo esto podemos hacer la función común a todos los menús de impresión

  ev.target.parentNode.nextSibling.nextSibling.hidden = pdf;

  ev.target.parentNode.parentNode.nextSibling.nextSibling.children[1].disabled = !pdf;
}
function dragOverHandler(ev) {
  // console.log('File(s) in drop zone'); 

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

let MAX_SHOW_GROUPS = 10;
let MAX_SHOW_PRINTERS = 8;
let MAX_SHOW_JOBS = 4;
let detalleModelo = true; let detalleLocal = true; let detalleIP = true; let detalleGrupo = true; let detalleEstado = true; let detalleTrabajo = true;
let detalleImpresoras = true; let detalleNombreGrupo = true;
let detalleJobID = true; let detalleJobImpresora= true; let detalleJobArchivo= true;
let filterAlias = "", filterGrupo = "", filterModelo = "", filterLocalizacion = "", filterEstado = "", filterIP = "";
let filterName = "", filterImpresora = "";
let filterImpresoraJob = "", filterArchivo = "";


function generar_select_printers()
{
  $("#filterPrintersGr").multipleSelect('refresh');
  $("#filterPrintersJo").multipleSelect('refresh');

  let editPrSelect = document.getElementById('editPrintersGr');
  let addPrSelect = document.getElementById('addPrintersGr');
  let filterPrintersGr = document.getElementById('filterPrintersGr');

  let selGr = $("#filterPrintersGr").multipleSelect('getSelects');

  let filterPrintersJo = document.getElementById('filterPrintersJo');

  let selJo = $("#filterPrintersJo").multipleSelect('getSelects');
  
  let groupOptions = "";
  
  Pmgr.globalState.printers.forEach(g => groupOptions += `<option value="${g.alias}">${g.alias}</option>`);
  
  editPrSelect.innerHTML = groupOptions;
  addPrSelect.innerHTML = groupOptions;
  
  groupOptions = `<option value=""> -- </option>` + groupOptions;

  filterPrintersGr.innerHTML = groupOptions;
  filterPrintersJo.innerHTML = groupOptions;
  
  $("#editPrintersGr").multipleSelect('refresh');
  $("#addPrintersGr").multipleSelect('refresh');
  $("#filterPrintersGr").multipleSelect('refresh');
  $("#filterPrintersGr").multipleSelect('setSelects', selGr);
  $("#filterPrintersJo").multipleSelect('refresh');
  $("#filterPrintersJo").multipleSelect('setSelects', selJo);
}

function generar_select_grupos()
{
  $("#filterGroupsPr").multipleSelect('refresh');

  let editSelect = document.getElementById('editGroupsPr');
  let filterGroupsPr = document.getElementById('filterGroupsPr');

  let sel = $("#filterGroupsPr").multipleSelect('getSelects');

  let addSelect = document.getElementById('addGroupsPr');
  let editGroupsGrCont = document.getElementById('editGroupsGrCont');
  
  let groupOptions = "";
  
  Pmgr.globalState.groups.forEach(g => groupOptions += `<option value="${g.name}">${g.name}</option>`);
  
  editSelect.innerHTML = groupOptions;
  addSelect.innerHTML = groupOptions;
  editGroupsGrCont.innerHTML = groupOptions;

  groupOptions = `<option value=""> -- </option>` + groupOptions;
  filterGroupsPr.innerHTML = groupOptions;
  
  $("#editGroupsPr").multipleSelect('refresh');
  $("#filterGroupsPr").multipleSelect('refresh');
  $("#filterGroupsPr").multipleSelect('setSelects', sel);
  $("#addGroupsPr").multipleSelect('refresh');
  $("#editGroupsGrCont").multipleSelect('refresh');
}

function createPrinterItem(printer) {

  //comprobación de filtros normal
  if(!printer.alias.includes(filterAlias) || !printer.model.includes(filterModelo) || !printer.location.includes(filterLocalizacion) ||
      !printer.status.includes(filterEstado) || !printer.ip.includes(filterIP))
    return null;


  if(printer.status == Pmgr.PrinterStates.PAUSED && printer.queue.length > 0)
    printer.status = Pmgr.PrinterStates.PRINTING;
  else if(printer.status == Pmgr.PrinterStates.PRINTING && printer.queue.length == 0)
    printer.status = Pmgr.PrinterStates.PAUSED;


  const rid = 'x_' + Math.floor(Math.random()*1000000);
  const hid = 'h_'+rid;
  const cid = 'c_'+rid;

  // usar [] en las claves las evalua (ver https://stackoverflow.com/a/19837961/15472)
  const PS = Pmgr.PrinterStates;
  let pillClass = { "PAUSED" : "badge-secondary",
                    "PRINTING" : "badge-success",
                    "NO_INK" : "badge-danger",
                    "NO_PAPER" : "badge-danger" };

  let allJobs = printer.queue.map((id) =>
     `<span class="badge badge-secondary">${id}</span>`
  ).join(" ");

  let myTable = "";
  
  //Esto se muestra siempre
  myTable+="<tr><td>" + printer.id + "</td>";
  myTable+="<td>" + printer.alias + "</td>";

  //Aqui se hace la distincion de que se muestra y que no
  if(detalleModelo) myTable+="<td>" + printer.model + "</td>";  
  if(detalleLocal) myTable+="<td>" + printer.location + "</td>";
  if(detalleIP) myTable+="<td>" + printer.ip + "</td>"; 
  //-------Grupos
  if(detalleGrupo)
  {
    let esc = (printer.groups.length == 0);

    myTable+="<td>";
    let i = 0;

    printer.groups.forEach(gr =>
    {
      let idG = Pmgr.globalState.groups.find(element => gr == element.id);
      
      if(idG.name.includes(filterGrupo))
        esc = true;

      if(i < MAX_SHOW_PRINTERS)
      {
        myTable += `<span class="badge badge-pill badge-secondary">`;
        myTable += idG.name;
        myTable += `</span> `;
      }
      i++;
    });
    if(i > 0 && i > MAX_SHOW_PRINTERS)
    {
      myTable += `<span class="badge badge-pill badge-secondary">+`;
      myTable += i - MAX_SHOW_PRINTERS;
      myTable += `</span> `;
    }
  
    myTable += "</td>";

    if(!esc)
      return null;
  }
  //-------Estado---------------
  if(detalleEstado){
    myTable+="<td>"; 
    myTable += `<span class="badge badge-pill ${pillClass[printer.status]}">${printer.status}</span>`;
    myTable += "</td>";  
  }

  //-------JOBS---------------
  if(detalleTrabajo)
  {    

    myTable+="<td>";
  
    for (let i = 0; i < printer.queue.length && i < MAX_SHOW_JOBS; i++)
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
  }
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

    let alias = Pmgr.globalState.printers.find(p => p.id == arrayAux[0]).alias;

    document.getElementById('nombreEd').innerHTML = "" + alias;  
    document.getElementById('nombreEl').innerHTML = "" + alias;  
    document.getElementById('nombreEl2').innerHTML = "la impresora " + alias;  
    document.getElementById('nombreCa').innerHTML = "" + alias;  
    document.getElementById('nombreCa2').innerHTML = "" + alias;  
    document.getElementById('nombreIm').innerHTML = "" + alias;  
    document.getElementById('listaEd').hidden = true;
    document.getElementById('listaEl').hidden = true;
    document.getElementById('listaCa').hidden = true;
    document.getElementById('listaPr').hidden = true;
  }
  
  else if(selected.length > 1)
  {
  
    let allPrinters = "";
    
    selected.forEach(gr =>
    {    
      let text = gr.innerText;
      let arrayAux= text.split("\t");

      let alias = Pmgr.globalState.printers.find(p => p.id == arrayAux[0]).alias;

      allPrinters += `<span class="badge badge-pill badge-secondary">${alias}</span>`;
    });
  
    document.getElementById('listaCa').innerHTML = allPrinters;  
    document.getElementById('listaCa').hidden = false;
    document.getElementById('listaPr').innerHTML = allPrinters;  
    document.getElementById('listaPr').hidden = false;
    document.getElementById('listaEd').innerHTML = allPrinters;  
    document.getElementById('listaEd').hidden = false;
    document.getElementById('listaEl').innerHTML = allPrinters;  
    document.getElementById('listaEl').hidden = false;


    let text = "múltiples impresoras";
    document.getElementById('nombreEd').innerHTML = text;  
    document.getElementById('nombreEl').innerHTML = text;  
    document.getElementById('nombreEl2').innerHTML = text;  
    document.getElementById('nombreCa').innerHTML = text; 
    document.getElementById('nombreCa2').innerHTML = text; 
    document.getElementById('nombreIm').innerHTML = text; 
  }
}

//-------------------------DETALLES----------------------------------------------------------------------------->
$("#toggle-co-pr-model").click(function(){
  detalleModelo = !detalleModelo
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-pr-local").click(function(){
  detalleLocal = !detalleLocal
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-pr-ip").click(function(){
  detalleIP = !detalleIP
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-pr-groups").click(function(){
  detalleGrupo = !detalleGrupo
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-pr-status").click(function(){
  detalleEstado = !detalleEstado
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-pr-jobs").click(function(){
  detalleTrabajo = !detalleTrabajo
  this.children[0].toggleAttribute("checked");
  update();
});

    //-----Detalles grupos---//
$("#toggle-co-gr-name").click(function(){
  detalleNombreGrupo = !detalleNombreGrupo
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-gr-printers").click(function(){
  detalleImpresoras = !detalleImpresoras
  this.children[0].toggleAttribute("checked");
  update();
});

    //-----Detalles jobs---//
$("#toggle-co-job-printer").click(function(){
  detalleJobImpresora = !detalleJobImpresora

  this.children[0].toggleAttribute("checked");

  update();
});
$("#toggle-co-job-prid").click(function(){
  detalleJobID = !detalleJobID
  this.children[0].toggleAttribute("checked");
  update();
});
$("#toggle-co-job-file").click(function(){
  detalleJobArchivo = !detalleJobArchivo
  this.children[0].toggleAttribute("checked");
  update();
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////777

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
    
    let id = Pmgr.globalState.jobs.filter(j => j.printer == pr.id);
    
    id.forEach(element => {      
      Pmgr.rmJob(element.id).then(update);
    });
  }

  update();
});

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
  
  let alias = "", model = "", location = "", ip = "";
  
  if(selected.length == 1)
  {
    input[2].children[0].children[1].disabled = false;

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
  else
    input[2].children[0].children[1].disabled = true;
  
  
  $("#editGroupsPr").multipleSelect('refresh');
  
  for(let i = 0; i < selected.length; i++)
  {
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    let pr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);
    
    alias = (alias == "" || alias == pr.alias) ? pr.alias : "<múltiples valores>";
    model = (model == "" || model == pr.model) ? pr.model : "<múltiples valores>";
    location = (location == "" || location == pr.location) ? pr.location : "<múltiples valores>";
    ip = (ip == "" || ip == pr.ip) ? pr.ip : "<múltiples valores>";
  }  
  
  input[2].children[0].children[1].value = "";
  input[4].children[0].children[1].value = "";
  input[5].children[0].children[1].value = "";
  input[6].children[0].children[1].value = "";
  
  input[2].children[0].children[1].placeholder = alias;
  input[4].children[0].children[1].placeholder = model;
  input[5].children[0].children[1].placeholder = location;
  input[6].children[0].children[1].placeholder = ip;
  
  document.getElementById('warningEdPr').hidden = true;
  document.getElementById('warningEdIpPr').hidden = true;
});

$("#aliasEdPr").on("change keyup paste", function()
{
  let id = (!this.disabled) &&  (this.value != this.placeholder) && (Pmgr.globalState.printers.findIndex(pr => pr.alias == this.value) != -1);

  document.getElementById('warningEdPr').hidden = !id;
  document.getElementById('confirmarEdPr').disabled = id;
});


$("#ipEdPr").on("change keyup paste", function()
{
  let id = (this.value != this.placeholder) && !validateIP(this.value);

  document.getElementById('warningEdIpPr').hidden = !id;
  document.getElementById('confirmarEdPr').disabled = id;
});


$("#addPrinterButton").click(function()
{
  document.getElementById('confirmarAdPr').disabled = true;
  
  document.getElementById('warningAdPr').hidden = true;
  document.getElementById('aliasAdPr').value = "";
});

$("#aliasAdPr").on("change keyup paste", function()
{
  let id = Pmgr.globalState.printers.findIndex(pr => pr.alias == this.value) != -1;

  document.getElementById('warningAdPr').hidden = !id;
  document.getElementById('confirmarAdPr').disabled = (this.value == "") || id;
});

$("#confirmarAdPr").click(function(e)
{
  let alias = document.getElementById('aliasAdPr').value;
  let group;// = document.getElementById('addGroupsPr').value;
  let ip = "192.168.0." + Pmgr.Util.randomInRange(10,250);

  let sel = $("#addGroupsPr").multipleSelect('getSelects');
  let selGrs = [];
  
  //con map no nos tiene en cuenta que 2 impresoras o 2 grupos tengan el mismo alias!

  for (let i = 0; i < sel.length; i++) {
    const name = sel[i];
    let aux = Pmgr.globalState.groups.filter(p => p.name == name);
    aux.forEach(gr => {
      if(selGrs.length == 0 || selGrs.findIndex(gID => gID == gr.id) < 0)
        selGrs.push(gr.id)
    });
  }


  let pr = new Pmgr.Printer(
    0,
    alias,
    "-",
    "-",
    ip,
    selGrs,
    [],
    Pmgr.PrinterStates.PAUSED
  );

  Pmgr.addPrinter(pr).then(update);
});


$("#printPrinterButton").click(function()
{
  document.getElementById('filePrPr').value = "";
  document.getElementById('warningPrPr').hidden = false;
  document.getElementById('confirmarPrPr').disabled = true;
});

$("#filePrPr").on("change keyup paste", function()
{
  let pdf = endsWith(this.value, ".pdf");

  document.getElementById('warningPrPr').hidden = pdf;
  document.getElementById('confirmarPrPr').disabled = (this.value == "") || !pdf;
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
      0,
      pr.id,
      pr.alias,
      file
    );
    
    Pmgr.addJob(job).then(update);

    document.getElementById('filePrPr').value = "";
  }
});

$("#confirmarEdPr").click(function()
{  
  
  let alias = "", model = "", location = "", ip = "";
  
  let input = document.getElementById('editImp').children[0].children[0].children;
  
  let groupSel = $("#editGroupsPr").multipleSelect('getSelects');

  let groupIDs = [];

  let idG = Pmgr.globalState.groups;
  
  if(!editGroupsDisabled && (groupSel.length == 0 && selected.length > 1))
    groupIDs = null;
  
  else if (!editGroupsDisabled)
  {
    for (let i = 0; i < groupSel.length; i++) {
      const n = groupSel[i];
      groupIDs.push(idG.find(gr => gr.name == n).id);
    }
  }
  
  
  alias = input[2].children[0].children[1].value;
  model = input[4].children[0].children[1].value;
  location = input[5].children[0].children[1].value;
  ip = input[6].children[0].children[1].value;
  
  for(let i = 0; i < selected.length; i++)
  {
    let text = selected[i].innerText;
    let arrayAux= text.split("\t");
    let pr = Pmgr.globalState.printers.find(el => el.id == arrayAux[0]);
    
    pr.alias = (alias == "" || alias == "<múltiples valores>") ? pr.alias : alias;
    pr.model = (model == "" || model == "<múltiples valores>") ? pr.model : model;
    pr.location = (location == "" || location == "<múltiples valores>") ? pr.location : location;
    pr.ip = (ip == "" || ip == "<múltiples valores>") ? pr.ip : ip;

    if(groupIDs != null)
      pr.groups = groupIDs;

    Pmgr.setPrinter(pr).then(update);
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
    let arrayAux = text.split("\t");

    Pmgr.rmPrinter(parseInt(arrayAux[0])).then(update);
  }

  update();
}); 

function generar_tabla(){

  let myTable= "<table class=table table-bordered mb-0 table-hover display>";

  myTable+= " <thead><tr>";

  myTable+= "<th headers=co-pr-id>ID</th>";
  myTable+= "<th headers=co-pr-alias>Alias</th>";

  if(detalleModelo) myTable+= "<th headers=co-pr-model>Modelo</th>";
  if(detalleLocal) myTable+= "<th headers=co-pr-local>Localización</th>";
  if(detalleIP) myTable+= "<th headers=co-pr-ip>IP</th>";
  if(detalleGrupo)myTable+= "<th headers=co-pr-groups>Grupos</th>";
  if(detalleEstado)myTable+= "<th headers=co-pr-status>Estado</th>";
  if(detalleTrabajo)myTable+= "<th headers=co-pr-jobs>Trabajos</th></tr></thead>";

  myTable+= "<tbody>";

  for (let i = 0; i < Pmgr.globalState.printers.length ; i++) {
    let aux = createPrinterItem(Pmgr.globalState.printers[i])

    if(aux != null)
      myTable += aux;
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

  
  let allPrinters = "";

  let prID = [];
  
  selectedGroup.forEach(gr =>
  {    
    let text = gr.innerText;
    let arrayAux= text.split("\t");

    let gr_ = Pmgr.globalState.groups.find(g => g.id == arrayAux[0]).printers;

    gr_.forEach(pr =>
    {
      if(prID.findIndex(p => p == pr) == -1)
      {
        prID.push(pr);
        let alias = Pmgr.globalState.printers.find(l => l.id == pr).alias;

        allPrinters += `<span class="badge badge-pill badge-secondary">${alias}</span>`;
      }
    });
  });

  document.getElementById('listaEdGCont').innerHTML = allPrinters;  
  document.getElementById('listaEdGCont').hidden = false;
  document.getElementById('listaCaG').innerHTML = allPrinters;  
  document.getElementById('listaCaG').hidden = false;
  document.getElementById('listaPrG').innerHTML = allPrinters;  
  document.getElementById('listaPrG').hidden = false;
  
  if(selectedGroup.length == 1)
  {
    let text = selectedGroup[0].innerText;
    let arrayAux= text.split("\t");

    let name = Pmgr.globalState.groups.find(p => p.id == arrayAux[0]).name;

    document.getElementById('nombreEdG').innerHTML = "grupo " + name;  
    document.getElementById('nombreEdGCont').innerHTML = "impresoras de grupo " + name;  
    document.getElementById('nombreElG').innerHTML = "grupo " + name;  
    document.getElementById('nombreEl2G').innerHTML = "el grupo " + name;  
    document.getElementById('nombreCaG').innerHTML = "trabajos del grupo " + name;  
    document.getElementById('nombreImG').innerHTML = "grupo " + name;  
    document.getElementById('listaEdG').hidden = true;
    document.getElementById('listaElG').hidden = true;
  }
  
  else if(selectedGroup.length > 1)
  {
    let allGroups = "";
  
    selectedGroup.forEach(gr =>
    {    
      let text = gr.innerText;
      let arrayAux= text.split("\t");

      let name = Pmgr.globalState.groups.find(p => p.id == arrayAux[0]).name;

      allGroups += `<span class="badge badge-pill badge-secondary">${name}</span>`;
    });

    document.getElementById('listaEdG').innerHTML = allGroups;  
    document.getElementById('listaEdG').hidden = false;
    document.getElementById('listaElG').innerHTML = allGroups;  
    document.getElementById('listaElG').hidden = false;

    let text = "múltiples grupos";
    document.getElementById('nombreEdG').innerHTML = text;  
    document.getElementById('nombreEdGCont').innerHTML = "impresoras de " + text;  
    document.getElementById('nombreElG').innerHTML = text;  
    document.getElementById('nombreEl2G').innerHTML = text;  
    document.getElementById('nombreCaG').innerHTML = "trabajos de " + text;  
    document.getElementById('nombreImG').innerHTML = text;  
  }
}

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

  let multiple = (selectedGroup.length > 1);
  
  for(let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    let gr = Pmgr.globalState.groups.find(el => el.id == arrayAux[0]);

    multiple |= (gr.printers.length > 1);
    
    gr.printers.forEach(pID =>{
      let pr = Pmgr.globalState.printers.find(el => el.id == pID);
      
      alias = (alias == "" || alias == pr.alias) ? pr.alias : "<múltiples valores>";
      model = (model == "" || model == pr.model) ? pr.model : "<múltiples valores>";
      location = (location == "" || location == pr.location) ? pr.location : "<múltiples valores>";
      ip = (ip == "" || ip == pr.ip) ? pr.ip : "<múltiples valores>";
      
    });
  }
  
  input[2].children[0].children[1].value = "";
  input[4].children[0].children[1].value = "";
  input[5].children[0].children[1].value = "";
  input[6].children[0].children[1].value = "";
  
  input[2].children[0].children[1].placeholder = alias;
  input[4].children[0].children[1].placeholder = model;
  input[5].children[0].children[1].placeholder = location;
  input[6].children[0].children[1].placeholder = ip;
  

  document.getElementById('aliasEdGrCont').disabled = multiple;
  document.getElementById('warningEdGrCont').hidden = true;
  document.getElementById('warningEdIpGrCont').hidden = true;
});


$("#aliasEdGrCont").on("change keyup paste", function()
{
  let id = (!this.disabled) && (this.value != this.placeholder) && (Pmgr.globalState.printers.findIndex(pr => pr.alias == this.value) != -1);

  document.getElementById('warningEdGrCont').hidden = !id;
  document.getElementById('confirmarEdGrCont').disabled = id;
});

$("#ipEdGrCont").on("change keyup paste", function()
{
  let id = (this.value != this.placeholder) && !validateIP(this.value);

  document.getElementById('warningEdIpGrCont').hidden = !id;
  document.getElementById('confirmarEdGrCont').disabled = id;
});

$("#confirmarEdGrCont").click(function()
{
  let alias = "", model = "", location = "", ip = "", status = "";
  
  let input = document.getElementById('editGrupoCont').children[0].children[0].children;

  let sel = $("#editGroupsGrCont").multipleSelect('getSelects');
  let groupSel = [];

  let idG = Pmgr.globalState.groups;
  
  if(!editGroupsDisabled && sel.length == 0)
    groupSel = null;
  
  else if (!editGroupsDisabled)
  {
    for (let i = 0; i < sel.length; i++) {
      const n = sel[i];
      groupSel.push(idG.find(gr => gr.name == n).id);
    }
  }
  
  let prIDs = [];

  for (let i = 0; i < selectedGroup.length; i++)
  {
    
    let text = selectedGroup[i].innerText;
    let arrayAux = text.split("\t");
    let group = idG.find(g => g.id == arrayAux[0]);
    
    group.printers.forEach(pID =>
      {
        if(prIDs.findIndex(sel => sel == pID) == -1)
        {
          prIDs.push(pID);
          
          alias = input[2].children[0].children[1].value;
          model = input[4].children[0].children[1].value;
          location = input[5].children[0].children[1].value;
          ip = input[6].children[0].children[1].value;
          
          let pr = Pmgr.globalState.printers.find(el => el.id == pID);
          
          pr.alias = (alias == "" || alias == "<múltiples valores>") ? pr.alias : alias;
          pr.model = (model == "" || model == "<múltiples valores>") ? pr.model : model;
          pr.location = (location == "" || location == "<múltiples valores>") ? pr.location : location;
          pr.ip = (ip == "" || ip == "<múltiples valores>") ? pr.ip : ip;

          if(groupSel != null)
            pr.groups = groupSel;

          Pmgr.setPrinter(pr).then(update);
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
    input[2].children[0].children[1].disabled = false;

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
  else
    input[2].children[0].children[1].disabled = true;
  
  $("#editPrintersGr").multipleSelect('refresh');
  
  for(let i = 0; i < selectedGroup.length; i++)
  {
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    
    let name_ = Pmgr.globalState.groups.find(p => p.id == arrayAux[0]).name;
    
    name = (name == "" || name == name_) ? name_ : "<múltiples valores>";
  }
  
  input[2].children[0].children[1].value = "";
  
  input[2].children[0].children[1].placeholder = name;
  
  document.getElementById('warningEdGr').hidden = true;
});

$("#aliasEdGr").on("change keyup paste", function()
{
  let id = (this.value != this.placeholder) && (Pmgr.globalState.groups.findIndex(gr => gr.name == this.value) != -1);

  document.getElementById('warningEdGr').hidden = !id;
  document.getElementById('confirmarEdGr').disabled = id;
});

  
$("#confirmarEdGr").click(function()
{
  let name = "";
  
  let input = document.getElementById('editGrupo').children[0].children[0].children;
  

  let sel = $("#editPrintersGr").multipleSelect('getSelects');
  let groupSel = [];

  //con map no nos tiene en cuenta que 2 impresoras o 2 grupos tengan el mismo alias!
  for (let i = 0; i < sel.length; i++) {
    const alias = sel[i];
    let aux = Pmgr.globalState.printers.filter(p => p.alias == alias);
    aux.forEach(gr => {
      if(groupSel.length == 0 || groupSel.findIndex(gID => gID == gr.id) < 0)
        groupSel.push(gr.id)
    });
    
  }
  
  let idG = Pmgr.globalState.groups;

  for (let i = 0; i < selectedGroup.length; i++)
  {

    let text = selectedGroup[i].innerText;
    let arrayAux = text.split("\t");
    let group = idG.find(g => g.id == arrayAux[0]);
    
    name = input[2].children[0].children[1].value;
    
    group.name = (name == "" || name == "<múltiples valores>") ? group.name : name;
    
    if(groupSel.length > 0 || selectedGroup.length == 1)
      group.printers = groupSel;

    Pmgr.setGroup(group).then(update);
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
        let id = Pmgr.globalState.jobs.filter(j => j.printer == pr.id);
    
        id.forEach(element => {      
          Pmgr.rmJob(element.id).then(update);
        });
      }
    });
  }

  update();
});

$("#addGroupButton").click(function()
{
  document.getElementById('confirmarAdGr').disabled = true;
  
  document.getElementById('warningAdGr').hidden = true;

  document.getElementById('aliasAdGr').value = "";


});

$("#aliasAdGr").on("change keyup paste", function()
{
  let id = Pmgr.globalState.groups.findIndex(gr => gr.name == this.value) != -1;

  document.getElementById('warningAdGr').hidden = !id;
  document.getElementById('confirmarAdGr').disabled = (this.value == "") || id;
});

$("#confirmarAdGr").click(function(e)
{ 

  let alias = document.getElementById('aliasAdGr').value;
  
  //esto es de una librería que añadimos, como comentamos en el leeme.html
  //que hace las selecciones múltiples mejores
  let printSel = $("#addPrintersGr").multipleSelect('getSelects');
  
  //con map no nos tiene en cuenta que 2 impresoras o 2 grupos tengan el mismo alias!
  let sel = [];

  printSel.forEach(name => {
    let aux = Pmgr.globalState.printers.filter(p => p.alias == name);
    aux.forEach(pr => {
      if(sel.length == 0 || sel.findIndex(pID => pID == pr.id) < 0)
        sel.push(pr.id)
    });
  });
  // ahora contiene IDs

  let pr = new Pmgr.Group(
    0, //no funciona si no le pasas alguna id (aunque te la genera el server)
    alias,
    sel
  ); 

  // actualiza interfaz cuando acabe el update
  Pmgr.addGroup(pr).then(update); 
  $("#addPrintersGr").multipleSelect('setSelects', []);

});

$("#printGroupButton").click(function()
{
  document.getElementById('filePrGr').value = "";
  document.getElementById('warningPrGr').hidden = false;
  document.getElementById('confirmarPrGr').disabled = true;
});

$("#filePrGr").on("change keyup paste", function()
{
  let pdf = endsWith(this.value, ".pdf");

  document.getElementById('warningPrGr').hidden = pdf;
  document.getElementById('confirmarPrGr').disabled = (this.value == "") || !pdf;
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
      0,
      pr.id,
      pr.alias,
      file
    );

    pr.queue.push(job.id);

    if(pr.status == Pmgr.PrinterStates.PAUSED)
      pr.status = Pmgr.PrinterStates.PRINTING;

    document.getElementById('filePrGr').value = "";

    Pmgr.addJob(job).then(update);
  }
});

$("#confirmarElGr").click(function()
{  
  for (let i = 0; i < selectedGroup.length; i++)
  { 
    let text = selectedGroup[i].innerText;
    let arrayAux= text.split("\t");
    
    Pmgr.rmGroup(parseInt(arrayAux[0])).then(update);
  }
  
  //sin un último update, al tener multiple selección, puede actualizarse mal la interfaz
  update();
});

function generar_tabla_grupos()
{

  let myTable= "<table class=table table-bordered mb-0 table-hover display>";

  myTable+= " <thead><tr>";
  myTable+= "<th headers=co-gr-id>ID</th>";
  if(detalleNombreGrupo) myTable+= "<th headers=co-gr-name>Nombre</th>";
  if(detalleImpresoras) myTable+= "<th headers=co-gr-printers>Impresoras</th></tr></thead>";
  myTable+= "<tbody>";

  for (let i = 0; i < Pmgr.globalState.groups.length ; i++) {

    if(filterName != "" && filterName != Pmgr.globalState.groups[i].name)
      continue;

    let esc = (Pmgr.globalState.groups[i].printers == 0) || (!detalleImpresoras);

    let aux = "";

    aux +="<tr><td>" + Pmgr.globalState.groups[i].id + "</td>";  
    if(detalleNombreGrupo) aux +="<td>" + Pmgr.globalState.groups[i].name + "</td>";
    if(detalleImpresoras)
    {

      aux +="<td>";

      
      for(let p = 0; p < Pmgr.globalState.groups[i].printers.length; ++p )
      {
        let auxPr = Pmgr.globalState.groups[i].printers[p];
        let print = Pmgr.globalState.printers.find(element => element.id == auxPr);
        
        if(filterImpresora == "" || filterImpresora == print.alias)
          esc = true;

        if(p < MAX_SHOW_GROUPS)
          aux +=  `<span class="badge badge-pill badge-secondary">${print.alias}</span> `;
      }
      
      if(Pmgr.globalState.groups[i].printers.length > MAX_SHOW_GROUPS)
      {
        aux += `<span class="badge badge-pill badge-secondary">+`;
        aux += Pmgr.globalState.groups[i].printers.length - MAX_SHOW_GROUPS;
        aux += `</span> `;
      }
      aux+="</td>";
    }
    aux+= "</tr>";

    if(esc)
      myTable += aux;
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
    
    let name = Pmgr.globalState.jobs.find(p => p.id == arrayAux[0]).name;

    document.getElementById('nombreCaJ').innerHTML = "el archivo " + name;  //Igual vale para poner los nombres
    document.getElementById('listaCaJo').hidden = true;
  }
  
  else if(selectedJobs.length > 1)
  {  
    let allJobs = "";
    
    selectedJobs.forEach(gr =>
    {    
      let text = gr.innerText;
      let arrayAux= text.split("\t");
    
      let name = Pmgr.globalState.jobs.find(p => p.id == arrayAux[0]).fileName;

      allJobs += `<span class="badge badge-pill badge-secondary">${name}</span>`;
    });
  
    document.getElementById('listaCaJo').innerHTML = allJobs;  //Igual vale para poner los nombres
    document.getElementById('listaCaJo').hidden = false;

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
      Pmgr.rmJob(Pmgr.globalState.jobs[jobID].id).then(update);
    }
  }

  update();

});


function generar_tabla_jobs()
{
  let myTable= "<table class=table table-bordered mb-0 table-hover display>";

  myTable+= " <thead><tr>";
  myTable+= "<th headers=co-job-id>ID</th>";
  
  if(detalleJobImpresora) myTable+= "<th headers=co-job-printer>Impresora</th>";
  if(detalleJobID) myTable+= "<th headers=co-job-prid>ID Impresora</th>";
  //myTable+= "<th headers=co-job-owner>Owner</th>";
  if(detalleJobArchivo) myTable+= "<th headers=co-job-file>Archivo</th></tr></thead>";
  myTable+= "<tbody>";

  for (let i = 0; i < Pmgr.globalState.jobs.length ; i++)
  {
    if(filterImpresoraJob != "" && filterImpresoraJob != Pmgr.globalState.jobs[i].owner)
      continue;
    
    if(filterArchivo != "" && filterArchivo != Pmgr.globalState.jobs[i].fileName)
      continue;
    
    let pr = Pmgr.globalState.printers.find(p => p.id == Pmgr.globalState.jobs[i].printer);
    
    myTable+="<tr>";
    myTable+="<td>" + Pmgr.globalState.jobs[i].id + "</td>";
    if(detalleJobImpresora) myTable+="<td>" + Pmgr.globalState.jobs[i].owner + "</td>";
    if(detalleJobID) myTable+="<td>" + Pmgr.globalState.jobs[i].printer + "</td>";
    //myTable+="<td>" + Pmgr.globalState.jobs[i].owner + "</td>";
    if(detalleJobArchivo)myTable+="<td>" + Pmgr.globalState.jobs[i].fileName + "</td>";
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
      let ID_ = 0;
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

$("#searchtermPrint").on("change paste keyup", function()
{
  filterAlias = this.value;

  update();
});

$("#searchtermGroup").on("change paste keyup", function()
{
  filterName = this.value;

  update();
});

$("#searchtermJob").on("change paste keyup", function()
{
  filterArchivo = this.value;

  update();
});

$("#filterPrErase").click(function(e)
{
  filterAlias = filterGrupo = filterModelo = filterEstado = filterLocalizacion = filterIP = "";

  let aux = document.getElementById("confirmarFilterPr").parentNode.parentNode.children;
  aux[1].children[0].children[1].value = aux[3].children[0].children[1].value = aux[4].children[0].children[1].value = aux[5].children[0].children[1].value = aux[6].children[0].children[1].value = "";
  
  $("#filterGroupsPr").multipleSelect('setSelects', []);
  $("#filterGroupsPr").multipleSelect('refresh');
  
  document.getElementById("searchtermPrint").disabled = false;
  document.getElementById("searchtermPrint").value = "";

  update();
});

$("#filterGrErase").click(function(e)
{
  filterName = filterImpresora = "";

  let aux = document.getElementById("confirmarFilterGr").parentNode.parentNode.children;
  aux[1].children[0].children[1].value = "";
  
  $("#filterPrintersGr").multipleSelect('setSelects', []);
  $("#filterPrintersGr").multipleSelect('refresh');

  document.getElementById("searchtermGroup").disabled = false;
  document.getElementById("searchtermGroup").value = "";

  update();
});

$("#filterJoErase").click(function(e)
{
  filterArchivo = filterImpresoraJob = "";

  let aux = document.getElementById("confirmarFilterJo").parentNode.parentNode.children;
  aux[2].children[0].children[1].value = "";
  
  $("#filterPrintersJo").multipleSelect('setSelects', []);
  $("#filterPrintersJo").multipleSelect('refresh');

  document.getElementById("searchtermJobs").disabled = false;
  document.getElementById("searchtermJobs").value = "";

  update();
});

$("#filterPrButton").click(function(e)
{
  document.getElementById("confirmarFilterPr").parentNode.parentNode.children[1].children[0].children[1].value = filterAlias;
});

$("#filterGrButton").click(function(e)
{
  document.getElementById("confirmarFilterGr").parentNode.parentNode.children[1].children[0].children[1].value = filterName;
});

$("#filterJoButton").click(function(e)
{
  document.getElementById("confirmarFilterJo").parentNode.parentNode.children[2].children[0].children[1].value = filterArchivo;
});

$("#confirmarFilterPr").click(function(e)
{
  let input = this.parentNode.parentNode.children;

  filterAlias = input[1].children[0].children[1].value;

  let sel = $("#filterGroupsPr").multipleSelect('getSelects');
  if(sel.length == 0)
    filterGrupo = "";
  else
    filterGrupo = sel[0];

  filterModelo = input[3].children[0].children[1].value;
  filterEstado = input[4].children[0].children[1].value
  filterLocalizacion = input[5].children[0].children[1].value;
  filterIP = input[6].children[0].children[1].value;

  if(filterAlias == "" && filterGrupo == "" && filterModelo == "" && filterEstado == "" && filterModelo == "" && filterLocalizacion == "" && filterIP == "")
  {
    document.getElementById("searchtermPrint").disabled = false;
    document.getElementById("searchtermPrint").value = "";
  }
  else
  {
    document.getElementById("searchtermPrint").disabled = true;
    document.getElementById("searchtermPrint").value = "Usando filtros avanzados";
  }

  update();
});


$("#confirmarFilterGr").click(function()
{  
  let input = this.parentNode.parentNode.children;

  filterName = input[1].children[0].children[1].value;

  let sel = $("#filterPrintersGr").multipleSelect('getSelects');
  if(sel.length == 0)
    filterImpresora = "";
  else
    filterImpresora = sel[0];
    

  if(filterName == "" && filterImpresora == "")
  {
    document.getElementById("searchtermGroup").disabled = false;
    document.getElementById("searchtermGroup").value = "";
  }
  else
  {
    document.getElementById("searchtermGroup").disabled = true;
    document.getElementById("searchtermGroup").value = "Usando filtros avanzados";
  }

  update();
});


$("#confirmarFilterJo").click(function()
{  
  let input = this.parentNode.parentNode.children;

  filterArchivo = input[2].children[0].children[1].value;

  let sel = $("#filterPrintersJo").multipleSelect('getSelects');
  if(sel.length == 0)
    filterImpresoraJob = "";
  else
    filterImpresoraJob = sel[0];
    

  if(filterArchivo == "" && filterImpresoraJob == "")
  {
    document.getElementById("searchtermJobs").disabled = false;
    document.getElementById("searchtermJobs").value = "";
  }
  else
  {
    document.getElementById("searchtermJobs").disabled = true;
    document.getElementById("searchtermJobs").value = "Usando filtros avanzados";
  }
  

  update();
});

//
// PARTE 2:
// Código de pegamento, ejecutado sólo una vez que la interfaz esté cargada.
// Generalmente de la forma $("selector").cosaQueSucede(...)
//add
function update(result) {
  try {
    // vaciamos un contenedor
    //$("#accordionExample").empty();
    // y lo volvemos a rellenar con su nuevo contenido
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







