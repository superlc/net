/*
*** Author : CLuo ***
*** Date : 2014/10/18 ***
*/
var pow = Math.pow,
BACK_CONST = 1.70158,
Easing = {
  // 匀速运动
  linear: function (t) {
      return t;
  },
  easeIn: function (t) {
      return t * t;
  },
  easeOut: function (t) {
      return (2 - t) * t;
  },
  easeBoth: function (t) {
      return (t *= 2) < 1 ? .5 * t * t : .5 * (1 - (--t) * (t - 2));
  },
  easeInStrong: function (t) {
      return t * t * t * t;
  },
  easeOutStrong: function (t) {
      return 1 - (--t) * t * t * t;
  },
  easeBothStrong: function (t) {
      return (t *= 2) < 1 ? .5 * t * t * t * t : .5 * (2 - (t -= 2) * t * t * t);
  },
  easeOutQuart: function (t) {
      return -(pow((t - 1), 4) - 1)
  },
  easeInOutExpo: function (t) {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if ((t /= 0.5) < 1) return 0.5 * pow(2, 10 * (t - 1));
      return 0.5 * (-pow(2, - 10 * --t) + 2);
  },
  easeOutExpo: function (t) {
      return (t === 1) ? 1 : -pow(2, - 10 * t) + 1;
  },
  swingFrom: function (t) {
      return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
  },
  swingTo: function (t) {
      return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
  },
  backIn: function (t) {
      if (t === 1) t -= .001;
      return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
  },
  backOut: function (t) {
      return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
  },
  bounce: function (t) {
      var s = 7.5625,
          r;
      if (t < (1 / 2.75)) {
          r = s * t * t;
      } else if (t < (2 / 2.75)) {
          r = s * (t -= (1.5 / 2.75)) * t + .75;
      } else if (t < (2.5 / 2.75)) {
          r = s * (t -= (2.25 / 2.75)) * t + .9375;
      } else {
          r = s * (t -= (2.625 / 2.75)) * t + .984375;
      }
      return r;
  }
};
function Net(param){
  //动画时间
  this.duration = param.duration || 2000;
  //每一帧总时长
  this.frameTime = param.frameTime || 3000;
  this.context = param.context;
  this.group = param.group;
  //画布的起始位置和宽高
  this.rect = param.rect;
  this._init();
}
Net.prototype = {
  _init : function(){
    this.draw([
          {
            x : this.group[0].t_points[0].x,
            y : this.group[0].t_points[0].y
          },
          {
            x : this.group[1].t_points[0].x,
            y : this.group[1].t_points[0].y
          }
        ]);
  },
  draw : function(t_points){
    var context = this.context,group = this.group;
    context.clearRect(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
    //获取每一个组的内容
    for(var i = 0;i < t_points.length;i++){
      for(var j=0;j<group[i].points.length;j++){
        context.beginPath();
        context.moveTo(t_points[i].x,t_points[i].y);
        context.lineTo(group[i].points[j].x,group[i].points[j].y);
        context.stroke();
        context.closePath();
      }
      //绘制端点
      context.beginPath();
      context.arc(t_points[i].x,t_points[i].y,5,0,Math.PI*2,true);
      context.fill();
      context.closePath();
    }
  },
  animate : function(){
    var _this = this;
    var group = this.group;
    var duration = this.duration;
    var callBack = null;
    var easing = this.easing || Easing.easeOutQuart;
    var startTime = +new Date(),//记录当前时间，+new Date()为new Date().getTime()的简写
              endTime       = startTime+duration,//结束时间
              curTime, //当前时间
              t,       //当前时间，在总时间的比例，范围0.0~1.0
              e,       //动画算子
              timer,   //setTimeout，的定时器
              //一个单位动画执行的函数
              run = function(){
                curTime = +new Date();
                //计算，当前时间，在总时间的比例，范围0.0~1.0
                t = curTime > endTime ? 1 : (curTime - startTime)/duration;
                //动画算子
                e = easing?easing(t):t;
                //计算时间t时的点坐标
                var tmp_tpoints = [];
                for(var i=0;i<group.length;i++){
                  var p = {
                    x : ((group[i].t_points[group[i].status.n_index]).x - (group[i].t_points[group[i].status.index]).x)*e + (group[i].t_points[group[i].status.index]).x,
                    y : ((group[i].t_points[group[i].status.n_index]).y - (group[i].t_points[group[i].status.index]).y)*e + (group[i].t_points[group[i].status.index]).y
                  };
                  tmp_tpoints.push(p);
                }
                //绘制图集
                _this.draw(tmp_tpoints);

                if(t < 1){
                  //t < 1.0表面动画未结束 ,每16毫秒递归一次run函数。
                  timer = setTimeout(function(){run()},16);
                }else{
                  //如果回调函数存在，执行回调函数
                  callBack&&callBack();
                }
              };
              run();
              return function(){
                timer&&clearTimeout(timer);
              };
  },
  move : function(){
    var group = this.group;
    var _this = this;
    var timer = setInterval(function(){
          //对于每一个group随机下一个端点的位置
          for(var i=0;i<group.length;i++){
            //this.group[i].t_points[location[i].n_index].x,this.group[i].t_points[location[i].n_index].y
            var tmp = Math.ceil(Math.random()*(group[i].t_points.length -1)+1);
            group[i].status.n_index = tmp-1;
          }

          //重绘调整后的射线
          _this.animate(2000,null,Easing.easeOutQuart);
          var r_timer = setTimeout(function(){
            for(var j=0;j<group.length;j++){
              group[j].status.index = group[j].status.n_index;
            }
            clearTimeout(r_timer);
          },2000);
        },3000);
  }
};