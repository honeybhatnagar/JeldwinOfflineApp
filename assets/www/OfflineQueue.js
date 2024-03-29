function OfflineQueue() {

}

/**
 * Queue for later upload
 **/
OfflineQueue.QueueRecords = function(records,error){
    //DF12 DEMO 19 -- REGISTER QUEUE SOUP AND STORE QUEUE RECORDS
	console.log('OfflineQueue.QueueRecords');	
	OfflineQueue.RegisterQueueSoup(function(){
		navigator.smartstore.upsertSoupEntriesWithExternalId('Queue',records, 'Id', function(){
			console.log("Queue Upsert Success");        
		}, error);		
	},error);
}

/**
 * Upload Queue to Salesforce
 **/
OfflineQueue.UploadQueue = function(callback,error) {
	console.log("OfflineQueue.UploadQueue");
	if(Util.checkConnection()) {
      	console.log("OfflineQueue.UploadQueue -- app is online");
        //DF12 DEMO 23 -- UPLOAD QUEUE TO SFDC
		navigator.smartstore.soupExists('Queue',function(param){
			if(param)
			{
                console.log("OfflineQueue.UploadQueue -- Queue exists");
				OfflineQueue.LoadRecordsFromQueue(function(records) {
					if(records.length==0){
                       	console.log("OfflineQueue.UploadQueue -- no records in queue");
						callback();
					}
					else {				
                        console.log("OfflineQueue.UploadQueue -- iterating records");
						for(i in records){
							forcetkClient.update('Contact',records[i].Id,{"Name":records[i].Name},function(){
								console.log('QUEUED SFDC Update Success!');
                                //DF12 DEMO 24 -- ON SUCCESS, REMOVE RECORD FROM QUEUE
								navigator.smartstore.removeFromSoup('Queue',[records[i]._soupEntryId],function(){
									console.log('Removed from Soup');
									if(i == records.length-1) {
										callback();
									}
								},error);
							},error);				
						}
					}
				},error);
			}
			else {
				console.log("Offline queue doesn't exist yet... must not be any records there...")
				callback();
			}
		},error);


	}
	else {
		console.log("We're offline, can't upload queue... how'd we even get here?")
		callback();
	}

}

/**
 * Load records from Queue
 **/
OfflineQueue.LoadRecordsFromQueue = function(callback,error){
	console.log("OfflineQueue.loadRecordsFromQueue");
	var that=this;
    var querySpec = navigator.smartstore.buildAllQuerySpec("Id", null, 2000);
        
    navigator.smartstore.querySoup('Queue',querySpec, function(cursor) { 
		var records = [];
		records = Util.LoadAllRecords(cursor,records);
		//close the query cursor
		navigator.smartstore.closeCursor(cursor);
		callback(records);
    },error);
}

/**
 * Store Records
 **/
OfflineQueue.StoreRecords = function(records,error){
	console.log('OfflineQueue.storeRecords');
	console.log(records);
    //DF12 DEMO 9 -- SMARTSTORE UPSERT
    //GOTO DF12 7
	navigator.smartstore.upsertSoupEntries('JeldwinContacts',records, function(){
		console.log("Soup Upsert Success");        
	}, error);

    //DF12 DEMO 18 -- QUEUE THE RECORDS IF WE'RE OFFLINE
	//if we're not connected, queue the records
	if(!Util.checkConnection()){
		OfflineQueue.QueueRecords(records,error);
	}
}

/**
 * Register the Queue soup if it doesn't already exist
 **/
OfflineQueue.RegisterQueueSoup = function(callback,error){
	console.log('OfflineQueue.registerQueueSoup');
	//check if the Contact soup exists
	navigator.smartstore.soupExists('Queue',function(param){
		if(!param){
			//Contact soup doesn't exist, so let's register it
			var indexSpec=[{"path":"Id","type":"string"}];
			navigator.smartstore.registerSoup('Queue',indexSpec,function(param){
				console.log('Soup Created: '+param);
				callback();
			},error);
		}
		else {
			callback();
		}
	},error);
}
