(function(){

	var squareSize =  16;	
	var fragmentSize = 1024 / 4;  // 1 pixel
	
	var maxY = 15;
	
	var transparent = [0,0,0,255];
	
	
	var fragments=[];

	function getData(elementId){
		
		var img = document.getElementById(elementId);
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
		
		var worldW = canvas.width / squareSize;
		var worldH = Math.max(canvas.height / squareSize, maxY);
		
		for(var x = 0; x < worldW; x++){
			for(var y = 0; y < worldW; y++){
				var pixelData = pack(canvas.getContext('2d').getImageData(x * squareSize, y * squareSize, squareSize, squareSize).data);
					
					//debugger;
				var index = findFragment(pixelData);
				if(index == -1){
					fragments.push({
						data: pixelData,
						instances: 1
					});
				}				
				else{
					fragments[index].instances ++;
				}
			}		
		}
		
		return fragments.length;
	}
	
	function pack(data){
		var arr = new Uint32Array(fragmentSize);
		
		for(var i = 0; i < fragmentSize; i++){
			var j = i * 4;
			arr[i] = (data[j] << 24) + (data[j + 1] << 16) + (data[j + 2] << 8) + data[j + 3];
		}
		
		return arr;
	}
	
	
	function findFragment(data){
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
		
		for(var x = 0; x < 8; x++){
			for(var y = 0; y < 4; y++){
				var count = getData("test-image-" + (x + 1) + "-" + (y + 1))
				console.log(count);
			}	
		}	
		
	}
	

})();