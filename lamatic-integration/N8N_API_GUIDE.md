# 🔑 n8n API Integration Guide

This guide explains how to get your n8n API credentials for bulk migration.

## 🎯 Getting n8n API Credentials

### 1. **Self-Hosted n8n Instance**

If you're running your own n8n instance:

#### **Step 1: Get Your n8n URL**
```
https://your-n8n-instance.com
```

#### **Step 2: Generate API Key**

**Option A: Via n8n UI (Recommended)**
1. Open your n8n instance
2. Click on your profile (top right)
3. Go to **"Personal Settings"**
4. Navigate to **"API Keys"** tab
5. Click **"Create API Key"**
6. Give it a name (e.g., "Lamatic Migration")
7. Copy the generated key

**Option B: Via n8n CLI**
```bash
# In your n8n installation directory
n8n user:create --email=api@yourcompany.com --firstName=API --lastName=User
n8n user:token --email=api@yourcompany.com
```

### 2. **n8n Cloud**

If you're using n8n Cloud:

#### **Step 1: Get Your n8n Cloud URL**
```
https://yourinstance.app.n8n.cloud
```

#### **Step 2: Generate API Key**
1. Log into your n8n Cloud instance
2. Click on your profile (top right)
3. Go to **"Settings"** → **"API Keys"**
4. Click **"Create new API key"**
5. Set permissions and expiration
6. Copy the generated key

## 🔐 Required Permissions

Your API key needs these permissions:
- ✅ **Read workflows** (`workflow:read`)
- ✅ **List workflows** (`workflow:list`)

## 🧪 Testing Your Credentials

### Quick Test with cURL:
```bash
curl -X GET "https://your-n8n-instance.com/api/v1/workflows" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### Expected Response:
```json
{
  "data": [
    {
      "id": "1",
      "name": "My Workflow",
      "active": true,
      "nodes": [...],
      "connections": {...},
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🚨 Security Best Practices

### 1. **API Key Security**
- ✅ Use separate API keys for different purposes
- ✅ Set appropriate expiration dates
- ✅ Store keys securely (never in code)
- ✅ Rotate keys regularly
- ❌ Never share API keys in screenshots or logs

### 2. **Network Security**
- ✅ Use HTTPS only
- ✅ Whitelist IP addresses if possible
- ✅ Use VPN for internal instances

### 3. **Access Control**
- ✅ Create dedicated service accounts
- ✅ Grant minimum required permissions
- ✅ Monitor API usage

## 🔧 Troubleshooting

### Common Issues:

#### **401 Unauthorized**
```
Error: n8n API returned 401: Unauthorized
```
**Solutions:**
- Check API key is correct
- Verify key hasn't expired
- Ensure proper Authorization header format

#### **403 Forbidden**
```
Error: n8n API returned 403: Forbidden
```
**Solutions:**
- Check API key permissions
- Verify workflow access rights
- Contact n8n admin for permissions

#### **404 Not Found**
```
Error: n8n API returned 404: Not Found
```
**Solutions:**
- Verify n8n URL is correct
- Check if `/api/v1/` endpoint exists
- Ensure n8n version supports REST API

#### **CORS Issues (Browser)**
```
Error: CORS policy blocked request
```
**Solutions:**
- Use server-side API calls (not browser direct calls)
- Configure CORS on n8n instance
- Use proxy server for API calls

## 📚 n8n API Documentation

- **Official Docs**: https://docs.n8n.io/api/
- **OpenAPI Spec**: `https://your-n8n-instance.com/api/v1/openapi.json`
- **Swagger UI**: `https://your-n8n-instance.com/api/v1/docs`

## 🎯 Demo Credentials

For testing purposes, you can use:
- **URL**: `https://demo.n8n.io` (any URL will work for demo)
- **API Key**: `demo-key` (any key will work for demo)

*Note: Demo mode uses mock data for testing the UI without real n8n API calls.*

## 🔄 API Endpoints Used

The bulk migration feature uses these n8n API endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/workflows` | GET | List all workflows |
| `/api/v1/workflows/{id}` | GET | Get specific workflow |

## 💡 Tips

1. **Test with a small workflow first** to verify everything works
2. **Check workflow complexity** - complex workflows may need manual review
3. **Backup your n8n data** before major migrations
4. **Use demo mode** to test the UI without API calls

---

**Ready to migrate?** Enter your credentials in the bulk migration dialog! 🚀
