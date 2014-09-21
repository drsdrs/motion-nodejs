
var images, pos, imgEl, intervalId, startAt, startAtEl, playtStopEl, play= true;

window.onload = function(){
  images = [];
  pos = 0;
  imgEl = document.getElementById("imgVideo");
  spdSliderEl = document.getElementById("spdSlider");
  startAtEl = document.getElementById("startAt");
  playStopEl = document.getElementById("playStop");

  loadImgData(5000);
  startAnimation(spdSliderEl.value);

  spdSliderEl.addEventListener("change", function(e){
    if(play){ startAnimation(e.target.value); }
  }); 
  startAtEl.addEventListener("change", function(e){
    pos = startAt = startAtEl.value;
    e.target.previousElementSibling.innerHTML = "start at "+startAt;
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
  startAt = startAtEl.value;
}

chImage = function(position) {
  pos = position || pos;
  len = images.length;
  if(pos >= len) { pos = startAt;};
  src = "data/"+images[pos];
  imgEl.src = src;
  pos++;
}

stopAnimation = function(){ clearInterval(intervalId); }
startAnimation = function(interval){
  clearInterval(intervalId);
  intervalId = setInterval(function(){
    chImage();
  }, interval);
}
