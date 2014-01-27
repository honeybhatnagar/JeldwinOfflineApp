//Sample code for Hybrid REST Explorer
//DF12 DEMO 4 -- FAKE OFFLINE
var FAKE_OFFLINE = false;
var fieldsChanged = false;
var JeldwinManager;
var $j = jQuery.noConflict();
function getContacts() {
	
	JeldwinManager.loadRecords(onError);
	
	
}

function init() {
  console.log('APPLICATION INIT');
  //DF12 DEMO 5 -- INSTANTIATE AND LOAD RECORDS
  JeldwinManager = new Jeldwin();
  JeldwinManager.loadRecordsFromSalesforce();
  
  //When the Contacts buton is clicked
  $j('#link_fetch_contacts').click(function() {
	    console.log("Getting Contacts");
	    fieldsChanged=false;
	    JeldwinManager.loadRecords(onError);
	  });
}

function notused(){
  
  
  //DF12 DEMO 22 -- PUSH QUEUE TO SFDC
  OfflineQueue.UploadQueue(function(){},onError);

  
    
  //Do stuff when the page changes
  $(document).bind("pagebeforechange",function(event,data) {
    if (typeof data.toPage === "string") {
        if(fieldsChanged) {
          console.log('Fields Changed... Saving');
          var page = $('#edit');
          var idField = page.find('#id');
          
          var usernameField = page.find('#username');
          var JeldwinField = page.find('#Jeldwin');
          var nameField = page.find('#name');
          var urlField = page.find('#url');
          //DF12 DEMO 16 -- SAVE RECORDS ON BACK FROM EDIT
          var fieldData = {'id':idField.val(),
                           'username':usernameField.val(),
                           'Jeldwin':JeldwinField.val(),
                           'url':urlField.val(),
                           'name':nameField.val()
                          }
          JeldwinManager.updateRecord(fieldData,onError);
        }
        fieldsChanged=false;

        var url = $.mobile.path.parseUrl(data.toPage);
        var editurl = /^#edit/;
        if (url.hash.search(editurl) !== -1) {
            changeToEditPage(url,event);
        }
    }
  });
}

/**
 * Change to Edit Page
 **/
function changeToEditPage(url,event) {
    //DF12 DEMO 15 -- LOAD EDIT PAGE
    //url scheme is a bit mucked up, so get rid of the initial "edit?" after the hash so we can parse it like a normal url
    var paramstring = url.hash.replace(/^#edit\?/,"#");
    //get the id, username, and Jeldwin from the query string
    var id = $.url(paramstring).fparam('Id');
    var username = $.url(paramstring).fparam('Username__c');
    var Jeldwin = $.url(paramstring).fparam('Jeldwin__c');
    var name = $.url(paramstring).fparam('Name');
    var siteUrl = $.url(paramstring).fparam('URL__c');

    var pageSelector = url.hash.replace(/\?.*$/, "");
    if(id) {
        //select the page
        var page = $(pageSelector);
        //put the site name in the header
        var header = page.find('#title');
        header.html(name);
        //select the content element within it
        var content = page.children(":jqmData(role=content)");
        //add the URL
        var urlField = content.find('#siteUrl');
        urlField.html("<a href='"+siteUrl+"' target='_blank'>"+siteUrl+"</a>");

        //fill out the fields
        var idField = content.find('#id');
        idField.val(id);
        var usernameField = content.find('#username');
        usernameField.val(username);
        var JeldwinField = content.find('#Jeldwin');
        JeldwinField.val(Jeldwin);
        var nameField = content.find('#name');
        nameField.val(name);
        var urlField = content.find('#url');
        urlField.val(siteUrl);

        //monitor for changes to fields
        usernameField.change(function(){
            console.log('username changed');
            fieldsChanged=true;
        });

        JeldwinField.change(function(){
            console.log('Jeldwin changed');
            fieldsChanged=true;
        });

        nameField.change(function(){
            console.log('name changed');
            fieldsChanged=true;
        });

        urlField.change(function(){
            console.log('url changed');
            fieldsChanged=true;
        });        

        //we're intercepting the page change event, so change the page
        $.mobile.changePage(page);

        //stop the default page change actions from occurring
        event.preventDefault();
    }                  
}

/**
 * Handle Errors
 **/
function onError(error) {
    console.log("onErrorSfdc: " + JSON.stringify(error));
    alert('Application Error');
}