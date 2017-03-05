(function(){

	var squareSize =  16;	
	var fragmentSize = 1024 / 4;  // 1 pixel
	
	var maxY = 15;
	
	var transparent = [0,0,0,255];
	
	
	

	function getData(elementId){
		
		var fragments=[];
		
		var img = document.getElementById(elementId);
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
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
			if(f.data.length < 2){
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
	

	
	window.onload = function(){
		
		var stage = getData("test-image-1-1");
		
		var canvas = document.createElement('canvas');
		canvas.width = stage.x * squareSize;
		canvas.height = stage.y * squareSize;

		document.getElementById("view").appendChild(canvas)
		
		
		
		var ctx = canvas.getContext('2d');
		
		//var imageData = ctx.createImageData(squareSize, squareSize);
		
		
		for(var x = 0; x < stage.x; x++){
			for(var y = 0; y < stage.y; y++){
				var i = stage.map[x][y];
				var imageData = stage.fragments[i].imageData;
				
				ctx.putImageData(imageData, x * squareSize, y * squareSize);
			}
		}
		
		return;
		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 4; y++){
				var stage = getData("test-image-" + (x + 1) + "-" + (y + 1))
				//console.log(count);
			}	
		}	
		
	}
	

})();