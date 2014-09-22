
var images
, pos, intervalId, startAt, endAt
, startAtEl, playtStopEl, imgEl, imgPosEl
, play= true
, imgLoading= false
, firstImgDataLoad = true
, timeLoadingImg = Date.now()
;

window.onload = function(){
  images = [];
  pos = 0;
  imgEl = document.getElementById("imgVideo");
  spdSliderEl = document.getElementById("spdSlider");
  startAtEl = document.getElementById("startAt");
  endAtEl = document.getElementById("endAt");
  playStopEl = document.getElementById("playStop");
  imgPosEl = document.getElementById("imgPos");
  imgPosSliderEl = document.getElementById("imgPosSlider");

  chStartAt = function(){
    pos = startAt = startAtEl.value;
    if(endAtEl.value<=startAt){ endAtEl.value = startAt; console.log("endAtEl small", endAtEl.value+">"+startAt)}
    startAtEl.previousElementSibling.innerHTML = "start at "+startAt;
  }

  chEndAt = function(){ 
    endAt = endAtEl.value;
    if(startAtEl.value>=endAt){ startAtEl.value = endAt; console.log("startAtEl big", startAtEl.value+">"+endAt) }
    endAtEl.previousElementSibling.innerHTML = "end at "+endAt;
  }

  spdSliderEl.addEventListener("change", function(e){
    if(play){ startAnimation(e.target.value); }
  }); 


  startAtEl.addEventListener("change", chStartAt);
  endAtEl.addEventListener("change", chEndAt);

  playStopEl.addEventListener("click", function(e){
    play = !play;
    imgLoading = false;
    if(play){ startAnimation(spdSliderEl.value); } else { stopAnimation(); }
  });

  imgPosSliderEl.addEventListener("change", function(e){
    chImage
    pos = e.target.value;
    return
  }); 

  // INIT
  loadImgData(8000);
  startAnimation(spdSliderEl.value);
  endAtEl.value = endAtEl.max = images.length;
  chEndAt();
}

loadImgData = function(refreshRate){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/images", true);
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      images = JSON.parse(xmlhttp.responseText);
      initSliders();
      if(firstImgDataLoad===true){
        endAtEl.max = images.length;
        firstImgDataLoad = false;
        chEndAt();
      }
      setTimeout(function(){ loadImgData(refreshRate); }, refreshRate);
    }
   }
   xmlhttp.send();
}

initSliders = function(){
  len = images.length-1;
  if(len>0){ startAtEl.max= len }else{ startAtEl.max =0 };
  startAtEl.previousElementSibling.innerHTML = "start at "+startAtEl.value;
  startAt = startAtEl.value;
  endAtEl.max = len;
  imgPosSliderEl.max = len
}

chImage = function(position) {
  pos = position || pos;
  len = images.length;
  src = images[pos]||null;
  if((pos >= endAt) && play) { pos = startAt;};
  if(src===null || imgLoading===true){
    console.log("too fast || no images : "+src+" Pos:"+pos+" IMG onload"+ imgLoading);
    return imgLoading = false;
  }
  imgLoading = true;
  // timeLoadingImg = Date.now()
  imgEl.src = src;
  imgEl.onload = function(){
    imgPosEl.innerHTML = "pos :"+pos;
    imgPosSliderEl.value = pos;
    //console.log("loadTime "+(Date.now()-timeLoadingImg)+"ms");
    return imgLoading = false;
  }
  return pos++;
}

stopAnimation = function(){ clearInterval(intervalId); }
startAnimation = function(interval){
  clearInterval(intervalId);
  intervalId = setInterval(function(){
    chImage();
  }, interval);
}
