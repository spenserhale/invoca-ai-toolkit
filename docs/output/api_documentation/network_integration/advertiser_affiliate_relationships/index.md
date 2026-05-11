  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Auto-Approve Affiliate to Campaigns[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_affiliate_relationships/index.html#auto-approve-affiliate-to-campaigns "Permalink to this heading")
Changes to the Relationship between Advertiser and Affiliate on the network platform are replicated to the Invoca platform using this API. The operations on Advertiser‐Affiliate Relationships are similar to Network, in that the interface is fully idempotent, and the create and update commands will act as “create or update”.
When setting the Relationship between an Advertiser and Affiliate to Approved, all current and future campaign applications made between the Affiliate and Advertiser will be auto-approved. If the Relationship is set to any status other than Approved, all current and future applications will be declined and any active affiliate campaigns will be suspended.
Relationship status is set individually but reading is available for one or all relationships for an advertiser.
Parameters for the relationships are shown below  
| Property  | Type  | Value  |  
| --- | --- | --- |  
| affiliate_id_from_network  | string  | The network id for the affiliate. (read only)  |  
| status  | One of: Pending, Approved, Suspended, Declined, Deactivated  | Status of the advertiser ‐ affiliate relationship.  |  
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/affiliates/<affiliate_id_from_network>.json`
GET /advertisers/<advertiser_id>/affiliates Get all Advertiser-Affiliate relationships
Examples
Read all relationships for advertiser id from network 1
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/1/affiliates.json`
Format: application/json
Response Code: 200
Response Body:

```
[
{
"status":"Approved",
"affiliate_id_from_network":"222"
},
{
"status":"Approved",
"affiliate_id_from_network":"34518"
}
]

```

GET /advertisers/<advertiser_id>/affiliates/<affiliate_id> Get an Advertiser-Affiliate relationship
Examples
Read a single relationship
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/1/affiliates/222.json`
Format: application/json
Response Code: 200
Response Body:

```
{
"status":"Approved",
"affiliate_id_from_network":"222"
}

```

POST /advertisers/<advertiser_id>/affiliates/<affiliate_id> Create an Advertiser-Affiliate relationship
Examples
Create relationship between Advertiser id from network 1 and Affiliate id from network 222
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/1/affiliates/222.json`
Format: application/json
Request Body:

```
{
"status":"Approved"
}

```

Response Code: 201
Response Body:
PUT /advertisers/<advertiser_id>/affiliates/<affiliate_id> Update an Advertiser-Affiliate relationship
Examples
Update an Advertiser-Affiliate relationship with id from network 1 and Affiliate id from network 222
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/1/affiliates/222.json`
Format: application/json
Request Body:

```
{
"status":"Approved"
}

```

Response Code: 200
Response Body:
DELETE /advertisers/<advertiser_id>/affiliates/<affiliate_id> Delete an Advertiser-Affiliate relationship
Examples
Delete a relationship
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/1/affiliates/222.json`
Response Code: 200
