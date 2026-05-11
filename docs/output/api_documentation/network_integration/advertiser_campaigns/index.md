  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Advertiser Campaigns[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_campaigns/index.html#advertiser-campaigns "Permalink to this heading")
Advertiser Campaigns can be managed using the Network API. In addition to create, update, and show operations, this interface provides additional endpoints including go_live, archive, and quick_stats.
Note that the <advertiser_id_from_network> and <advertiser_campaign_id_from_network> are the network’s id for those objects, not Invoca’s.
`/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
We support passing back current_terms and future_terms on campaigns. The current properties of the campaign are reflected in current_terms. All changes to the campaign are staged in future_terms. Once the campaign goes live, future_terms transition over to current_terms.
You can set budgets on your campaign. There are three budget types, budget_cap_alert which is based on commissions, periodic_call_cap_alert, which is based on the number of calls in a given period, and concurrent_call_cap_alert, which is based on the number of simultaneous calls. These budget activities are only applicable for AffiliateEnabled campaigns (Known in the platform as a “Publisher Promotion” Campaign Type.)
You are not allowed to delete campaigns.  
| Property  | Type  | Value  |  
| --- | --- | --- |  
| id  | integer (read-only)  | The internal Invoca id for this Advertiser Campaign.  |  
| id_from_network  | string  | The network object_id for this Advertiser Campaign. Unique within network. Not required when auto-generation is enabled at network level.  |  
| name  | string  | Campaign name.  |  
| campaign_type  | string  | 2 Campaign Types Supported: “AffiliateEnabled” ‐ Advertiser Campaign that allows Affiliates to promote it. Includes Payin and Payouts for qualified Calls. “DirectOnly” ‐ Advertiser Campaign used for internal marketing. No ability to promote via Affiliates or setup Payin and Payouts for Calls.  |  
| description  | string  | Campaign Description.  |  
| url  | string  | Click URL Template.  |  
| object_url  | string (read-only)  | URL for reaching the advertiser campaign in the UI.  |  
| timezone  | string  | Supported Time Zones:   |  
| campaign_language  | string  | Supported Campaign Languages: “English”, “French”, “Spanish”.  |  
| campaign_country  | string  | Supported Countries: “US”, “CA”, “UK”, “AU”, “CN”, “FI”, “FR”, “DE”, “HK”, “IT”, “JP”, “NL”, “SG”, “SE”, “CH”.  |  
| operating_24_7  | boolean  |  
| **affiliate_payout**  |  
| **policies**  |  
| currency  | string  | USD, GBP, EUR.  |  
| amount  | decimal  | Payout Amount.  |  
| condition  | string  | Condition options depend on the following Campaign Setup items being in place: Duration (seconds/minutes) and (greater than, greater than or equal to, less than, less than or equal to, equal to), Connect Duration (seconds/minutes) and (greater than, greater than or equal to, less than, less than or equal to, equal to), Repeat, In Region (specified across multiple Regions), During Hours, Key Press, Is Mobile, Is Landline, Send SMS All may be grouped with logic operators (AND/OR/NOT).  |  
| type  | string  | One of: Base, Bonus.  |  
| **advertiser_payin**  |  
| **policies**  |  
| currency  | string  | Supported Currencies: ‐ USD, GBP, EUR.  |  
| amount  | integer  | Advertiser Payin Amount.  |  
| condition  | string  | Condition options depend on the following Campaign Setup items being in place: Duration (seconds/minutes) and (greater than, greater than or equal to, less than, less than or equal to, equal to), Connect Duration (seconds/minutes) and (greater than, greater than or equal to, less than, less than or equal to, equal to), Repeat, In Region (specified across multiple Regions), During Hours, Key Press, Is Mobile, Is Landline, Send SMS. All may be grouped with logic operators (AND/OR/NOT).  |  
| type  | string  | One of: Base, Bonus.  |  
| **hours**  |  
| [day of week]_open (e.g. friday_open)  | string  | Open Hours. In seconds past midnight (e.g. 0 for midnight, 32400 for 9:00 AM).  |  
| [day of week]_close (e.g. friday_close)  | string  | Closed Hours. In seconds past midnight (e.g. 0 for midnight, 75600 for 9:00 PM).  |  
| [day of week]_closed (e.g. sunday_closed)  | string  | true, false, or null. Whether the business is closed that day of the week.  |  
| **named_regions**  |  
| name  | string  | Region Name.  |  
| **regions**  |  
| region_type  | string  | Region Type. Can be one of: Zone, City, State, Country.  |  
| value  | string  | Region Value, e.g. “Sacramento, CA”, or just “CA”.  |  
| ivr_tree  | hash  | See following Advertiser Campaign IVR Section.  |  
| **budget_activities**  | Only applicable for AffiliateEnabled campaigns.  |  
| **budget_cap_alert**  |  
| reset_period  | string (required)  | Budget will reset based on this entry. One of: Daily, Weekly, Monthly, Quarterly, Ongoing.  |  
| starts_at  | date (required)  | Budget Start.  |  
| budget_currency  | string (required)  | Budget Currency.  |  
| time_zone  | string (required)  | Supported Time Zones: “Pacific Time (US & Canada)”, “Mountain Time (US & Canada)”, “Central Time (US & Canada)”, “Eastern Time (US & Canada)”, “London”, “UTC”.  |  
| budget_amount  | decimal (required)  | Budget Amount.  |  
| include_call_fees  | boolean  | True if you want call fees to be included in the budget.  |  
| **periodic_call_cap_alert**  |  
| reset_period  | string (required)  | Budget will reset based on this entry. One of: Daily, Weekly, Monthly, Quarterly, Ongoing.  |  
| starts_at  | date (required)  | Call Cap Start.  |  
| budget_currency  | string (required)  | Budget Currency.  |  
| time_zone  | string (required)  | Supported Time Zones: “Pacific Time (US & Canada)”, “Mountain Time (US & Canada)”, “Central Time (US & Canada)”, “Eastern Time (US & Canada)”, “UTC”.  |  
| budget_amount  | decimal (required)  | Budget Amount.  |  
| auto_approve  | string  | One of: All, None, Approved_Affiliates Default: None This controls if affiliates are automatically approved when applying to the campaign.  |  
| visibility  | string  | One of: All, None, Approved_Affiliates Default: All This controls the level of visibility publishers have when applying to campaigns.  |  
| expiration_date  | string  | date string (ex. ‘2015‐01‐01’). Read only.  |  
| default_creative_id_from_network  | integer  | Default Creative ID.  |  
| **concurrent_call_cap_alert**  |  
| budget_amount  | decimal (required)  | Budget Amount.  |  
| timeout  | integer  | Seconds to wait for the campaign to go live. Between 2 and 60.  |  
## Advertiser Campaign IVRs[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_campaigns/index.html#advertiser-campaign-ivrs "Permalink to this heading")
When creating an advertiser campaign, you need to provide some call flow logic through an IVR tree. Depending on the advertiser/campaign type (direct, bundled, etc) you may use the following node types:
Node Parameters and Usage
* => required parameter  
| Node Type  | Parameters  | Usage  |  
| --- | --- | --- |  
| Menu  | *prompt  | Allows the caller to select from up to 9 choices (e.g. choosing a department, selecting a language, etc).  |  
| Connect  |  prompt *destination_phone_number *destination_country_code *destination_extension  | Forwards the call to a selected phone number after optionally reading a prompt.  |  
| EndCall  | prompt  | Ends the call after optionally reading a prompt.  |  
| SmsPromo  |  *prompt *sms_promo_copy sms_promo_delay sms_promo_sender  | Provide the option for a user to receive a text message with a special promotion.  |  
| Condition  | *condition  | If/else option for a call based on the qualities of the call/caller.  |  
| VerifyLocation  | prompt  | Prompt the caller to verify the guessed location or confirm through input. Useful if geographical data is important or useful in a condition node.  |  
| DynamicRoute (beta - read only)  | *dynamic_route_destination  | Forwards the call to a destination that is extracted from a custom data field specified in dynamic_route_destination. The destination must be a phone number or if you are SIP integrated, can be a string that is routable by your SIP infrastructure.  |  
| MessagingAi  |  *prompt *messaging_ai_agent_id *messaging_ai_first_message *messaging_ai_promo_number_id *messaging_ai_ring_pool_id  | Allows the caller to opt in to a conversation with an AI agent. If the customer opts in, they will receive a message from the AI agent. You can configure any child nodes for both the case where the caller opts in, and when they opt out.  |  
Node Details  
| Node Type  | Details  |  
| --- | --- |  
| Menu  | Can have 1‐9 child nodes, with each child corresponding to the 1‐9 buttons.  |  
| Connect  | May not have any children. The prompt will be read before connecting to the provided phone number.  |  
| EndCall  | May not have any children. The prompt will be read before ending the call.  |  
| SmsPromo  | May have exactly 1 child node. After accepting or declining the promotional sms, the child node will be executed. To accept the promotional sms, the user must push 9 on the phone (this should be added as part of the prompt). Only numbers recognized as mobile phones will be offered the sms option.  |  
| Condition  | May have exactly 2 child nodes. If the conditions are met, the first child is executed. If they are not met then the second child plays. See the conditions section and examples below for details on valid conditions.  |  
| NearestBranch  | May have exactly 1 child node. The caller will be prompted to verify their location prior to forwarding the call. If no branch is within ‘radius_miles’ of the caller then the child node will be executed.  |  
| VerifyLocation  | May have exactly 1 child node. The prompt will play before verifying the callers location. The child node will be executed after verifying the callers location.  |  
| DynamicRoute (beta - read only)  | May have exactly 1 child node. We will evaluate the custom data field value specified on this node’s dynamic_route_destination. With non-SIP integration, if the extracted value is a valid phone number and the destination phone number is in an allowed region given your settings, we will play the prompt and transfer the call, otherwise the child node will be executed without the prompt. When SIP integrated, we also allow transferring to any string (such as an extension), in which case the destination should be routable by your SIP infrastructure.  |  
| MessagingAi  | May have exactly 2 child nodes. If the caller opts in to receive a message the first node is executed. If the caller does not opt in, or they are calling from a land line, the second node will be executed.  |  
Parameter Details  
| Property  | Type  | Value  |  
| --- | --- | --- |  
| condition  | String  | The boolean condition that decided if the first or second child will be executed in a condition node.  |  
| destination_country_code  | String  | The country code for the destination_phone_number.  |  
| destination_phone_number  | String  | The phone number to forward the caller to.  |  
| destination_extension  | String  | Extension keypresses on the destination number. Commas indicate pause (e.g. 1,,,234 means a keypress of “1” is executed followed by a 3 second pause and an extension keypress of “234”).  |  
| dynamic_route_destination (beta - read only)  | Strings  | The custom data field partner name you want to use as the destination in a dynamic route node. Typically a phone number in e164 format.  |  
| prompt  | String  | The text that will be read before a nodes action occurs. An empty string will result in no prompt being read, and the following action will occur immediately.  |  
| messaging_ai_agent_id  | Integer  | The id associated with the Messaging AI agent you want to use.  |  
| messaging_ai_first_message  | String  | The initial message that the AI Agent will send to the customer when they opt in to receive messages.  |  
| messaging_ai_promo_number_id  | Integer  | The ID of a static promo number that is enabled for SMS messaging to be used by the agent to send messages.  |  
| messaging_ai_ring_pool_id  | Integer  | The ID of the ring pool that the AI Agent will use to provide a callback phone number  |  
| sms_promo_copy  | String  | The text that will be sent to the caller if they accept the promotional sms.  |  
| sms_promo_delay  | Integer  | The time delay in seconds before sending the promotional sms. This may be 1 (Immediately), 1800 (30 minutes), 86400 (1 day), 604800 (7 days), or 2592000 (30 days).  |  
| sms_promo_sender  | String  | The email address that will be shown in the sms. This defaults to   |  
Conditions  
| Condition  | Details  |  
| --- | --- |  
| during_hours  | True if the caller is calling during the hours specified in the campaign.  |  
| in_region  | True if the caller is calling from the region specified in the campaign.  |  
| landline  | True if the caller is calling from a landline phone.  |  
| mobile  | True if the caller is calling from a mobile phone.  |  
| pressed[key]  | True if the caller pressed the named key.  |  
| repeat  | True if the caller has already called this campaign in the last N days (the interval N can be set on the campaign; the default is 30 days).  |  
| sms_sent  | The caller chose to receive a text message during the call.  |  
| and  | Joins two conditions and is true if both conditions are true.  |  
| or  | Joins two conditions and is true if either condition is true.  |  
| not  | Inverts the following condition.  |  
| ( )  | Used for grouping.  |  
Example Conditions  
| Example  | Condition  |  
| --- | --- |  
| Call duration was a minute and a half or longer  | duration >= 1 min 30 sec.  |  
| Call came in during business hours  | during_hours.  |  
| Call was from a mobile phone where the caller pressed the 2 key in response to the first menu  | mobile and pressed[2].  |  
| Call was from the selected geographic region or was longer than 12 seconds  | in_region or duration > 12 sec.  |  
| Caller pressed 1 to the first question in a series and was not in the geographic region or calling during business hours  | pressed[a 1] and not (in_region or during_hours).  |  
Note that **and** is higher precedence than **or**. So if you use both in a condition like this:
`mobile or in_region and during_hours`
it is equivalent to this:
`mobile or (in_region and during_hours)`
Caller ID options can also be configured by optionally including a `caller_id` object inside `ivr_tree`:  
| Setting  | Mask  | Example  | Details  |  
| --- | --- | --- | --- |  
| “original”  | None  | { setting: “original” }  | Display caller’s caller id to call center agent. (Default)  |  
| “promo”  | None  | { setting: “promo” }  | Display affiliate promo number to call center agent. (Only if forwarding to a local number.)  |  
| “specific”  | String containing phone number  | { setting: “specific”, mask: “800-555-5555” }  | Display a specific caller ID number.  |  
| “partial”  | String containing mask format  | { setting: “partial”, mask: “800-555-XXXX” }  | Display caller’s caller ID with digits replaced.  |  
### Custom Data[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_campaigns/index.html#custom-data "Permalink to this heading")
Advertiser campaigns may have Custom Data Fields applied to them, which will be applied to calls originating through the advertiser campaign. To apply Custom Data Values to an advertiser campaign, the top level parameter `custom_data` should be assigned a hash with each pair’s key corresponding to a partner name. The value of the pair should be the value to be applied.
For the following example, we would apply the value “Offline newspaper” to the Custom Data Field “channel”.

```
{
"custom_data":{
"channel":"Offline newspaper"
}
}

```

Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
GET /advertiser_campaigns Get all campaigns for an Advertiser
Examples
Read all campaigns for Advertiser 2 id from network
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/2/advertiser_campaigns.json`
Response Body:
An array of campaigns are returned.
GET /advertiser_campaigns/<advertiser_campaign_id> Get a campaign for an Advertiser
Examples
Read Campaign 100 for Advertiser 2
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/2/advertiser_campaigns/100.json`
Response Body:

```
{
"id":11,
"id_from_network":"100",
"name":"PostSeason Promotion 11 fJauFbSEGHKw8ADEGv",
"status":"Entry",
"object_url":"https://invoca.net/a_campaigns/terms/11",
"current_terms":{
"description":"August promotion to sell post-season tickets at half price.",
"timezone":"Pacific Time (US & Canada)",
"visibility":"All",
"created_at":"2015-05-13 07:45:08 -0800",
"id":"215",
"operating_24_7":false,
"go_live_date":null,
"default_creative_id_from_network":"222",
"campaign_language":"English",
"campaign_country":"US",
"advertiser_payin":{
"min":7,
"currency":"EUR",
"pricing":"€7.00 per call if duration > 2 min 30 sec",
"max":7,
"policies":[
{
"type":"Base",
"currency":"EUR",
"condition":"duration > 2 min 30 sec",
"amount":7
}
],
"range":"€7.00 per call"
},
"pricing_type":"Fixed",
"ivr_tree":{
"root":{
"condition":"during_hours",
"children":[
{
"destination_phone_number":"8004377950",
"destination_country_code":"1",
"prompt":"",
"node_type":"Connect"
},
{
"destination_phone_number":"8004377950",
"destination_country_code":"1",
"prompt":"",
"node_type":"Connect"
}
],
"node_type":"Condition"
},
"record_calls":true
},
"auto_approve":"None",
"expiration_date":null,
"campaign_type":"AffiliateEnabled",
"affiliate_payout":{
"min":4.5,
"currency":"USD",
"pricing":"Base: $4.50 per call Bonus: $2.75 per call if duration > 60",
"max":7.25,
"policies":[
{
"type":"Base",
"currency":"USD",
"condition":"",
"amount":4.5
},
{
"type":"Bonus",
"currency":"USD",
"condition":"duration > 60",
"amount":2.75
}
],
"range":"$4.50 - $7.25 per call"
},
"updated_at":"2015-05-13 07:45:08 -0800",
"url":"http://www.nfltix.com/postseasonnow",
"hours":{
"saturday_open":32400,
"sunday_open":32400,
"monday_closed":false,
"tuesday_open":32400,
"thursday_open":32400,
"friday_close":75600,
"sunday_close":50999,
"wednesday_closed":false,
"thursday_closed":false,
"tuesday_close":75600,
"friday_open":32400,
"saturday_closed":true,
"sunday_closed":true,
"tuesday_closed":true,
"wednesday_close":75600,
"friday_closed":true,
"monday_open":32400,
"saturday_close":75600,
"monday_close":75600,
"thursday_close":75600,
"wednesday_open":32400
},
"named_regions":[
{
"regions":[
{
"region_type":"State",
"value":"CA",
"text":"TBD"
},
{
"region_type":"State",
"value":"OR",
"text":"TBD"
},
{
"region_type":"State",
"value":"WA",
"text":"TBD"
}
],
"name":"West Coast"
},
{
"regions":[
{
"region_type":"State",
"value":"NY",
"text":"TBD"
},
{
"region_type":"State",
"value":"NJ",
"text":"TBD"
}
],
"name":"East Coast"
}
]
},
"future_terms":{
"description":"August promotion to sell post-season tickets at half price.",
"timezone":"Pacific Time (US & Canada)",
"visibility":"All",
"created_at":"2015-05-13 08:46:43 -0800",
"id":"",
"operating_24_7":false,
"go_live_date":null,
"default_creative_id_from_network":"123",
"campaign_language":"English",
"campaign_country":"US",
"advertiser_payin":{
"min":7,
"currency":"EUR",
"pricing":"€7.00 per call if duration > 2 min 30 sec",
"max":7,
"policies":[
{
"type":"Base",
"currency":"EUR",
"condition":"duration > 2 min 30 sec",
"amount":7
}
],
"range":"€7.00 per call"
},
"budget_activities":{
"periodic_call_cap_alert":{
"budget_amount":200.0,
"budget_currency":"USD",
"reset_period":"Ongoing",
"start_at":"2014-04-17T00:00:00-07:00",
"total_amount":0.0,
"time_zone":"Pacific Time (US & Canada)"
},
"concurrent_call_cap_alert":{
"budget_amount":50.0,
"budget_currency":"USD",
"reset_period":"Ongoing",
"start_at":"2014-04-17T00:00:00-07:00",
"time_zone":"Pacific Time (US & Canada)"
},
"budget_cap_alert":{
"budget_amount":100.0,
"budget_currency":"USD",
"reset_period":"Monthly",
"start_at":"2014-04-01T00:00:00-07:00",
"total_amount":0.0,
"time_zone":"Pacific Time (US & Canada)"
},
"pricing_type":"Fixed",
"ivr_tree":{
"root":{
"condition":"during_hours",
"children":[
{
"destination_phone_number":"8004377950",
"destination_country_code":"1",
"prompt":"",
"node_type":"Connect"
},
{
"destination_phone_number":"8004377950",
"destination_country_code":"1",
"prompt":"",
"node_type":"Connect"
}
],
"node_type":"Condition"
},
"record_calls":true
},
"auto_approve":"None",
"expiration_date":"2015-05-18T23:59:59-08:00",
"campaign_type":"AffiliateEnabled",
"affiliate_payout":{
"min":4.5,
"currency":"USD",
"pricing":"Base: $4.50 per call Bonus: $2.75 per call if duration > 60",
"max":7.25,
"policies":[
{
"type":"Base",
"currency":"USD",
"condition":"",
"amount":4.5
},
{
"type":"Bonus",
"currency":"USD",
"condition":"duration > 60",
"amount":2.75
}
],
"range":"$4.50 - $7.25 per call"
},
"updated_at":"2015-05-13 08:46:43 -0800",
"url":"http://www.nfltix.com/postseasonnow",
"hours":{
"saturday_open":32400,
"sunday_open":32400,
"monday_closed":false,
"tuesday_open":32400,
"thursday_open":32400,
"friday_close":75600,
"sunday_close":50999,
"wednesday_closed":false,
"thursday_closed":false,
"tuesday_close":75600,
"friday_open":32400,
"saturday_closed":true,
"sunday_closed":true,
"tuesday_closed":true,
"wednesday_close":75600,
"friday_closed":true,
"monday_open":32400,
"saturday_close":75600,
"monday_close":75600,
"thursday_close":75600,
"wednesday_open":32400
},
"named_regions":[
{
"regions":[
{
"region_type":"State",
"value":"CA",
"text":"TBD"
},
{
"region_type":"State",
"value":"OR",
"text":"TBD"
},
{
"region_type":"State",
"value":"WA",
"text":"TBD"
}
],
"name":"West Coast"
},
{
"regions":[
{
"region_type":"State",
"value":"NY",
"text":"TBD"
},
{
"region_type":"State",
"value":"NJ",
"text":"TBD"
}
],
"name":"East Coast"
}
]
}
},
"custom_data":{
"channel":"Online lead"
}
}

```

POST /advertiser_campaigns Create an Advertiser Campaign
Examples
Create Campaign fJauFbSEGHKw8ADEGv for Advertiser cFUyYnFHyiYA42TrpM
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/cFUyYnFHyiYA42TrpM/advertiser_campaigns.json`
Request Body:

```
{
"id_from_network":"fJauFbSEGHKw8ADEGv",
"name":"PostSeason Promotion 11 fJauFbSEGHKw8ADEGv",
"description":"August promotion to sell post-season tickets at half price.",
"url":"http://www.nfltix.com/postseasonnow",
"timezone":"Pacific Time (US & Canada)",
"operating_24_7":false,
"campaign_type":"AffiliateEnabled",
"campaign_country":"US",
"default_creative_id_from_network":"111",
"hours":{
"friday_open":32400,
"wednesday_open":32400,
"sunday_close":50999,
"monday_open":32400,
"friday_close":75600,
"wednesday_close":75600,
"friday_closed":true,
"thursday_open":32400,
"sunday_closed":true,
"sunday_open":32400,
"saturday_open":32400,
"monday_closed":false,
"thursday_close":75600,
"tuesday_closed":true,
"tuesday_close":75600,
"tuesday_open":32400,
"saturday_closed":true,
"saturday_close":75600,
"monday_close":75600,
"thursday_closed":false,
"wednesday_closed":false
},
"named_regions":[
{
"name":"West Coast",
"regions":[
{
"region_type":"State",
"value":"CA"
},
{
"region_type":"State",
"value":"OR"
},
{
"region_type":"State",
"value":"WA"
}
]
},
{
"name":"East Coast",
"regions":[
{
"region_type":"State",
"value":"NY"
},
{
"region_type":"State",
"value":"NJ"
}
]
}
],
"advertiser_payin":{
"policies":[
{
"condition":"duration > 2 min 30 sec",
"type":"Base",
"currency":"USD",
"amount":7.0
}
]
},
"affiliate_payout":{
"policies":[
{
"condition":"",
"amount":4.5,
"currency":"USD",
"type":"Base"
},
{
"condition":"duration > 60",
"amount":2.75,
"currency":"USD",
"type":"Bonus"
}
]
},
"ivr_tree":{
"record_calls":true,
"root":{
"node_type":"Condition",
"condition":"during_hours",
"children":[
{
"node_type":"Connect",
"destination_phone_number":"8004377950",
"destination_country_code":"1",
"prompt":""
},
{
"node_type":"Connect",
"destination_phone_number":"8004377950",
"destination_country_code":"1",
"prompt":""
}
]
}
},
"custom_data":{
"channel":"Offline leads"
}
}

```

Response Body:
Same as a GET response, includes all the advertiser campaign properties.
PUT /advertiser_campaigns/<advertiser_campaign_id> Update an Advertiser Campaign
Examples
Example IVR Tree updates:
  1. Verify the callers location, then if on the West Coast (setup previously) forward to a call center, otherwise hang up after playing a prompt.



```
curl­-XPUT-H"Content­Type: application/json"-­u'login:pass'
'https://vanity.invoca.net/api/2018-11-01/advertisers/:advertiser_id/advertiser_campaigns/445566.json'\
-d'
{"ivr_tree":
 {"root":
   {"node_type":"VerifyLocation",
    "children":
     [{"node_type":"Condition",
       "condition":"in_region[West Coast]",
       "children":
         [{"children":[],
           "condition":"",
           "node_type":"Connect",
           "destination_phone_number":"8004377950",
           "destination_country_code":"1"},
           {"node_type":"EndCall",
            "prompt":"We are sorry, we currently cannot service your area. Goodbye."}]}]
   },
   "record_calls":true}}'-v

```

  1. Present the options for multiple departments, if sales is selected check if office is open. If the office is open, forward the call, if not play a prompt and then hangup.



```
curl-XPUT-H"Content­Type: application/json"-u'login:pass'
'https://vanity.invoca.net/api/2018-11-01/advertisers/:advertiser_id/advertiser_campaigns/445566.json'\
-d'
{"ivr_tree":{
   "record_calls":true,
   "root":{
     "node_type":"Menu",
     "prompt":"Please press 1 for sales or 2 for 24 hour support",
     "children":[
       { "node_type":"Condition",
         "condition":"during_hours",
         "children":[
           { "node_type":"Connect",
             "destination_phone_number":"8004377950",
             "destination_country_code":"1",
             "prompt":"Thank you, transferring you now"

           { "node_type":"EndCall",
             "prompt":"We are currently closed. Please call back during business hours. Goodbye"
           }]},
       { "node_type":"Connect",
         "destination_phone_number":"8004377950",
         "destination_country_code":"1",
         "prompt":"Thank you, transferring you now"
       }]}}}'-v

```

  1. Offer an sms to see current offers and then connect to a call center.



```
curl­-XPUT-H"Content­Type: application/json"­-u'login:pass'
'https://vanity.invoca.net/api/2018-11-01/advertisers/:advertiser_id/advertiser_campaigns/445566.json'\
-d'
{"ivr_tree":
 {"root":
   {"node_type":"SmsPromo",
    "sms_promo_copy":"Visit us at www.invoca.com to see new promotions.",
    "sms_promo_delay":1,
    "prompt":"If you would like to see information about our current offers, please press 9 now.",
    "children":
     [{"children":[],
       "condition":"",
       "node_type":"Connect",
       "destination_phone_number":"8004377950",
       "destination_country_code":"1"}]
   },
   "record_calls":true}}'-v

```

Each of the above requests will have a response body similar to a GET request, including all the advertiser campaign properties.
GET /advertiser_campaigns/<advertiser_campaign_id>/quick_stats Quick Stats
Examples
Read Campaign 100 for Advertiser 2
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>/quick_stats.json`
Response Body:

```
{
"stats":{
"last_30days":{
"call_avg_total_duration":0.0,
"call_count":0
},
"last_7days":{
"call_avg_total_duration":0.0,
"call_count":0
},
"today":{
"call_avg_total_duration":0.0,
"call_count":0
}
}
}

```

POST /advertiser_campaigns/<advertiser_campaign_id>/go_live Set Campaign State to Live
Examples
Advertiser campaigns can have their state controlled through this API. When a campaign is created through the API, its “future terms” are being set, and its state is not yet live. When the go_live endpoint is hit, the “future terms” are promoted to “current terms” and the campaign becomes live. Archived campaigns must be unarchived before calling this endpoint to make them live.
Use this request url format:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>/go_live.json`

```
curl­-XPOST­-H"Content­Type: application/json"­-u'login:pass'
'https://vanity.invoca.net/api/2018-11-01/123/advertisers/advertiser_id/advertiser_campaigns/445566/go_live.json'\
-d'
{
  "timeout": 10
}
'-v

```

POST /advertiser_campaigns/<advertiser_campaign_id>/archive Set Campaign State to Archived
Examples
If a campaign has previously been set to live, either through the API or through the UI, it can be archived, which effectively shuts it down. An archived campaign can be returned to live at a later time. To archive a campaign use this the following endpoint URL:
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>/archive.json`
Response Body:
POST /advertiser_campaigns/<advertiser_campaign_id>/unarchive Unarchive a Campaign
Examples
Archived campaigns should be unarchived using this endpoint. It changes campaign status to paused. After that you can activate the campaign using a go_live request.
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>/unarchive.json`
Response Body:
## Error Handling[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_campaigns/index.html#error-handling "Permalink to this heading")
Forbidden – 403:
### PUT/POST[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_campaigns/index.html#put-post "Permalink to this heading")
`https://invoca.net/api/2018-11-01/<network_id>/advertiser/<advertiser_id_from_network>/advertiser_campaign/<advertiser_campaign_id_from_network>/advertiser_campaigns/<advertiser_campaign_id>.json`
Content Type: application/json
Response Code: 403
**Request Body**

```
{
"node_type":"Menu",
"prompt":"Prompt text",
"prompt_id_from_network":"",
"prompt_url":null,
"prompt_recieved":null,
"children":[
{
"node_type":"Menu",
"prompt":"",
"prompt_id_from_network":"",
"prompt_url":null,
"prompt_recieved":null,
"children":[
{
"node_type":"EndCall",
"prompt":"",
"prompt_id_from_network":"",
"prompt_url":null,
"prompt_recieved":null
}
]
}
]
}

```

**Response Body**

```
{
"error":{
"ivr_tree":{
"children":[
{
"0":{
"prompt":[
"cannot be empty"
]
}
}
]
}
}
}

```

The number in error message represents the index of the child node in the tree, or in other words, it is the keypress of the node containing the error minus one.
