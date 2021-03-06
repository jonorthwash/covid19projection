
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

function updatePinnedDate(date) {
	var newDate = new moment(date).format("YYYY-MM-DD")
	$("body").data("pinnedDate", date);
	$("#pinnedDate").val(newDate);
}

function getCurrentNumberOfInfections(data, date) {
	var header = data[0];
	var data = data.slice(1,);

	var dateIdx = header.findIndex(function (x){return x=="date"});
	var casesIdx = header.findIndex(function (x){return x=="reported total cases"});
	var curCases = 0;
	//console.log(header, casesIdx);
	//console.log(data.slice(1,), data.length);
	for (row in data) {
		//console.log(row, data[row],moment(data[row][dateIdx]).diff(pinnedDate, 'days'));
		if (Math.abs(moment(data[row][dateIdx]).diff(date, 'days')) < 1) {
			//console.log(data[row])
			curCases = data[row][casesIdx];
		}
	}
	//console.log(latestRow[casesIdx]);
	//return latestRow[casesIdx];
	return curCases ;
}

function setLatestDate(){
	var data = $("body").data("data");
	var latestRow = data[Object.keys(data).pop()];
	var dateIdx = data[0].findIndex(function (x){return x=="date"});
	//var currentInfectionRow = latestRow;
	$("#pinnedDate").val(moment(latestRow[dateIdx]).format("YYYY-MM-DD"));
}

function getDaysSinceFirstInfection(data) {
	var header = data[0];
	var dateIdx = header.findIndex(function (x){return x=="date"});
	//var latestRow = data[Object.keys(data).pop()];
	var firstInfectionRow = data[1];
	//var currentInfectionRow = latestRow;
	//console.log(currentInfectionRow);
	var firstInfectionDate = new moment(new Date(firstInfectionRow[dateIdx]));
	//var currentInfectionDate = new Date(currentInfectionRow[dateIdx]);
	var currentInfectionDate = new moment($("#pinnedDate").val());
	//console.log(firstInfectionRow[dateIdx], currentInfectionRow[dateIdx]);
	//console.log(firstInfectionDate.toUTCString(), currentInfectionDate.toUTCString());
	//var numDays = Math.round((currentInfectionDate - firstInfectionDate) / (1000 * 3600 * 24));
	//console.log(firstInfectionDate, currentInfectionDate);
	var numDays = currentInfectionDate.diff(firstInfectionDate, 'days')
	//console.log(numDays);
	return numDays
}

function makeDataObject (data, currentStdevsFromMean, latestDate) {
	var header = data[0];
	var dateIdx = header.findIndex(function (x){return x=="date"});
	//var beginDate = new Date(data[1][dateIdx]);
	var beginDate = new moment(data[1][dateIdx]);
	//var endDate = new Date($("#lastViewDate").val());  // 05 = June
	var endDate = new moment($("#lastViewDate").val());  // 05 = June
	//var endDate = new Date(2020, 03, 10);  // 05 = June
	//console.log(endDate);
	//console.log(latestDate);
	//latestDate = new Date(latestDate);
	latestDate = new moment(latestDate);
	//if (endDate.getTime() < latestDate.getTime()) {
	if (endDate < latestDate) {
		//endDate = new Date(latestDate);
		endDate = Object.assign({}, latestDate);
	}
	//console.log(beginDate, endDate, latestDate);
	var dates = [] ;
	var dateData = {date: null, stdevFromMean: null, proportionOfMaxDailyInfectionsAtPeak: null, natLogOfRate: null, newHospitalisations: null, peopleInHospital: null, cumulativeHospitalisations: null, hospitalBedsInUse: null}
	//console.log(endDate);
	var currentDate = new moment(beginDate);  // gotta copy the variable or it screws things up
	//console.log(currentDate);
	while (currentDate <= endDate) {
		var thisDateData = Object.assign({}, dateData) ; // copy object
		//thisDateData.date = new Date(currentDate) ;
		thisDateData.date = Object.assign({}, new moment(currentDate.format())) ;
		//console.log(currentDate);
		//console.log(thisDateData.date.toUTCString());
		//if (currentDate.getTime() == latestDate.getTime()) {
		if (currentDate == latestDate) {
			thisDateData.stdevFromMean = currentStdevsFromMean;
		}
		//between.push(new Date(currentDate));
		dates.push(thisDateData);
		//console.log(currentDate.getDate());
		//var nextDate = new moment(moment(currentDate).add(1, 'days').format());
		//console.log("NEXTDATE", nextDate);
		//var nextDate = new Date((currentDate.getTime() + (1 * (1000 * 3600 * 24))))
		//console.log(currentDate, "nextDate", nextDate);
		//console.log(currentDate.toUTCString());
		//currentDate.setUTCDate(currentDate.getUTCDate() + 1);
		//console.log(currentDate.toUTCString());
		//currentDate = Object.assign({}, nextDate);
		currentDate = new moment(moment(currentDate).add(1, 'days').format());
		//console.log(currentDate);
	}
	//console.log(dates)
	return dates
}

function getNumberOfHospitalisations(data, currentStdevsFromMean, maxHospitalisationsPerDay, totalHospitalisationsPlusEfficacyOffset) {
	//$.each(data, function(index, element) {
	//	console.log(index, element);
	//});
	//console.log(data);
	var header = data[0];
	var dateIdx = header.findIndex(function (x){return x=="date"});
	//var todaysDate = new moment(data[Object.keys(data).pop()][dateIdx]);
	var todaysDate = new moment($("#pinnedDate").val());

	var hospitalisationDuration = $("#hospitalisationDuration").val() ;
	var daysPerStdev = $("#daysPerStdev").val() ;

	dates = makeDataObject(data, currentStdevsFromMean, todaysDate);

	$.each(dates, function(index, element) {
		//if (element.date.getTime() !== todaysDate.getTime()) {
		if (element.date !== todaysDate) {
			//console.log(element.date);
			diffDays = moment(element.date).diff(todaysDate, 'days');
			//diffDays = Math.round( (element.date - todaysDate) / (1000 * 3600 * 24) ) ;
			//console.log(diffDays)
			element.stdevFromMean = currentStdevsFromMean + ( diffDays *(1/daysPerStdev) ) ;
		}

		element.proportionOfMaxDailyInfectionsAtPeak = Math.exp(-(Math.pow(element.stdevFromMean,2))/2)
		element.natLogOfRate = Math.log(element.proportionOfMaxDailyInfectionsAtPeak);
		element.newHospitalisations = element.proportionOfMaxDailyInfectionsAtPeak * maxHospitalisationsPerDay ;

		//console.log(hospitalisationDuration,dates);
		var daysAgo = dates.filter(obj => {
			//return obj.date.getTime() == element.date-hospitalisationDuration*(1000*3600*24)
			//return obj.date == new moment(element.date).subtract(hospitalisationDuration, 'days'); //*(1000*3600*24)
			comparisonDate = new moment(element.date).subtract(hospitalisationDuration, 'days'); //*(1000*3600*24)
			//console.log(obj.date, comparisonDate);
			return Math.abs(moment(obj.date).diff(new Date(new moment(element.date).subtract(hospitalisationDuration, 'days')), 'days')) < 1; //*(1000*3600*24)
		})
		//console.log(daysAgo);
		if (0 in daysAgo) {  // make sure we're not too early
			//console.log(element.date.toUTCString(), daysAgo[0].date.toUTCString());
			preHospitalisationNatLogOfRate = daysAgo[0].natLogOfRate ;
			//console.log("HARGLE", preHospitalisationNatLogOfRate) ;
			element.peopleInHospital = hospitalisationDuration * Math.exp((element.natLogOfRate + preHospitalisationNatLogOfRate)/2) * maxHospitalisationsPerDay
			//var peopleInHospitalPerDay = hospitalisationDuration * Math.exp((natLogOfRate + preHospitalisationNatLogOfRate)/2) * maxHospitalisationsPerDay ;
		}

		// a more accurate (and slightly less conservative) way to calculate
		element.cumulativeHospitalisations = ((1+erf(element.stdevFromMean/Math.sqrt(2)))/2)*totalHospitalisationsPlusEfficacyOffset ;
		if (0 in daysAgo) {
			element.hospitalBedsInUse = element.cumulativeHospitalisations - daysAgo[0].cumulativeHospitalisations ;
		}

	});

	//console.log(dates);
	return dates;
}

function getDataWithProjection(data, curHospitalisations) {
	var algorithm = $("#algorithm").val()
	var outputArray = [];
	outputArray.push(data[0].slice()) ; //$.extend(true, {}, data[0]); // copy header
	//var maxColNum = Number(Object.keys(outputArray[0]).reduce((a,b) => outputArray[0][a] > outputArray[0][b] ? a : b ));
	//console.log(outputArray);
	//outputArray[0][maxColNum+1] = 'projected hospitalisations'; // add column
	outputArray[0].push('total cases days to double');
	outputArray[0].push('projected hospital bed use');
	//console.log(curHospitalisations);
	var newCasesIdx = outputArray[0].findIndex(function (x){return x=="reported new cases"});
	var totalCasesIdx = outputArray[0].findIndex(function (x){return x=="reported total cases"});

	$.each(curHospitalisations, function(index, element) {
		var thisRow = [];
		//console.log(data);
		var correspondingData = data.filter(obj => {
			//console.log(obj[0]);
			var newDate = new moment(new Date(obj[0]));
			//var newDate = moment(obj[0]);
			//return newDate.getTime() == element.date.getTime()
			//console.log(element.date);
			var testDate = new moment(element.date);
			//console.log(newDate, testDate);
			//return newDate == element.date
			//console.log(newDate, testDate, newDate.getTime(), testDate.getTime());
			//console.log(newDate.diff(testDate, 'days'));
			//if (newDate === testDate) {
			//	console.log(newDate, testDate);
			//}
			//return newDate == testDate
			return (Math.abs(newDate.diff(testDate, 'days')) < 1);
		});
		//console.log(correspondingData);
		//console.log(element.date);
		//thisRow.push(new Date(element.date));
		thisRow.push(element.date);

		if (correspondingData.length !== undefined && correspondingData.length != 0) {
			//console.log(correspondingData[0][1]);
			thisRow.push(correspondingData[0][1]);
			thisRow.push(correspondingData[0][2]);
			thisRow.push(correspondingData[0][3]);
			thisRow.push(correspondingData[0][4]);

			//console.log("correspondingData", correspondingData);
			if (correspondingData[0][newCasesIdx] != 0 ) {
				var daysToDouble = (correspondingData[0][totalCasesIdx] - correspondingData[0][newCasesIdx]) / correspondingData[0][newCasesIdx] ;
				//console.log(daysToDouble);
				thisRow.push(daysToDouble);
			} else {
				thisRow.push(null);
			}
		} else {
			thisRow.push(null, null, null, null, null);
		}
		if (algorithm == 0) { // old algorithm
			thisRow.push(element.peopleInHospital);
		} else { // new algorithm, even if undefined
			thisRow.push(element.hospitalBedsInUse);
		}
		console.log(thisRow);
		//console.log(element);
		outputArray.push(thisRow);
	});
	//console.log(outputArray);
	return outputArray;
}

function reloadData() {
	dataSource = $("#dataSource").val();
	//console.log(dataSource);
	$.get(dataSource, function(csvString) {
		// transform the CSV string into a 2-dimensional array
		var arrayData = $.csv.toArrays(csvString, {onParseValue: $.csv.hooks.castToScalar});
		$("body").data("data", arrayData);
		setLatestDate();
		updateMath();
	});
}

function updateMath() {
	var dataArray = $("body").data("data");
	//console.log(dataArray);
	var population = $("#population").val() ;
	var infectionsPerCapita = $("#infectionsPerCapita").val() ;
	var hospitalisationsPerInfection = Number($("#hospitalisationsPerInfection").val()) ;
	var testingEfficacy = $("#testingEfficacy").val()


	var totalInfections = population * infectionsPerCapita ;
	var maxHospitalisationsPerDay = getMaxHospitalisationsPerDay(totalInfections, hospitalisationsPerInfection);
	var totalHospitalisations = totalInfections * hospitalisationsPerInfection ;


	var oldPinnedDate = $("body").data("pinnedDate");
	var pinnedDate = new moment($("#pinnedDate").val());	
	$("body").data("pinnedDate", pinnedDate);

	var currentNumberOfInfections = getCurrentNumberOfInfections(dataArray, pinnedDate) ;
	if (currentNumberOfInfections == undefined || currentNumberOfInfections == 0) {
		//var latestRow = data[Object.keys(data).pop()];
		//curCases = latestRow[casesIdx];
		//console.log(oldPinnedDate,pinnedDate);
		pinnedDate = Object.assign({}, oldPinnedDate);
		updatePinnedDate(pinnedDate) ;
		currentNumberOfInfections = getCurrentNumberOfInfections(dataArray, pinnedDate) ;
	}

	//var efficacyOffset = (testingEfficacy / 100) * (totalInfections - totalHospitalisations) ;
	var efficacyOffset = (((1-hospitalisationsPerInfection)/100)*testingEfficacy)
	var efficacyFactor = (hospitalisationsPerInfection/(hospitalisationsPerInfection+efficacyOffset))
	// normsinv is cumulative standardized normal distribution
	var currentStdevsFromMean = NormSInv((currentNumberOfInfections * efficacyFactor) / totalHospitalisations) ;
	//console.log(currentNumberOfInfections, totalHospitalisations, hospitalisationsPerInfection, efficacyOffset, efficacyFactor);

	var daysSinceFirstInfection = getDaysSinceFirstInfection(dataArray) ;
	//console.log(currentNumberOfInfections, daysSinceFirstInfection, totalHospitalisations, currentStdevsFromMean);

	$("#maxHospitalisationsPerDay").val(Math.round(maxHospitalisationsPerDay));
	$("#totalInfections").val( Math.round(totalInfections) );
	$("#totalHospitalisations").val( Math.round(totalHospitalisations) );
	$("#currentNumberOfInfections").val( currentNumberOfInfections );
	$("#daysSinceFirstInfection").val( daysSinceFirstInfection );

	curHospitalisations = getNumberOfHospitalisations(dataArray, currentStdevsFromMean, maxHospitalisationsPerDay, totalHospitalisations);
	//console.log(curHospitalisations);

	dataWithProjection = getDataWithProjection(dataArray, curHospitalisations);
	//console.log(dataWithProjection);
	$("body").data("datawithprojection", dataWithProjection);

	drawVisualization();

}

function setMunicipality () {
	currentMun = $("#municipality").val();

	mundata = $("body").data("municipalities");
	$("#municipality").empty();
	for(munId in mundata) {
		if (munId == currentMun) {
			selected = true;
		} else {
			selected = false;
		}
		$("#municipality").append(
			$("<option></option>")
				.attr("value", munId)
				.attr("selected", selected)
				.text(mundata[munId]["name"])
		);
	}

	$("#population").val(mundata[currentMun]["population"]);
	$("#hospitalBeds").val(mundata[currentMun]["hospital beds"]);

	$("#dataSource").empty();

	for(dataSource in mundata[currentMun]["data sources"]) {
		$("#dataSource").append(
			$("<option></option>")
				.attr("value", mundata[currentMun]["data sources"][dataSource])
				.text(dataSource)
		);
	}

	TITLE = "COVID-19 in "+mundata[currentMun]["name"] ;

	reloadData();
	updateMath();

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
