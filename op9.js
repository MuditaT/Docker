var memPercent=0.0;
var pre_u =[];
var curr_u =[];
var pre_s =[];
var pre_count=[];
var curr_s =[];
var cpuPoints = [];
var memPoints = [];
var netPoints = [];
var t_packet_count=0;
var r_packet_count=0;
var totalCpuPercent=0.0;
var staticData;
$(document).ready(function()
{	
	slider();	
	cpuPlotgraph();
	memPlotgraph();
	netPlotgraph();
	containerManipulation();	
});
setInterval(function()
{ 
	 drawTable();
	 getStaticData();
	getList();
}, 1000);

	

function slider()
{
	//alert slider	
	var timer = setInterval(showAlert, 2000);		//calls every 5 sec
	var counter = 0;
	function showAlert() 
	{
		if(counter ==0) 
		{ 
			for(;counter<1001;++counter);
		}	//waits till counter loops till 1000
		if(counter== 1001)
		{	
			$("#alert").slideToggle(10000);			//shows the alert. Animates for 10sec to come down
			$("#alert").slideToggle(10000);			//hides it. Animates for 10secs to go up
			counter=0;
		}		
	}
}
//function for drawing table 
function drawTable()
{
	var statsData={};
	$.when(
		$.getJSON("stats", function(data) 
		{
			statsData = data;
		})).then(function() 
		{   			
	    	var htmlCode = '';
	    	var currCPU = 0.0;
	    	var len = 0.0;
	    	var currSystem = 0.0;
	    	memPercent=0.0;
	    	var memUsage=0.0;
	    	var memLimit=0.0;
	    	t_packet_count=0;
	    	r_packet_count=0;
	    	var htmlCode = "";
	    	$('#alert_info').empty().append("No Alerts")
	    	$.each(statsData, function(id, stats) 
	    	{
				cont_id= id.substr(0,12);
	    		currCPU = parseFloat(stats['cpu_stats']['cpu_usage']['total_usage']);
	    		currSystem = parseFloat(stats['cpu_stats']['system_cpu_usage']);
	   			len = parseFloat((stats['cpu_stats']['cpu_usage']['percpu_usage']).length);
	   			memUsage += parseFloat(stats['memory_stats']['usage']);
	   			memLimit = parseFloat(stats['memory_stats']['limit']);
	   			curr_u[cont_id]=currCPU;
    			curr_s[cont_id]=currSystem;	    				
    			var cpuPercent = getCpuPercent(pre_u[cont_id], pre_s[cont_id],curr_u[cont_id],curr_s[cont_id],len);
	    		if(isNaN(cpuPercent))
	    		{
					cpuPercent=0.0;
				}
				if(cpuPercent>0.02)
				{
					alertCode=""+cont_id+" exceeds CPU threshold 0.02%<br/>";
					$('#alert_info').empty().append(alertCode);
				}
	    		totalCpuPercent += cpuPercent;
	    		htmlCode += "<tr><td id='link' class= 'containerclass' style='padding: 0%; width: 12.84%;'>"+cont_id+"</td><td  style='padding: 0%; width: 26.5%'>"+staticData[id]['Name']+"</td><td style='padding: 0%; width:10%;'>" + stats['networks']['eth0']['rx_bytes'] + "</td><td style='padding: 0%; width: 11.9%;' >" + stats['networks']['eth0']['rx_packets'] + "</td><td style='padding: 0%; width: 9.4%;' >" + stats['networks']['eth0']['tx_bytes'] +"</td><td style='padding: 0%; width: 11.4%;' >" + stats['networks']['eth0']['tx_packets'] +"</td><td style='padding: 0%; width: 8.9%;' >" +cpuPercent.toFixed(2)+"%" + "</td><td style='padding: 0%; width: 8.7%;' >" + ((parseFloat(stats['memory_stats']['usage']))/(1024*1024)).toFixed(2) +"MB" + "</td><td style='padding: 0%; width: 9%;' >"+staticData[id]['State']['Status']+"</td></tr>";
	    		t_packet_count += stats['networks']['eth0']['tx_packets'];
	    		r_packet_count += stats['networks']['eth0']['rx_packets'];
	    		pre_u[cont_id]=currCPU;
	    		pre_s[cont_id]=currSystem;
	    	});
		    
		    
		    var value = $('#searchbar').val();
		   	if(value)
		    {
		    }
		    else
		    {
		    	document.getElementById('tbl_tbody').innerHTML = htmlCode;
		    }
		    memPercent = (memUsage/memLimit)*100;
		    if(isNaN(memPercent))
	    	{
				memPercent=0.0;
			}
		    if(memPercent>0.5)
			{
				alertCode="Total Memory usage exceeds threshold 0.5%<br/>";
				$('#alert_info').append(alertCode);
			}
		    networkInformation(t_packet_count,r_packet_count);
		    displaymetrics(totalCpuPercent,memPercent);
		});

}

function displaymetrics(cpuPercent,memPercent)
{
	if(isNaN(memPercent))
	{
				memPercent=0.0;
	}
	document.getElementById('Total_Mem').innerHTML = memPercent.toFixed(2)  + "%";
	document.getElementById('Total_CPU').innerHTML = totalCpuPercent.toFixed(2) + "%";
}

function networkInformation(t_packet_count,r_packet_count)
{
	var networkCode ="<br/>";	
	networkCode += "Transmitted Packets <br> "+t_packet_count+"<br>";
	networkCode += "Received Packets <br> "+r_packet_count+"<br>";
	document.getElementById('nwdata').innerHTML = networkCode; 
}



//graph plotting

function cpuPlotgraph()
{       
	$('#cgraph').jqChart({
	title: { 
				text: 'CPU Usage', 
				fillStyle: 'white'
			},
	border: {
				    cornerRadius: 0,
				    lineWidth: 0
		},
					
	axes: [{
				location: 'left',
				strokeStyle: 'white',
				fillStyle: 'white',
				majorTickMarks: 
				{
					strokeStyle: 'white'
				},
				labels:
				{
					fillStyle: 'white'
				}
			},    
			{
				location: 'bottom',			 
				strokeStyle: 'white',
				fillStyle: 'white',
				zoomEnabled : true,
				majorTickMarks: 
				{
				    strokeStyle: 'white'
				},
				labels: 
				{
					fillStyle: 'white'
				}
			}],
	background: 'rgba(0,0,0,0)',
	shadows: {
				enabled: true
			},
	series: [{
		        type: 'line',
		        data: cpuPoints,						
		    }]
	});
	cupdatechart();
}

//update function for total CPU usage Chart
function cupdatechart() 
{            
	var xVal=new Date();
	valueFormatString: "hh:mm:ss",	
	yValue = totalCpuPercent;
	if(yValue<0.0)
	{
		yValue=0.0;
	}
	cpuPoints.push([xVal, yValue]);
	totalCpuPercent=0.0;
    $('#cgraph').jqChart('update');
    setTimeout("cupdatechart()", 5000);
}





function memPlotgraph()
{       
	$('#mgraph').jqChart({
	title: { 
				text: 'Memory Usage', 
				fillStyle: 'white'
			},
	border: {
				    cornerRadius: 0,
				    lineWidth: 0
		},
					
	axes: [{
				location: 'left',
				strokeStyle: 'white',
				fillStyle: 'white',
				majorTickMarks: 
				{
					strokeStyle: 'white'
				},
				labels:
				{
					fillStyle: 'white'
				}
			},    
			{
				location: 'bottom',			 
				strokeStyle: 'white',
				fillStyle: 'white',
				zoomEnabled : true,
				majorTickMarks: 
				{
				    strokeStyle: 'white'
				},
				labels: 
				{
					fillStyle: 'white'
				}
			}],
	background: 'rgba(0,0,0,0)',
	shadows: {
				enabled: true
			},
	series: [{
		        type: 'line',
		        data: memPoints,						
		    }]
	});
	mupdatechart();
}

//update function for total CPU usage Chart
function mupdatechart() 
{            
	var xVal=new Date();
	valueFormatString: "hh:mm:ss",	
	yValue = memPercent;
	memPoints.push([xVal, yValue]);
	memPercent=0.0;
    $('#mgraph').jqChart('update');
    setTimeout("mupdatechart()", 5000);
}


function netPlotgraph()
{       
	$('#ngraph').jqChart({
	title: { 
				text: 'Network Usage', 
				fillStyle: 'white'
			},
	border: {
				    cornerRadius: 0,
				    lineWidth: 0
		},
					
	axes: [{
				location: 'left',
				strokeStyle: 'white',
				fillStyle: 'white',
				majorTickMarks: 
				{
					strokeStyle: 'white'
				},
				labels:
				{
					fillStyle: 'white'
				}
			},    
			{
				location: 'bottom',			 
				strokeStyle: 'white',
				fillStyle: 'white',
				zoomEnabled : true,
				majorTickMarks: 
				{
				    strokeStyle: 'white'
				},
				labels: 
				{
					fillStyle: 'white'
				}
			}],
	background: 'rgba(0,0,0,0)',
	shadows: {
				enabled: true
			},
	series: [{
		        type: 'line',
		        data: netPoints,						
		    }]
	});
	nupdatechart();
}

//update function for total CPU usage Chart
function nupdatechart() 
{            
	var xVal=new Date();
	valueFormatString: "hh:mm:ss",	
	yValue = t_packet_count;
	netPoints.push([xVal, yValue]);
    $('#ngraph').jqChart('update');
    setTimeout("nupdatechart()", 5000);
}





















//getting static Data 
function getStaticData()
{
	$.getJSON("staticData", function(data3) 
	{
		staticData = data3;
	}); 
}
//getting list of container id 
function getList()
{
	var statsData={};
	$.when($.getJSON("listContainer", function(data) 
	{
		statsData = data;
	})).then(function() 
	{
		$.each(statsData, function(id,data1) 
		{
	    	$("#conlist").append($("<option></option>").val(data1['Id'].substr(0,12)).html("<a href ='' id='"+data1[id]+"' class= 'containerclass'>"+data1['Id'].substr(0,12)+"</a>"));
	   	});		
	});
}

















//all container Manipulation Function
function containerManipulation()
{
	$("#submit1").click(function() 
	{
    	var cname= $('#cname').val();
    	var image=$('#name').val();
    	var command=$('#command').val();
		$.ajax({
			url:'/create',
			type: 'POST',
			data: {"name":cname,"image":image,"command":command},
			success: function(data8)
			{
				if(data8=="Error")
				{
					swal("Can't Create the Container");
				}
				else
				{
					swal("Container ID: "+ data8['Id'].substr(0,12)+" has been created successfully");
				}
			}
		});
   	});
				
	                                                                                    //Script for Container Manipulation
	$("#start").click(function() 
	{
		var clickedId= $('#conlist').val();
		$("#start").ajaxStart(function(){
        $("#wait").css("display", "block");
    });
    
		$.ajax({
			url:'/start/'+clickedId,
			type: 'GET',
			success: function(data)
			{
				if(data=="Error")
				{
					swal("Can't start the container "+clickedId);
				}
				else
				{
    				swal("Container "+clickedId+" has been started successfully");
    					
				}
			}
		});
		
		
	});
	
	$("#stop").click(function() 
	{
    	var clickedId= $('#conlist').val();	
    	$("#stop").ajaxStart(function(){
        $("#wait").css("display", "block");
    });			 
		$.ajax({	
			url:'/stop/'+clickedId,
			type: 'GET',
			success: function(data)
			{
				if(data=="Error")
				{
					swal("Can't stop the container "+clickedId);
				}
				else
				{								
					swal("Container "+clickedId+" has been stopped successfully");
					
				}
				
			}
		});
		$("#stop").ajaxComplete(function(){
							$("#wait").css("display", "none");
						});	
		
    
	});
   			
	$("#pause").click(function() 
	{
		var clickedId= $('#conlist').val();
 		$.ajax({	
			url:'/pause/'+clickedId,
			type: 'GET',
			success: function(data)
			{
				if(data=="Error")
				{
					swal("Can't pause the container "+clickedId);
				}
				else
				{			
					swal("Container "+clickedId+" has been paused successfully");
				}
			}
		});
   	});
   	$("#unpause").click(function() 
	{
		var clickedId= $('#conlist').val();
 		$.ajax({	
			url:'/unpause/'+clickedId,
			type: 'GET',
			success: function(data)
			{
				if(data=="Error")
				{
					swal("Can't resume the container "+clickedId);
				}
				else
				{			
					swal("Container "+clickedId+" has been resumed successfully");
				}
			}
		});
   	});
		
	$("#restart").click(function() 
	{
    	var clickedId= $('#conlist').val();  				 
		$.ajax({	
			url:'/restart/'+clickedId,
			type: 'GET',
			success: function(data)
			{
				if(data=="Error")
				{
					swal("Can't stop the container "+clickedId);
				}
				else
				{			
					swal("Container "+clickedId+" has been restarted successfully");
				}
			}
		});
   	});   	

	$("#remove").click(function() 
	{
    	var clickedId= $('#conlist').val();  				 
		$.ajax({		
			url:'/remove/'+clickedId,
			type: 'GET',
			success: function(data)
			{
				if(data=="Error")
				{
					swal("Can't stop the container "+clickedId)
				}
				else
				{			
					swal("Container "+clickedId+" has been removed successfully");
				}
			}
		});
   	});   	
	
	$("#report").click(function() 
	{
    	var clickedId= $('#conlist').val();				 
		$.ajax({
			url:'/db/'+clickedId,
			type: 'GET',
			success: function(dbData)
			{
				var htmlCode = "";
				
				var i=0;
				var pre_u=0.0;
				var pre_s=0.0;
				var curr_u=0.0;
				var curr_s=0.0;
				var points=[];
				var mpoints=[];
				var npoints=[];
				$.each(dbData, function(id, stats) 
				{
					currCPU = parseFloat(stats['cpu_usage']);
					currSystem = parseFloat(stats['total_usage']);
					len = parseFloat(stats['length']);
					memUsage = parseFloat(stats['mem_usage']);
					memLimit = parseFloat(stats['mem_limit']);
					date=stats['date'];
					time=stats['time'];
					timestamp=date+" "+time;
					curr_u=currCPU;
					curr_s=currSystem;
					if(i==0)
					{
						pre_u=currCPU;
						pre_s=currSystem;
					}
					var cpuPercent = getCpuPercent(pre_u, pre_s,curr_u,curr_s,len);
					if(isNaN(cpuPercent))
					{
						cpuPercent=0.0;
					}
					if(cpuPercent<0.0)
					{
						cpuPercent=0.0;
					}
					var mpercent=(memUsage/memLimit)*100;
					var xVal=i;	
					i++;
			    	var yValue = cpuPercent;
			    	var memValue=mpercent;
			    	var nValue=parseInt(stats['tx_packets']);
			    	points.push([xVal, yValue]);
			    	mpoints.push([xVal, memValue]);
			    	npoints.push([xVal, nValue]);
					htmlCode += "<tr><td style='padding:0%; width:13% ;'>" + stats['date'] + "</td><td style='padding:0%; width:13% ;'>" + stats['time'] + "</td><td style='padding:0%; width:13% ;'>" + stats['rx_bytes'] + "</td><td style='padding:0%; width:12% ;'>" + stats['rx_packets'] + "</td><td style='padding:0%; width:13% ;'>" + stats['tx_bytes'] +"</td><td style='padding:0%; width:12% ;'>" + stats['tx_packets'] +"</td><td style='padding:0%; width:13% ;'>" +cpuPercent.toFixed(2)+"%" + "</td><td style='padding:0%; width:8% ;'>" + ((parseFloat(stats['mem_usage']))/(1024*1024)).toFixed(2) +"MB" + "</td></tr>";
					pre_u=currCPU;
					pre_s=currSystem;
	    		});
		    	//htmlCode+= "</tbody></table>";
				var clickedId= $('#conlist').val();		 
				$.ajax({
					url:'/containerStats/'+clickedId,
					type: 'GET',
					success: function(data)
					{
						var data1= JSON.parse(data);
						var info= "<br><br><br>";
						info += "Id : "+data1['Id']+"<br>";
						info += "Container Name : "+data1['Name']+"<br>";
						info += "Pid : "+data1['State']['Pid']+"<br>";
						info += "Created at : "+data1['Created']+"<br>";
						info += "IP Address : "+data1['NetworkSettings']['Networks']['bridge']['IPAddress']+"<br>"; 
						info += "MAC Address : "+data1['NetworkSettings']['Networks']['bridge']['MacAddress']+"<br>";
						info += "Process : "+data1['Path']+"<br>";
						info += "Started at : "+data1['State']['StartedAt']+"<br>";
						info += "Image id : "+data1['Image']+"<br>";
						document.getElementById('staticinfo').innerHTML = info;
					}
				});
				document.getElementById('ctbl_tbody').innerHTML = htmlCode;	
				//check for array passing
				$("#hcpu_btn").click(function() 
				{
    				var clickedId= $('#conlist').val();  				 
				});   	
	
				historyCGraph(points);	
				historyMGraph(mpoints);
				historyNGraph(npoints);		
			}
						
		});
   });

   			
}


//function for plotting report generated graph
function historyCGraph(points)
{
	$('#hcgraph').jqChart({
	title: { 
				text: 'CPU Usage', 
				fillStyle: 'white'
			},
	border: {
				    cornerRadius: 0,
				    lineWidth: 0
		},
	axes: [{
				location: 'left',
				strokeStyle: 'white',
				fillStyle: 'white',					
				majorTickMarks: 
				{
					strokeStyle: 'white'
				},
				labels:
				{
					fillStyle: 'white'
				}
			}, 
			{
				location: 'bottom',			 
				strokeStyle: 'white',
				fillStyle: 'white',
				zoomEnabled: true,
				majorTickMarks: 
				{
				    strokeStyle: 'white'
				},
				labels: 
				{
					fillStyle: 'white'
				}
								
			}],
	background: 'rgba(0,0,0,0)',
	shadows: {
			    enabled: true
			},
	tooltips: {
                type: 'shared'
            },
	series: [{
		   		type: 'line',
				data: points,
				markers: null						
			}]
	});
}

function historyMGraph(points)
{
	$('#hmgraph').jqChart({
	title: { 
				text: 'Memory Usage', 
				fillStyle: 'white'
			},
	border: {
				    cornerRadius: 0,
				    lineWidth: 0
		},
	axes: [{
				location: 'left',
				strokeStyle: 'white',
				fillStyle: 'white',					
				majorTickMarks: 
				{
					strokeStyle: 'white'
				},
				labels:
				{
					fillStyle: 'white'
				}
			}, 
			{
				location: 'bottom',			 
				strokeStyle: 'white',
				fillStyle: 'white',
				zoomEnabled: true,
				majorTickMarks: 
				{
				    strokeStyle: 'white'
				},
				labels: 
				{
					fillStyle: 'white'
				}
								
			}],
	background: 'rgba(0,0,0,0)',
	shadows: {
			    enabled: true
			},
	tooltips: {
                type: 'shared'
            },
	series: [{
		   		type: 'line',
				data: points,
				markers: null						
			}]
	});
}

function historyNGraph(points)
{
	$('#hngraph').jqChart({
	title: { 
				text: 'Network Usage', 
				fillStyle: 'white'
			},
	border: {
				    cornerRadius: 0,
				    lineWidth: 0
		},
	axes: [{
				location: 'left',
				strokeStyle: 'white',
				fillStyle: 'white',					
				majorTickMarks: 
				{
					strokeStyle: 'white'
				},
				labels:
				{
					fillStyle: 'white'
				}
			}, 
			{
				location: 'bottom',			 
				strokeStyle: 'white',
				fillStyle: 'white',
				zoomEnabled: true,
				majorTickMarks: 
				{
				    strokeStyle: 'white'
				},
				labels: 
				{
					fillStyle: 'white'
				}
								
			}],
	background: 'rgba(0,0,0,0)',
	shadows: {
			    enabled: true
			},
	tooltips: {
                type: 'shared'
            },
	series: [{
		   		type: 'line',
				data: points,
				markers: null						
			}]
	});
}

//function for calculating CPU percent
function getCpuPercent(preCPU, preSystem,currCPU,currSystem,x)                  
{
	var returnValue =0.0;
    var CpuPercent= 0.0	;
    preCPU= parseFloat(preCPU);
    preSystem= parseFloat(preSystem);
    currCPU= parseFloat(currCPU);
    currSystem= parseFloat(currSystem);
    var CpuDelta= parseFloat(currCPU - preCPU);
    var SysDelta= parseFloat(currSystem - preSystem);
    CpuPercent = ((CpuDelta)/SysDelta)*x*100;
    returnValue=CpuPercent;
    return returnValue;

}
