function romanize (num) {
    if (isNaN(num))
        return NaN;
    var digits = String(+num).split(""),
        key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman;
}
module.exports = {
    name:'status',
    description:"Sends status of discord pet",
    execute(message,args,health,hunger,happiness,lastFed,lastPlayed,userLastFed,userLastPlayed,timeAlive,generation){
        message.channel.send("Jerry "+romanize(generation)+".\nhealth: "+health+"/10\nhunger: "+hunger+"/10\nhappiness: "+happiness+"/10\nI was last fed by <@"+userLastFed+"> "+lastFed+" hours ago.\nI was last played with by <@"+userLastPlayed+"> "+lastPlayed+" hours ago.\nIve been alive for "+timeAlive+" hours.")
    }
}