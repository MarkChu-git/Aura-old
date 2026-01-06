# DeepSeek API Troubleshooting

## Issue: 401 Unauthorized

**Symptoms:**

- The application logs show `401 Unauthorized` when calling DeepSeek.
- DNS resolution works (`ping api.deepseek.com` from container works).
- Network connectivity is fine.

**Cause:**
The most common cause is a missing or malformed `Authorization` header in the request, or an invalid API Key.

## Verification Script

Run this python script inside the container (or locally with the key set) to verify your credentials.

```python
import os
import requests

API_KEY = os.getenv("DEEPSEEK_API_KEY")
MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

if not API_KEY:
    print("❌ Error: DEEPSEEK_API_KEY is not set.")
    exit(1)

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": MODEL,
    "messages": [
        {"role": "user", "content": "Hello, are you online?"}
    ]
}

print(f"Testing DeepSeek API with model: {MODEL}...")
try:
    response = requests.post("https://api.deepseek.com/chat/completions", json=data, headers=headers, timeout=10)
    
    if response.status_code == 200:
        print("✅ Success! API Key is valid.")
        print("Response:", response.json()['choices'][0]['message']['content'])
    else:
        print(f"❌ Failed with Status Code: {response.status_code}")
        print("Response:", response.text)

except Exception as e:
    print(f"❌ Connection Error: {e}")
```

## Solutions

1. **Check Secrets File**: Ensure `DEEPSEEK_API_KEY` is present in `/home/deploy/aura-secrets.env`.

2. **Restart Container**: If you changed the env file, you must recreate the container:

   ```bash
   docker compose -f docker-compose.prod.yml up -d --force-recreate api
   ```

3. **Verify Header Format**: Ensure the code uses `Bearer <KEY>`.
