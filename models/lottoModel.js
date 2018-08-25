var mongoose = require('mongoose')
var schema = mongoose.Schema 

var lotto = new schema({
    회차: Number,
    추첨일: String,
    NO1: Number,
    NO2: Number,
    NO3: Number,
    NO4: Number,
    NO5: Number,
    NO6: Number,
    보너스: Number    
})

module.exports = mongoose.model('lotto',lotto)

