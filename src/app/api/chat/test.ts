// Test file for the chat API
// This can be used to test the chat functionality

export const testQueries = [
  // Query examples
  "Show me all active clients",
  "How many properties do we have?",
  "List recent interactions",
  "What clients are in the LEAD stage?",
  "Show me properties under construction",
  
  // Insert examples  
  "Add a new client: John Smith, email john@example.com, phone 555-1234",
  "Create a new property: Sunset Villa, 3 bedrooms, $500,000, Miami",
  "Add an interaction for client ID abc123: Phone call about property viewing",
  
  // Update examples
  "Update client john@example.com to QUALIFIED stage",
  "Mark property ID xyz789 as sold",
  "Change client budget to $600,000 for john@example.com",
];

export const sampleResponses = {
  query: {
    success: true,
    intent: "query",
    table: "clients", 
    data: [
      {
        id: "123",
        first_name: "John",
        last_name: "Doe", 
        email: "john@example.com",
        current_stage: "QUALIFIED",
        status: "active"
      }
    ],
    answer: "I found 1 active client: John Doe (john@example.com) who is currently in the QUALIFIED stage."
  },
  
  insert: {
    success: true,
    intent: "insert",
    table: "clients",
    data: [
      {
        id: "456",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com"
      }
    ],
    answer: "Successfully added new client record. Added new clients record with ID: 456"
  },
  
  update: {
    success: true,
    intent: "update", 
    table: "clients",
    data: [
      {
        id: "123",
        current_stage: "PROPERTY_MATCHED"
      }
    ],
    answer: "Successfully updated clients record(s). Updated 1 record(s)"
  }
};
