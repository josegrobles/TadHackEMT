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

exports.getFavorites = function(phone,callback){
  client.lrange(phone+":favorites",0,5,function(err,response){
    callback(null,response)
  })
}

exports.setFavorites = function(phone,id,index,callback){
  client.llen(phone+":favorites",function(err,res1){
    if(res1 < 5){
      client.rpush(phone+":favorites",id,function(err){
        if(err) callback(err)
        else callback(null)
      })
    }
    else {
      client.lset(phone+":favorites",index,id,function(err){
        if(err) callback(err)
        else callback(null)
      })
    }
  })
}
