const brain = require('brain.js');
const fs = require('fs');
const { Message } = require('discord.js');
const { debug } = require('console');
const { CommandInteractionOptionResolver } = require('discord.js');
const network = new brain.recurrent.LSTM({
    activation:'leaky-relu'
})

//convert conversation data into two seperate arrays
//one consisting of the input messages
var trainingDataMessage = JSON.parse(fs.readFileSync('conversation-data.json')).map(item=>{
    return [item.input]
})
//second consisting of the output intent
var trainingDataIntent = JSON.parse(fs.readFileSync('conversation-data.json')).map(item=>{
    return [item.output]
})

function testTrainingModel(){
    network.fromJSON(JSON.parse(fs.readFileSync('neuralnet.json','utf8')))
    boot();
}


const boot = () =>{
    //loops through every data point within the database
    for(var i =0 ;i<trainingDataMessage.length;i++){
        
        //converts input message data into readable string
        var qs = (trainingDataMessage[i].toString()).replace(/[^a-zA-Z]+/g,"").toLowerCase();
        
        //output to console the current data point being tested
        console.log("Message received "+trainingDataMessage[i])
        console.log("intended intent "+trainingDataIntent[i])
        console.log("bot intent "+parseInt(network.run(qs)));
        
        var trainingData = "\t{ \"input\":\""+trainingDataMessage[i]+"\", \"output\":"+trainingDataIntent[i]+" },\r"
        //if the intent of the database does not match the neural networks given intent then rewrite the data point into the database
        if(trainingDataIntent[i]!=parseInt(network.run(qs))){
            try{
                fs.appendFile("conversation-data.json",trainingData,(err,result)=>{
                    if(err) console.log("Error: "+err)
                })
            }catch(err){
                console.log(err)
            }
        }
    }
}

const init = () =>{
    testTrainingModel();
}
init();


