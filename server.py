import json
import thread
import requests
import sys
import MySQLdb
import datetime
import time
from flask import Flask , jsonify , request, render_template
from docker import Client

app = Flask(__name__)

#creating docker Client
cli = Client(base_url='unix://var/run/docker.sock')


#rendering main page for Docker Monitoring Tool
@app.route("/")
def hello():
	return render_template('homepage.html')

#returns container id of all running containers
@app.route("/stats/")
def containerID():
	json_data={}
	#getting container id of all the running containers
	con_list=cli.containers(quiet=True)
	try:
		for con in con_list:
			#getting substring of container id (only first 12 bytes)
			e=con['Id']
			conid=e[0:12]
			#getting the container statistics 
			conlist = cli.stats(e)
			#getting the instance of generator object
			json_data[conid] = json.loads(next(conlist))
			dataStorage(json_data[conid],conid)
			
	except:
		#if error exists 
		print sys.exc_info()
		pass
	#returning statistics to template 
	return jsonify(json_data)

def dataStorage(json_data,conid):
	#creating MySQL connection
	db=MySQLdb.Connect("localhost","root","v")
	cursor=db.cursor()
	#creating database if not exists
	cursor.execute("CREATE DATABASE IF NOT EXISTS DB")
	#using database
	cursor.execute("USE DB")
	#creates table if not exists by the name of container id  
	cursor.execute("CREATE TABLE IF NOT EXISTS "+conid+"(rx_bytes INT,rx_packet INT,rx_dropped INT,tx_bytes INT,tx_packet INT,tx_dropped INT,memory_usage INT,memory_limit BIGINT, currCPU INT,currSystem BIGINT,length INT,date VARCHAR(55),time VARCHAR(55))")
	#extracting information from the instance
	#inserting current time in database
	today = time.strftime("%Y-%m-%d")
	present =time.strftime("%H-%M-%S")
	currCPU =json_data['cpu_stats']['cpu_usage']['total_usage']
	currSystem = json_data['cpu_stats']['system_cpu_usage']
	length=len(json_data['cpu_stats']['cpu_usage']['percpu_usage'])
	rx_bytes=json_data['networks']['eth0']['rx_bytes']
	rx_packet=json_data['networks']['eth0']['rx_packets']
	rx_dropped=json_data['networks']['eth0']['rx_dropped']
	tx_bytes=json_data['networks']['eth0']['tx_bytes']
	tx_packet=json_data['networks']['eth0']['tx_packets']
	tx_dropped=json_data['networks']['eth0']['tx_dropped']
	memory_usage=json_data['memory_stats']['usage']
	memory_limit=json_data['memory_stats']['limit']
	#insert row into database
	cursor.execute("INSERT INTO "+conid+"(rx_bytes,rx_packet,rx_dropped,tx_bytes,tx_packet,tx_dropped,memory_usage,memory_limit,currCPU,currSystem,length,date,time) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",(rx_bytes,rx_packet,rx_dropped,tx_bytes,tx_packet,tx_dropped,memory_usage,memory_limit,currCPU,currSystem,length,today,present))
	#commit changes to the containers
	db.commit()
	#closing db connection
	db.close()

#retreives data from the database	
@app.route("/db/<conid>")
def db(conid):
	db=MySQLdb.Connect("localhost","root","v")
	cursor=db.cursor()
	cursor.execute("CREATE DATABASE IF NOT EXISTS DB")
	cursor.execute("USE DB")
	sql = "SELECT * FROM "+conid
	json_data={}
	jsonData={}
	i=0;
	try:
   		cursor.execute(sql)
   		results = cursor.fetchall()
   		for row in results:
			json_data['rx_bytes']=row[0]
			json_data['rx_packets']=row[1]
			json_data['rx_dropped']=row[2]
			json_data['tx_bytes']=row[3]
			json_data['tx_packets']=row[4]
			json_data['tx_dropped']=row[5]
			json_data['mem_usage']=row[6]
			json_data['mem_limit']=row[7]
			json_data['total_usage']=row[9]
			json_data['cpu_usage']=row[8]
			json_data['length']=row[10]
			json_data['date']=row[11]
			json_data['time']=row[12]
			json.dumps(json_data)
			json_data={}
			jsonData[i]=json_data;
			i = i + 1
	except:
   		print "Error: unable to fecth data"
	db.close()
	return jsonify(jsonData)
		

#list all containers present in the system
@app.route("/listContainer/")
def Listingcontainer():
	try:
		con_list=cli.containers(quiet=True,all=True)
		return str(json.dumps(con_list))
	except:
		return str("Error")		

#start a conatiner of name given by container id
@app.route("/start/<containerid>")
def startContainer(containerid):
	try:
		conStart = cli.start(container=containerid)	
		return str("Success")
	except:
		return str("Error")

#stop a conatiner of name given by container id
@app.route("/stop/<containerid>")
def stopContainer(containerid):
	try:
		conStop = cli.stop(container=containerid)	
		return str("Success")
	except:
		return str("Error")

#Pause a conatiner of name given by container id
@app.route("/pause/<containerid>")
def pauseContainer(containerid):
	try:
		conPause = cli.pause(container=containerid)	
		return str("Success")
	except:
		return str("Error")
		

#resume a container of name given by container id
@app.route("/unpause/<containerid>")
def unpauseContainer(containerid):
	try:
		conPause = cli.unpause(container=containerid)	
		return str("Success")
	except:
		return str("Error")

#Remove a conatiner of name given by container id
@app.route("/remove/<containerid>")
def removeContainer(containerid):
	try:
		conRemove = cli.remove_container(container=containerid)	
		return str("Success")
	except:
		return str("Error")
	
#create a container
@app.route("/create",methods=['POST'])
def createContainer():
	try:
		image=request.form.get('image')
		cname=request.form.get('name')
		command=request.form.get('command')
		cid=cli.create_container(image=image,command=command,name=cname)
		cli.start(container=cid)
		return jsonify(cid)
	except:
	    return str("Error")	

#Restart a conatiner of name given by container id
@app.route("/restart/<containerid>")
def restartContainer(containerid):
	try:
		conRestart = cli.restart(container=containerid)	
		return str("Success")
	except:
		return str("Error")		


#Getting all the static container information
@app.route("/staticData/")
def staticData():
	json_data={}
	#getting all the container's id of the machine
	con_list=cli.containers(quiet=True,all=True)
	try:
		for con in con_list:
			conlist = cli.inspect_container(container=con['Id'])
			b=con['Id']
			c=b[0:12]
			json_data[c] = conlist
	except:
		print sys.exc_info()
		pass
		
	return jsonify(json_data)

@app.route("/containerStats/<containerid>")
def containerStatistics(containerid):
	try:
		conInspect=cli.inspect_container(container=containerid)
		return str(json.dumps(conInspect))
	except:
		return str("Error")

#running web app
if __name__ =="__main__":
	app.run(threaded=True,debug=True)
