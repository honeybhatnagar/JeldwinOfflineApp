function Jeldwin() 
{

}

/**
 * load records for the app
 **/
Jeldwin.prototype.loadRecords = function(error) {
	console.log("Jeldwin.prototype.loadRecords");
	var that = this;
    //DF12 DEMO 6 -- DECIDE WHETHER TO QUERY SFDC OR SMARTSTORE
	//check if we have local records -- if we do, just load those
	navigator.smartstore.soupExists('JeldwinContacts',function(param){
		if(param){
            //GOTO DF12 11
			that.loadRecordsFromSmartstore(error);
		}
		else {
            //GOTO DF12 7                        
			that.loadRecordsFromSalesforce(false,error);
		}
	},error);
}

/**
 * load records from salesforce
 **/
Jeldwin.prototype.loadRecordsFromSalesforce = function(soupExists,error) {
	console.log("Jeldwin.prototype.loadRecordsFromSalesforce");
	var that = this;
	//check if we're online
	if(Util.checkConnection()){
		console.log('We are online...');
		console.log('Upload any queued records from offline first');
        //DF12 DEMO 21 -- PUSH QUEUE TO SFDC
		OfflineQueue.UploadQueue(function(){
			console.log('We are online... querying SFDC');
            //DF12 DEMO 7 -- QUERY FROM SALESFORCE USING FORCETK
			forcetkClient.query("SELECT LastName,FirstName,Email,MailingCity,MailingState,Title,Account_Name__c,Phone,Id FROM Contact limit 100", function(response){  
                //GOTO DF12 8
				console.log(response.records);
				try{
					console.log(JSON.parse(response.records));
					}
					catch(e){
						
						console.log(e.message);
					}
                that.registerJeldwinSoup(function(){
                    //GOTO DF12 9
                	console.log(response.records);
					OfflineQueue.StoreRecords(response.records,error);
				},error);
                //GOTO DF12 10
				//that.populateListview(response.records);
			}, error); 
		},onError);
	}
	else {
		console.log('We are not online... querying SmartStore');
		if(soupExists) {
	  		that.loadRecordsFromSmartstore();
		}
		else {
	  		alert('ERROR: Not online and no local records exist');
		}
	}
}

/**
 * Load records from Smartstore
 **/
Jeldwin.prototype.loadRecordsFromSmartstore = function(error){
	console.log("Jeldwin.prototype.loadRecordsFromSmartstore");
	var that=this;
    //DF12 DEMO 11 QUERY SMARTSTORE
    //GOTO DF12 12
    var querySpec = navigator.smartstore.buildAllQuerySpec("Id", null, 2000);
        
    navigator.smartstore.querySoup('JeldwinContacts',querySpec,
                                  function(cursor) { that.onSuccessQuerySoup(cursor); },
                                  error);
}

/**
 * Load record with Id from Smartstore
 **/
Jeldwin.prototype.loadRecordWithIdFromSmartstore = function(Id,callback,error){
  	console.log("Jeldwin.prototype.loadRecordWithIdFromSmartstore");
	var that = this;
	var querySpec = navigator.smartstore.buildExactQuerySpec("Id", Id, 2000);
    navigator.smartstore.querySoup('JeldwinContacts',querySpec,
                                  function(cursor) { 
                                      var records = [];
                                      records = Util.LoadAllRecords(cursor,records);
                                      callback(records);
                                  },
                                  error);
}

/**
 * Update an entry changed by the user
 **/
Jeldwin.prototype.updateRecord = function(fieldData,error) {
	console.log('Jeldwin.prototype.updateRecord');
	var that=this;
    //DF12 DEMO 17 -- UPDATE SMARTSTORE RECORD
	that.loadRecordWithIdFromSmartstore(fieldData.id,function(records){
		console.log('Smartstore record loaded');
		//upate username/Jeldwin
		records[0].Username__c = fieldData.username;
		records[0].Contact = fieldData.Jeldwin;
		records[0].URL__c = fieldData.url;
		records[0].Name = fieldData.name;
        //GOTO DEMO 18
		OfflineQueue.StoreRecords(records,error);
		that.loadRecords(error);
	},error);

    //DF12 DEMO 20 -- SAVE TO SALESFORCE IF ONLINE
	if(Util.checkConnection()) {
		forcetkClient.update('JeldwinContacts',fieldData.id,{"Username__c":fieldData.username,"Contact":fieldData.Jeldwin,"URL__c":fieldData.url,"Name":fieldData.name},function(){
			console.log('SFDC Update Success!');
		},error);
	}
}

/**
 * Register the Contact soup if it doesn't already exist
 **/
Jeldwin.prototype.registerJeldwinSoup = function(callback,error){
	console.log('Jeldwin.prototype.registerJeldwinSoup');
	//check if the Contact soup exists
	navigator.smartstore.soupExists('JeldwinContacts',function(param){
		if(!param){
            //DF12 DEMO 8 -- REGISTER THE SOUP
            //GOTO DF12 7
			//Contact soup doesn't exist, so let's register it
			var indexSpec = [
		                     {path:"LastName",type:"string"},
		                     {path:"FirstName",type:"string"},
		                     {path:"Email",type:"string"},
		                     {path:"MailingCity",type:"string"},
		                     {path:"MailingState",type:"string"},
		                     {path:"Title",type:"string"},
		                     {path:"Account_Name__c",type:"string"},
		                     {path:"Phone",type:"string"},
		                     {path:"Id",type:"string"}
		                     
		                     ];
			navigator.smartstore.registerSoup('JeldwinContacts',indexSpec,function(param){
				console.log('Soup Created: '+param);
				callback();
			},error);
		}
		else {
			callback();
		}
	},error);
}



/**
 * Take an array of records, and populate the list view
 **/
Jeldwin.prototype.populateListview = function(records){
	console.log('Jeldwin.prototype.populateListview');
	try{
	console.log(JSON.parse(records));
	}
	catch(e){
		
		console.log(e.message);
	}
    //DF12 DEMO 10 -- POPULATE THE LIST VIEW WITH Jeldwin RECORDS
    //GOTO DF12 6
    var JeldwinList = $( "#contPg" ).find( "#ContactList" );
	JeldwinList.empty();
	var curPageEntries = records;
	$.each(curPageEntries, function(i,entry) {
        var formattedName = entry.FirstName + " " + entry.LastName; 
        var Email = entry.Email;
        
        
       
     var newLi = $("<li><a href='#contPg2' onclick='getContact(\"" + entry.Id +
     		"\")' > "  + formattedName + " - " + Email + "</a></li>");
     JeldwinList.append(newLi);
    });
	//$( "#JeldwinItem" ).tmpl( records ).appendTo( JeldwinList );
	//JeldwinList.listview( "refresh" );    
	// $("#div_sfdc_soup_entry_list").trigger( "create" );
}


/**
 * Soup Successfully Queried
 **/
Jeldwin.prototype.onSuccessQuerySoup = function(cursor) {
	console.log('Jeldwin.prototype.onSuccessQuerySoup');
	
	var that = this;
	var records = [];

    //DF12 DEMO 12 -- LOAD RECORDS
	records = Util.LoadAllRecords(cursor,records);
	
	//close the query cursor
	navigator.smartstore.closeCursor(cursor);

    //DF12 DEMO 13 -- CALL POPULATELISTVIEW -- SAME METHOD TO POPULATE
	that.populateListview(records);    
}