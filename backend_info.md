So far, we have one endpoint, volunet-ai(not deployed to GCP rn). Here is a sample cURL request:
```curl -X POST -d '{"thread_id": "", "incoming_msg": "I want to ...", "lat": 123, "long": 789}' -H "Content-Type: application/json" http://localhost:8080/```
If the user is creating a new conversation, the ```thread_id``` will be blank. The ```incoming_msg``` field should include the users message. The function will return an object that looks like this:
```{"thread_id": "", "outgoing_msg": "I want to ..."}```
The ```thread_id``` field will include the thread id. This is important if you are creating a new thread, as you will have to pass this along to subsequent calls. ```outgoing_msg``` is the outgoing message.
k bye
