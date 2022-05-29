const brain = require('brain');
const data = require('./conversation-data.json');
const fs = require('fs');
const { Message } = require('discord.js');
const network = new brain.recurrent.LSTM({
    activation:'leaky-relu'
})

var trainingData = data.map(item=>{
    input: item.input
    output: item.output
})


function testTrainingModel(){
    network.fromJSON(JSON.parse(fs.readFileSync('neuralnet.json','utf8')))
    boot();
}

const boot = () =>{
    for(var i =0 ;i<trainingData.length;i++){
        var qs = trainingData.input[i].replace(/[^a-zA-Z]+/g,"").toLowerCase();
        console.log("Message received "+trainingData.input[i])
        console.log("intended intent "+trainingData.output[i])
        console.log("actual intent "+JSON.parseInt(network.run(qs)));
        if(trainingData.output[i]!=JSON.parseInt(network.run(qs))){
            fs.writeFile("converstation-data.json",",\r{\"input\":\""+trainingData.input[i]+"\", \"output\":"+trainingData.output[i]+" },")
        }
        boot();
    }
}

const init = () =>{
    testTrainingModel();
}
init();