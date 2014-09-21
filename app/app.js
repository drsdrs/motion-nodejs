
var images, pos, imgEl, intervalId;

window.onload = function(){
  images = [];
  pos = 0;
  imgEl = document.getElementById("imgVideo");
  spdSlider = document.getElementById("spdSlider");

  loadImgData(5000);
  startAnimation(1120);

  spdSlider.addEventListener("change", function(e){
    startAnimation(e.target.value);
  }); 

}

loadImgData = function(refreshRate){
  xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","/images", true);
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      result=JSON.parse(xmlhttp.responseText);
      images = result;
      setTimeout(function(){
        loadImgData(refreshRate);
      }, refreshRate);
    }
   }
   xmlhttp.send();
}


animate = function() {
  len = images.length;
  pos = pos%len;
  src = "data/"+images[pos];
  imgEl.src = src;
  pos++;
}

startAnimation = function(interval){
  clearInterval(intervalId);
  intervalId = setInterval(function(){
    animate();
  }, interval);
}