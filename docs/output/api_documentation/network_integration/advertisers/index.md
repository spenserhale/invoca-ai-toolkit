  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Advertisers[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertisers/index.html#advertisers "Permalink to this heading")
The operations on Advertiser are similar to Network, in that the interface is fully idempotent, and the create and update commands both expect the full set of advertiser sites and users each time. You are not allowed to delete an advertiser if it has one or more campaigns.  
| Property  | Type  | Value  |  
| --- | --- | --- |  
| id  | integer (read-only)  | The internal Invoca id for this Advertiser.  |  
| id_from_network  | string (required)  | The network id for this Advertiser. Unique within network. Not required when auto-generation is enabled at network level.  |  
| name  | string (required)  | The name of the Advertiser. Unique within network.  |  
| oauth_refresh_token  | string  | For internal use only.  |  
| approval_status  | string (one of): Applied, Approved (default), Declined, Suspended, Archived  | Approval status for this advertiser.  |  
| web_integration_phone_number  | string  |  
| default_creative_id_from_network  | integer  |  
| object_url  | string (read-only)  | URL for reaching the advertiser in the UI.  |  
| **sites**  | json array of hashes  | 1 or more pairs of id_from_network [and name].  |  
| id_from_network  | integer site_id (PID)  | The site_id (PID). At least one is required. The first becomes the default.  |  
| name  | string  | The site name that matches site_id.  |  
| **users**  | JSON array of hashes  | 0 or more users for the organization. Each must have first 5 fields below.  |  
| id_from_network  | string  | The network id for this User.  |  
| email_settings  | JSON array of hashes  |  Each hash has two required fields: `email_address`: string in RFC 2822 addr-spec format. The user’s email address. Unique for this user. `use_for_notifications`: boolean used to indicate if notifications should be sent to the email address. A user must have at least one email address where `use_for_notifications` is true.  |  
| first_name  | string (Required)  | The user’s first name.  |  
| last_name  | string (Required)  | The user’s last name.  |  
| contact_phone_number  | string in ITU E.164 format or 10-digit US form (no punctuation)  | The user’s phone number.  |  
| oauth_refresh_token  | string  | Not used. Reserved.  |  
| role  | One of: Super (default), Manager, Member, Observer  | This user’s role in this organization. (A user may have different roles in different organizations)  |  
| notify_on_budgets  | boolean, optional, defaults to false  |  
| notify_on_campaign_applications  | boolean, optional, defaults to false  |  
| notify_on_campaign_expirations  | boolean, optional, defaults to false  |  
| notify_on_creative_duplication_requests  | boolean, optional, defaults to false  |  
| notify_on_network_announcements  | boolean, optional, defaults to false  |  
| notify_on_performance_notifications  | boolean, optional, defaults to false  |  
| notify_on_monthly_campaign_performance_reports  | boolean, optional, defaults to false  |  
| notify_on_weekly_campaign_performance_reports  | boolean, optional, defaults to false  |  
| notify_on_call_activities  | boolean, optional, defaults to false  |  
| can_login_via_platform  | boolean (read-only)  | Indicates if user can directly login with username and password. If false, the user is managed via SSO.  |  
## Custom Data[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertisers/index.html#custom-data "Permalink to this heading")
Advertisers may have Custom Data Fields applied to them, which will be applied to calls originating through the advertiser. To apply Custom Data Values to an advertiser, the top level parameter `custom_data` should be assigned a hash with each pair’s key corresponding to a partner name. The value of the pair should be the value to be applied.
For the following example, we would apply the value “Offline newspaper” to the Custom Data Field “channel”.

```
{
"custom_data":{
"channel":"Offline newspaper"
}
}

```

Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>.json`
GET /advertisers Get all Advertisers
Examples
Read all advertisers for this network
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers.json`
Format: application/json
Response Code: 200
Response Body:

```
[
{
"id":43838,
"id_from_network":"cFUyYnFHy",
"web_integration_phone_number":"8004377950",
"approval_status":"Approved",
"object_url":"https://invoca.net/as/43838/dashboards/ui",
"sites":[
{
"id_from_network":"315",
"name":"315.blog.com"
}
],
"name":"NFL Tickets Exchange",
"users":[
{
"id_from_network":"549494858585cFUyYnFHyiYA42TrpM",
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"first_name":"Chris",
"phone_number":"888‐603‐3760",
"last_name":"Dean",
"role":"Manager",
"oauth_refresh_token":"556588585858585858585858858",
"notify_on_budgets":true,
"notify_on_campaign_applications":false,
"notify_on_campaign_expirations":false,
"notify_on_creative_duplication_requests":true,
"notify_on_network_announcements":true,
"notify_on_performance_notifications":false,
"notify_on_monthly_campaign_performance_reports":true,
"notify_on_weekly_campaign_performance_reports":false,
"notify_on_call_activities":true,
"can_login_via_platform":true
}
],
"default_creative_id_from_network":"222",
"oauth_refresh_token":"7464644784457575757494930303",
"custom_data":{
"channel":"Online lead"
}
}
]

```

GET /advertisers/<advertiser_id> Get an Advertiser
Examples
Read a single advertiser
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/cFUyYnFHy.json`
Format: application/json
Response Code: 200
Response Body:

```
{
"id":43838,
"id_from_network":"cFUyYnFHy",
"web_integration_phone_number":"8004377950",
"approval_status":"Approved",
"object_url":"https://invoca.net/as/43838/dashboards/ui",
"sites":[
{
"id_from_network":"315",
"name":"315.blog.com"
},
{
"id_from_network":"996",
"name":"996.blog.com"
}
],
"name":"NFL Tickets Exchange",
"users":[
{
"id_from_network":"549494858585cFUyYnFHyiYA42TrpM",
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"first_name":"Chris",
"phone_number":"888‐603‐3760",
"last_name":"Dean",
"role":"Manager",
"oauth_refresh_token":"556588585858585858585858858",
"notify_on_budgets":true,
"notify_on_campaign_applications":false,
"notify_on_campaign_expirations":false,
"notify_on_creative_duplication_requests":true,
"notify_on_network_announcements":true,
"notify_on_performance_notifications":false,
"notify_on_monthly_campaign_performance_reports":true,
"notify_on_weekly_campaign_performance_reports":false,
"notify_on_call_activities":true,
"can_login_via_platform":false
},
{
"id_from_network":"694940505055cFUyYnFHyiYA42TrpM",
"email_settings":[
{"email_address":"jim@nfltix.com","use_for_notifications":true}
],
"first_name":"Jim",
"phone_number":"888‐603‐3760",
"last_name":"Williams",
"role":"Observer",
"oauth_refresh_token":"4222424241628298228222",
"notify_on_budgets":true,
"notify_on_campaign_applications":false,
"notify_on_campaign_expirations":false,
"notify_on_creative_duplication_requests":true,
"notify_on_network_announcements":true,
"notify_on_performance_notifications":false,
"notify_on_monthly_campaign_performance_reports":true,
"notify_on_weekly_campaign_performance_reports":false,
"notify_on_call_activities":true,
"can_login_via_platform":true
}
],
"default_creative_id_from_network":"222",
"oauth_refresh_token":"7464644784457575757494930303",
"custom_data":{
"channel":"Online lead"
}
}

```

DELETE /advertisers/<advertiser_id> Delete an Advertiser
Examples
Delete a single advertiser
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/cFUyYnFHy.json`
Format: application/json
Response Code: 200
Response Body:
POST /advertisers Create an Advertiser
Examples
Create an advertiser with users
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers.json`
Format: application/json
Request Body:

```
{
"name":"NFL Tickets Exchange",
"id_from_network":"cFUyYnFHy",
"oauth_refresh_token":"7464644784457575757494930303",
"approval_status":"Approved",
"web_integration_phone_number":"8004377950",
"default_creative_id_from_network":"222",
"users":[
{
"id_from_network":"549494858585cFUyYnFHyiYA42TrpM",
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"first_name":"Chris",
"last_name":"Dean",
"contact_phone_number":"805-555-5555",
"oauth_refresh_token":"556588585858585858585858858",
"role":"Manager",
"notify_on_budgets":true,
"notify_on_campaign_applications":false,
"notify_on_campaign_expirations":false,
"notify_on_creative_duplication_requests":true,
"notify_on_network_announcements":true,
"notify_on_performance_notifications":false,
"notify_on_monthly_campaign_performance_reports":true,
"notify_on_weekly_campaign_performance_reports":false,
"notify_on_call_activities":true
},
{
"id_from_network":"694940505055cFUyYnFHyiYA42TrpM",
"email_settings":[
{"email_address":"jim@nfltix.com","use_for_notifications":true}
],
"first_name":"Jim",
"last_name":"Williams",
"contact_phone_number":"2135555555",
"oauth_refresh_token":"4222424241628298228222",
"role":"Observer",
"notify_on_budgets":true,
"notify_on_campaign_applications":false,
"notify_on_campaign_expirations":false,
"notify_on_creative_duplication_requests":true,
"notify_on_network_announcements":true,
"notify_on_performance_notifications":false,
"notify_on_monthly_campaign_performance_reports":true,
"notify_on_weekly_campaign_performance_reports":false,
"notify_on_call_activities":true
}
],
"sites":[
{
"id_from_network":"315",
"name":"315.blog.com"
},
{
"id_from_network":"996",
"name":"996.blog.com"
}
],
"custom_data":{
"channel":"Offline lead"
}
}

```

Response Body:
Same as a GET response, includes all the advertiser properties.
PUT /advertisers/<advertiser_id> Update an Advertiser
Examples
Update a user from advertiser
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/cFUyYnFHy.json`
Format: application/json
Request Body:

```
{
"name":"NFL Tickets Exchange",
"oauth_refresh_token":"7464644784457575757494930303",
"approval_status":"Approved",
"web_integration_phone_number":"8004377950",
"default_creative_id_from_network":"222",
"users":[
{
"id_from_network":"549494858585cFUyYnFHyiYA42TrpM",
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"first_name":"Chris",
"last_name":"Dean",
"contact_phone_number":"805-555-5555",
"oauth_refresh_token":"556588585858585858585858858",
"role":"Manager",
"notify_on_budgets":true,
"notify_on_campaign_applications":false,
"notify_on_campaign_expirations":false,
"notify_on_creative_duplication_requests":true,
"notify_on_network_announcements":true,
"notify_on_performance_notifications":false,
"notify_on_monthly_campaign_performance_reports":true,
"notify_on_weekly_campaign_performance_reports":false,
"notify_on_call_activities":true
}
],
"sites":[
{
"id_from_network":"315",
"name":"315.blog.com"
}
],
"custom_data":{
"channel":"Offline lead"
}
}

```

Response Body:
Same as a GET response, includes all the advertiser properties.
