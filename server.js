const express = require('express');
var app = express()
const bodyParser = require('body-parser');
const database = require('./db_connections/mongodb');
const morgan = require('morgan')
const path = require('path');
let config = require('./config/config.dev');
var customerRoutes=require("./routes/customerRoutes/customerRoutes")
var groomerRoutes=require('./routes/groomerRoutes/groomerRoutes')
var chatRoutes=require('./routes/chat/messageRoutes')
app.use(morgan('dev'))
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
    
app.get('/', (req, res) => {
  res.json("HOTSPAWTS PROJECT IS CONNECTED Customer API DOCS https://docs.google.com/document/d/1EwzP7SPpeP_ieFNU1ClqxpGYez2vEU2duQFW8CBm4mA/edit?usp=sharing "+"Groomer Api docs -->>  https://docs.google.com/document/d/1xIySU87E-HzxIBt_IEFH2byqfRLlp873DzSHAoiG0Oo/edit?usp=sharing");   
});




app.use("/customer",customerRoutes);
app.use("/groomer",groomerRoutes);
var test=require('./routes/customerRoutes/routes')
app.use('/test',test)
// app.use('/chat',chatRoutes)

app.listen(config.server_port, () => {
    console.log("server is listen :","http://localhost:1417")
});

  