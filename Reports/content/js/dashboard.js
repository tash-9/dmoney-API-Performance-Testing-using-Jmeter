/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];
    var header = tableRef.createTHead();
    if(headerCreator) { headerCreator(header); }
    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }
    var tBody;
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);
    var regexp;
    if(seriesFilter) { regexp = new RegExp(seriesFilter, 'i'); }
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    // 7.14% failure = 2 out of 28
    var data = {"OkPercent": 92.86, "KoPercent": 7.14};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : { show : true }
    });

    // APDEX table
    createTable($("#apdexTable"), {
        "supportsControllersDiscrimination": true,
        "overall": {"data": [0.9285714285714286, 500, 1500, "Total"], "isController": false},
        "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"],
        "items": [
            {"data": [0.5, 500, 1500, "Admin Login"], "isController": false},
            {"data": [0.8, 500, 1500, "Deposit"], "isController": false},
            {"data": [1.0, 500, 1500, "Send Money"], "isController": false},
            {"data": [1.0, 500, 1500, "Payment"], "isController": false}
        ]
    }, function(index, item){
        switch(index){
            case 0: item = item.toFixed(3); break;
            case 1:
            case 2: item = formatDuration(item); break;
        }
        return item;
    }, [[0, 0]], 3);

    // Statistics table
    createTable($("#statisticsTable"), {
        "supportsControllersDiscrimination": true,
        "overall": {
            "data": ["Total", 28, 2, 7.14, 318.46, 151, 626, 327.5, 498.3, 579.4, 624.1, 0.27863, 0.10246, 0.14749],
            "isController": false
        },
        "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"],
        "items": [
            {"data": ["Admin Login", 3, 0, 0.0, 589.33, 541, 626, 601.0, 624.1, 626.0, 626.0, 0.4926, 0.2641, 0.1563], "isController": false},
            {"data": ["Deposit", 10, 2, 20.0, 334.5, 188, 512, 318.0, 509.3, 512.0, 512.0, 0.10243, 0.03781, 0.05501], "isController": false},
            {"data": ["Send Money", 10, 0, 0.0, 271.4, 151, 401, 263.5, 398.7, 401.0, 401.0, 0.10318, 0.03687, 0.05562], "isController": false},
            {"data": ["Payment", 5, 0, 0.0, 344.2, 318, 389, 337.0, 388.2, 389.0, 389.0, 0.05176, 0.01831, 0.02782], "isController": false}
        ]
    }, function(index, item){
        switch(index){
            case 3: item = item.toFixed(2) + '%'; break;
            case 4: case 7: case 8: case 9: case 10: case 11: case 12: case 13:
                item = item.toFixed(2); break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Errors table - 2 deposit failures due to OTP timeout
    createTable($("#errorsTable"), {
        "supportsControllersDiscrimination": false,
        "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"],
        "items": [
            {"data": ["401/Unauthorized", 2, 100.0, 7.14], "isController": false}
        ]
    }, function(index, item){
        switch(index){
            case 2:
            case 3: item = item.toFixed(2) + '%'; break;
        }
        return item;
    }, [[1, 1]]);

    // Top 5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {
        "supportsControllersDiscrimination": false,
        "overall": {
            "data": ["Total", 28, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""],
            "isController": false
        },
        "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"],
        "items": [
            {"data": [], "isController": false},
            {"data": ["Deposit", 10, 2, "401/Unauthorized", 2, "", "", "", "", "", "", "", ""], "isController": false},
            {"data": [], "isController": false},
            {"data": [], "isController": false}
        ]
    }, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
