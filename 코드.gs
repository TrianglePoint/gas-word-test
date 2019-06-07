/*
 * First page is index page.
 */
function doGet() {  
  return HtmlService.createHtmlOutputFromFile('index');
}

function getSheetName(){
  return PropertiesService.getScriptProperties().getProperty('sheetName');
}

function setSheetName(sheetName){
  PropertiesService.getScriptProperties().setProperty('sheetName', sheetName)
}

function setWordOption(requestMin, requestMax, requestTestType){
  /*
   * Minimum number of word test.
   */
  PropertiesService.getScriptProperties().setProperty('min', requestMin);
  
  /*
   * Maximum number of word test.
   */
  PropertiesService.getScriptProperties().setProperty('max', requestMax);
  
  /*
   * Order? Random? of word test.
   */
  PropertiesService.getScriptProperties().setProperty('testType', requestTestType);
}

function setListNotKnow(tableChild){
  PropertiesService.getScriptProperties().setProperty('listNotKnow', tableChild);
}

function getListNotKnow(){
  return PropertiesService.getScriptProperties().getProperty('listNotKnow');
}

/*
 * get the html page.
 */
function getPage(requestFileName){
  return HtmlService.createHtmlOutputFromFile(requestFileName).getContent();
}

function getWords(){
  var wordRange = {
    min : PropertiesService.getScriptProperties().getProperty('min'),
    max : PropertiesService.getScriptProperties().getProperty('max')
  };
  
  // Location of number + locationAdd = location of values of word.
  var locationAdd = {
    yomigana: [0, 1],
    kanji: [1, 1],
    hangul: [0, 2]
  };
  var sheet = getSheet(getSheetName());
  var words = [];
  var cells = getCellValues(sheet); // All word list.
  
  for(var col = 0; col < cells[0].length; col+=3){
    for(var row = 0; row < cells.length; row++){
      if(cells[row][col] >= wordRange.min && cells[row][col] <= wordRange.max){
        var word = {
          number: cells[row][col],
          yomigana: cells[row+locationAdd.yomigana[0]][col+locationAdd.yomigana[1]],
          kanji: cells[row+locationAdd.kanji[0]][col+locationAdd.kanji[1]],
          hangul: removeLineBreak(cells[row+locationAdd.hangul[0]][col+locationAdd.hangul[1]]) // Removed lineBreak.
        };
        words.push(word);
      }
    }
  }
  
  words.sort(sortConditionNumber);
  
  return {words : words, testType: PropertiesService.getScriptProperties().getProperty('testType')};
}

// Used words.sort().
function sortConditionNumber(a, b){
  return a.number < b.number ? -1 : a.number > b.number ? 1 : 0;
}

/*
 * Get spreadsheet.
 * used that get the sheet list on index page,
 * and get the word list on select page.
 */
function getSpreadsheet(){
  var url = 'https://docs.google.com/spreadsheets/d/1GCy_XizmsBWEgn6U3aaPzLAZAPs6y2dKZfvLJhuQ2n4/edit?usp=sharing';
  return SpreadsheetApp.openByUrl(url);
}

/*
 * Get the one sheet.
 */
function getSheet(sheetName){
  var spreadsheet = getSpreadsheet();
  
  return spreadsheet.getSheetByName(sheetName);
}

/*
 * Get sheet list. used on index page.
 */
function getSheetList(){
  var spreadsheet = getSpreadsheet();
  var list = spreadsheet.getSheets();
  var sheetNames = [];
  
  for(var i = 0; i < list.length; i++){
    sheetNames.push(list[i].getSheetName());
  }
  
  return sheetNames;
}

function getCellValues(sheet){
  /*
   * Function getDataRange is return the range of cells that exist data.
   */
  var range = sheet.getDataRange();
  
  /*
   * Values of cells.
   */
  return range.getValues();
}

/*
 * Get the word range of requested sheet.
 */
function getWordRange(sheetName){
  var sheet = getSheet(sheetName);

  var values = getCellValues(sheet);
  
  /*
   * Maximum of word number.
   */
  var max = -1;
  
  /*
   * max = maximum number.
   */
  for(var i = 0; i < values.length; i++){
    for(var j = 0; j < values[i].length; j++){
      if(values[i][j] > max){
        max = values[i][j];
      }
    }
  }
  
  return max;
}

// Remove the LineBreak.
function removeLineBreak(str){
  var result = '';
  for(var i = 0; i < str.length; i++){
    if(str[i] != '\n'){
      result += str[i];
    }
  }
  
  return result;
}