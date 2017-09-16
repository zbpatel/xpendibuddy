'use strict';
/*
XpendiBuddy Alexa Service

Basic code structure courtesy of the Alexa Color Sample provided by Amazon

Written by Zac Patel for Hack Into It 3.0 9/15-16/17
*/

// Getting the various packages we need to make web calls and such:
var request = require('request');

// Underscore 
var _ = require('underscore');

// the URL of the server we query for the data
// production url: 'http://7879f2c7.ngrok.io/spending-date'
var SERVER_URL = 'http://607282d5.ngrok.io';

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output,
        },
        card: {
            type: 'Simple',
            title: `${title}`,
            content: `${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

// initial method to make a web query 
function makeRequest(rUrl=SERVER_URL, rMethod, rHeader, rBody, rQs, cback) {
    var options = {
        url: rUrl,
        method: rethod,
        headers: rHeaders,
        body: rBody, // add body if necessary
        qs: rQs // add query strings   
    };
    request(options, function (error, response, body) {
        if (error) {
            console.error('Could not connect: Error Message: ' + error.message);
            callback(error);
        } else {
            // writing the full body to the console so we can see what we got back
            console.log('Made request, body: ' + str(body));
        }
    });
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = 'Welcome';
    const speechOutput = 'Welcome to XpendiBuddy, how can I help you with your financial goals?';
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = 'Ask me about how you are doing towards your spending goal.';
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(intent, session, callback) {
    const cardTitle = 'Session Ended';
    // don't want any speech input when ending the skill
    const speechOutput = '';
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// ----- START DATE / EXPENDITURE HELPER METHODS -----
function generateExpendStatement(expend, date) {
    // Returns a short statement summarizing the user's expenditures on a certain date
    var d = stripDate(date);
    console.log(d);
    var dString = d[0] + ' ' + d[1] + ' ' + d[2] + ', ' + d[3];

    expend = '$' + expend.toString();

    return 'On ' + dString  + ' you spent ' + expend + '.';
}

// date constants for the strip date method
// This is because the crappy built in JS date class doesn't give the full names of anything... :/
var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function stripDate(date) {
    // strips a date in ISO 8086 to Month / Day / Year
    var m = months[date.getUTCMonth()];
    var w = weekdays[date.getUTCDay()];
    var d = date.getUTCDate();
    var y = date.getUTCFullYear();
    return [w, m, d, y]
}
// ----- END DATE / EXPENDITURE HELPER METHODS -----

// ----- APP SPECIFIC EVENT HANDLERS: -----
function getExpendHandler(intent, session, callback) {
    // handles the GETEXPENDONDATE_INTENT

    // grabbing the date from the intent
    // TODO: add production quality error handling here
    var date = new Date(intent.slots.date.value);

    // configuring options for the request call
    var options = {
        url: SERVER_URL + "/spending-date",
        method: 'POST',
        headers: {},
        body: '',
        qs: {
            'ds':date
        }   
    };

    request(options, function (error, response, body) {
        if (error) {
            console.error('Failed to connect when attempting GETEXPENDONDATE_INTENT, error: ' + error.message);
            callback(error);
        } else {
            // writing the full body to the console so we can see what we got back
            console.log('Ccompleted request, body: ' + body);

            // basic test that we dont ice the body
            if (body == null) {
                body = 0;
            }

            // creating the response 
            var sessionAttributes = {};
            var title = 'Daily Expenses for: ' + date.toGMTString();
            var output = generateExpendStatement(body, date);
            callback(sessionAttributes, 
                buildSpeechletResponse(title, output, '', true));
        }
    });
}

function setGoalHandler(intent, session, callback) {
    // handles the SETGOAL_INTENT

}

function getProximToGoalHandler(intent, session, callback) {
    // handles the PROXIMTOGOAL_INTENT
    
    // configuring options for the request call
    var options = {
        url: SERVER_URL + '' , //ADD PAGE HERE
        method: '', // ADD REQUEST TYPE HERE
        headers: {},
        body: '',
        qs: {}   
    };

    request(options, function (error, response, body) {
        if (error) {
            console.error('Failed to connect when attempting PROXIMTOGOAL_INTENT, error:' + error.message);
            callback(error);
        } else {
            // writing the full body to the console so we can see what we got back
            console.log('Completed request, body: ' + body);

            // basic test that we dont ice the body
            if (body == null) {
                body = 0;
            }

            // creating the response 
            var sessionAttributes = {};
            var title = 'Daily Expenses for: ' + date.toGMTString();
            var output = generateExpendStatement(body, date);
            callback(sessionAttributes, 
                buildSpeechletResponse(title, output, '', true));
        }
    });
}

function setNewRoutineHandler(intent, session, callback) {
    // handles the SUGGESTNEWROUTINE_INTENT

}
// ----- END APP SPECIFIC EVENT HANDLERS: -----

// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log(`onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}`);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log(`onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}`);

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // calls handlers for the various intents
    if (intentName == 'GETEXPENDONDATE_INTENT') {
        getExpendHandler(intent, session, callback);
    } else if (intentName == 'SETGOAL_INTENT') {
        setGoalHandler(intent, session, callback);
    } else if (intentName == 'PROXIMTOGOAL_INTENT') {
        getProximToGoalHandler(intent, session, callback);
    } else if (intentName == 'SUGGESTNEWROUTINE_INTENT') {
        setNewRoutineHandler(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getWelcomeResponse(callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log(`onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}`);
    // Add cleanup logic here (only if necessary)
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log(`event.session.application.applicationId=${event.session.application.applicationId}`);
        if (event.session.application.applicationId !== 'amzn1.ask.skill.14f41b07-4beb-4392-b225-0af056feba8b') {
             callback('Invalid Application ID');
        }
        
        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};

