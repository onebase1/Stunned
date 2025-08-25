# Heritage100 Database Tool Usage Guide

## Overview
The Heritage100 Database Tool is a comprehensive JavaScript-based solution that provides full CRUD (Create, Read, Update, Delete) access to all Supabase tables through the AI Agent.

## Supported Tables
- `clients` - Client information and journey stages
- `properties` - Property inventory and details
- `contracts` - Sales transactions and agreements
- `payments` - Payment tracking and schedules
- `interactions` - Communication history
- `client_stages` - Client journey progression
- `construction_updates` - Build progress tracking
- `notifications` - Automated alerts
- `client_property_matches` - Property recommendations
- `payment_plans` - Payment schedules

## Operations

### 1. GET ALL (Query Multiple Records)
```json
{
  "table": "clients",
  "operation": "getAll",
  "filters": {
    "current_stage": "LEAD",
    "status": "active"
  },
  "select": "first_name,last_name,email,current_stage",
  "limit": 20
}
```

**Use Cases:**
- List all active clients
- Show properties under construction
- Display pending payments
- Get recent interactions

### 2. GET (Query Specific Record)
```json
{
  "table": "clients",
  "operation": "get",
  "filters": {
    "email": "john@example.com"
  },
  "select": "*"
}
```

**Use Cases:**
- Find client by email
- Get property details by name
- Lookup contract by ID

### 3. CREATE (Add New Record)
```json
{
  "table": "clients",
  "operation": "create",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "budget_min": 400000,
    "budget_max": 600000,
    "current_stage": "LEAD",
    "status": "active"
  }
}
```

**Use Cases:**
- Add new client
- Create property listing
- Record new interaction
- Generate contract

### 4. UPDATE (Modify Existing Record)
```json
{
  "table": "clients",
  "operation": "update",
  "filters": {
    "email": "john@example.com"
  },
  "data": {
    "current_stage": "QUALIFIED",
    "assigned_agent": "Sarah Smith"
  }
}
```

**Use Cases:**
- Move client to next stage
- Update property status
- Modify payment due date
- Change contract terms

### 5. DELETE (Remove Record)
```json
{
  "table": "interactions",
  "operation": "delete",
  "filters": {
    "id": "interaction-id-123"
  }
}
```

**Use Cases:**
- Remove duplicate records
- Delete cancelled contracts
- Clean up old notifications

## Advanced Filtering

### Exact Match
```json
"filters": {
  "current_stage": "LEAD"
}
```

### Array/List Matching
```json
"filters": {
  "current_stage": ["LEAD", "QUALIFIED", "PROPERTY_MATCHED"]
}
```

### Pattern Matching (LIKE)
```json
"filters": {
  "property_name": "%Villa%"
}
```

### Multiple Conditions
```json
"filters": {
  "current_stage": "QUALIFIED",
  "budget_min": 500000,
  "status": "active"
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "operation": "getAll",
  "table": "clients",
  "data": [
    {
      "id": "client-123",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "current_stage": "QUALIFIED"
    }
  ],
  "count": 1,
  "message": "getAll operation completed successfully on clients table"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid table: invalid_table. Valid tables: clients, properties, contracts...",
  "operation": "getAll",
  "table": "invalid_table"
}
```

## AI Agent Usage Examples

### Example 1: List Active Clients
**User:** "Show me all active clients"
**AI Agent Tool Call:**
```json
{
  "table": "clients",
  "operation": "getAll",
  "filters": {"status": "active"},
  "select": "first_name,last_name,email,current_stage,budget_min,budget_max",
  "limit": 20
}
```

### Example 2: Add New Client
**User:** "Add new client Sarah Johnson, email sarah@email.com, budget 600k"
**AI Agent Tool Call:**
```json
{
  "table": "clients",
  "operation": "create",
  "data": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah@email.com",
    "budget_min": 550000,
    "budget_max": 650000,
    "current_stage": "LEAD",
    "status": "active"
  }
}
```

### Example 3: Update Client Stage
**User:** "Move client sarah@email.com to qualified stage"
**AI Agent Tool Call:**
```json
{
  "table": "clients",
  "operation": "update",
  "filters": {"email": "sarah@email.com"},
  "data": {"current_stage": "QUALIFIED"}
}
```

### Example 4: Search Properties
**User:** "Show me 3-bedroom properties under construction"
**AI Agent Tool Call:**
```json
{
  "table": "properties",
  "operation": "getAll",
  "filters": {
    "bedrooms": 3,
    "construction_status": "under_construction"
  },
  "select": "property_name,price,location,completion_percentage",
  "limit": 10
}
```

## Error Handling

The tool includes comprehensive error handling:
- **Table Validation**: Ensures only valid tables are accessed
- **Operation Validation**: Confirms supported operations
- **API Error Handling**: Captures and reports Supabase API errors
- **Network Error Handling**: Handles connection issues
- **Data Validation**: Basic validation of required fields

## Security Features

- **Environment Variables**: Uses secure environment variables for credentials
- **Service Role Key**: Uses Supabase service role for full access
- **Input Validation**: Validates table names and operations
- **Error Sanitization**: Prevents sensitive data leakage in errors

## Performance Optimizations

- **Selective Fields**: Use `select` parameter to fetch only needed fields
- **Limit Results**: Use `limit` parameter to control result size
- **Efficient Filtering**: Proper indexing support through Supabase
- **Connection Reuse**: Efficient HTTP connection handling

This tool provides the AI Agent with complete database access while maintaining security, performance, and reliability standards.
