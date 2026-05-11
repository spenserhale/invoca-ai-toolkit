  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Prompt Recordings[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/prompt_recordings/index.html#prompt-recordings "Permalink to this heading")
## Assign prompts to campaigns[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/prompt_recordings/index.html#assign-prompts-to-campaigns "Permalink to this heading")
Professional prompt recordings can be assigned to advertiser campaigns. The prompts uploaded at Network level can be assigned to any advertiser campaign from that network. The prompts at Advertiser level can be assigned only to the campaigns of that specific advertiser.
### Retrieve available prompts[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/prompt_recordings/index.html#retrieve-available-prompts "Permalink to this heading")
It’s possible to retrieve all the prompts assigned to a network or an advertiser. The attributes returned for a prompt are:  
| id_from_network  | the network’s id for this prompt  |  
| --- | --- |  
| prompt_text  | the text of the recording  |  
| prompt_url  | the url of the prompt recording file  |  
| prompt_received  | the date when the professional prompt was created  |  
**Example: Network prompt recordings**
GET
`https://invoca.net/api/2018-11-01/<network_id>.json`
Response

```
{
"name":"Invoca",
"users":[],
"prompt_recordings":[
{
"id_from_network":"a1b2",
"prompt_text":"Thank you. Your call is being connected.",
"prompt_url":"http://example.com/recording.wav",
"prompt_received":"2015-08-02 08:49:28 -0700"
},
{
"id_from_network":"pr_342",
"prompt_text":"This prompt is on order",
"prompt_url":"http://example.com/recording_order.wav",
"prompt_received":null
}
]
}

```

**Example: Advertiser prompt recordings**
GET
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>.json`
Response

```
{
"id_from_network":"11",
"name":"Travel Agency",
"oauth_refresh_token":null,
"approval_status":"Approved",
"web_integration_phone_number":"5555551234",
"default_creative_id_from_network":"1234",
"sites":[],
"users":[],
"prompt_recordings":[
{
"id_from_network":"rec736",
"prompt_text":"Thank you for calling.",
"prompt_url":"http://example.com/recording.wav",
"prompt_received":"2015-08-02 08:49:28 -0700"
}
]
}

```

### Assign prompt to advertiser campaign[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/prompt_recordings/index.html#assign-prompt-to-advertiser-campaign "Permalink to this heading")
A prompt can be assigned to an advertiser campaign IVR tree by specifying its id_from_network at the specific node. The same request can be used to assign a new prompt or replace an existing one.
**Example: assign prompt recording**
POST
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Request Body

```
{
"ivr_tree":{
"record_calls":false,
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":"",
"prompt_id_from_network":"rec34"
}
}
}

```

**Example: list the prompts by retrieving the advertiser campaign**
GET
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Response (_complete response not shown_)

```
{
"name":"Selling Shoes",
"status":"Activated",
"future_terms":{
"ivr_tree":{
"record_calls":false,
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":"",
"prompt":"Thank you. We appreciate your interest in our product.",
"prompt_id_from_network":"rec34",
"prompt_url":"http://example.com/recording.wav",
"prompt_received":"2015-08-02 08:49:28 -0700"
}
}
}
}

```

**Example: remove prompt recording from a campaign**
Just specify an empty id_from_network and the prompt will get unassigned from the campaign.
POST
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Request Body

```
{
"ivr_tree":{
"record_calls":false,
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":"",
"prompt_id_from_network":""
}
}
}

```

