const fs = require('fs')
const brain = require('brain.js');
const { brotliCompress } = require('zlib');
const network = new brain.recurrent.LSTM({
    activation:'leaky-relu'
})
var trainingData = [];

function loadInitialTraining(){
    train(JSON.parse(fs.readFileSync('conversation-data.json')))
}

function loadTraining(){
    network.fromJSON(JSON.parse(fs.readFileSynce('neuralnet.json','utf8')));
    train(JSON.parse(fs.readFileSync('conversation-data.json')))
}

function saveTrainingData()
{
    try{
        fs.writeFile('neuralnet.json',JSON.stringify(network.toJSON()),(err,result)=>{
            if(err) console.log("Error: "+err);
        });
    }catch(err){
        console.log(err)
    }
}

function testTrainingModel(){
    network.fromJSON(JSON.parse(fs.readFileSync('neuralnet.json','utf8')))
    boot();
}

const train = (dt =>{
    console.log("Training.");

    const d = new Date();

    network.train(dt,{
        iterations:2000,
        log: true,
        errorThresh:0.001,
        logPeriod:50,
        momentum:0.1,
        learningRate:.001
    })

    saveTrainingData();

    console.log(`Finished in ${(new Date()-d)/1000}s`)
})

const init = () =>{
    loadInitialTraining();
    //loadTraining(); //for retraining a bot
    //testTrainingModel() //testing bot
}
init();


//quick test 
const boot = () =>{
    r1.question("Enter: ",(q)=>{
        var qs = q.replace(/[^a-zA-Z]+/g,"").toLowerCase();
        console.log(reply(network.run(qs)));
        boot();
    })
}

//response arrays
var hello_reply =["hi","sup","yo","hello"];
var bye_reply = ["bye","peace","see ya","goodbye"]
var yes_reply =["yes","i agree"]
var no_reply=["no","i dont agree"]
var opinion_reply=["i hate them","i love them","theyre mid"]


//returns string depending on intent determined by the neural network
const reply = (intent) =>{
    if(intent ==="") return ":thinking";

    var retstr = "";

    switch(parseInt(intent)){
        case 1:
            retstr = hello_reply[Math.floor(Math.random()*hello_reply.length)];
            break;
        case 2:
            retstr = bye_reply[Math.floor(Math.random()*bye_reply.length)];
            break;
        case 3:
            retstr = yes_reply[Math.floor(Math.random()*yes_reply.length)];
            break;
        case 4:
            retstr = no_reply[Math.floor(Math.random()*no_reply.length)];
            break;
        case 5:
            retstr = opinion_reply[Math.floor(Math.random()*opinion_reply.length)];
            break;
        case 6:
            retstr = greeting();
            break;
        default:
            retstr =":thinking";
            break;
    }
    return retstr;
}

const greeting =() =>{
    
}