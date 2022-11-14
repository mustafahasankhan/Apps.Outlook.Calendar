# Outlook Calendar Integration for Rocket.Chat

![Horizontal Banner](https://i.ibb.co/64T97sv/Screenshot-2022-11-06-at-11-05-33-AM.png)

The Outlook Calendar App for Rocket.Chat  provides a seamless integration between Outlook Calendar and Rocket.Chat and hassle free management of Calendar events and meetings.
The application allows users to view and manage thier events, subscribe to event reminders, and get notified 10 minutes prior to events.


<h2>🚀 Features </h2>
<ul>
  <li>Quick and easy setup.</li> 
  <li>Login to Outlook with one click using built-in OAuth2 mechanism.</li>
  <li>Subscribe to Calendar Events and get notified about meetings before 10 minutes they start.</li>
  <li>View the daily events..</li>
  <li>Cancel all reminders in one click.</li>
</ul>


<h2>🔧 Installation steps </h2>

 1. Clone this repo and Change Directory: </br>
 `git clone https://github.com/mustafahasankhan/Apps.Outlook.Calendar.git && cd Apps.Outlook Calendar/`

 2. Install the required packages from `package.json`: </br>
	 `npm install`

 3. Deploy Rocket.Chat app: </br>
    `rc-apps deploy --url http://localhost:3000 --username user_username --password user_password`
    Where:
    - `http://localhost:3000` is your local server URL (if you are running in another port, change the 3000 to the appropriate port)
    - `user_username` is the username of your admin user.
    - `user_password` is the password of your admin user.

    For more info refer [this](https://rocket.chat/docs/developer-guides/developing-apps/getting-started/) guide

<h2>📲 Setup guide </h2>
 <ul>
  <li> Create an app on Microsoft Azure platform by following these steps:</li> 
  
  1. Login to Microsoft Developers portal (developers.microsoft.com) with your Microsoft account, create an Account and go to Microsoft Azure Portal (portal.azure.com).
  
  2. Search for App Registration in Search bar.
  
  3. Click on New Registration an App, enter desired app name and your app's callback URL in the Redirect URL(s) input box.
  
  4. Click on Register button to generate a Client ID and Client Secret.
  
  <li>Fill the details in the Outlook Calendar app on your server by following these steps:</li>
  
  1. Navigate to Administration->Apps. 
  
  2. Select the Installed tab.
  
  3. Click on Outlook Calendar, and go to Settings tab.
  
  4. Enter your generated a Client ID and Client Secret and click on Save changes button.
  
  <li>Start the authorization by using /Outlook Calendar-app auth slash command.</li>
</ul>


