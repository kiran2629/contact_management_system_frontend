# 🔐 AI Features - Role-Based Permissions Guide

## Overview

All **3 AI features** (AI Assistant, Voice Commands, Language Selector) now **fully respect user roles and permissions** in your CRM system.

---

## 👥 Three User Personas

### 1. **Admin** 👑
- **Access Level**: FULL ACCESS
- **Can**:
  - ✅ View all contacts (all categories)
  - ✅ Create, update, delete any contact
  - ✅ View dashboard statistics
  - ✅ Manage users (create, edit, delete users)
  - ✅ Access admin panel
  - ✅ View permissions
  - ✅ Export/import contacts
  - ✅ View all activity logs
  - ✅ Use all AI features without restrictions

### 2. **HR** 🏢
- **Access Level**: LIMITED
- **Can**:
  - ✅ View contacts in assigned categories only
  - ✅ Create, update contacts (in allowed categories)
  - ⚠️ May have restricted delete permissions
  - ✅ View limited dashboard statistics
  - ❌ Cannot manage users
  - ❌ Cannot access admin panel
  - ❌ Cannot export all contacts
  - ✅ Use AI features (with category restrictions)

### 3. **User** 👤
- **Access Level**: RESTRICTED
- **Can**:
  - ✅ View contacts in assigned categories only
  - ⚠️ May have restricted create permissions
  - ⚠️ May have restricted update permissions
  - ❌ Usually cannot delete contacts
  - ⚠️ Limited dashboard access
  - ❌ Cannot manage users
  - ❌ Cannot access admin panel
  - ❌ Cannot export contacts
  - ✅ Use AI features (with strict restrictions)

---

## 🤖 AI Assistant - Permission Behavior

### What the AI Assistant Knows About You:

The AI Assistant is **context-aware** and knows:
1. Your **role** (Admin, HR, User)
2. Your **allowed categories**
3. Your **permissions** (create, read, update, delete)
4. Your **current page** and **search context**
5. **Total contacts you can access** (filtered by your categories)
6. **Dashboard stats** (if you have permission)

### Examples by Role:

#### **Admin**:
```plaintext
👤 You: "Create a new contact"
🤖 AI: "I'll open the form to create a new contact." [✅ Opens form]

👤 You: "Show me all users"
🤖 AI: "I'll open the user management panel for you." [✅ Opens admin panel]

👤 You: "Delete John's contact"
🤖 AI: "Are you sure you want to delete John's contact?" [✅ Shows confirm action]
```

#### **HR**:
```plaintext
👤 You: "Create a new contact"
🤖 AI: "I'll open the form to create a new contact." [✅ Opens form]

👤 You: "Show me all users"
🤖 AI: "User management is only available to Admins. Your role (HR) doesn't have access." [❌ Denied]

👤 You: "Show marketing contacts"
🤖 AI: "Searching for contacts in Marketing category." [✅ If allowed, ❌ If not]
```

#### **User**:
```plaintext
👤 You: "Create a new contact"
🤖 AI: "Sorry, you don't have permission to create contacts. Your role (User) doesn't allow this." [❌ Denied]

👤 You: "Show me dashboard stats"
🤖 AI: "You don't have permission to view detailed statistics." [❌ Denied]

👤 You: "Find John in Sales"
🤖 AI: "Searching for John in Sales..." [✅ If allowed, ❌ If not in your categories]
```

### Permission-Based Suggestions:

The AI Assistant **dynamically adjusts** its suggestions based on your permissions:

**Admin sees:**
```plaintext
I can help you with:

• Search contacts: "Find John Smith"
• Filter by category: "Show marketing contacts"
• Navigate: "Open dashboard"
• Create: "Add new contact"
• Statistics: "Show me stats"
• User Management: "Manage users" (Admin only)

Your Role: Admin
Allowed Categories: All
```

**HR sees:**
```plaintext
I can help you with:

• Search contacts: "Find John Smith"
• Filter by category: "Show Client contacts"
• Navigate: "Open dashboard"
• Create: "Add new contact"
• Statistics: "Show me stats"

Your Role: HR
Allowed Categories: Client, Vendor
```

**User sees:**
```plaintext
I can help you with:

• Search contacts: "Find John Smith"
• Filter by category: "Show Client contacts"
• Navigate: "Open dashboard"

Your Role: User
Allowed Categories: Client
```

---

## 🎤 Voice Commands - Permission Behavior

### Protected Commands:

#### **Admin Only**:
```bash
# ✅ Admin
"Open admin"
"Manage users"
"Show all users"
"Create new user"

# ❌ HR/User
Response: "User management is only available to Admins. Your role is HR/User."
```

#### **Create Permission Required**:
```bash
# ✅ If user has contact.create permission
"Create new contact"
"Add contact"

# ❌ If user doesn't have permission
Response: "You don't have permission to create contacts. Your role is User."
```

#### **View Statistics Permission Required**:
```bash
# ✅ If user has crm_features.view_statistics permission
"Open dashboard"
"Show statistics"
"Show stats"

# ❌ If user doesn't have permission
Response: "You don't have permission to view dashboard statistics."
```

#### **Category-Based Filtering**:
```bash
# ✅ If category is in allowed_categories
"Show marketing contacts"
"Filter sales contacts"

# ❌ If category is NOT in allowed_categories
Response: "You don't have access to Marketing category. 
           Allowed categories: Client, Vendor."
```

#### **Export Permission Required**:
```bash
# ✅ If user has crm_features.export_contacts permission
"Export contacts"

# ❌ If user doesn't have permission
Response: "You don't have permission to export contacts."
```

### Always Available Commands:

These work for **all roles**:
```bash
"Open contacts"           # View contacts (filtered by allowed categories)
"Search for John"         # Search (within allowed categories)
"Open settings"           # Access settings
"Open profile"            # View own profile
"Change theme"            # Toggle theme
"Logout"                  # Sign out
"Go back"                 # Navigate back
```

---

## 🌐 Language Selector - Permission Behavior

The **Language Selector** is available to **all users** regardless of role:

✅ **Admin**: Can change language
✅ **HR**: Can change language
✅ **User**: Can change language

**Available Languages**:
- 🇬🇧 English
- 🇮🇳 Tamil (தமிழ்)
- 🇮🇳 Hindi (हिन्दी)
- 🇮🇳 Telugu (తెలుగు)
- 🇮🇳 Kannada (ಕನ್ನಡ)

**Note**: AI-powered translation requires API key (optional).

---

## 🛡️ How Permissions Are Checked

### 1. **Contact Permissions**:
```typescript
permissions: {
  contact: {
    create: boolean,  // Can create new contacts
    read: boolean,    // Can view contacts
    update: boolean,  // Can edit contacts
    delete: boolean   // Can delete contacts
  }
}
```

### 2. **Notes Permissions**:
```typescript
permissions: {
  notes: {
    create: boolean,  // Can add notes to contacts
    update: boolean   // Can edit notes
  }
}
```

### 3. **CRM Features Permissions**:
```typescript
permissions: {
  crm_features: {
    view_statistics: boolean,   // Can view dashboard stats
    export_contacts: boolean,   // Can export contact data
    import_contacts: boolean    // Can import contact data
  }
}
```

### 4. **Allowed Categories**:
```typescript
allowed_categories: string[]  // e.g., ["Client", "Vendor", "Partner"]
```

Only contacts with at least one category in this list are accessible.

### 5. **Role-Based Access**:
```typescript
role: "Admin" | "HR" | "User"
```

**Admin**: Bypasses most restrictions (full access)
**HR**: Moderate access (category-filtered)
**User**: Limited access (strict category filter)

---

## 🧪 Testing Permission-Based AI

### Test as Admin:
1. Login as Admin user
2. Click AI Assistant (bottom-right)
3. Try: "Manage users" ✅ Should work
4. Try: "Create new contact" ✅ Should work
5. Use Voice: "Open admin" ✅ Should work

### Test as HR:
1. Login as HR user
2. Click AI Assistant
3. Try: "Manage users" ❌ Should deny
4. Try: "Show client contacts" ✅ Should work (if allowed)
5. Use Voice: "Create contact" ⚠️ Depends on permissions

### Test as User:
1. Login as User
2. Click AI Assistant
3. Try: "Create contact" ❌ Should deny (usually)
4. Try: "Show dashboard" ⚠️ Depends on permissions
5. Use Voice: "Open admin" ❌ Should deny

---

## 📊 Permission Matrix

| Feature | Admin | HR | User |
|---------|-------|-----|------|
| **AI Assistant** | ✅ Full | ✅ Limited | ✅ Basic |
| **Voice Commands** | ✅ All | ⚠️ Most | ⚠️ Few |
| **Language Selector** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create Contact** | ✅ Yes | ⚠️ Depends | ❌ Usually No |
| **Delete Contact** | ✅ Yes | ⚠️ Depends | ❌ Usually No |
| **View All Contacts** | ✅ Yes | ❌ No | ❌ No |
| **Manage Users** | ✅ Yes | ❌ No | ❌ No |
| **View Statistics** | ✅ Yes | ⚠️ Depends | ⚠️ Depends |
| **Export Contacts** | ✅ Yes | ⚠️ Depends | ❌ Usually No |
| **Admin Panel** | ✅ Yes | ❌ No | ❌ No |
| **Category Filter** | ✅ All | ✅ Assigned | ✅ Assigned |

**Legend**:
- ✅ = Always Available
- ⚠️ = Depends on specific permissions
- ❌ = Not Available

---

## 🔧 Configuration

### Setting User Permissions (Backend):

When creating/updating users, set:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "HR",
  "allowed_categories": ["Client", "Vendor", "Partner"],
  "permissions": {
    "contact": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "notes": {
      "create": true,
      "update": true
    },
    "crm_features": {
      "view_statistics": true,
      "export_contacts": false,
      "import_contacts": false
    }
  }
}
```

### Frontend Permission Detection:

The AI features automatically detect user permissions from Redux state:

```typescript
const { user } = useSelector((state: RootState) => state.auth);

// Permissions are automatically passed to:
// - AI Assistant
// - Voice Commands
// - All UI components
```

---

## 🚨 Important Notes

1. **Category Filtering**: 
   - If a user has `allowed_categories: ["Client"]`, they will ONLY see contacts tagged with "Client"
   - AI Assistant will ONLY suggest contacts from allowed categories
   - Voice commands will FAIL if trying to filter by non-allowed category

2. **Real-Time Updates**:
   - When user permissions change (e.g., admin updates their role)
   - They need to **logout and login again** for AI features to reflect new permissions

3. **Graceful Degradation**:
   - If permission check fails, user gets a clear error message
   - No broken UI or crashes
   - Alternative actions are suggested when possible

4. **Logging**:
   - All permission checks are logged to console (dev mode)
   - Example: `"Voice Commands - User context updated: { role: 'HR', allowed_categories: ['Client'] }"`

---

## 🎯 Summary

✅ **AI Assistant**: Fully permission-aware, provides role-based suggestions
✅ **Voice Commands**: Blocks unauthorized commands with clear feedback
✅ **Language Selector**: Available to all users
✅ **Category Filtering**: Respects allowed_categories for all users
✅ **Clear Error Messages**: Users know why an action was denied
✅ **Console Logging**: Developers can debug permission issues
✅ **No Breaking Changes**: Existing CRM functionality untouched

**Your CRM's AI features are now production-ready with enterprise-grade permission management!** 🚀

