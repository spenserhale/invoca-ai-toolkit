  * [API Documentation](https://developers.invoca.net/en/2019-02-01/api_documentation/index.html)
  * [Network Integration](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# Advertiser Users[¶](https://developers.invoca.net/en/2019-02-01/api_documentation/network_integration/advertiser_users/index.html#advertiser-users "Permalink to this heading")
For convenience, the API provides an interface for performing operations on specific advertiser users. This is useful for situations where it is inconvenient to send an array of all existing advertiser users. Actions for this endpoint can only be taken on users with value of false for <can_login_via_platform> field, indicating that the user’s authentication is managed by the network (and has access to the Invoca platform using SSO).
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/<advertiser_id_from_network>/users/<user_id_from_network>.json`
GET /advertisers/<advertiser_id>/users Get all Advertiser Users for Advertiser
Examples
Read all advertiser users for advertiser e0Fv6YEk
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/e0Fv6YEk/users.json`
Format: application/json
Response Code: 200
Response Body:

```
[
{
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"id_from_network":"549494858585Dxlj2uCX0ijqXP4nAW",
"first_name":"Chris",
"contact_country_code":"1",
"last_name":"Dean",
"role":"Manager",
"oauth_refresh_token":"556588585858585858585858858",
"contact_phone_number":"888-603-3760",
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
}
]

```

GET /advertisers/<advertiser_id>/users/<user_id> Get an Advertiser User
Examples
Read a specific advertiser user
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/e0Fv6YEk/users/549494858585Dxlj2uCX0ijqXP4nAW.json`
Format: application/json
Response Code: 200
Response Body:

```
{
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"id_from_network":"549494858585Dxlj2uCX0ijqXP4nAW",
"first_name":"Chris",
"contact_country_code":"1",
"last_name":"Dean",
"role":"Manager",
"oauth_refresh_token":"556588585858585858585858858",
"contact_phone_number":"888-603-3760",
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
}

```

POST /advertisers/<advertiser_id>/users Create an Advertiser User
Examples
Create an advertiser user
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/e0Fv6YEk/users.json`
Request Body:

```
{
"user":{
"id_from_network":"549494858585Dxlj2uCX0ijqXP4nAW",
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
}

```

PUT /advertisers/<advertiser_id>/users/<user_id> Update an Advertiser User
Examples
Update an Advertiser User
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/e0Fv6YEk/users/<user_id>`
Request Body:

```
{
"user":{
"email_settings":[
{"email_address":"chris@nfltix.com","use_for_notifications":true}
],
"id_from_network":"549494858585Dxlj2uCX0ijqXP4nAW",
"first_name":"Chris",
"contact_country_code":"1",
"last_name":"Dean",
"role":"Manager",
"oauth_refresh_token":"556588585858585858585858858",
"contact_phone_number":"888-603-3760",
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
}

```

DELETE /advertisers/<advertiser_id>/users/<user_id> Delete an Advertiser User
Examples
Delete an advertiser user
Endpoint:
`https://invoca.net/api/2018-11-01/<network_id>/advertisers/e0Fv6YEk/users/549494858585Dxlj2uCX0ijqXP4nAW.json`
Format: application/json
Response Code: 200
Response Body:
