/**
 * Integration Helper Functions
 * 
 * This file contains utility functions to interact with connected third-party services
 */

// Get stored credentials for a service
export const getIntegrationCredentials = (integrationId) => {
  const stored = localStorage.getItem(`integration_${integrationId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(`Failed to load ${integrationId} credentials`);
      return null;
    }
  }
  return null;
};

// Check if a service is connected
export const isIntegrationConnected = (integrationId) => {
  return !!getIntegrationCredentials(integrationId);
};

/**
 * ChatGPT / OpenAI Integration
 */

// Call OpenAI API
export const callOpenAI = async (prompt, options = {}) => {
  const credentials = getIntegrationCredentials('chatgpt');
  
  if (!credentials || !credentials.apiKey) {
    throw new Error('ChatGPT is not connected. Please add your API key in Settings → Integrations.');
  }

  const {
    model = 'gpt-3.5-turbo',
    maxTokens = 500,
    temperature = 0.7
  } = options;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant for task management. Provide concise, practical suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

// Generate task description using AI
export const generateTaskDescription = async (taskTitle) => {
  const prompt = `Given this task title: "${taskTitle}"
  
Generate a brief, professional description (2-3 sentences) that explains what this task involves and what needs to be accomplished.`;

  return await callOpenAI(prompt, { maxTokens: 150 });
};

// Generate key points for a task
export const generateKeyPoints = async (taskTitle, taskDescription = '') => {
  const prompt = `For this task:
Title: "${taskTitle}"
${taskDescription ? `Description: "${taskDescription}"` : ''}

Generate 3-5 key points or action items that should be covered when completing this task. Format as a simple list.`;

  const response = await callOpenAI(prompt, { maxTokens: 200 });
  
  // Parse the response into an array of key points
  const lines = response.split('\n')
    .filter(line => line.trim())
    .map(line => line.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter(line => line.length > 0);
  
  return lines;
};

// Suggest task priority based on content
export const suggestTaskPriority = async (taskTitle, taskDescription = '', dueDate = null) => {
  const prompt = `Analyze this task and suggest an appropriate priority level (Low, Medium, High, or Urgent):

Title: "${taskTitle}"
${taskDescription ? `Description: "${taskDescription}"` : ''}
${dueDate ? `Due Date: ${dueDate}` : ''}

Respond with ONLY one word: Low, Medium, High, or Urgent, followed by a brief one-sentence explanation.`;

  const response = await callOpenAI(prompt, { maxTokens: 100, temperature: 0.5 });
  
  // Extract priority and reasoning
  const lines = response.split('\n').filter(line => line.trim());
  const firstLine = lines[0].toLowerCase();
  
  let priority = 'Medium'; // default
  if (firstLine.includes('urgent')) priority = 'Urgent';
  else if (firstLine.includes('high')) priority = 'High';
  else if (firstLine.includes('low')) priority = 'Low';
  else if (firstLine.includes('medium')) priority = 'Medium';
  
  const reasoning = lines.slice(1).join(' ').trim() || lines[0];
  
  return { priority, reasoning };
};

// Improve task title
export const improveTaskTitle = async (currentTitle) => {
  const prompt = `Improve this task title to make it more clear, actionable, and concise:
"${currentTitle}"

Provide ONLY the improved title, nothing else.`;

  return await callOpenAI(prompt, { maxTokens: 50, temperature: 0.7 });
};

// Generate follow-up note suggestion
export const generateFollowUpSuggestion = async (taskTitle, previousNotes = []) => {
  const notesContext = previousNotes.length > 0 
    ? `Previous notes:\n${previousNotes.map((n, i) => `${i + 1}. ${n.text}`).join('\n')}`
    : 'No previous notes.';

  const prompt = `For this task: "${taskTitle}"

${notesContext}

Suggest a helpful follow-up action or question to track progress. Keep it concise (1-2 sentences).`;

  return await callOpenAI(prompt, { maxTokens: 100 });
};

/**
 * Zoom Integration
 */

// Open Zoom meeting
export const openZoomMeeting = (meetingLink) => {
  if (meetingLink) {
    window.open(meetingLink, '_blank');
    return true;
  }
  return false;
};

// Generate Zoom meeting link (helper for manual creation)
export const generateZoomMeetingLink = () => {
  const meetingId = Math.floor(Math.random() * 900000000) + 100000000;
  return {
    meetingLink: `https://zoom.us/j/${meetingId}`,
    meetingId: meetingId,
    instructions: 'Create this meeting manually in Zoom with this ID'
  };
};

/**
 * Google Meet Integration
 */

// Open Google Meet
export const openGoogleMeet = (meetingLink) => {
  if (meetingLink) {
    window.open(meetingLink, '_blank');
    return true;
  }
  return false;
};

// Generate Google Meet link (helper)
export const generateGoogleMeetLink = () => {
  const token = Math.random().toString(36).slice(2, 10);
  const code = `${token.slice(0, 3)}-${token.slice(3, 6)}-${token.slice(6, 9)}`;
  return {
    meetingLink: `https://meet.google.com/${code}`,
    meetingCode: code,
    instructions: 'This is a placeholder link. Create meeting in Google Calendar for real link.'
  };
};

/**
 * Canva Integration
 */

// Open Canva design editor
export const openCanva = (taskTitle = '') => {
  const canvaUrl = `https://www.canva.com/create/design?${taskTitle ? `title=${encodeURIComponent(taskTitle)}` : ''}`;
  window.open(canvaUrl, '_blank');
};

// Open Canva presentation
export const openCanvaPresentation = (taskTitle = '') => {
  const canvaUrl = `https://www.canva.com/create/presentations?${taskTitle ? `title=${encodeURIComponent(taskTitle)}` : ''}`;
  window.open(canvaUrl, '_blank');
};

/**
 * Stripe Integration
 */

// Open Stripe payment page
export const openStripePayment = (amount, description) => {
  // Note: In production, you'd generate a proper payment link via Stripe API
  // For now, this opens Stripe homepage - user needs to set up payment links
  const stripeUrl = amount 
    ? `https://buy.stripe.com/test?amount=${amount}&description=${encodeURIComponent(description)}`
    : 'https://stripe.com';
  window.open(stripeUrl, '_blank');
};

// Request payment via Stripe
export const requestStripePayment = (taskData) => {
  const amount = prompt('Enter amount (USD):');
  if (amount && !isNaN(amount)) {
    openStripePayment(amount, taskData.title || 'Payment Request');
    return { amount, method: 'stripe' };
  }
  return null;
};

/**
 * PayPal Integration
 */

// Open PayPal payment
export const openPayPalPayment = (amount, description) => {
  // Opens PayPal - in production would use PayPal payment links
  const paypalUrl = 'https://www.paypal.com/paypalme';
  window.open(paypalUrl, '_blank');
};

// Request payment via PayPal
export const requestPayPalPayment = (taskData) => {
  const amount = prompt('Enter amount (USD):');
  if (amount && !isNaN(amount)) {
    openPayPalPayment(amount, taskData.title || 'Payment Request');
    return { amount, method: 'paypal' };
  }
  return null;
};

/**
 * Zapier Integration
 */

// Send webhook to Zapier
export const sendToZapier = async (eventType, data) => {
  const credentials = getIntegrationCredentials('zapier');
  
  if (!credentials || !credentials.webhookUrl) {
    console.log('Zapier not connected, skipping webhook');
    return { sent: false, reason: 'not_connected' };
  }

  try {
    const response = await fetch(credentials.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        data
      })
    });
    
    if (response.ok) {
      console.log('Zapier webhook sent successfully');
      return { sent: true, status: response.status };
    } else {
      console.error('Zapier webhook failed:', response.status);
      return { sent: false, status: response.status };
    }
  } catch (error) {
    console.error('Failed to send Zapier webhook:', error);
    return { sent: false, error: error.message };
  }
};

// Notify task created
export const notifyTaskCreated = async (taskData) => {
  return await sendToZapier('task_created', {
    title: taskData.title || taskData.name,
    description: taskData.description,
    dateTime: taskData.dateTime,
    priority: taskData.priority,
    type: taskData.taskType,
    status: taskData.status || 'pending'
  });
};

// Notify task completed
export const notifyTaskCompleted = async (taskData) => {
  return await sendToZapier('task_completed', {
    title: taskData.title || taskData.name,
    completedAt: new Date().toISOString()
  });
};

// Export all functions
export default {
  // General
  getIntegrationCredentials,
  isIntegrationConnected,
  
  // ChatGPT
  callOpenAI,
  generateTaskDescription,
  generateKeyPoints,
  suggestTaskPriority,
  improveTaskTitle,
  generateFollowUpSuggestion,
  
  // Zoom
  openZoomMeeting,
  generateZoomMeetingLink,
  
  // Google Meet
  openGoogleMeet,
  generateGoogleMeetLink,
  
  // Canva
  openCanva,
  openCanvaPresentation,
  
  // Stripe
  requestStripePayment,
  openStripePayment,
  
  // PayPal
  requestPayPalPayment,
  openPayPalPayment,
  
  // Zapier
  sendToZapier,
  notifyTaskCreated,
  notifyTaskCompleted
};
