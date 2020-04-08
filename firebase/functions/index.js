// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
const sgmail = require('@sendgrid/mail');
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://oncreate-essentials-35bbe.firebaseio.com',
});
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
process.env.SENDGRID_API_KEY = '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', 

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  //function welcome(agent) {
    //agent.add(`Fetching details... Please be patient.`);
  //}
 
  //function fallback(agent) {
    //agent.add(`Umm... Looks like the admins have not updated the details for the next session`);
    //agent.add(`You dont have to worry, you will recieve a notification through the app itself.`);
//}
function getDataFromDB(agent)
  {
    //const nextSessionDate=agent.parameters.nextSession;
  //agent.add('Fetching information... PLease be patient');
    return admin.database().ref('Sessions').once("value").then(
      (snapshot) => 
    {
        var date = snapshot.child("nextSession").child("nextSessionDate").val();
        agent.add("We'll have a session on the "+ date);
        agent.add("Is there anything else I can help you with?");
    }
    );
  }
function getTypeFromDB(agent)
  {
    return admin.database().ref('Sessions').once("value").then(
      (snapshot) => 
    {
      var type=snapshot.child("nextSession").child("nextSessionType").val();
      agent.add("We will be working on "+ type);
      agent.add("Anything else?");
    }
    );
  }
  
function weekly_challenge(agent)
  {
  return admin.database().ref('Sessions').once("value").then(
      (snapshot) => 
    {
      var challenge=snapshot.child("Weekly_Challenges").val();
      agent.add("The title is \""+ challenge + "\"");
      agent.add("Do you need something else?");
    }
    );
  }

function sendEmail(agent)
  {
    sgmail.setApiKey(process.env.SENDGRID_API_KEY);
    const emailParam = agent.param.email;
    const msg = 
    {
    to:emailParam,
    from: 'cse.mobilecomputingforum@gmail.com',
    subject: 'Hi! I am Dr. onCreate()',
    text: 'Just trying to test myself if i can send emails',
    html: 'This is the way i can send emails in the html format</strong>...',
    };
    console.log(msg);
    sgmail.send(msg);
    agent.add('I triend sending them, just check if you got them please!');
  }
  
 function status_check(agent)
  {
  return admin.database().ref('Admin_List').once("value").then(
      (snapshot) => 
    {
      var status=snapshot.child("membership_open").val();
      if(status === true)
      agent.add("Yes, the registrations are open");
      else
      agent.add("No, the registrations are not open as of now");
      
      agent.add("Anything else?");
    }
    );
  } 
 
  

  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('nextSession', getDataFromDB);
  intentMap.set('nextSessionType', getTypeFromDB);
  //intentMap.set('sendEmail',sendEmail);
  intentMap.set('weeklyChallenge',weekly_challenge);
  intentMap.set('newRegistration',status_check);
  //intentMap.set('Default Fallback Intent', fallback);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
