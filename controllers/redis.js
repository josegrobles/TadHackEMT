var redis = require("redis"),
    client = redis.createClient();

exports.saveLast = function(phone,id){
  client.lpush(phone+":last",id)
}
exports.getLast = function(phone,callback){
  client.lrange(phone+":last",0,5,function(err,response){
    callback(null,response)
  })
}

exports.getFromLast = function(phone,index,callback){
  client.lindex(phone,index,function(err,ans){
    callback(null,ans)
  })
}
