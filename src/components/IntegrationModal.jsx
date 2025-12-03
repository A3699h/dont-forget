import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiExternalLink } from 'react-icons/fi';
import './IntegrationModal.css';
import { api } from '../utils/api';

const IntegrationModal = ({ integration, onClose, onSave }) => {
  console.log(integration);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    accountId: '',
  });

  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    // // Load existing credentials from localStorage
    // const saved = localStorage.getItem(`integration_${integration.id}`);
    // if (saved) {
    //   try {
    //     setCredentials(JSON.parse(saved));
    //   } catch (e) {
    //     console.error('Failed to load credentials');
    //   }
    // }
    console.log(integration.id);
    loadCredentials();
  }, [integration.id]);

  const loadCredentials = async () => {
    const response = await api.getIntegration(integration.id);
    const integration = response.integration;
    console.log(integration);
    setCredentials(integration.credentials);

  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(`integration_${integration.id}`, JSON.stringify(credentials));
    onSave(integration.id, credentials);
  };

  const getInstructions = () => {
    switch (integration.id) {
      case 'zoom':
        return {
          title: 'Zoom Integration Setup',
          steps: [
            '1. Go to Zoom App Marketplace: https://marketplace.zoom.us/',
            '2. Click "Develop" → "Build App"',
            '3. Choose "Server-to-Server OAuth" app type',
            '4. Fill in app details and get your credentials',
            '5. Copy Account ID, Client ID (API Key), and Client Secret (API Secret)',
            '6. Paste them below to connect'
          ],
          fields: ['apiKey', 'apiSecret', 'accountId'],
          labels: {
            apiKey: 'Client ID',
            apiSecret: 'Client Secret',
            accountId: 'Account ID'
          },
          link: 'https://marketplace.zoom.us/develop/create'
        };
      
      case 'gmeet':
        return {
          title: 'Google Meet Integration Setup',
          steps: [
            '1. Go to Google Cloud Console: https://console.cloud.google.com/',
            '2. Create a new project or select existing',
            '3. Enable Google Calendar API',
            '4. Create credentials (OAuth 2.0 Client ID)',
            '5. Add authorized redirect URIs',
            '6. Copy Client ID and Client Secret'
          ],
          fields: ['apiKey', 'apiSecret'],
          labels: {
            apiKey: 'Client ID',
            apiSecret: 'Client Secret'
          },
          link: 'https://console.cloud.google.com/apis/credentials'
        };
      
      case 'chatgpt':
        return {
          title: 'ChatGPT (OpenAI) Integration Setup',
          steps: [
            '1. Go to OpenAI Platform: https://platform.openai.com/',
            '2. Sign in or create an account',
            '3. Navigate to API Keys section',
            '4. Click "Create new secret key"',
            '5. Copy the API key (it will only show once!)',
            '6. Paste it below'
          ],
          fields: ['apiKey'],
          labels: {
            apiKey: 'OpenAI API Key'
          },
          link: 'https://platform.openai.com/api-keys'
        };
      
      case 'canva':
        return {
          title: 'Canva Integration Setup',
          steps: [
            '1. Go to Canva Developers: https://www.canva.com/developers/',
            '2. Sign in with your Canva account',
            '3. Create a new app in the Developer Portal',
            '4. Get your App ID and App Secret',
            '5. Set up OAuth redirect URLs',
            '6. Copy credentials below'
          ],
          fields: ['apiKey', 'apiSecret'],
          labels: {
            apiKey: 'App ID',
            apiSecret: 'App Secret'
          },
          link: 'https://www.canva.com/developers/apps'
        };
      
      case 'stripe':
        return {
          title: 'Stripe Integration Setup',
          steps: [
            '1. Go to Stripe Dashboard: https://dashboard.stripe.com/',
            '2. Sign in or create an account',
            '3. Navigate to Developers → API Keys',
            '4. Copy your Publishable Key and Secret Key',
            '5. For webhooks: Create webhook endpoint',
            '6. Copy Webhook Secret'
          ],
          fields: ['apiKey', 'apiSecret', 'webhookUrl'],
          labels: {
            apiKey: 'Publishable Key',
            apiSecret: 'Secret Key',
            webhookUrl: 'Webhook Secret'
          },
          link: 'https://dashboard.stripe.com/apikeys'
        };
      
      case 'paypal':
        return {
          title: 'PayPal Integration Setup',
          steps: [
            '1. Go to PayPal Developer: https://developer.paypal.com/',
            '2. Sign in with your PayPal account',
            '3. Go to Dashboard → My Apps & Credentials',
            '4. Create a new app or select existing',
            '5. Copy Client ID and Secret',
            '6. Paste them below'
          ],
          fields: ['apiKey', 'apiSecret'],
          labels: {
            apiKey: 'Client ID',
            apiSecret: 'Secret'
          },
          link: 'https://developer.paypal.com/dashboard/applications'
        };
      
      case 'zapier':
        return {
          title: 'Zapier Integration Setup',
          steps: [
            '1. Go to Zapier: https://zapier.com/',
            '2. Create a new Zap',
            '3. Choose "Webhooks by Zapier" as trigger',
            '4. Select "Catch Hook"',
            '5. Copy the webhook URL',
            '6. Paste it below'
          ],
          fields: ['webhookUrl'],
          labels: {
            webhookUrl: 'Webhook URL'
          },
          link: 'https://zapier.com/app/zaps'
        };
      
      default:
        return {
          title: 'Integration Setup',
          steps: ['Follow the service provider instructions to get your API credentials'],
          fields: ['apiKey'],
          labels: { apiKey: 'API Key' },
          link: ''
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="integration-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{instructions.title}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <div className="modal-content">
          {showInstructions && (
            <div className="instructions-section">
              <div className="instructions-header">
                <h3>How to Get Your API Credentials</h3>
                <button 
                  className="toggle-instructions-btn"
                  onClick={() => setShowInstructions(false)}
                >
                  Hide Instructions
                </button>
              </div>
              <ol className="instructions-list">
                {instructions.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              {instructions.link && (
                <a 
                  href={instructions.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <FiExternalLink /> Open {integration.name} Developer Portal
                </a>
              )}
            </div>
          )}

          {!showInstructions && (
            <button 
              className="show-instructions-btn"
              onClick={() => setShowInstructions(true)}
            >
              Show Instructions
            </button>
          )}

          <div className="credentials-form">
            <h3>Enter Your Credentials</h3>
            {instructions.fields.map((field) => (
              <div key={field} className="form-group">
                <label className="form-label">{instructions.labels[field]}</label>
                <input
                  type={field.includes('Secret') || field.includes('secret') ? 'password' : 'text'}
                  name={field}
                  value={credentials[field]}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={`Enter your ${instructions.labels[field]}`}
                />
              </div>
            ))}
            <div className="security-note">
              <strong>🔒 Security Note:</strong> Your credentials are stored locally in your browser 
              and never sent to our servers. Keep your API keys secure and never share them.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!credentials.apiKey && !credentials.webhookUrl}
          >
            <FiSave /> Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;
