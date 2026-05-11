  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Affiliate Campaigns[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/affiliate_campaigns/index.html#affiliate-campaigns "Permalink to this heading")
Affiliate Campaign status can be replicated using this API. You are not allowed to delete affiliate campaigns.
Relationship properties are shown below  
| Property  | Type  | Value  |  
| --- | --- | --- |  
| affiliate_id_from_network  | string (read only)  | Network specific id of the affiliate.  |  
| status  | string (read and write)  | One of: Applied, Approved, Suspended, Declined.  |  
| id  | integer (read-only)  | The internal Invoca id of the affiliate campaign.  |  
| id_from_network  | string (read and write)  | Network specific id of the affiliate campaign.  |  
| max_promo_numbers  | integer (read only)  | Promo number limit.  |  
| object_url  | string (read-only)  | URL for reaching the affiliate campaign in the UI.  |  
| current_terms  | (read only)  |  
| **advertiser_payin**  |  
| max  | decimal  | Maximum payin amount (base + bonuses).  |  
| min  | decimal  | Minimum payin amount (base).  |  
| pricing  | string  | Human‐friendly representation of the payin pricing (eg. “$5.07 per call”).  |  
| currency  | string  | USD, GBP, EUR.  |  
| range  | string  | Formatted string including min and max payin values.  |  
| **policies**  |  
| amount  | decimal  | Payin policy amount.  |  
| currency  | string  | USD, GBP, EUR.  |  
| type  | string  | Base, Bonus.  |  
| condition  | string  | Condition options used to determine the base or bonus payout (eg. “duration >= 1 min 30 sec”).  |  
| pricing_type  | string  | Fixed, OverallMargin, IndividualMargin.  |  
| ivr_tree  | hash  | Interactive Voice Response tree.  |  
| **affiliate_payout**  |  
| max  | decimal  | Maximum payout amount (base + bonuses).  |  
| min  | decimal  | Minimum payout amount (base).  |  
| pricing  | string  | Human‐friendly representation of the payout pricing (eg. “$5.07 per call”).  |  
| currency  | string  | USD, GBP, EUR.  |  
| range  | string  | Formatted string including min and max payin values policies.  |  
| **policies**  |  
| amount  | decimal  | Payout policy amount.  |  
| currency  | string  | USD, GBP, EUR.  |  
| type  | string  | Base, Bonus.  |  
| condition  | string  | Condition options used to determine the base or bonus payout (eg. “duration >= 1 min 30 sec”).  |  
## Custom Data[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/affiliate_campaigns/index.html#custom-data "Permalink to this heading")
Affiliate campaigns may have Custom Data Fields applied to them, which will be applied to calls originating through the affiliate campaign. To apply Custom Data Values to an affiliate campaign, the top level parameter `custom_data` should be assigned a hash with each pair’s key corresponding to a partner name. The value of the pair should be the value to be applied.
For the following example, we would apply the value “Offline newspaper” to the Custom Data Field “channel”.

```
{
"custom_data":{
"channel":"Offline newspaper"
}
}

```

Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>/affiliates/<affiliate_id_from_network>/affiliate_campaigns.json`
GET /affiliate_campaigns Get all Affiliate Campaigns
Examples
Get all Affiliate Campaigns
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>/affiliate_campaigns.json`
GET /affiliates/<affiliate_id>/affiliate_campaigns Get an Affiliate Campaign
Examples
GET of Affiliate Campaign status for Advertiser 354 Campaign 12 to Affiliate 976
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/354/advertiser_campaigns/12/affiliates/976/affiliate_campaigns.json`
Format: application/json
Response Body:

```
{
"max_promo_numbers":10,
"current_terms":{
"advertiser_payin":{
"max":3.5,
"min":3.5,
"pricing":"$3.50 per call",
"currency":"USD",
"range":"$3.50 per call",
"policies":[
{
"amount":3.5,
"currency":"USD",
"type":"Base",
"condition":""
}
]
},
"pricing_type":"Fixed",
"ivr_tree":{
"root":{
"children":[
{
"destination_country_code":"",
"destination_phone_number":"",
"node_type":"Connect",
"prompt":""
},
{
"destination_country_code":"",
"destination_phone_number":"",
"node_type":"Connect",
"prompt":""
}
],
"node_type":"Menu",
"prompt":"Press one for transfer to a normal campaign (scottad pro 0903), press two for normal campaign (scott ad pro 3122), press three for transfer to a syndicated campaign!"
},
"record_calls":false
},
"affiliate_payout":{
"max":3.5,
"min":3.5,
"pricing":"$3.50 per call",
"currency":"USD",
"range":"$3.50 per call",
"policies":[
{
"amount":3.5,
"currency":"USD",
"type":"Base",
"condition":""
}
]
}
},
"status":"Approved_NotActive",
"id":1,
"id_from_network":"11",
"affiliate_id_from_network":"976",
"object_url":"https://invoca.net/p_campaigns/terms/19/11",
"custom_data":{
"channel":"Online lead"
}
}

```

POST /affiliates/<affiliate_id>/affiliate_campaigns Create an Affiliate Campaign
Examples
Create Affiliate Campaign with status for Advertiser 354 Campaign 12 to Affiliate 975
Please note - The Network Integration API only provides the ability to create an affiliate campaign with status “Applied”. If the Advertiser Campaign is set to “Approve All”, the campaign will automatically transition to “Approved”.
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/354/advertiser_campaigns/12/affiliates/975/affiliate_campaigns.json`
Format: application/json
Request Body:

```
{
"status":"Applied",
"id_from_network":"2234",
"custom_data":{
"channel":"Offline lead"
}
}

```

Response Body:
Same as a GET response, includes all the affiliate campaign properties.
Not Found - 404
Endpoint:
`https://invoca.net/api/api/2018-11-01/<network_id>/advertisers/354/advertiser_campaigns/13/affiliates/976/affiliate_campaigns.json`
Format: application/json
Request Body:

```
{
"status":"Approved"
}

```

Response Code: 403
Response Body:

```
{
"errors":{
"status":[
"cannot transition from 'Approved'"
]
},
"status":"Applied"
}

```

PUT /affiliates/<affiliate_id>/affiliate_campaigns Update an Affiliate Campaign
Examples
Update Affiliate Campaign status for Advertiser 354 Campaign 12 to Affiliate 976
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/354/advertiser_campaigns/12/affiliates/976/affiliate_campaigns.json`
Format: application/json
Request Body:

```
{
"status":"Approved"
}

```

Response Body:
Same as a GET response, includes all the affiliate campaign properties.
DELETE /affiliates/<affiliate_id>/affiliate_campaigns Delete an Affiliate Campaign
Examples
You are not allowed to delete an Affiliate Campaign.
