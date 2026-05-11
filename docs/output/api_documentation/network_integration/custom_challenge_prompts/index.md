  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Custom Challenge Prompts[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/custom_challenge_prompts/index.html#custom-challenge-prompts "Permalink to this heading")
## Manage custom challenge prompt for campaigns[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/custom_challenge_prompts/index.html#manage-custom-challenge-prompt-for-campaigns "Permalink to this heading")
A custom challenge prompt can be created from provided text or a professional prompt recordings can be assigned as custom challenge prompt.
### Create custom challenge prompt[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/custom_challenge_prompts/index.html#create-custom-challenge-prompt "Permalink to this heading")
**Example: create custom challenge prompt**
POST
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Request Body

```
{
"ivr_tree":{
"record_calls":false,
"custom_challenge_prompt_text":"Thank you for calling.",
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":""
}
}
}

```

### Assign prompt recording as custom challenge prompt[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/custom_challenge_prompts/index.html#assign-prompt-recording-as-custom-challenge-prompt "Permalink to this heading")
**Example: assign prompt recording as custom challenge prompt**
POST
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Request Body

```
{
"ivr_tree":{
"record_calls":false,
"custom_challenge_prompt_id_from_network":"rec34",
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":""
}
}
}

```

### Retrieve custom challenge prompt for a campaign[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/custom_challenge_prompts/index.html#retrieve-custom-challenge-prompt-for-a-campaign "Permalink to this heading")
**Example: retrieve custom challenge prompt for a campaign**
GET
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Response

```
{
"name":"Selling Shoes",
"status":"Activated",
"future_terms":{
"ivr_tree":{
"record_calls":false,
"custom_challenge_prompt_text":"Thank you for calling.",
"custom_challenge_prompt_id_from_network":"rec34",
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":""
}
}
}
}

```

