const fs = require('fs');
const brain = require('brain.js');
const { brotliCompress } = require('zlib');
const network = new brain.recurrent.LSTM({
    activation:'leaky-relu'
})
var path  = require('path');
const filePath = "C:\Users\Thai_\Documents\GitHub\JerryBot\bot";
const readline = require('readline');
const { CommandInteractionOptionResolver } = require('discord.js');
const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

var trainingData = [];

function ensureDirectoryExistence(filePath){
    var dirname = path.dirname(filePath);
    if(fs.existsSync(dirname)){
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname)
}

function loadInitialTraining(){
    train(JSON.parse(fs.readFileSync('conversation-data.json')))
}

function loadTraining(){
    network.fromJSON(JSON.parse(fs.readFileSync('neuralnet.json','utf8')));
    train(JSON.parse(fs.readFileSync('conversation-data.json')));
}

function saveTrainingData()
{
    try{
        fs.writeFile('../bot/neuralnet.json',JSON.stringify(network.toJSON()),(err,result)=>{
            if(err) console.log("Error: "+err);
        });
    }catch(err){
        console.log(err)
    }
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
        iterations: 10000,
        log: true,
        logPeriod:1,
        learningRate:.001
    })

    saveTrainingData();

    console.log(`Finished in ${(new Date()-d)/1000}s`)
})


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
var negative_reply=["fuck you","you a bitch","suck my dick"]


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
        case 7:
              retstr = negative_reply[Math.floor(Math.random()*negative_reply.length)]
             break;
        default:
            retstr =":thinking";
            break;
        }
        return retstr;
    }

    const greeting =() =>{
        
    var terms = ["how are you?","hows it going?","how are you doing?"]
    var str ="";
    str+= terms[Math.floor(Math.random()*terms.length)]+" ";
    
    if(Math.random() >= 0.8){
        str +="I dont know about ";
        switch(Math.floor(Math.random()*3)){
            case 0:
                str +="everyone else but "
                break;
                case 1:
                    str +="you but ";
                    break;
                    case 2:
                str +="them but "
                break;
                default: break;    
            }
        }
        
        str +="im ";
        
        if(Math.random() >=.7){
            var things =["feeling ","doing ","being ","genuinely "]
        str += things[Math.floor(Math.random()*things.length)]
    }
    
    var feelings =["great. ","playful. ","calm. ","confident. ","peaceful. ","neutral. ","anxious. ","hungry. "];
    
    str += feelings[Math.floor(Math.random()*feelings.length)]
    
    if(Math.random()>=.8){
        var reasons = ["for some reason ","just because ","because i can "]
        str+= reasons[Math.floor(Math.random()*reasons.length)]
        
        if(Math.random()>=.5){
            str+="thanks for asking. ";
        } else {
            str+=". ";
        }
    }
    return str;
}
const init = () =>{
    //loadInitialTraining();
    //loadTraining(); //for retraining a bot
    testTrainingModel() //testing bot
}
init();