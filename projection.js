
//var hospitalisationsPerInfection = 0.2 ;
//var hospitalisationDuration = 9 ;  // days
//var infectionsPerCapita = 0.4 ;
//var daysPerStdev = 14 ;
//var currentCases = 54 ;

function getMaxHospitalisationsPerDay(totalInfections, hospitalisationsPerInfection) {
	halfOfAllInfections = totalInfections / 2 ; // number of infections in 1.34 stdev around peak
	rateOfCasesPerStdev = halfOfAllInfections / 1.34 ;  // across 1.34 interval
	maxCasesPerStdev =  rateOfCasesPerStdev / 0.95 ;
	maxCasesPerDay = maxCasesPerStdev / $("#daysPerStdev").val();
	maxHospitalisationsPerDay = maxCasesPerDay * hospitalisationsPerInfection;
	return maxHospitalisationsPerDay ;
}

function getCurrentNumberOfInfections(data) {
	var header = data[0];
	var casesIdx = header.findIndex(function (x){return x=="total cases"});
	//console.log(header, casesIdx);
	var latestRow = data[Object.keys(data).pop()];
	//console.log(latestRow[casesIdx]);
	return latestRow[casesIdx];
}

function getDaysSinceFirstInfection(data) {
	var header = data[0];
	var dateIdx = header.findIndex(function (x){return x=="date"});
	var latestRow = data[Object.keys(data).pop()];
	var firstInfectionRow = data[1];
	var currentInfectionRow = latestRow;
	// console.log(currentInfectionRow);
	var firstInfectionDate = firstInfectionRow[dateIdx];
	var currentInfectionDate = currentInfectionRow[dateIdx];
	// console.log(firstInfectionDate, currentInfectionDate);
	var numDays = Math.round((currentInfectionDate - firstInfectionDate) / (1000 * 3600 * 24));
	return numDays
}

function makeDataObject (data, currentStdevsFromMean, latestDate) {
	var header = data[0];
	var dateIdx = header.findIndex(function (x){return x=="date"});
	var beginDate = data[1][dateIdx];
	var endDate = new Date($("#lastViewDate").val());  // 05 = June
	//var endDate = new Date(2020, 03, 10);  // 05 = June
	//console.log(endDate);
	//console.log(latestDate);
	latestDate = new Date(latestDate);
	if (endDate.getTime() < latestDate.getTime()) {
		endDate = new Date(latestDate);
	}
	var dates = [] ;
	var dateData = {date: null, stdevFromMean: null, proportionOfMaxDailyInfectionsAtPeak: null, natLogOfRate: null, newHospitalisations: null, peopleInHospital: null}
	//console.log(endDate);
	currentDate = new Date(beginDate);  // gotta copy the variable or it screws things up
	//console.log(currentDate);
	while (currentDate <= endDate) {
		var thisDateData = Object.assign({}, dateData) ; // copy object
		thisDateData.date = new Date(currentDate) ;
		if (currentDate.getTime() == latestDate.getTime()) {
			thisDateData.stdevFromMean = currentStdevsFromMean;
		}
		//between.push(new Date(currentDate));
		dates.push(thisDateData);
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return dates
}

function getNumberOfHospitalisations(data, currentStdevsFromMean, maxHospitalisationsPerDay) {
	//$.each(data, function(index, element) {
	//	console.log(index, element);
	//});

	//console.log(data);
	var header = data[0];
	var dateIdx = header.findIndex(function (x){return x=="date"});
	var todaysDate = new Date(data[Object.keys(data).pop()][dateIdx]);

	var hospitalisationDuration = $("#hospitalisationDuration").val() ;
	var daysPerStdev = $("#daysPerStdev").val() ;

	dates = makeDataObject(data, currentStdevsFromMean, todaysDate);

	$.each(dates, function(index, element) {
		if (element.date.getTime() !== todaysDate.getTime()) {
			diffDays = Math.round( (element.date - todaysDate) / (1000 * 3600 * 24) ) ;
			//console.log(diffDays)
			element.stdevFromMean = currentStdevsFromMean + ( diffDays *(1/daysPerStdev) ) ;
		}

		element.proportionOfMaxDailyInfectionsAtPeak = Math.exp(-(Math.pow(element.stdevFromMean,2))/2)
		element.natLogOfRate = Math.log(element.proportionOfMaxDailyInfectionsAtPeak);
		element.newHospitalisations = element.proportionOfMaxDailyInfectionsAtPeak * maxHospitalisationsPerDay ;

		var daysAgo = dates.filter(obj => {
			return obj.date.getTime() == element.date-hospitalisationDuration*(1000*3600*24)
		})
		//console.log(element.date, daysAgo);
		//console.log(daysAgo[0]);
		if (0 in daysAgo) {  // make sure we're not too early
			preHospitalisationNatLogOfRate = daysAgo[0].natLogOfRate ;
			//console.log("HARGLE", preHospitalisationNatLogOfRate) ;
			element.peopleInHospital = hospitalisationDuration * Math.exp((element.natLogOfRate + preHospitalisationNatLogOfRate)/2) * maxHospitalisationsPerDay
			//var peopleInHospitalPerDay = hospitalisationDuration * Math.exp((natLogOfRate + preHospitalisationNatLogOfRate)/2) * maxHospitalisationsPerDay ;
		}
	});

	//console.log(dates);
	return dates;
}

function getDataWithProjection(data, curHospitalisations) {
	var outputArray = []
	outputArray.push(data[0].slice()) ; //$.extend(true, {}, data[0]); // copy header
	//var maxColNum = Number(Object.keys(outputArray[0]).reduce((a,b) => outputArray[0][a] > outputArray[0][b] ? a : b ));
	//console.log(outputArray);
	//outputArray[0][maxColNum+1] = 'projected hospitalisations'; // add column
	outputArray[0].push('projected hospital bed use');
	//console.log(curHospitalisations);
	$.each(curHospitalisations, function(index, element) {
		var thisRow = [];
		//console.log(data);
		var correspondingData = data.filter(obj => {
			var newDate = new Date(obj[0]);
			return newDate.getTime() == element.date.getTime()
		});
		//console.log(correspondingData);
		thisRow.push(element.date);
		if (correspondingData.length !== undefined && correspondingData.length != 0) {
			//console.log(correspondingData);
			thisRow.push(correspondingData[0][1]);
			thisRow.push(correspondingData[0][2]);
			thisRow.push(correspondingData[0][3]);
			thisRow.push(correspondingData[0][4]);
		} else {
			thisRow.push(null, null, null, null);
		}
		thisRow.push(element.peopleInHospital);
		//console.log(thisRow);
		outputArray.push(thisRow);
	});
	//console.log(outputArray);
	return outputArray;
}

function updateMath() {
	var dataArray = $("body").data("data");
	var population = $("#population").val() ;
	var infectionsPerCapita = $("#infectionsPerCapita").val() ;
	var hospitalisationsPerInfection = $("#hospitalisationsPerInfection").val() ;


	var totalInfections = population * infectionsPerCapita ;
	var maxHospitalisationsPerDay = getMaxHospitalisationsPerDay(totalInfections, hospitalisationsPerInfection);
	var totalHospitalisations = totalInfections * hospitalisationsPerInfection ;

	var currentNumberOfInfections = getCurrentNumberOfInfections(dataArray) ;
	var currentStdevsFromMean = NormSInv(currentNumberOfInfections / totalHospitalisations) ;
	console.log(currentNumberOfInfections, totalHospitalisations, currentStdevsFromMean);

	var daysSinceFirstInfection = getDaysSinceFirstInfection(dataArray) ;

	$("#maxHospitalisationsPerDay").val(Math.round(maxHospitalisationsPerDay));
	$("#totalInfections").val( Math.round(totalInfections) );
	$("#totalHospitalisations").val( Math.round(totalHospitalisations) );
	$("#currentNumberOfInfections").val( currentNumberOfInfections );
	$("#daysSinceFirstInfection").val( daysSinceFirstInfection );

	curHospitalisations = getNumberOfHospitalisations(dataArray, currentStdevsFromMean, maxHospitalisationsPerDay);
	//console.log(curHospitalisations);

	dataWithProjection = getDataWithProjection(dataArray, curHospitalisations);
	//console.log(dataWithProjection);
	$("body").data("datawithprojection", dataWithProjection);

	drawVisualization();

}


// The following functions are based on https://stackoverflow.com/a/32060010/5181692

function drawAdditionalHAxis(chart,dataTable){
    var layout = chart.getChartLayoutInterface();
    var chartArea = layout.getChartAreaBoundingBox();

    var svg = chart.getContainer().getElementsByTagName('svg')[0];
    var lastVal = dataTable.getValue(dataTable.getNumberOfRows()-1,1);
    var yLoc = layout.getYLocation(lastVal);
    svg.appendChild(createLine(chartArea.left,yLoc,chartArea.width + chartArea.left,yLoc,'red',1)); // axis line
    svg.appendChild(createText(chartArea.left - 40 ,yLoc + 15,'Arial','13','red', "hospital beds")); // axis label 
}

function createLine(x1, y1, x2, y2, color, w) {
    var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', w);
    line.setAttribute('stroke-dasharray', '3');
    return line;
}

function createText(x, y, fontFamily, fontSize,color,value) {
    var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('font-family', fontFamily);
    text.setAttribute('font-size', fontSize);
    text.setAttribute('fill', color);
    text.innerHTML = value;
    return text;
}

$(document).load( function () {
	lastViewDate.min = new Date().toISOString().split("T")[0];
	//updateMath();
});
