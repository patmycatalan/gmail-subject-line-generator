# Gmail Subject Line Generator

A Google Workspace Add-on that uses Google's Gemini 2.0 Flash AI model to generate relevant subject lines for your email drafts.

## Features

- Generates concise, contextually relevant subject lines based on email content
- Uses Google's Gemini 2.0 Flash AI model for high-quality results
- Simple interface that works within Gmail

## Installation

### For Personal Use

1. Create a new Google Apps Script project at [script.google.com](https://script.google.com)
2. Add the following files to your project:
   - `Code.gs` - The main script file
   - `appsscript.json` - The manifest file
3. Get a Google AI API key from [Google AI Studio](https://makersuite.google.com/)
4. In the `Code.gs` file, find the `setApiKey()` function and replace `"YOUR_GOOGLE_AI_API_KEY"` with your actual API key
5. Run the `setApiKey()` function to securely store your API key
6. Deploy as a test deployment (Deploy > New deployment > Select type: Gmail add-on)
7. Install the add-on in Gmail

### Required APIs and Services

- Google AI API or Gemini API must be enabled in your Google Cloud project
- The script requires the Gmail API and access to external services

## Usage

1. While composing an email in Gmail, click on the Gmail Subject Line Generator icon
2. Copy your email content from the compose window and paste it into the text field
3. Click "Generate Subject Line"
4. Copy the generated subject line and paste it into your email's subject line field

## Technical Details

- Uses Google's Gemini 2.0 Flash AI model
- Implemented as a Google Workspace Add-on using Google Apps Script
- Card-based user interface
- API connections to Google's Generative AI services

## Limitations

- Currently requires manual copy-paste of email content and subject line
- Cannot directly access or modify draft content due to Gmail Add-on limitations

## Future Development Ideas

- Sidebar integration for easier workflow
- Multiple style options for different types of subject lines
- More direct integration with Gmail using the Gmail API
- Potential browser extension version for seamless experience

## License

MIT License

## Contributors

Alex Catalán Flores

## Acknowledgements

Built with Google Apps Script and Google's Generative AI API services, and using Claude 3.7 Sonnet. 
