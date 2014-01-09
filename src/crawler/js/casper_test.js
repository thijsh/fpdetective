var WAIT_AFTER_PAGE_LOAD = 1000;

var fs = require("fs");
phantom.casperPath = fs.workingDirectory + "/../../../run/bins/casperjs"; // from test dir
if (!phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js')){
	phantom.casperPath = fs.workingDirectory + "/../../run/bins/casperjs"; // src/crawler dir
	if (!phantom.injectJs(phantom.casperPath + '/bin/bootstrap.js')){
		console.log("Cannot find casperjs module, quitting...");
		phantom.exit();	
	}
}

var casper = require('casper').create({
    clientScripts:  [
        'jquery.min.js'
    ],
    verbose: true,
    logLevel: 'debug'
});

var url = casper.cli.get(0);
var caps_name = (casper.cli.get(1) !== 'NO_SCREENSHOT') ? casper.cli.get(1) : '';
var client_js= casper.cli.get(2);
casper.echo('Clientjs: '+client_js);
casper.echo('caps_name: '+caps_name);

// http://docs.casperjs.org/en/latest/modules/casper.html#clientscripts
if (client_js !== "NO_CLIENT_JS"){ 
	casper.options.clientScripts = [client_js];
}

//casper.options.stepTimeout = timeout > 0 ? timeout : MAX_DURATION_PER_LINK;
//casper.options.timeout = MAX_LINKS_TO_CLICK * casper.options.stepTimeout + TIMEOUT_TOLERANCE;

if (!url) {
    casper
        .echo("No URL is given. Quitting:" + url)
        .exit(1)
    ;
}

casper.on('resource.received', function(resource) {
    casper.echo('received: '+resource.url);
});

casper.on('resource.requested', function(request) {
    casper.echo('requested: '+request.url);
});

casper.on('step.timeout', function() {
	casper.echo('Step timed out on ' + this.requestUrl);
});

casper.on('timeout', function() {
    casper.echo('Script timed out on ' + this.requestUrl);
});

casper.on('child.page.created', function(page) {
	casper.echo('Child page created' + this.requestUrl);    
});

casper.on('child.page.loaded', function(page) {
	casper.echo('Child page loaded' + this.requestUrl);    
});

casper.start();
casper.userAgent('Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1673.0 Safari/537.36');
casper.thenOpen(url, function() {
	
	casper.viewport(1280, 768);
	casper.log("Loaded " + url, 'info');
	this.wait(WAIT_AFTER_PAGE_LOAD, function(){

		// ADDED TO TEST: form data entry
		$('input').val('casper@th-d.nl');
		this.capture(caps_name);
		casper.log("ScreenshoT!", 'info');
		
		// Submit after screenshot
		$('form').submit();

		// WAIT
		this.wait(1000, function() {
			casper.log("Finished all steps!", 'info');
			casper.exit();
		});
	});
	
});
casper.run();
