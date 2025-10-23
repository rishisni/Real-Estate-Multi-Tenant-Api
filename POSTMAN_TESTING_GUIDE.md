# Postman Testing Guide - Housingram API

## 📥 Import Collection & Environment

### Step 1: Import Collection
1. Open Postman
2. Click **Import** button (top left)
3. Select `Housingram_API.postman_collection.json`
4. Click **Import**

### Step 2: Import Environment
1. Click **Import** again
2. Select `Housingram_Environment.postman_environment.json`
3. Click **Import**
4. Select "Housingram Local Environment" from environment dropdown (top right)

## 🚀 Prerequisites

Before testing, ensure:

```bash
# 1. Database is created
createdb housingram_db

# 2. Environment is configured
cp .env.example .env
# Edit .env with your database credentials

# 3. Migrations are run
npm run setup

# 4. Server is running
npm start
```

## 🧪 Testing Workflow

### Phase 1: Super Admin Setup (Public Schema)

#### 1.1 Health Check
- **Folder:** `07. Health Check`
- **Request:** `Health Check`
- **Expected:** Status 200, API is running

#### 1.2 Super Admin Login
- **Folder:** `01. Authentication`
- **Request:** `Super Admin Login`
- **Credentials:**
  - Email: `superadmin@housingram.com`
  - Password: `SuperAdmin@123`
- **Expected:** Status 200, token saved to `superAdminToken`
- **Auto-saves:** Token automatically stored in environment

#### 1.3 Create First Tenant
- **Folder:** `02. Super Admin - Tenant Management`
- **Request:** `Create Tenant`
- **What happens:**
  1. Creates tenant in public.tenants
  2. Creates schema `tenant_1`
  3. Runs all tenant migrations
  4. Creates admin user in tenant schema
- **Expected:** Status 201, tenant created
- **Auto-saves:** `tenantId`, `tenantSchemaName`

#### 1.4 View Tenant Statistics
- **Request:** `Get Statistics`
- **Shows:** Aggregated data across all tenants
- **Expected:** Stats with tenant count, projects, units, revenue

### Phase 2: Tenant Admin Setup

#### 2.1 Login as Tenant Admin
- **Folder:** `01. Authentication`
- **Request:** `Tenant User Login`
- **Credentials:** (from tenant creation)
  - Email: `admin@abcbuilders.com`
  - Password: `SecurePass123`
- **Expected:** Status 200, token saved to `tenantToken`
- **Auto-saves:** Token and schema name

#### 2.2 Create Sales User
- **Folder:** `03. User Management`
- **Request:** `Create User`
- **Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@abcbuilders.com",
  "password": "SecurePass456",
  "role": "Sales"
}
```
- **Expected:** Status 201, user created
- **Note:** Use `tenantToken` for authorization

### Phase 3: Project Management

#### 3.1 Create Project
- **Folder:** `04. Project Management`
- **Request:** `Create Project`
- **Expected:** Status 201, project created
- **Auto-saves:** `projectId`

#### 3.2 List Projects
- **Request:** `Get All Projects`
- **Expected:** Paginated list of projects

#### 3.3 Update Project Status
- **Request:** `Update Project`
- **Body:** Change status to "Under Construction"
- **Expected:** Status 200, project updated

### Phase 4: Unit Management & Booking

#### 4.1 Create Multiple Units
- **Folder:** `05. Unit Management`
- **Request:** `Create Unit`
- **Run multiple times** with different unit numbers:
  - A-101, A-102, A-103, B-201, B-202, etc.
- **Expected:** Each returns 201
- **Auto-saves:** Last `unitId`

#### 4.2 View All Units
- **Request:** `Get All Units`
- **Expected:** List of all created units

#### 4.3 Filter Available Units
- **Request:** `Filter Units - Available Only`
- **Expected:** Only units with status "Available"

#### 4.4 Filter by Price Range
- **Request:** `Filter Units - By Price Range`
- **Modify:** `min_price` and `max_price` as needed
- **Expected:** Units within price range

#### 4.5 Filter by Bedrooms
- **Request:** `Filter Units - By Bedrooms & Project`
- **Expected:** Units matching criteria

#### 4.6 Book a Unit
- **Request:** `Book Unit`
- **What happens:**
  1. Changes status from "Available" to "Booked"
  2. Records user ID and timestamp
  3. Creates audit log
- **Expected:** Status 200, unit booked
- **Try again:** Should fail (unit already booked)

#### 4.7 Verify Booking
- **Request:** `Get Unit by ID`
- **Check:**
  - status: "Booked"
  - booked_by: Your user ID
  - booked_at: Timestamp

### Phase 5: Audit Trail

#### 5.1 View All Audit Logs
- **Folder:** `06. Audit Logs`
- **Request:** `Get All Audit Logs`
- **Expected:** Chronological list of all actions

#### 5.2 Filter by Action Type
- **Request:** `Filter Logs - By Action`
- **Try different actions:**
  - CREATE - See all creations
  - UPDATE - See all updates
  - BOOK - See all bookings
  - DELETE - See all deletions

#### 5.3 Filter by Entity
- **Request:** `Filter Logs - By Entity`
- **Set entity:** `unit`
- **Set action:** `BOOK`
- **Expected:** All unit booking activities

#### 5.4 Filter by User
- **Request:** `Filter Logs - By User`
- **Expected:** All actions by specific user

### Phase 6: Sales User Testing

#### 6.1 Login as Sales User
- **Folder:** `01. Authentication`
- **Request:** `Tenant User Login`
- **Use:** Jane's credentials
- **Expected:** Token saved

#### 6.2 Try to Create Project (Should Fail)
- **Request:** `Create Project`
- **Expected:** Status 403 - Forbidden
- **Reason:** Sales role cannot create projects

#### 6.3 View Projects (Should Work)
- **Request:** `Get All Projects`
- **Expected:** Status 200 - Can view

#### 6.4 Book Unit (Should Work)
- **Request:** `Book Unit`
- **Expected:** Status 200 - Sales can book

#### 6.5 Try to Delete Unit (Should Fail)
- **Request:** `Delete Unit`
- **Expected:** Status 403 - Forbidden

### Phase 7: Multi-Tenant Isolation Testing

#### 7.1 Create Second Tenant (as Super Admin)
- **Login:** Super Admin
- **Request:** `Create Tenant`
- **Use different name:** "XYZ Developers"
- **Expected:** New tenant with `tenant_2` schema

#### 7.2 Login as Second Tenant Admin
- **Use:** Credentials from second tenant creation

#### 7.3 Create Projects in Second Tenant
- **Create:** Project in tenant 2

#### 7.4 Verify Isolation
- **Login:** First tenant admin
- **Request:** `Get All Projects`
- **Expected:** Only see first tenant's projects (not second tenant's)

## 📊 Collection Organization

### 01. Authentication (3 requests)
- Super Admin Login ✅
- Tenant User Login ✅
- Refresh Token ✅

### 02. Super Admin - Tenant Management (7 requests)
- Create Tenant ✅
- Get All Tenants ✅
- Get Tenant by ID ✅
- Update Tenant ✅
- Activate Tenant ✅
- Deactivate Tenant ✅
- Get Statistics ✅

### 03. User Management (5 requests)
- Create User ✅
- Get All Users ✅
- Get User by ID ✅
- Update User ✅
- Delete User ✅

### 04. Project Management (5 requests)
- Create Project ✅
- Get All Projects ✅
- Get Project by ID ✅
- Update Project ✅
- Delete Project ✅

### 05. Unit Management (9 requests)
- Create Unit ✅
- Get All Units ✅
- Filter Units - Available Only ✅
- Filter Units - By Price Range ✅
- Filter Units - By Bedrooms & Project ✅
- Get Unit by ID ✅
- **Book Unit** ✅ (Key feature!)
- Update Unit ✅
- Delete Unit ✅

### 06. Audit Logs (6 requests)
- Get All Audit Logs ✅
- Filter Logs - By Action ✅
- Filter Logs - By Entity ✅
- Filter Logs - By User ✅
- Filter Logs - By Date Range ✅
- Get Audit Log by ID ✅

### 07. Health Check (2 requests)
- Health Check ✅
- API Root ✅

**Total: 42 API Requests** 🎯

## 🔍 What to Check

### For Each Request:

✅ **Status Code:** Correct HTTP status (200, 201, 403, etc.)  
✅ **Response Format:** Consistent structure  
✅ **Data Accuracy:** Correct data returned  
✅ **Authorization:** RBAC working correctly  
✅ **Audit Logs:** Actions logged automatically  
✅ **Schema Isolation:** Data separation between tenants  

### Key Features to Test:

1. **Multi-tenancy:**
   - Different tenants cannot see each other's data
   - Schema isolation working

2. **RBAC:**
   - Super Admin: Can manage tenants
   - Admin: Full access in tenant
   - Sales: Can book but not create/delete
   - Viewer: Read-only (create a viewer user to test)

3. **Unit Booking:**
   - Only available units can be booked
   - Status changes correctly
   - Booking info recorded
   - Audit log created

4. **Audit Trail:**
   - All mutations logged
   - Old/new values captured
   - User context included

## 🎯 Test Scenarios

### Scenario 1: Complete Tenant Onboarding
1. Super Admin creates tenant
2. Tenant admin logs in
3. Creates project
4. Creates 10 units
5. Creates sales users
6. Sales user books units
7. Admin views audit logs

### Scenario 2: Multi-Tenant Isolation
1. Create 2 tenants
2. Each creates projects/units
3. Verify tenant 1 cannot see tenant 2's data
4. Verify schemas are separate

### Scenario 3: RBAC Testing
1. Create Admin, Sales, Viewer users
2. Test each role's permissions
3. Verify forbidden actions fail
4. Verify allowed actions succeed

### Scenario 4: Booking Workflow
1. Create available units
2. Filter to find suitable units
3. Book units
4. Verify status changes
5. Check audit logs
6. Verify booked units cannot be booked again

### Scenario 5: Audit Trail
1. Perform various actions
2. View all audit logs
3. Filter by action type
4. Filter by entity
5. Filter by user
6. Verify all mutations logged

## 💡 Pro Tips

### Using Environment Variables
- Tokens are auto-saved from login requests
- IDs are auto-saved from creation requests
- No need to copy-paste tokens manually

### Testing Efficiently
1. Use **Collection Runner** to run all requests
2. Set up **Tests** tab for automated assertions
3. Use **Pre-request Scripts** for dynamic data

### Common Issues

**Issue:** 401 Unauthorized  
**Fix:** Re-run login request to refresh token

**Issue:** 403 Forbidden  
**Fix:** Check user role has permission for action

**Issue:** 404 Not Found  
**Fix:** Ensure resource exists, check ID variable

**Issue:** Schema not found  
**Fix:** Run `npm run migrate:tenant up <schema_name>`

## 📝 Sample Test Flow

```
1. Health Check (/api/health)
   ✅ Server running

2. Super Admin Login
   ✅ Token received: eyJhbGc...
   ✅ Saved to superAdminToken

3. Create Tenant "ABC Builders"
   ✅ Tenant ID: 1
   ✅ Schema: tenant_1
   ✅ Admin user created

4. Tenant Admin Login
   ✅ Token received
   ✅ Schema: tenant_1

5. Create Project "Sunrise Apartments"
   ✅ Project ID: 1
   ✅ Audit log created

6. Create 5 Units
   ✅ Units A-101 to A-105 created
   ✅ All status: Available

7. Book Unit A-101
   ✅ Status changed to Booked
   ✅ Booked by user ID: 1
   ✅ Audit log: BOOK action

8. View Audit Logs
   ✅ 7 entries (1 project + 5 units + 1 booking)
   ✅ All with correct details

9. Filter Units (Available Only)
   ✅ Shows 4 units (A-102 to A-105)
   ✅ A-101 not shown (booked)

10. Super Admin Stats
    ✅ 1 active tenant
    ✅ 1 project
    ✅ 5 total units
    ✅ 4 available, 1 booked
```

## 🎉 Success Criteria

✅ All 42 requests work correctly  
✅ RBAC enforced properly  
✅ Multi-tenant isolation verified  
✅ Booking system functional  
✅ Audit logs capturing all actions  
✅ Filtering working on all endpoints  
✅ Pagination working  
✅ Error handling proper  

---

**Happy Testing! 🚀**

If you encounter any issues, check:
1. Server is running (`npm start`)
2. Migrations are run (`npm run setup`)
3. Environment variables are correct
4. Correct token is selected

