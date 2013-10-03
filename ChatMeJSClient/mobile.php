<?

$pre = (!$_REQUEST['pre']) ? 'false' : $_REQUEST['pre'];
$topic = (!$_REQUEST['topic']) ? 'Choose any topic' : $_REQUEST['topic'];
$source = (!$_REQUEST['source']) ? 'Select a source' : $_REQUEST['source'];
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
	<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>ChatMeTV: UF: JS Client: Debugger</title>
		<script type="text/javascript" src="js/nokapi.js"></script> 
    	<link href="css/mobnok.css" rel="stylesheet" type="text/css" />
		</head>
	<body>
    <br />
   	<div align="left">
   	  <div class="copy1">
   	    <input name="chooseTopic" type="text" class="chooseTopic" id="chooseTopic" value="<? echo $topic; ?>" />
   	  </div>
   	  <span class="copy1">Topic: </span><br /><br />
       	  <span class="copy1">Source: </span><input name="chooseSource" type="text" class="chooseSource" id="chooseSource" value="<? echo $source; ?>" />
       	  <div class="copy1"></div>
  <form enctype="text/plain" method="" onsubmit="" name="starters">
    <input type="button" class="clearTheLog" id="clearTheLog" name="clearTheLog" onclick="clearLogger();" value="Clear Log" />
    <input type="button" class="Start" onclick="sessionVars();" value="Start Session"  />
  </form>
	  <script language="javascript" type="text/javascript">
			var runat = <? echo $pre; ?>;
			var sourceId;
			var topicId;
			if(runat == true){
				sourceId = '<? echo $source; ?>';
				topicId = '<? echo $topic; ?>';
				init();
			} else {
				sourceId = 'Select a source';
				topicId = 'Choose any nTopic';
			}
			//---------------------------------->
			
			  
				
			var nokConn = null;
			var nTopic   = null;
			
			var currentUser = '';

			var session = null;
			
			function init(){
				nTopic = new knocknok.Topic( topicId );
				//------------------------------------------------------>
				startSession();
			}
			function sessionVars(){
				sourceId = (document.getElementById('chooseSource').value) ? document.getElementById('chooseSource').value : sourceId;
				topicId  = (document.getElementById('chooseTopic').value)  ? document.getElementById('chooseTopic').value : topicId;
				//------------------------------------------------------>
				nTopic = new knocknok.Topic( topicId );
				//------------------------------------------------------>
				startSession();
			}
			
			function startSession(){
				session = new knocknok.Session( sourceId );
				session.addEventListener( events.SessionEvent.STARTED, sessionBegins);
			}
			function sessionBegins(e) {
				logMessage('UF: ChatMe: Testing Session:');
				logMessage('Source:'+sourceId);
				logMessage('Topic: '+topicId);
				//iterateAndLog(e, 'sessionBegins');
				//-------------------------------------------------------------------------->
      			nokConn = new knocknok.Connection( nTopic, session );
      			nokConn.addEventListener( events.MessageEvent.RECEIVED, messageRecieved);
				nokConn.addEventListener( events.MessageEvent.SENT, messageSent );
				nokConn.addEventListener( events.ConnectionEvent.CONNECTED, onConnectionEstablished );
                nTopic.addEventListener( events.UserEvent.JOIN, userJoin );
                nTopic.addEventListener( events.UserEvent.LEAVE, userLeave );
                nokConn.connect();
			}
			//*************************
			//* Connection Event Handlers
			//*************************
			function onConnectionEstablished( e ) {
				//iterateAndLog(e, 'onConnectionEstablished');
				logToQueue('Connection Established: '+session.screenName);
  				//connection successfully established to the server
  				//hide any loading dialogs, etc....
			}
			function messageSent(e) {
				//iterateAndLog(e, 'messageSent');
			}
			function messageRecieved( e ) {
				try { nTopic.updateSubscribers(); } catch (e) {}
				//logMessage('['+currentUser+']: '+e.message.text);
				var _uuid = e.message.uuid;
				var _text = e.message.text;
				var _topic = e.message.nTopic;
				var _subscriber = e.message.subscriber;
				var _meta = (!e.message.meta) ? e.message.nTopic : e.message.meta;
				var _ts = nTopic.getSubscribers();
				var _ss = session.screenName;
				var _userAttempt = 'default';
				//--------------------------------------------------------------->
				for(var i in _ts){
					for(var o in _ts[i]){
						if(o == 'session'){
							if(_subscriber == _ts[i][o]){
								_userAttempt = _ts[i]['screenName'];
							}
						}
					}
				}
				//logMessage('Your Screen Name: '+_ss);
				//---------------------------------------------------------------?
				if(_userAttempt != 'default'){
					document.getElementById('changesn').value = _userAttempt;
				}
				showRecieved('('+_topic+')['+_userAttempt+']',e.message.text)
			} 
			
			function userJoin( e ) {
  				var user = e;
				logToQueue('['+e.type+']: '+e.user.screenName);
				currentUser = e.user.screenName;
				//iterateAndLog(, 'UserJoin');
  				//do something with the user data: user.screenName
  				//full subscriber list is here: nokConn.nTopic.subscribers
			}
			function userLeave( e ) {
  				var user = e;
				logToQueue('['+e.type+']: '+e.user.screenName);
				//iterateAndLog(e, 'UserLeft');
  				//do something with the user data: user.screenName
  				//full subscriber list is here: nokConn.nTopic.subscribers
			}
			function showRecieved(user, message){
				document.getElementById('output').innerHTML += ('<b>'+user+': </b>'+message+'<br>');
			}
			function logMessage(msg){
				document.getElementById('output').innerHTML += (msg+'<br>');
			}
			function logToQueue(msg){
				document.getElementById('users').innerHTML += (msg+'<br>');
			}
			function iterateAndLog(obj, ref){
				for(var i in obj){
					if(i != '__class__'){
						logMessage('{ref:'+ref+': '+i+', '+obj[i]+' }');	
					}
				}
			}
			function upDateSN(){
				var c = document.getElementById('changesn').value;
				nokConn.changeScreenName(c);
			}
			function sendMessage(){
				var newMessage = 'default message';
				if(document.getElementById('send').value == null){
					if(document.getElementById('send').value == 'undefined'){
						if(document.getElementById('send').value == ''){
							newMessage = 'Empty Chat Field';	
						}
					} else {
						newMessage = 'Element is undefined';	
					}
				} else {
					newMessage = document.getElementById('send').value;	
				}
				//logMessage('Attempting to send: '+newMessage);
				nokConn._sendMessage(newMessage);
				document.getElementById('send').value = '';
			}
			function clearLogger(){
				document.getElementById('output').innerHTML = '';
			}
			function setInviteField(){
				var linkTo = '';
				document.getElementById('invite').value = linkTo;	
			}
			</script>
       	  <div id="output"></div>
		  <textarea name="send"  class="send" id="send" rows="2" cols="25">TYPE HERE</textarea>
   	  <div class="clearLog"></div>
  <span class="smessage">
  <input name="submit" type="button" class="copy2" id="submit" onclick="sendMessage();" value="send message" />
</span><br />
          <div class="smessage"></div>
          <div id="smessage" class="clearLog"></div>
    </div>
    <div class="users" id="users"></div>
<input type="text" class="changesn" id="changesn" />
	<input type="button" value="Update ScreenName" onclick="upDateSN();" class="sn" id="sn" />
	</body>
</html>
