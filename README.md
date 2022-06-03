happiness check - > 0-10 happiness bar that decays by 1 every hour but decays by 2 when hunger is below 5
happiness decays by 1 when jerry is overfed
health check -> 0-10 health bar decays by 1 every hour when hunger is at 1, health is restored by 1 when hunger and health
is full

hunger check - > 0-10 hunger bar that decays every hour

status check - > effects how jerry talks, status is determined by happiness health and hunger
status[happy = happiness 10,sad = happiness is less than 5,angry = happiness is 0,sick = health <5,hungry = hunger<5,dead = health =0]
happy  sad and angry only apply if hunger and health are greater than 5, i.e. sick hungry and dead take presedence