var images, pos, intervalId, startAt, endAt
, startAtEl, playtStopEl, imgEl, imgPosEl, rmImagesEl, rmAllImagesEl, makeGifEl
, errorReported = false
, mousedown = false
, play = true
, imgLoading = false
, firstImgDataLoad = true
, timeLoadingImg = Date.now()
, motionOptions = [
  "width",
  "height",
  "rotate",
  "pre_capture",
  "post_capture",
  "framerate",
  "threshold",
  "threshold_tune",
  "noise_level",
  "noise_tune",
  "quality",
  "text_right",
  "text_left"
];

window.onload = function(){
  images = [];
  pos = 0;
  imgEl = document.getElementById("imgVideo");
  spdSliderEl = document.getElementById("spdSlider");
  startAtEl = document.getElementById("startAt");
  endAtEl = document.getElementById("endAt");
  videoWrapEl = document.getElementById("videoWrap");
  playStopEl = document.getElementById("playStop");
  imgPosEl = document.getElementById("imgPos");
  imgPosSliderEl = document.getElementById("imgPosSlider");
  rmImagesEl = document.getElementById("rmImages");
  rmAllImagesEl = document.getElementById("rmAllImages");
  motionOptionsEl = document.getElementById("motionOptions");
  motionOptionInputEl = document.getElementById("motionOptionInput");
  motionOptionInfoEl = document.getElementById("motionOptionInfo");
  startStopMotionEl = document.getElementById("startStopMotion");
  toggleStreamEl = document.getElementById("toggleStream");
  liveStreamEl = document.getElementById("liveStream");
  writeMotionConfigEl = document.getElementById("writeMotionConfig");
  makeMovieSelEl = document.getElementById("makeMovieSel");
  makeMovieAllEl = document.getElementById("makeMovieAll");

  function toggleStream(e){
    liveStreamEl.style.display = "block";
    closeBtn = document.createElement("button");
    closeBtn.innerHTML = closeBtn.innerText ="X";
    closeBtn.addEventListener("click", function(e){
      liveStreamEl.innerHTML = "";
      liveStreamEl.style.display = "none";
    });
    img = document.createElement("img");
    img.src = "http://127.0.0.1:3600/";
    liveStreamEl.appendChild(img);
    liveStreamEl.appendChild(closeBtn);
  }

  function makeMovieAll(){
    pre_toggleDownloadMovieWindow()
    post("makeMovieAll", "fps="+spdSliderEl.value, function(res){
      toggleDownloadMovieWindow();
      console.log("makeMovieAll done...");
    });
  }

  function makeMovieSel(){
    pre_toggleDownloadMovieWindow()
    post("makeMovieSel", "start="+startAt+"&end="+endAt+"&fps="+spdSliderEl.value, function(res){
      toggleDownloadMovieWindow();
      console.log("makeMovieSel done...");
    });
  }

  function writeMotionConfig(){
    post("writeMotionConfig");
  }

  function pre_toggleDownloadMovieWindow(){
    liveStreamEl.style.display = "block";
    loadingEl = document.createElement("div");
    loadingEl.className = "loading";
    liveStreamEl.appendChild(loadingEl);
  }

  function toggleDownloadMovieWindow(){
    closeBtn = document.createElement("button");
    closeBtn.innerHTML = closeBtn.innerText ="X";
    closeBtn.addEventListener("click", function(e){
      liveStreamEl.innerHTML = "";
      liveStreamEl.style.display = "none";
    });
    downloadBtn = document.createElement("a");
    downloadBtn.download = "movie.mp4";
    downloadBtn.href = "/movie.mp4";
    downloadBtn.innerHTML = downloadBtn.innerText ="Download";
    downloadBtn.addEventListener("click", function(e){
      // download movie.mp4
    });
    video = document.createElement("video");
    video.src = "movie.mp4";
    video.loop = true;
    video.autoplay = true;
    video.controls = true;
    liveStreamEl.appendChild(video);
    liveStreamEl.appendChild(closeBtn);
    liveStreamEl.appendChild(downloadBtn);
  }

  function startStopMotion(e){
    e.target.innerHTML = "Loading..."
    post("startStopMotion", "", function(res){
      if(res=="running") { btnText = "Stop motion"; }
      else if(res=="stopped") { btnText = "Start motion"; }
      else { btnText = "ERROR"; }
      e.target.innerHTML = btnText;
    });
  }

  function initMotionOptions(){
    motionOptions.forEach(function(v,i) {
      setTimeout(function(){ // add delay because the order is mixed sometimes if req isnt fast enough
        post('getMotionConfig', "k="+v, function(res){
          if(res==="noConnectionError"&&errorReported===false){
            errorReported = true;
            setTimeout(function(){
              startStopMotionEl.click();
              location.reload();
            }, 1000);
          }
          var select = document.createElement("option");
          var optionText = v+" = "+res.split(v+" = ")[1].split(" ")[0];
          console.log(optionText);
          select.value = v;
          select.innerText = select.innerHTML = optionText;
          motionOptionsEl.appendChild(select);
        })
      }, 100);
    });
  }

  function changeMotionOption(e){
    post('getMotionConfig', "k="+e.target.value, function(res){
      ghostEl = document.createElement("div")
      ghostEl.innerHTML = res;
      info = ghostEl.getElementsByTagName("i")[0];
      data = ghostEl.getElementsByTagName("ul")[0].innerHTML;
      helpLink = ghostEl.getElementsByTagName("a")[1];
      motionOptionInfoEl.innerHTML = "";
      motionOptionInfoEl.appendChild(info);
      motionOptionInfoEl.appendChild(helpLink);
      motionOptionInput.value = data.split(" = ")[1].split(" ")[0];
    })
  }

  chStartAt = function(){
    startAt = parseInt(startAtEl.value);
    endAt = parseInt(endAtEl.value);
    console.log(startAtEl.value,  endAtEl.value);
    if(startAt>endAt){
      endAtEl.value = startAt;
      console.log("endAtEl small", endAtEl.value+"<="+startAt);
    }
    startAtEl.previousElementSibling.innerHTML = "startPos: "+startAt;
  }

  chEndAt = function(){
    startAt = parseInt(startAtEl.value);
    endAt = parseInt(endAtEl.value);
    console.log(startAtEl.value, endAtEl.value);
    if(startAt>endAt){
      startAtEl.value = endAt;
      console.log("startAtEl big", startAtEl.value+">"+endAt);
    }
    endAtEl.previousElementSibling.innerHTML = "endPos: "+endAt;
  }

  spdSliderEl.addEventListener("change", function(e){
    this.previousElementSibling.innerHTML = "Fps: "+this.value;
    if(play){ startAnimation(1000/e.target.value); }
  });


  function setMotionConfig(e){
    if(e.target.value.length>0){
      var len = e.target.previousElementSibling.childElementCount;
      while(len--){
        el = e.target.previousElementSibling[len];
        console.log(el);
        if(el.value===motionOptionsEl.value){
          el.innerHTML = motionOptionsEl.value+" = "+e.target.value
        }
      }
      post('setMotionConfig', "k="+motionOptionsEl.value+"&v="+e.target.value)
    }
  }


  function loadImgData(refreshRate){
    loadImageCallback = function(result){
      if(result) {
        data = JSON.parse(result);
        images = data;
        initSliders();
        if(firstImgDataLoad===true){
          endAtEl.max = images.length-1;
          endAtEl.value = images.length-1;
          firstImgDataLoad = false;
          chEndAt();
        }
      }
      setTimeout(function(){ loadImgData(refreshRate); }, refreshRate);
    }
    post("/getImages", "imageLength="+images.length, loadImageCallback)
  }

  function rmImages(){
    if (!confirm('Delete selected images?')) { return false; }
    post("/rmImages", "start="+startAt+"&end="+endAt);
    location.reload();
  }

  function rmAllImages(){
    if (!confirm('Delete all images?')) { return false; }
    post("/rmAllImages");
    location.reload();
  }

   function initSliders(){
    len = images.length-1;
    if(len>0){ startAtEl.max= len }else{ startAtEl.max =0 };
    startAtEl.previousElementSibling.innerHTML = "start at "+startAtEl.value;
    startAt = startAtEl.value;
    endAtEl.max = len;
    imgPosSliderEl.max = len
  }

  function slideImages(e){
    if (pos != e.target.value){
      console.log("slide");
      pos = e.target.value;
      chImage(pos);
    }
    return false;
  }

  function chImage(position) {
    pos = position || pos;
    len = images.length;
    if (endAt-startAt<1&&intervalId>0) return console.log("to less images...")
    src = images[pos]||null;
    if((pos >= endAt) && play) { pos = startAt;};
    if(src===null || imgLoading===true){
      return imgLoading = false;
    }
    imgLoading = true;
    imgEl.src = src;
    imgEl.onload = function(){
      imgPosEl.innerHTML = "pos :"+pos;
      if (intervalId>0) imgPosSliderEl.value = pos-1;
      return imgLoading = false;
    }
    return pos++;
  }

  function post(url, sendData, responseCallback) {
    var xmlhttpRequest = new XMLHttpRequest();
    xmlhttpRequest.open("POST", url, true);
    xmlhttpRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttpRequest.onreadystatechange = function(){
      if (xmlhttpRequest.readyState==4 && xmlhttpRequest.status==200 && typeof(responseCallback)==="function" ){
        responseCallback((xmlhttpRequest.responseText));
      }
    }
    return xmlhttpRequest.send(sendData||'');
  }

  function get(url, sendData) {
    var xmlhttpRequest = new XMLHttpRequest()
    xmlhttpRequest.open("GET", url, true);
    return xmlhttpRequest.send();
  }

  function stopAnimation(){
    clearInterval(intervalId);
    intervalId = -1;
  }

  function startAnimation(interval){
    clearInterval(intervalId);
    intervalId = setInterval(chImage, interval);
  }

  function startStop(e){
    e.stopPropagation()
    play = !play;
    if(play){ playStopEl.innerHTML = "STOP" }
    else { playStopEl.innerHTML = "PLAY" }
    imgLoading = false;
    if(play){ startAnimation(1000/spdSliderEl.value); }
    else { stopAnimation(); }
    return false
  };

  startAtEl.addEventListener("change", chStartAt);
  endAtEl.addEventListener("change", chEndAt);
  imgPosSliderEl.addEventListener("mousemove", function(e){ if(mousedown==true){ slideImages(e); } });
  imgPosSliderEl.addEventListener("keyup", slideImages);
  imgPosSliderEl.addEventListener("mousedown", function(e){ stopAnimation(); mousedown = true; slideImages(e); } );
  imgPosSliderEl.addEventListener("mouseup", function(e){ startAnimation(1000/spdSliderEl.value); mousedown = false; slideImages(e);  });
  rmImagesEl.addEventListener("click", rmImages);
  rmAllImagesEl.addEventListener("click", rmAllImages);
  motionOptionsEl.addEventListener("change", changeMotionOption)
  motionOptionInputEl.addEventListener("blur", setMotionConfig)
  writeMotionConfigEl.addEventListener("click", writeMotionConfig)
  startStopMotionEl.addEventListener("click", startStopMotion)
  toggleStreamEl.addEventListener("click", toggleStream)
  makeMovieAllEl.addEventListener("click", makeMovieAll)
  makeMovieSelEl.addEventListener("click", makeMovieSel)
  playStopEl.addEventListener("click", startStop);
  videoWrapEl.addEventListener("click", startStop);

  initMotionOptions();
  loadImgData(8000);
  startAnimation(1000/spdSliderEl.value);
  endAtEl.value = endAtEl.max = images.length;
  chEndAt();
}