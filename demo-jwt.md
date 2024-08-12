Go to http://frontend.local/

Login using the following credentials:

![JWT Flow](images/jwt-1.png)


- Username: client1
- Password: client1

or
- Username: client2
- Password: client2

The frontend make a post to this endpoint: http://api.local/logi

code:
curl 'http://api.local/login' \
  -H 'Referer: http://frontend.local/' \
  --data-raw '{"username":"client1","password":"client1"}' \
  --insecure

The API will return a JWT token that will be stored in the local storage of the browser.

![JWT Flow](images/jwt-2.png)


If we decode the token we can see the following information:

![JWT Flow](images/jwt-3.png)

The payflow has the scope for the client 1 so this user only could modify this client.

The token has a Verify signatre encrypted, only the API could decrypt this token. THe siging is in this code

const token = jwt.sign({ username, scope: users[username].scope }, SECRET_KEY, { expiresIn: '1h' });

https://github.com/morettimaxi/qdrant-gitops/blob/463990308973e902cbaeb0000132bbb4a5b46e63/source/api/index.js#L43

//TO Do: The secret key is hardcoded, we need to change this to a secret manager like Vault or AWS Secret Manager to store the secret key. For taht we need a process to the rotation, and the secret key should be stored in a secure place.

Now we made te login with the client1 user. It only can see the client1 information.

![JWT Flow](images/jwt-4.png)

We will modify the number of replcias of the Qdrant Helm chart to 3 replicas..

![JWT Flow](images/jwt-5.png)

It make a post to the API, it inhect the jwt token in the header.

curl 'http://api.local/configure' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
  --data-raw '{"client":"client1","replicas":"3"}' \
  --insecure

  The API will validate if the user has the scope to modify the client1 and if the client exists. For that it will decode using the secret the token and check the scope and the client.

  We get the response from the API that the replicas are updated and pushed to Github
  ![JWT Flow](images/jwt-6.png)

  The APi automatially make a commit to the git repository with the new configuration.

    ![JWT Flow](images/jwt-7.png)
Commit: https://github.com/morettimaxi/qdrant-gitops/commit/e19471207607d499adc37b9f827bb35490cfa5bb

Argo CD detected the chaange and it will apply the new configuration to the cluster.

![JWT Flow](images/jwt-8.png)

Argo Event: 
![JWT Flow](images/jwt-0.png)


Also it has the featuure to get the API key and endpoint to connect to the Qdrant API.

![JWT Flow](images/jwt-10.png)

curl 'http://api.local/token/client1' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNsaWVudDEiLCJzY29wZSI6ImNsaWVudDEiLCJpYXQiOjE3MjM0MjcwODUsImV4cCI6MTcyMzQzMDY4NX0.hPF0XX7xm-_s-49M9PdFznYkEM7Mq3J-hJ1e3dovgCo' \
 
 The frontend make this query to the API to get the API key and the endpoint to connect to the Qdrant API and show the URL and API key to the user.

![JWT Flow](images/jwt-11.png)

If we make the same query but for the client2 user, it will return an error because the user doesn't have the scope to modify the client1.

``` curl 'http://api.local/token/client2'   -H 'Accept: */*'   -H 'Accept-Language: en'   -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNsaWVudDEiLCJzY29wZSI6ImNsaWVudDEiLCJpYXQiOjE3MjM0MjcwODUsImV4cCI6MTcyMzQzMDY4NX0.hPF0XX7xm-_s-49M9PdFznYkEM7Mq3J-hJ1e3dovgCo'   -H 'Cache-Control: no-cache'   -H 'Connection: keep-alive'   -H 'DNT: 1'   -H 'Origin: http://localhost:3000'   -H 'Pragma: no-cache'   -H 'Referer: http://localhost:3000/'   -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'   --insecure
{"error":"Insufficient permissions"}```

