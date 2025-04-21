// Store your API key in script properties for security
function setApiKey() {
  // You'll run this function once to securely store your API key
  var apiKey = "YOUR-API-KEY"; // Replace with your actual API key
  PropertiesService.getScriptProperties().setProperty('API_KEY', apiKey);
}

/**
 * Main function that creates the card UI when the add-on button is clicked
 */
function generateSubjectLine(e) {
  // Create a card with a text input field and a button
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("Generate Email Subject Line")
      .setImageUrl("https://www.gstatic.com/images/icons/material/system/1x/email_grey600_24dp.png"))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText("Paste your email content below, and we'll generate a subject line for you."))
      .addWidget(CardService.newTextInput()
        .setFieldName("emailContent")
        .setTitle("Email Content")
        .setMultiline(true)
        .setHint("Paste your email text here..."))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText("Generate Subject Line")
          .setOnClickAction(CardService.newAction()
            .setFunctionName("processEmailContent")))))
    .build();
  
  return card;
}

/**
 * Processes the email content and generates a subject line
 */
function processEmailContent(e) {
  try {
    // Get the email content from the form
    var emailContent = e.formInput.emailContent;
    
    // Validate input
    if (!emailContent || emailContent.trim() === "") {
      return createErrorCard("Please enter some email content first.");
    }
    
    // Truncate if too long (APIs have token limits)
    if (emailContent.length > 1000) {
      emailContent = emailContent.substring(0, 1000) + "...";
    }
    
    // Call Google AI to generate a subject line
    var subjectLine = callGoogleAI(emailContent);
    
    // Check if we got an error - FIXED to use indexOf instead of startsWith
    if (typeof subjectLine === 'string' && subjectLine.indexOf("Error:") === 0) {
      return createErrorCard(subjectLine);
    }
    
    // Return a card with the generated subject line
    return createResultCard(subjectLine);
  } catch (error) {
    // Log the error
    Logger.log("Error processing email content: " + error.toString());
    return createErrorCard("Error: " + error.toString());
  }
}

/**
 * Creates a card showing the generated subject line
 */
function createResultCard(subjectLine) {
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("Your Generated Subject Line")
      .setImageUrl("https://www.gstatic.com/images/icons/material/system/1x/email_grey600_24dp.png"))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText("Here's a subject line based on your email content:"))
      .addWidget(CardService.newTextParagraph()
        .setText("<b>" + subjectLine + "</b>"))
      .addWidget(CardService.newTextParagraph()
        .setText("Copy this subject line and paste it into your email's subject field."))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText("Generate Another")
          .setOnClickAction(CardService.newAction()
            .setFunctionName("generateSubjectLine")))))
    .build();
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}

/**
 * Creates an error card
 */
function createErrorCard(errorMessage) {
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle("Error")
      .setImageUrl("https://www.gstatic.com/images/icons/material/system/1x/error_grey600_24dp.png"))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText(errorMessage))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText("Try Again")
          .setOnClickAction(CardService.newAction()
            .setFunctionName("generateSubjectLine")))))
    .build();
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().pushCard(card))
    .build();
}

/**
 * Call Google's AI API (Gemini 2.0 Flash) to get a subject line
 */
function callGoogleAI(emailContent) {
  // Get the API key stored in script properties
  var apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  
  // Log if API key is missing (for debugging)
  if (!apiKey) {
    Logger.log("ERROR: API key is missing. Run the setApiKey() function first.");
    return "Error: API key not set. Please contact the administrator.";
  }
  
  // Use the Gemini 2.0 Flash model
  var url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' + apiKey;
  var fallbackUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
  
  // Payload for Gemini 2.0 Flash
  var payload = {
    'contents': [
      {
        'role': 'user',
        'parts': [
          {
            'text': 'Generate a concise, informative subject line for this email. Return ONLY the subject line text with no explanations or quotes: ' + emailContent
          }
        ]
      }
    ],
    'generationConfig': {
      'temperature': 0.4,
      'maxOutputTokens': 30
    }
  };
  
  // Set up the API request options
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true
  };
  
  try {
    // Try the primary URL first
    var response = UrlFetchApp.fetch(url, options);
    var responseCode = response.getResponseCode();
    
    // If the primary URL fails, try the fallback URL
    if (responseCode !== 200) {
      Logger.log("Primary URL failed with code " + responseCode + ". Trying fallback URL...");
      response = UrlFetchApp.fetch(fallbackUrl, options);
      responseCode = response.getResponseCode();
      
      if (responseCode !== 200) {
        Logger.log("Fallback URL also failed with code " + responseCode);
        return "Error: Could not connect to Google AI API. Response code: " + responseCode;
      }
    }
    
    var responseText = response.getContentText();
    
    // Parse the response
    var responseJson = JSON.parse(responseText);
    
    // Check if the response contains error information
    if (responseJson.error) {
      Logger.log("API Error: " + JSON.stringify(responseJson.error));
      return "Error: " + (responseJson.error.message || "Unknown API error");
    }
    
    // Extract the generated subject line from Gemini 2.0 Flash response
    if (responseJson.candidates && 
        responseJson.candidates[0] && 
        responseJson.candidates[0].content && 
        responseJson.candidates[0].content.parts && 
        responseJson.candidates[0].content.parts[0]) {
      
      var subjectLine = responseJson.candidates[0].content.parts[0].text.trim();
      
      // Clean up the response (remove quotes, "Subject:", etc.)
      subjectLine = subjectLine.replace(/^"(.+)"$/, "$1"); // Remove surrounding quotes
      subjectLine = subjectLine.replace(/^Subject:\s*/i, ""); // Remove "Subject:" prefix
      
      return subjectLine;
    } else {
      Logger.log("Unexpected API response structure: " + JSON.stringify(responseJson));
      return "Error: Unexpected API response format";
    }
  } catch (error) {
    // Log any errors that occur
    Logger.log("Error calling API: " + error.toString());
    return "Error: " + error.toString();
  }
}

/**
 * Simple test function to check if your Gemini integration works
 */
function testGoogleAI() {
  var result = callGoogleAI("This is a test email where I'm asking about the status of the project. Could you let me know where we stand on the timeline and budget? We need to finalize several deliverables by the end of the month, and I'm concerned about our progress on the marketing materials.");
  Logger.log("Generated subject: " + result);
}
