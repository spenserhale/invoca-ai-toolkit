  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Affiliates[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/affiliates/index.html#affiliates "Permalink to this heading")
The operations on Affiliate are similar to Network, in that the interface is fully idempotent, and the create and update commands both expect the full set of affiliate sites and users each time. Similar to advertisers, you are not allowed to delete if one or more campaigns exist for this affiliate.  
| Property  | Type  | Value  |  
| --- | --- | --- |  
| id  | integer (read-only)  | The internal Invoca id for this Affiliate.  |  
| id_from_network  | string  | The network object_id for this Affiliate. Unique within network. Not required when auto-generation is enabled at network level.  |  
| name  | string  | The name of the Affiliate. Unique within the network.  |  
| status  | string (one of): Applied, Approved (default), Declined, Suspended, Archived  | Approval status for this affiliate.  |  
| object_url  | string (read-only)  | URL for reaching the affiliate in the UI.  |  
| **sites**  | json array of hashes  | 1 or more pairs of id_from_network [and name].  |  
| id_from_network  | string  | The site id (PID).  |  
| name  | string  | The site name that matches site id_from_network.  |  
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
## Custom Data[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/affiliates/index.html#custom-data "Permalink to this heading")
Affiliates may have Custom Data Fields applied to them, which will be applied to calls originating through the affiliate. To apply Custom Data Values to an affiliate, the top level parameter `custom_data` should be assigned a hash with each pair’s key corresponding to a partner name. The value of the pair should be the value to be applied.
For the following example, we would apply the value “Offline newspaper” to the Custom Data Field “channel”.

```
{
"custom_data":{
"channel":"Offline newspaper"
}
}

```

Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/affiliates/<affiliate_id_from_network>.json`
GET /affiliates Get all Affiliates
Examples
Read all Affiliates for this network
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/affiliates.json`
Response Body:

```
[
{
"id":19,
"id_from_network":"222",
"object_url":"https://invoca.net/ps/19/dashboards/ui",
"sites":[
{
"id_from_network":"33567",
"name":"http://www.surfoz.au"
},
{
"id_from_network":"44920",
"name":"http://www.blogspot.com/surfoz"
}
],
"name":"Surf Oz Magazine",
"users":[
{
"email_settings":[
{"email_address":"userx@invoca.com","use_for_notifications":true}
],
"id_from_network":"1231",
"first_name":"User",
"phone_number":"805‐708‐9876",
"last_name":"Affiliate",
"role":"Super",
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
"status":"Approved",
"custom_data":{
"channel":"Online lead"
}
}
]

```

GET /affiliates/<affiliate_id> Get an Affiliate
Examples
Read a specific affiliate
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/affiliates/222.json`
Response Body:

```
{
"id":19,
"id_from_network":"222",
"object_url":"https://invoca.net/ps/19/dashboards/ui",
"sites":[
{
"id_from_network":"33567",
"name":"http://www.surfoz.au"
},
{
"id_from_network":"44920",
"name":"http://www.blogspot.com/surfoz"
}
],
"name":"Surf Oz Magazine",
"users":[
{
"email_settings:"[
{"email_address":"userx@invoca.com","use_for_notifications":true}
],
"id_from_network":"1231",
"first_name":"User",
"phone_number":"805‐708‐9876",
"last_name":"Affiliate",
"role":"Super",
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
"status":"Approved",
"custom_data":{
"channel":"Online lead"
}
}

```

DELETE /affiliates/<affiliate_id> Delete an Affiliate
Examples
Delete a single affiliate
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/affiliates/222.json`
Response Body:
POST /affiliates Create an Affiliate
Examples
Create an affiliate with users
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/affiliates.json`
Format: application/json
Request Body:

```
{
"name":"Surf Oz Magazine",
"status":"Approved",
"id_from_network":"222",
"users":[
{
"phone_number":"805‐708‐9876",
"id_from_network":123,
"role":"Super",
"last_name":"Affiliate",
"first_name":"User",
"email_settings":[
{"email_address":"userx@invoca.com","use_for_notifications":true}
],
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
"id_from_network":33567,
"name":"http://www.surfoz.au"
},
{
"id_from_network":44920,
"name":"http://www.blogspot.com/surfoz"
}
],
"custom_data":{
"channel":"Offline lead"
}
}

```

Response Body:
Same as a GET response, includes all the affiliate properties.
PUT /affiliates/<affiliate_id> Update an Affiliate
Examples
Update a single affiliate
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/affiliates/222.json`
Request Body:

```
{
"name":"Updated Surf Oz Magazine"
}

```

Response Body:
Same as a GET response, includes all the affiliate properties.
