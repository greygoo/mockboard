var blessed = require('blessed')
  , contrib = require('../blessed-contrib/index')

var screen = blessed.screen()
screen.title = 'TSM Facility Status'

/////////////////////////////////////////////////////////////////
// create layout and widgets

var grid = new contrib.grid({rows: 13, cols: 12, screen: screen})


/////////////////////////////////////////////////////////////////
// basic variables
var generator_count = ['01', '02', '03', 'XX']

let logInterval;
let generatorsInterval;
let secure_facilitiesInterval;
let energy_consumptionInterval;

/////////////////////////////////////////////////////////////////
// states

stable = true;
warning = false;
panic   = false;
fixing = false;
emergency = false;


/////////////////////////////////////////////////////////////////
// state functions


// stable mode
function run_stable() {
  
  // LCD output
  lcd.setOptions({
    color: 'green',
  });
  lcd.setDisplay('DON.T PANIC');


  // Load
  load.setData(
    { barCategory: ['Dist'],
    stackedCategory: ["C", "S", "X"],
    data:
      [ [ 3, 2, 1 ] ] 
  })


  // Log
  clearInterval(logInterval);
  logInterval = setInterval(function() {
    var rnd = Math.round(Math.random()*2)
    if (rnd==0) log.log('check ok ')   
    else if (rnd==1) log.log('balancing')
    else if (rnd==2) log.log('contained')
  }, 5000);


  // Generators
  function fillGenerators() {
    var arr = []
    for (var i=0; i<generator_count.length; i++) {
      if (i == 0) {
        value = Math.floor(Math.random() * 10) + 80
        arr.push(value)
      }
      else if (i == 3) {
        arr.push(0)
      }
      else {
        value = Math.floor(Math.random() * 40) + 30
        arr.push(value)
      }
    }
  generators.setData({titles: generator_count, data: arr})
  }

  fillGenerators()
  clearInterval(generatorsInterval)
  generatorsInterval = setInterval(fillGenerators, 2000)


  // Secure facilities 
  var marker = true
  clearInterval(secure_facilitiesInterval)
  secure_facilitiesInterval = setInterval(function() {
    if (marker) {
      secure_facilities.addMarker({"lon" : "-122.6819", "lat" : "45.5200", char: unescape("%u0058") })
      secure_facilities.addMarker({"lon" : "-6.2597", "lat" : "53.3478", char: unescape("%u0058") })
      secure_facilities.addMarker({"lon" : "103.8000", "lat" : "1.3000", char: unescape("%u0058") })
      secure_facilities.addMarker({"lon" : "-79.0000", "lat" : "37.5000", color: 'yellow', char: unescape("%u2302") })
      secure_facilities.addMarker({"lon" : "69.004165", "lat" : "-49.288385", color: 'blue', char: unescape("%u2302") }) 
    }
    else {
      secure_facilities.clearMarkers()
      secure_facilities.addMarker({"lon" : "-122.6819", "lat" : "45.5200", char: unescape("%u00D7") })
      secure_facilities.addMarker({"lon" : "-6.2597", "lat" : "53.3478", char: unescape("%u00D7") })
      secure_facilities.addMarker({"lon" : "103.8000", "lat" : "1.3000", char: unescape("%u00D7") })
      secure_facilities.addMarker({"lon" : "-79.0000", "lat" : "37.5000", color: 'yellow', char: "!" })
      secure_facilities.addMarker({"lon" : "69.004165", "lat" : "-49.288385", color: 'green', char: unescape("%u2302") }) 
    }
  marker =! marker
  screen.render()
  }, 200)


  // Energy consumption
  function setLineData(mockData, line) {
    for (var i=0; i<mockData.length; i++) {
      var last = mockData[i].y[mockData[i].y.length-1]
      mockData[i].y.shift()
      var num = Math.max(last + Math.round(Math.random()*10) - 5, 10)    
      mockData[i].y.push(num)  
    }
    line.setData(mockData)
  }

  var transactionsData = {
	     	  title: 'Containment',
	     	  style: {line: 'red'},
	     	  x: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50', '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50', '04:00', '04:10', '04:20', '04:30'],
	          y: [0, 20, 40, 45, 45, 50, 55, 70, 65, 58, 50, 55, 60, 65, 70, 80, 70, 50, 40, 50, 60, 70, 82, 88, 89, 89, 89, 80, 72, 70]
  }

  var transactionsData1 = {
		   title: 'Useless Stuff',
		   style: {line: 'yellow'},
		   x: ['00:00', '00:05', '00:10', '00:15', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50', '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50', '04:00', '04:10', '04:20', '04:30'],
		   y: [0, 5, 5, 10, 10, 15, 20, 30, 25, 30, 30, 20, 20, 30, 30, 20, 15, 15, 19, 25, 30, 25, 25, 20, 25, 30, 35, 35, 30, 30]
  }
  setLineData([transactionsData, transactionsData1], energy_consumption)

  clearInterval(energy_consumptionInterval)
  energy_consumptionInterval = setInterval(function() {
    setLineData([transactionsData, transactionsData1], energy_consumption)
    screen.render()
  }, 500)
}



function run_warning() {
  clearInterval(logInterval);
  

  // Generators
  let counter = 1;
  let generatorsList = [[78,12,11,0],
		      [81,13,11,0],
		      [84,30,12,0],
		      [90,45,15,0],
		      [97,67,20,0],
		      [100,81,19,0],
		      [100,89,13,0],
		      [100,95,12,0],
		      [100,99,11,0],
		      [100,100,30,0],
		      [100,100,52,0],
		      [100,100,67,0],
		      [100,100,82,0],
		      [100,100,93,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
	    	      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0],
		      [100,100,100,0]]
  let logList = ["check err",
			"balancing",
			"check err",
			"check err",
			"balancing",
			"g1 load!!",
			"balancing",
			"g1 load!!",
			"balancing",
			"g2 load!",
			"g1 load!",
			"WARNING!",
			"g1 load!",
			"g2 load!",
			"g3 load!",
			"OVERLOAD!",
			"! ALERT !",
			"OVERLOAD!",
			"! ALERT !",
			"OVERLOAD!",
			"! ALERT !",
			"OVERLOAD!",
			"! ALERT !",
			"OVERLOAD!",
			"! ALERT !",
			"OVERLOAD!",
			"! ALERT !"]



  clearInterval(generatorsInterval);
  generatorsInterval = setInterval(function() {
    if ( counter >= generatorsList.length) {
      generators.setData({titles: generator_count, data: [100,100,100,0]}); 
      log.log("OVERLOAD !");
    }
    else {
      generators.setData({titles: generator_count, data: generatorsList[counter]}); 
      log.log(logList[counter]);
    }
    counter++
  }, 2000);
}


function run_panic() {
  // LCD
  lcd.setOptions({
    color: 'red',
  });
  lcd.setDisplay(' PANIC NOW');

  // Generators	
  clearInterval(generatorsInterval);
  let generator_overload = [100,100,100,0]
  generators.setData({titles: generator_count, data: generator_overload})
  panic = true

  // Secure Facilities
  // Secure facilities 
  var marker = true
  clearInterval(secure_facilitiesInterval)
  secure_facilitiesInterval = setInterval(function() {
    if (marker) {
      secure_facilities.addMarker({"lon" : "-122.6819", "lat" : "45.5200", char: unescape("%u0058") })
      secure_facilities.addMarker({"lon" : "-6.2597", "lat" : "53.3478", char: unescape("%u0058") })
      secure_facilities.addMarker({"lon" : "103.8000", "lat" : "1.3000", char: unescape("%u0058") })
      secure_facilities.addMarker({"lon" : "-79.0000", "lat" : "37.5000", color: 'yellow', char: unescape("%u2302") })
      secure_facilities.addMarker({"lon" : "69.004165", "lat" : "-49.288385", color: 'yellow', char: unescape("%u2302") }) 
    }
    else {
      secure_facilities.clearMarkers()
      secure_facilities.addMarker({"lon" : "-122.6819", "lat" : "45.5200", char: unescape("%u00D7") })
      secure_facilities.addMarker({"lon" : "-6.2597", "lat" : "53.3478", char: unescape("%u00D7") })
      secure_facilities.addMarker({"lon" : "103.8000", "lat" : "1.3000", char: unescape("%u00D7") })
      secure_facilities.addMarker({"lon" : "-79.0000", "lat" : "37.5000", color: 'yellow', char: "!" })
      secure_facilities.addMarker({"lon" : "69.004165", "lat" : "-49.288385", color: 'red', char: "!" }) 
    }
  marker =! marker
  screen.render()
  }, 200)
}



///////////////////////////////////////////////////////////////////
//Widgets

// Containment
var containment = grid.set(5, 7, 5, 3, contrib.donut, 
  {
  label: 'Containment',
  radius: 9,
  arcWidth: 4,
  yPadding: 1,
  spacing: 0,
  data: [{label: 'Strength', percent: 87}]
})


// Load
var load = grid.set(5, 10, 5, 2, contrib.stackedBar,
  { 
  label: 'Load',
  barWidth: 4,
  barSpacing: 1,
  xOffset: 1,
  height: "100%",
  width: "50%",
  barBgColor: [ 'red', 'blue', 'green' ]
})


// Generators
var generators = grid.set(6, 0, 4, 5, contrib.bar, 
  { label: 'Generators'
  , barWidth: 4
  , barSpacing: 6
  , xOffset: 2
  , maxHeight: 9})


// LCD 
var lcd = grid.set(10,0,3,12, contrib.lcd,
  {
    label: "Status",
    segmentWidth: 0.06,
    segmentInterval: 0.11,
    strokeWidth: 0.01,
    elements: 11,
    display: 3210,
    elementSpacing: 4,
    elementPadding: 0 
  }
);


// Energy Consumption
var energy_consumption = grid.set(0, 7, 5, 5, contrib.line, 
          { showNthLabel: 10 
	  , numYLabels: 5 
          , maxY: 100
          , label: 'Energy Consumption'
          , showLegend:true 
          , showXLabels: false 
          , legend: {width: 10}})


// Secure Fecilities
var secure_facilities = grid.set(0, 0, 6, 7, contrib.map, {label: 'Secure Facilities'})


// Log
var log = grid.set(6, 5, 4, 2, contrib.log, 
  { fg: "green"
  , selectedFg: "green"
  , label: 'Log'})



///////////////////////////////////////////////////////////////////
// Key handling


// stable = "s"
screen.key(['s'], function(ch, key) {
  stable = true;
  warning = false;
  panic = false;
  fixing = false;
  emergency = false;

  run_stable();
});


// stable = "w"
screen.key(['w'], function(ch, key) {
  stable = false;
  warning = true;
  panic = false;
  fixing = false;
  emergency = false;

  run_warning();
});


// panic = "p"
screen.key(['p'], function(ch, key) {
  stable = false;
  warning = false;
  panic = true;
  fixing = false;
  emergency = false;

  run_panic();
});


// quit = "q"
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});


/////////////////////////////////////////////////////////////////
// fixes https://github.com/yaronn/blessed-contrib/issues/10
screen.on('resize', function() {
  donut.emit('attach');
  gauge.emit('attach');
  gauge_two.emit('attach');
  sparkline.emit('attach');
  stackedBar.emit('attach');
  bar.emit('attach');
  table.emit('attach');
  lcdLineOne.emit('attach');
  errorsLine.emit('attach');
  transactionsLine.emit('attach');
  map.emit('attach');
  log.emit('attach');
});

screen.render()
