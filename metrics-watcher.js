/********************************************************
 * Metrics-Watcher
 *
 * Copyright 2012 Ben Bertola and iovation, Inc.
 *
 * To use this library:
 * 1.  Call addXXX() for each graph you want on your page
 * 2.  Call initGraphs() once to draw the initial graphs
 * 3.  Call updateGraphs(jsonData) with the JSON data from your metrics/servlet as often as you would like your graphs to update.
 *
 *******************************************************/

/**
 * Adds a Gauge type graph to your page.
 * @param divId The id of the div to draw the graph in
 * @param className The class name of your metrics data, from the metrics servlet
 * @param metricName The metric name of your metrics data, from the metrics servlet
 * @param title The user-displayed title of this graph
 */
function addGauge(divId, className, metricName, title){
	var metricInfo = new MetricInfo(divId, className, metricName, null, title, 'gauge');
	graphs.push(metricInfo);
}

/**
 * Adds a Meter type graph to your page.
 * @param divId The id of the div to draw the graph in
 * @param className The class name of your metrics data, from the metrics servlet
 * @param metricName The metric name of your metrics data, from the metrics servlet
 * @param max What the max value target is, used to determine the % width of progress bars for this graph
 * @param title The user-displayed title of this graph
 */
function addMeter(divId, className, metricName, max, title){
	var metricInfo = new MetricInfo(divId, className, metricName, max, title, 'meter');
	graphs.push(metricInfo);
}

/**
 * Add a Counter graph
 * @param divId The id of the div to draw the graph in
 * @param className The class name of your metrics data, from the metrics servlet
 * @param metricName The metric name of your metrics data, from the metrics servlet
 * @param max What the max value target is, used to determine the % width of progress bars for this graph
 * @param title The user-displayed title of this graph
 */
function addCounter(divId, className, metricName, max, title){
	var metricInfo = new MetricInfo(divId, className, metricName, max, title, 'counter');
	graphs.push(metricInfo);
}

/**
 * Add a linked Counter graph.  Linked Counters differ from a plain counter graph in that both the numerator and denominator
 * of a linked counter graph each come from individual Counter Metrics.
 *
 * @param divId The id of the div to draw the graph in
 * @param className The class name of your metrics data, from the metrics servlet
 * @param metricName The metric name of your metrics data, from the metrics servlet
 * @param maxClassName
 * @param maxMetricName
 * @param title The user-displayed title of this graph
 */
function addLinkedCounter(divId, className, metricName, maxClassName, maxMetricName, title) {
	var metricInfo = new MetricInfo(divId, className, metricName, null, title, "counter");
	metricInfo.maxClassName = maxClassName;
	metricInfo.maxMetricName = maxMetricName;

	metricInfo.getMax = function(json) {
		var maxNode = this.getMetricNode(this.maxClassName, this.maxMetricName, json);
		return maxNode["count"];
	};

	graphs.push(metricInfo);
}

/**
 * Add a Timer graph.  This will include a Meter, Timing Info, and a Histogram.
 *
 * @param divId The id of the div to draw the graph in
 * @param className The class name of your metrics data, from the metrics servlet
 * @param metricName The metric name of your metrics data, from the metrics servlet
 * @param max The max target value for the Meter, showing frequency
 * @param title The user-displayed title of this graph
 * @param eventType a name for this event type
 * @param durationMax The max target value for duration
 */
function addTimer(divId, className, metricName, max, title, eventType, durationMax){
	var metricInfo = new MetricInfo(divId, className, metricName, max, title, 'timer');

	metricInfo.getMeterInfo = function() {
		var myDivId = this.divId + " div.timerGraph div.row div.meterGraph";
		var retVal = new MetricInfo(myDivId, this.className, this.metricName, this.max, "Frequency", 'meter');

		retVal.getMetricNode = function(className, metricName, jsonRoot) {
			var classNode = jsonRoot[className];
			if(!classNode){
				return null;
			}
			return classNode[metricName]["rate"];
		};

		return retVal;
	};

	metricInfo.getTimerStatsDivId = function() {
		return "#" + this.divId + " div.timerGraph div.row div.timerStatsGraph";
	};
	metricInfo.getTimerHistogramDivId = function() {
		return "#" + this.divId + " div.timerGraph div.row div.timerHistogram";
	};
	metricInfo.durationMax = durationMax;

	graphs.push(metricInfo);
}

function addCache(divId, className, title) {
	var metricInfo = new MetricInfo(divId, className, null, null, title, "cache");

	metricInfo.getAccuracyInfo = function() {
		var id = divId + " div.cacheGraph div.row div.accuracyGraph";
		var result = new MetricInfo(id, className, null, null, "Accuracy", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["accuracy"];
		};
		return result;
	};
	metricInfo.getEvictionCountInfo = function() {
		var id = divId + " div.cacheGraph div.row div.evictionCountGraph";
		var result = new MetricInfo(id, className, null, null, "Eviction Count", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["eviction-count"];
		};
		return result;
	};
	metricInfo.getHitsInfo = function() {
		var id = divId + " div.cacheGraph div.row div.hitsGraph";
		var result = new MetricInfo(id, className, null, null, "Hits", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["hits"];
		};
		return result;
	};
	metricInfo.getInMemoryHitsInfo = function() {
		var id = divId + " div.cacheGraph div.row div.inMemoryHitsGraph";
		var result = new MetricInfo(id, className, null, null, "In Memory Hits", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["in-memory-hits"];
		};
		return result;
	};
	metricInfo.getInMemoryMissesInfo = function() {
		var id = divId + " div.cacheGraph div.row div.inMemoryMissesGraph";
		var result = new MetricInfo(id, className, null, null, "In Memory Misses", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["in-memory-misses"];
		};
		return result;
	};
	metricInfo.getInMemoryObjectsInfo = function() {
		var id = divId + " div.cacheGraph div.row div.inMemoryObjectsGraph";
		var result = new MetricInfo(id, className, null, null, "In Memory Objects", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["in-memory-objects"];
		};
		return result;
	};
	metricInfo.getMeanGetTimeInfo = function() {
		var id = divId + " div.cacheGraph div.row div.meanGetTimeGraph";
		var result = new MetricInfo(id, className, null, null, "Mean Get Time", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["mean-get-time"];
		};
		return result;
	};
	metricInfo.getMeanSearchTimeInfo = function() {
		var id = divId + " div.cacheGraph div.row div.meanSearchTimeGraph";
		var result = new MetricInfo(id, className, null, null, "Mean Search Time", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["mean-search-time"];
		};
		return result;
	};
	metricInfo.getMissesInfo = function() {
		var id = divId + " div.cacheGraph div.row div.missesGraph";
		var result = new MetricInfo(id, className, null, null, "Misses", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["misses"];
		};
		return result;
	};
	metricInfo.getObjectsInfo = function() {
		var id = divId + " div.cacheGraph div.row div.objectsGraph";
		var result = new MetricInfo(id, className, null, null, "Objects", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["objects"];
		};
		return result;
	};
	metricInfo.getSearchesPerSecondInfo = function() {
		var id = divId + " div.cacheGraph div.row div.searchesPerSecondGraph";
		var result = new MetricInfo(id, className, null, null, "Searches Per Second", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["searches-per-second"];
		};
		return result;
	};
	metricInfo.getWriterQueueSizeInfo = function() {
		var id = divId + " div.cacheGraph div.row div.writerQueueSizeGraph";
		var result = new MetricInfo(id, className, null, null, "Writer Queue Size", "gauge");
		result.getMetricNode = function(className, metricName, jsonRoot) {
			return !jsonRoot[className] ? null : jsonRoot[className]["writer-queue-size"];
		};
		return result;
	};
	graphs.push(metricInfo);
}

/**
 * Initialized each of the graphs that you have added through addXXX() calls, and draws them on the screen for the first time
 */
function initGraphs() {
	//draw all graphs for the first time
	for (var i = 0; i < graphs.length; i++) {
		if (graphs[i].type == "gauge")
			drawGauge(graphs[i]);
		else if (graphs[i].type == "meter")
			drawMeter(graphs[i]);
		else if (graphs[i].type == "counter")
			drawCounter(graphs[i]);
		else if (graphs[i].type == "timer")
			drawTimer(graphs[i]);
		else if (graphs[i].type == "cache")
			drawCache(graphs[i]);
		else
			alert("Unknown meter info type: " + graphs[i].type);
	}
}

/**
 * Update the existing graphs with new data. You can call this method as frequently as you would
 * like to, and all graph info will be updated.
 *
 * @param json The root of the json node returned from your ajax call to the metrics servlet
 */
function updateGraphs(json) {
	//draw all graphs for the first time
	for (var i = 0; i < graphs.length; i++) {
		if (graphs[i].type == "gauge")
			updateGauge(graphs[i], json);
		else if (graphs[i].type == "meter")
			updateMeter(graphs[i], json);
		else if (graphs[i].type == "counter")
			updateCounter(graphs[i], json);
		else if (graphs[i].type == "timer")
			updateTimer(graphs[i], json);
		else if (graphs[i].type == "cache")
			updateCache(graphs[i], json);
		else
			alert("Unknown meter info type: " + graphs[i].type);
	}
}

/********************************
 * Internal Methods
 *******************************/
var graphs = new Array();

function MetricInfo(divId, className, metricName, max, title, type) {
	this.divId = divId;
	this.className = className;
	this.metricName = metricName;
	this.max = max;
	this.title = title;
	this.type = type;

	this.getMax = function(json) {
		return this.max;
	};

	this.getMetricNode = function getMetricNode(className, metricName, jsonRoot) {
		var classNode = jsonRoot[className];
		if (!classNode) {
			return null;
		}
		return classNode[metricName];
	};
}

function calculatePercentage(currentVal, maxVal) {
	var p = (currentVal / maxVal) * 100;
	return p.toFixed(0);
}

function formatNumber(varNumber) {
	return varNumber.toFixed(1);
}

function showMeters() {
	alert(JSON.stringify(graphs));
}

/**********************
 * Counter specific methods
 **********************/
function drawCounter(counterInfo) {
	var parentDiv = $("#" + counterInfo.divId);
	var html = "<div class='counterGraph'><h3>" + counterInfo.title + "</h3><div class='progress'><div class='bar' style='width: 0%;'></div></div></div>";
	parentDiv.html(html);
}

function updateCounter(counterInfo, json) {
	var metricData = counterInfo.getMetricNode(counterInfo.className, counterInfo.metricName, json);
	var pct = calculatePercentage(metricData["count"], counterInfo.getMax(json));

	$("#" + counterInfo.divId + " div.progress div.bar").css("width", pct + "%");
	$("#" + counterInfo.divId + " div.progress div.bar").html(metricData["count"] + "/" + counterInfo.getMax(json));
}

/**********************
 * Timer specific methods
 **********************/
function drawTimer(timerInfo) {
	var parentDiv = $("#" + timerInfo.divId);

	// set up the parent container
	var html = "<div class='timerGraph'><h1>" + timerInfo.title + "</h1><div class='row'>"
			+ "<div class='span4 meterGraph'>meter graph</div>"
			+ "<div class='span4 timerStatsGraph'>timer graph</div>"
			+ "<div class='span4 timerHistogram'>timer histogram</div></div></div>";
	parentDiv.html(html);

	// now draw the children
	drawMeter(timerInfo.getMeterInfo());

	drawDurationStats(timerInfo);
	drawDurationHistogram(timerInfo);
}

function drawDurationStats(timerInfo) {
	var html = "<h3>Recent Duration</h3><p></p><div class='metricGraph'><table class='progressTable'>"
		+ addMeterRow("Min", "min")
		+ addMeterRow("Mean", "mean")
		+ addMeterRow("Median", "median")
		+ addMeterRow("Max", "max")
		+ addMeterRow("Std Dev", "std_dev")
		+ "</table></div>";
	var parentDiv = $(timerInfo.getTimerStatsDivId());
	parentDiv.html(html);
}

function drawDurationHistogram(timerInfo) {
	var html = "<h3>Histogram</h3><p></p><div class='metricGraph'><table class='progressTable'>"
		+ addMeterRow("99.9%", "p999")
		+ addMeterRow("99%", "p99")
		+ addMeterRow("98%", "p98")
		+ addMeterRow("95%", "p95")
		+ addMeterRow("75%", "p75")
		+ "</table></div>";
	var parentDiv = $(timerInfo.getTimerHistogramDivId());
	parentDiv.html(html);
}

function updateTimer(timerInfo, json) {
	//update the meter info for the meter
	updateMeter(timerInfo.getMeterInfo(), json);
	updateDurationStats(timerInfo, json);
	updateDurationHistogram(timerInfo, json);
}

function updateDurationStats(timerInfo, json) {
	//get data node
	var metricData = timerInfo.getMetricNode(timerInfo.className, timerInfo.metricName, json)["duration"];

	var timeUnitDiv = $(timerInfo.getTimerStatsDivId() + " p");
	timeUnitDiv.html("(" + metricData["unit"] + ")");

	updateDuration(timerInfo.getTimerStatsDivId(), metricData, "min", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerStatsDivId(), metricData, "mean", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerStatsDivId(), metricData, "median", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerStatsDivId(), metricData, "max", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerStatsDivId(), metricData, "std_dev", timerInfo.durationMax);
}

function updateDuration(timerStatsDivId, durationData, style, max) {
	$(timerStatsDivId + " tr." + style + " td.progressValue").html(formatNumber(durationData[style]));
	$(timerStatsDivId + " tr." + style + " td.progressBar div.progress div.bar").css("width", calculatePercentage(durationData[style], max) + "%");
}

function updateDurationHistogram(timerInfo, json) {
	var metricData = timerInfo.getMetricNode(timerInfo.className, timerInfo.metricName, json)["duration"];

	updateDuration(timerInfo.getTimerHistogramDivId(), metricData, "p999", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerHistogramDivId(), metricData, "p99", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerHistogramDivId(), metricData, "p98", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerHistogramDivId(), metricData, "p95", timerInfo.durationMax);
	updateDuration(timerInfo.getTimerHistogramDivId(), metricData, "p75", timerInfo.durationMax);
}

/************************************************
 * Meter specific methods
 ***********************************************/

/**
 * Draws a meter for the first time.
 * @param meterInfo
 */
function drawMeter(meterInfo){
	var parentDiv = $("#" + meterInfo.divId);

	var html = "<div class='metricGraph'><h3>" + meterInfo.title + "</h3><h1></h1><p></p><table class='progressTable'>"
		+ addMeterRow("1 min", "onemin")
		+ addMeterRow("5 min", "fivemin")
		+ addMeterRow("15 min", "fifteenmin")
		+ addMeterRow("Mean", "mean")
		+ "</table></div>";
	parentDiv.html(html);
}

function addMeterRow(type, className) {
	return "<tr class='" + className + "'><td class='progressLabel'>" + type + "</td>"
		+ "<td class='progressBar'><div class='progress'><div class='bar' style='width: 0%;'></div>"
		+ "</div></td><td class='progressValue'>0</td></tr>";
}

function updateMeter(meterInfo, json) {
	var metricData = meterInfo.getMetricNode(meterInfo.className, meterInfo.metricName, json);
	if (metricData) {
		updateMeterData(meterInfo, metricData);
	}
}

function updateMeterData(meterInfo, meterData) {
	// set the big counter
	var gaugeDiv = $("#" + meterInfo.divId + " h1");
	gaugeDiv.html(formatNumber(meterData["m1"]));

	// and the {whats}/{time unit} value
	var eventType = meterInfo.eventType;
	if (!eventType) {
		eventType = meterData["event_type"];
	}

	var dispVal = eventType + "/" + meterData["unit"] + " (1 min)<br/>" + meterData["count"] + " Total";
	$("#" + meterInfo.divId + " p").html(dispVal);

	//set the mean count
	setMeterRow(meterInfo, meterData, "mean", "mean");
	setMeterRow(meterInfo, meterData, "m1", "onemin");
	setMeterRow(meterInfo, meterData, "m5", "fivemin");
	setMeterRow(meterInfo, meterData, "m15", "fifteenmin");
}

function setMeterRow(meterInfo, meterData, rowType, rowStyle) {
	$("#" + meterInfo.divId + " tr." + rowStyle + " td.progressValue").html(formatNumber(meterData[rowType]));
	$("#" + meterInfo.divId + " tr." + rowStyle + " td.progressBar div.progress div.bar").css("width", calculatePercentage(meterData[rowType], meterInfo.max) + "%");
}

/************************************************
 * Gauge specific methods
 ***********************************************/

/**
 * Draws a gauge for the first time.
 * @param gaugeInfo
 */
function drawGauge(gaugeInfo) {
	var parentDiv = $("#" + gaugeInfo.divId);
	var html = "<div class='metricGraph'><h3>" + gaugeInfo.title + "</h3><h1></h1>";
	parentDiv.html(html);
}

function updateGauge(gaugeInfo, json) {
	var metricData = gaugeInfo.getMetricNode(gaugeInfo.className, gaugeInfo.metricName, json);
	if (metricData) {
		updateGaugeData(gaugeInfo, metricData);
	}
}

function updateGaugeData(gaugeInfo, gaugeData) {
	var gaugeDiv = $("#" + gaugeInfo.divId + " h1");
	gaugeDiv.html(gaugeData["value"]);
}

/**********************
 * Cache specific methods
 **********************/
function drawCache(cacheInfo) {
	var parentDiv = $("#" + cacheInfo.divId);

	//set up the parent container
	var html = "<div class='cacheGraph'><h1>" + cacheInfo.title + "</h1><div class='row'>"
			+ "<div class='span2 accuracyGraph'>accuracy</div>"
			+ "<div class='span2 evictionCountGraph'></div>"
			+ "<div class='span2 hitsGraph'>hits</div>"
			+ "<div class='span2 inMemoryHitsGraph'>in-memory-hits</div>"
			+ "<div class='span2 inMemoryMissesGraph'>in-memory-misses</div>"
			+ "</div><div class='row'>"
			+ "<div class='span2 inMemoryObjectsGraph'>in-memory-objects</div>"
			+ "<div class='span2 meanGetTimeGraph'>mean-get-time</div>"
			+ "<div class='span2 meanSearchTimeGraph'>mean-search-time</div>"
			+ "<div class='span2 missesGraph'>misses</div>"
			+ "<div class='span2 objectsGraph'>objects</div>"
			+ "</div><div class='row'>"
			+ "<div class='span2 searchesPerSecondGraph'></div>"
			+ "<div class='span2 writerQueueSizeGraph'></div>"
			+ "</div></div>";
	parentDiv.html(html);

	drawGauge(cacheInfo.getAccuracyInfo());
	drawGauge(cacheInfo.getEvictionCountInfo());
	drawGauge(cacheInfo.getHitsInfo());
	drawGauge(cacheInfo.getInMemoryHitsInfo());
	drawGauge(cacheInfo.getInMemoryMissesInfo());
	drawGauge(cacheInfo.getInMemoryObjectsInfo());
	drawGauge(cacheInfo.getMeanGetTimeInfo());
	drawGauge(cacheInfo.getMeanSearchTimeInfo());
	drawGauge(cacheInfo.getMissesInfo());
	drawGauge(cacheInfo.getObjectsInfo());
	drawGauge(cacheInfo.getSearchesPerSecondInfo());
	drawGauge(cacheInfo.getWriterQueueSizeInfo());
}

function updateCache(cacheInfo, json) {
	var accuracyData = cacheInfo.getAccuracyInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (accuracyData) {
		var gaugeDiv = $("#" + cacheInfo.getAccuracyInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(accuracyData["value"]);
	}
	var evictionCountData = cacheInfo.getEvictionCountInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (evictionCountData) {
		var gaugeDiv = $("#" + cacheInfo.getEvictionCountInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(evictionCountData["value"]);
	}
	var hitsData = cacheInfo.getHitsInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (hitsData) {
		var gaugeDiv = $("#" + cacheInfo.getHitsInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(hitsData["value"]);
	}
	var inMemoryHitsData = cacheInfo.getInMemoryHitsInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (inMemoryHitsData) {
		var gaugeDiv = $("#" + cacheInfo.getInMemoryHitsInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(inMemoryHitsData["value"]);
	}
	var inMemoryMissesData = cacheInfo.getInMemoryMissesInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (inMemoryMissesData) {
		var gaugeDiv = $("#" + cacheInfo.getInMemoryMissesInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(inMemoryMissesData["value"]);
	}
	var inMemoryObjectsData = cacheInfo.getInMemoryObjectsInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (inMemoryObjectsData) {
		var gaugeDiv = $("#" + cacheInfo.getInMemoryObjectsInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(inMemoryObjectsData["value"]);
	}
	var meanGetTimeData = cacheInfo.getMeanGetTimeInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (meanGetTimeData) {
		var gaugeDiv = $("#" + cacheInfo.getMeanGetTimeInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(meanGetTimeData["value"]);
	}
	var meanSearchTimeData = cacheInfo.getMeanSearchTimeInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (meanSearchTimeData) {
		var gaugeDiv = $("#" + cacheInfo.getMeanSearchTimeInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(meanSearchTimeData["value"]);
	}
	var missesData = cacheInfo.getMissesInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (missesData) {
		var gaugeDiv = $("#" + cacheInfo.getMissesInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(missesData["value"]);
	}
	var objectsData = cacheInfo.getObjectsInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (objectsData) {
		var gaugeDiv = $("#" + cacheInfo.getObjectsInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(objectsData["value"]);
	}
	var searchesPerSecondData = cacheInfo.getSearchesPerSecondInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (searchesPerSecondData) {
		var gaugeDiv = $("#" + cacheInfo.getSearchesPerSecondInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(searchesPerSecondData["value"]);
	}
	var writerQueueSizeData = cacheInfo.getWriterQueueSizeInfo().getMetricNode(cacheInfo.className, cacheInfo.metricName, json);
	if (writerQueueSizeData) {
		var gaugeDiv = $("#" + cacheInfo.getWriterQueueSizeInfo().divId + " div.metricGraph h1");
		gaugeDiv.html(writerQueueSizeData["value"]);
	}
}
