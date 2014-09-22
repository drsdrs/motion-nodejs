
var images, pos
, intervalId, startAt
, startAtEl, playtStopEl, imgEl
, play= true, imageLoading= false;

window.onload = function(){
  images = [];
  pos = 0;
  imgEl = document.getElementById("imgVideo");
  spdSliderEl = document.getElementById("spdSlider");
  startAtEl = document.getElementById("startAt");
  playStopEl = document.getElementById("playStop");

  loadImgData(8000);
  startAnimation(spdSliderEl.value);

  spdSliderEl.addEventListener("change", function(e){
    if(play){ startAnimation(e.target.value); }
  }); 
  startAtEl.addEventListener("change", function(e){
    pos = startAt = startAtEl.value;
    e.target.previousElementSibling.innerHTML = "start at "+startAt+" of "+ images.length;
    console.log(e)
    if(!play) { chImage(pos); }
  });
  playStopEl.addEventListener("click", function(e){
    play = !play;
    if(play){ startAnimation(spdSliderEl.value); } else { stopAnimation(); }
  }); 
}

loadImgData = function(refreshRate){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/images", true);
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      result=JSON.parse(xmlhttp.responseText);
      images = result;
      initStartAtSlider();
      setTimeout(function(){
        loadImgData(refreshRate);
      }, refreshRate);
    }
   }
   xmlhttp.send();
}

initStartAtSlider = function(){
  len = images.length-1;
  if(len>0){ startAtEl.max= len }else{ startAtEl.max =0 };
  startAtEl.previousElementSibling.innerHTML = "start at "+startAtEl.value+" of "+ images.length;
  startAt = startAtEl.value;
}

chImage = function(position) {
  pos = position || pos;
  src = images[pos]||null;
  if(src===null || imgloading===true){ return console.log("too fast || no images : "+src)}
  len = images.length;
  if(pos >= len) { pos = startAt;};
  imgEl.src = src;
  imgEl.onload = function(){ imgLoading = true;}
  pos++;
}

stopAnimation = function(){ clearInterval(intervalId); }
startAnimation = function(interval){
  clearInterval(intervalId);
  intervalId = setInterval(function(){
    chImage();
  }, interval);
}
