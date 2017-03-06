(function(){

	var squareSize =  16;	
	var fragmentSize = 1024 / 4;  // 1 pixel
	
	var maxY = 15;
	var xxx = 0.0;
	
	var gain = 0;
	
	var mainCanvas = null;
	var ctx = null;
	
	var transparent = [0,0,0,255];
	
	var mode = 0;
		// 0 - edit map
		// 1 - edit UI

	function getData(elementId){
		
		var fragments=[];
		
		var img = document.getElementById(elementId);
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		var _ctx = canvas.getContext('2d');
		_ctx.drawImage(img, 0, 0, img.width, img.height);
		
		var worldW = canvas.width / squareSize;
		var worldH = Math.max(canvas.height / squareSize, maxY);

		var map = [];
		for(var x = 0; x < worldW; x++){
			var line = [];
			for(var y = 0; y < worldH; y++){
			
				var imageData = canvas.getContext('2d').getImageData(x * squareSize, y * squareSize, squareSize, squareSize);
				var pixelData = pack(imageData.data);
					
				
					//debugger;
				var index = findFragment(fragments, pixelData);
				if(index == -1){
					fragments.push({
						imageData:imageData,
						data: pixelData,
						instances: 1,
						posX: x,
						posY:y
					});
				
					line.push(fragments.length-1);				
					
				}				
				else{
					fragments[index].instances ++;
					line.push(index);				
				}
			}		
			map.push(line);
		}
		
		transparentColor = calculateBaseTransparency(fragments);
		
		
		_.forEach(fragments, function(f){
			if(f.instances < 2){
				f.badSample = true;
			}
		});
		
		
		return {
			transparentColor: transparentColor,
			fragments: fragments,
			map:map,
			x: worldW,
			y: worldH
		};
	}
	
	function pack(data){
		var arr = new Uint32Array(fragmentSize);
		
		for(var i = 0; i < fragmentSize; i++){
			var j = i * 4;
			arr[i] = (data[j] ) + (data[j + 1] << 8) + (data[j + 2] << 16) + (data[j + 3] << 24);
		}
		
		return arr;
	}
	
	function calculateBaseTransparency(fragments){
		
		var sorted = _.sortBy(fragments, function(f){
			return f.instances;
		});
		
		return sorted[0].data[0];
		
	
	}
	
	function findFragment(fragments, data){
		for(var i = 0;i < fragments.length; i++){
			var fr = fragments[i].data;
			var equal = true;
			for(var j = 0; j < fragmentSize; j++){				
				if(fr[j] != data[j]){
					equal = false;
					break;
				}
			}		
			if(equal){
				return i;
			}
		}
		
		return -1;
	}
	
	
	function open(stg, level){		

		xxx = 0.0;
	
		var s = (stg ) + "-" + (level);
		document.getElementById("stage").innerHTML = s;
		window.stage = getData("test-image-" + s);
		
		var canvas = document.createElement('canvas');
		
		mainCanvas = canvas;
		ctx = canvas.getContext('2d');
		
		canvas.width = squareSize * (maxY + 4);
		canvas.height = squareSize * maxY;

		if(document.getElementById("view").children.length > 0){
			var  child = document.getElementById("view").children[0]
			document.getElementById("view").removeChild(child);
		}
		
		document.getElementById("view").appendChild(canvas);
		



/*		var ctx = canvas.getContext('2d');
		
		for(var x = 0; x < stage.x; x++){
			for(var y = 0; y < stage.y; y++){
				var i = stage.map[x][y];		
				
				var imageData = stage.fragments[i].imageData;
				
				ctx.putImageData(imageData, x * squareSize, y * squareSize);
				if(stage.fragments[i].badSample){
					ctx.rect(x * squareSize, y * squareSize, squareSize, squareSize);
					ctx.stroke();					
				}
			}
		}		
*/		
	}
	function saveData(key, data){
		var json = JSON.stringify(data);
		localStorage.setItem(key, json);
	}
	
	function loadData(key){
		var json = localStorage.getItem(key);
		return JSON.parse(json);
	}		



	
	document.onkeydown = function(evt){
		if(evt.keyCode == 83) { // save
			
		}
		if(evt.keyCode == 76) { // load
			
		}

		if(evt.keyCode == 79) { // open
		
			var level = +window.prompt("Select level (1-8)");			
			if(typeof(level) == "number" && level > 0 && level < 9 ){
				var stg = +window.prompt("Select stage (1-4)");	
				if(typeof(stg) == "number" && stg > 0 && stg < 5 ){
					open(level, stg);
				}				
			}
		}
				
		if(evt.keyCode == 77) { // map
			setMode(0);
		}
		if(evt.keyCode == 85) { // UI
			setMode(1);
		}
		
		if(evt.keyCode == 39) { // Right
			gain += 0.03;
			if(gain > 1)
				gain = 1
		}
		if(evt.keyCode == 37) { // Left
			gain -= 0.02;
			if(gain < 0.0)
				gain = 0.0
		}
	}

	function setMode(m){
		mode = m;
		
		document.getElementById("mode").innerHTML = (m == 0) ? "Map" : "UI"
	}
	
	

	var lastTime = new Date().getTime();
	render = function(){		
	
		requestAnimationFrame(render);			
		
		var currTime = new Date().getTime();
		
		
		var step = (currTime - lastTime)
		
		lastTime = currTime;
		
		
		if(!mainCanvas){
			return;
		}
		
		console.log(step / 20) 
		
		
		xxx += (gain * (step / 10));
		
		
		
		if(xxx > ((window.stage.x  * squareSize) - (maxY + 5) * squareSize)){
			xxx = (window.stage.x  * squareSize) - (maxY + 5) * squareSize;
		}
		
		var offset = Math.floor(xxx / squareSize);
		var dist = Math.floor((offset * squareSize) - xxx);
		
		
		
		for(var x = 0; x < maxY + 5; x++){
			for(var y = 0; y < maxY; y++){
				var i = window.stage.map[offset + x][y];		
				
				var imageData = window.stage.fragments[i].imageData;
				
				ctx.putImageData(imageData, x * squareSize + dist, y * squareSize);

				if(mode == 0){
					if(window.stage.fragments[i].badSample){
						ctx.beginPath();
						ctx.lineWidth=1;
						ctx.strokeStyle="black";
						ctx.rect(x * squareSize + dist , y * squareSize , squareSize - 1, squareSize - 1);
						ctx.stroke();
					}
				}
			}
		}		
	}	
	
	window.onload = function(){
		setMode(0);
		
		
		
		
		
		document.getElementById("view").onclick = function(evt){
			
			if(evt.target.nodeName != "CANVAS"){
				return;
			}
		
			var offset = Math.floor(xxx / squareSize);
			var dist = Math.floor((offset * squareSize) - xxx);

			
			var x = Math.floor((evt.offsetX - dist) / squareSize) + offset;
			var y = Math.floor(evt.offsetY / squareSize);
			
			if(!window.stage.map)
				return;
			
			if(x >= window.stage.map.length || y >= window.stage.map[0].length)
				return;
			
			
			if(evt.ctrlKey){
				window.stage.map[x][y]--;
				if(window.stage.map[x][y] < 0)
					window.stage.map[x][y] = window.stage.fragments.length - 1;
			}else{
				window.stage.map[x][y]++;
				if(window.stage.map[x][y] >= window.stage.fragments.length)
					window.stage.map[x][y] = 0;
			}

			//ctx = mainCanvas.getContext('2d');
			
			/*var i = window.stage.map[x][y];
			var imageData = window.stage.fragments[i].imageData;
			ctx.putImageData(imageData, x * squareSize, y * squareSize);
		*/
				
			/*if(window.stage.fragments[i].badSample){
				ctx.rect(x * squareSize, y * squareSize, squareSize, squareSize);
				ctx.stroke();					
			}*/
		}
			
		
	}
	
	render();
	

})();