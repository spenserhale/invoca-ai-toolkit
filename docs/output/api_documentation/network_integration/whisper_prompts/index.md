  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Whisper Prompts[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/whisper_prompts/index.html#whisper-prompts "Permalink to this heading")
## Manage whisper prompts for campaigns[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/whisper_prompts/index.html#manage-whisper-prompts-for-campaigns "Permalink to this heading")
A whisper prompt can be created from provided text or a professional prompt recordings can be assigned as whisper prompt.
### Create whisper prompt[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/whisper_prompts/index.html#create-whisper-prompt "Permalink to this heading")
**Example: create whisper prompt**
POST
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Request Body

```
{
"ivr_tree":{
"record_calls":false,
"whisper_prompt_text":"How are you today?",
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":""
}
}
}

```

### Assign prompt recording as whisper prompt[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/whisper_prompts/index.html#assign-prompt-recording-as-whisper-prompt "Permalink to this heading")
**Example: assign prompt recording as whisper prompt**
POST
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/advertiser_campaigns/<advertiser_campaign_id_from_network>.json`
Request Body

```
{
"ivr_tree":{
"record_calls":false,
"whisper_prompt_id_from_network":"rec34",
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":""
}
}
}

```

### Retrieve whisper prompt for a campaign[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/whisper_prompts/index.html#retrieve-whisper-prompt-for-a-campaign "Permalink to this heading")
**Example: retrieve whisper prompt for a campaign**
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
"whisper_prompt_text":"How are you today?",
"whisper_prompt_id_from_network":"rec34",
"root":{
"node_type":"Connect",
"destination_phone_number":"8056173768",
"destination_country_code":""
}
}
}
}

```

