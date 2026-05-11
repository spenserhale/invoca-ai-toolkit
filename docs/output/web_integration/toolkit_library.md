  * [Web Integration](https://developers.invoca.net/en/2019-02-01/web_integration/index.html)
  * Invoca Developer Portal


[Return to the Invoca Platform](http://www.invoca.net/home)
# InvocaJS Toolkit Library[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#invocajs-toolkit-library "Permalink to this heading")
The InvocaJS Toolkit is a library of JavaScript functions to help facilitate advanced implementations. The following functions can be leveraged only if you have InvocaJS installed on your site and your Invoca network has been properly configured by an Invoca Customer Success or Implementation Manager.
_Note:_ Any method preceded with an underscore is subject to change and should not be used.
## Toolkit Functions[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#toolkit-functions "Permalink to this heading")
### readInvocaData[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#readinvocadata "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#description "Permalink to this heading")
Searches the `"invoca_session"` cookie for a cached value. If the request is not found, it returns the default value or null if one is not passed.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#usage "Permalink to this heading")
`Invoca.Tools.readInvocaData(key, defaultValue)`
#### Arguments:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#arguments "Permalink to this heading")
`"key"` is the name of the parameter to search for.
`"defaultValue"` is the value returned if “key” is not found.
### setCookie[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#setcookie "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id1 "Permalink to this heading")
Sets a cookie at the current trueDomain.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id2 "Permalink to this heading")
`Invoca.Tools.setCookie(cookieName, cookieValue, lifetimeInDays)`
#### Arguments:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id3 "Permalink to this heading")
`"cookieName"` is the name of the cookie to be set.
`"cookieValue"` is the value of the cookie to be set.
`"lifetimeInDays"` is the number of days the cookie should live for.
### readCookie[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#readcookie "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id4 "Permalink to this heading")
This function will return the value of a requested cookie by passing the cookie name.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id5 "Permalink to this heading")
`Invoca.Tools.readCookie(cookieName)`
#### Arguments:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id6 "Permalink to this heading")
`"cookieName"` is the name of the cookie to read.
### parseReferrer[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#parsereferrer "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id7 "Permalink to this heading")
This function uses a `campaignMapping` hash to search the referrer for each key in the hash and will return its value as a campaign ID. If none are found, it will return the default value.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id8 "Permalink to this heading")
`Invoca.Tools.parseReferrer(campaignMapping, defaultValue)`
#### Arguments:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id9 "Permalink to this heading")
`"campaignMapping"` is a hash of strings to look for in the referrer. The key is what to look for, the value is the corresponding Campaign ID.
`"defaultValue"` is a string of the fallback Campaign ID that should be returned when no keys are found.
### contains[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#contains "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id10 "Permalink to this heading")
This function will search for a string inside another string. It will return true if it does and false if it does not.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id11 "Permalink to this heading")
`Invoca.Tools.contains(haystack, needle)`
#### Arguments:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id12 "Permalink to this heading")
`"haystack"` is the string to look in.
`"needle"` is the string to look for.
Looking for a needle in a haystack!
### readUrl[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#readurl "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id13 "Permalink to this heading")
This function will search all query strings the the URL for a key name and return it’s value.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id14 "Permalink to this heading")
`Invoca.Tools.readUrl(key)`
#### Arguments:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id15 "Permalink to this heading")
`"key"` = Name of the query string parameter to look for.
### deviceType[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#devicetype "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id16 "Permalink to this heading")
This function will attempt to return the device type of the visitor.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id17 "Permalink to this heading")
`Invoca.Tools.deviceType()`
#### Response:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#response "Permalink to this heading")
`desktop`, `mobile`, or `tablet`.
### isMobile[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#ismobile "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id18 "Permalink to this heading")
This function will decide if the visitor is on a mobile device.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id19 "Permalink to this heading")
`Invoca.Tools.isMobile()`
#### Response:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id20 "Permalink to this heading")
`true` when visitor is on a mobile phone or tablet.
`false` when visitor is on desktop or unknown.
### waitFor[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#waitfor "Permalink to this heading")
#### Description:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id21 "Permalink to this heading")
This function will wait for a function to return a value before executing the next code.
#### Usage:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id22 "Permalink to this heading")
`Invoca.Tools.waitFor(inputFunction, callbackFunction, defaultValue, maxWaitTime)`
#### Response:[¶](https://developers.invoca.net/en/2019-02-01/web_integration/toolkit_library.html#id23 "Permalink to this heading")
`inputFuction` must be a function, any value returned by this function will be considered true, so return null to try again.
`callbackFunction` must be a function, and is called with the found value or default value passed as an argument.
`defaultVaule` is the value that will be passed into `callbackFunction` if `inputFunction` fails to return a value within the `maxWaitTime`.
`maxWaitTime` is the maximum amount of miliseconds to wait for `inputFunction` to return a value.
