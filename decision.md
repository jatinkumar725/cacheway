# Problem 1: Request vs Forward

1. Until now I thought requesting a resource is same as forwarding a request. But, both are different.

How?

- Request a resource

Make a HTTP request to target url with
 - Method
 - URL specifics
 - Headers
 - Body (if has)
 - Protocol version

Problem?

If proxy make this request on behalf of client, then handling headers, body, protocol and other things are become difficult to manage as i need to create same request object as client.

Solution?

- Forward a request


2. If I use http.request() from HTTP module, it creates a proxy request but it cannot flow complete tranfer of response object from target machine to client. I need to handle everything personally like response status code, error-handling, headers, retries.

Solution?

- Use http-proxy module


---------------------------------------------------------------------------------------------------------------------------------------------------------------

# CONFUSION???

1. If i use http.request() to make proxy request then will it pipe only response data from target server or complete response object including headers, cookies, session, data, etc.?

Ans: It only pipe data, need to handle status, headers, etc. manually.