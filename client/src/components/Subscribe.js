// const API_KEY = 'YW9GegPZXKzE53M7vqmLvw';
// const FORM_ID = '5258337';


import React, { useState } from 'react';
import axios from 'axios';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset previous error message
    setErrorMessage('');

    // Validate email input
    if (!email) {
      setErrorMessage('Email is required.');
      return;
    }

    // Replace with your ConvertKit API key and form ID
    const API_KEY = 'YW9GegPZXKzE53M7vqmLvw';
    const FORM_ID = '5258337';

    setLoading(true);

    try {
      const response = await axios.post(
        `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`,
        {
          api_key: API_KEY,
          email
        }
      );
      console.log('Email sent successfully!');
      setEmail(''); // Reset the email input field after successful submission
      setLoading(false);
      setSubscribed(true);

      // Clear "Subscribed" message after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setErrorMessage('Error subscribing email. Please try again.');
      setLoading(false);

      // Clear error message after 3 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
      <div className="flex items-center mb-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleEmailChange}
          className="px-4 py-2 mr-2 w-full border border-gray-300 rounded-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-sm focus:outline-none"
        >
          {loading ? 'Submitting...' : 'Subscribe'}
        </button>
      </div>
      {errorMessage && (
        <p className="text-red-500 text-xs">{errorMessage}</p>
      )}
      {subscribed && (
        <p className="text-green-500 text-xs">Subscribed successfully!</p>
      )}
    </form>
  );
};

export default NewsletterForm;



 {/* <input type="checkbox" class="peer hidden" id="navbar-open" />
    <label class="absolute top-4 right-4 cursor-pointer md:hidden" for="navbar-open">
      <span class="sr-only">Toggle Navigation</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </label>
    <nav aria-label="Header Navigation" class="peer-checked:mt-8 peer-checked:max-h-56 flex max-h-0 w-full flex-col items-center justify-between overflow-hidden transition-all md:ml-12 md:max-h-full md:flex-row md:items-start">
      <ul class="flex flex-col items-center space-y-2 md:ml-auto md:flex-row md:space-y-0">
        <li class="font-bold md:mr-12"><Link to="/services">Services</Link></li>
        <li class="md:mr-12 hover:text-blue-500"><Link to="/support">Support</Link></li>
        <li class="md:mr-12 hover:text-blue-500" ><Link to="/feature">Features</Link></li>
        <li class="md:mr-12 hover:text-blue-500">
          <button class="rounded-full border-2 border-blue-900 hover:border-blue-500 px-6 py-1 text-blue-900 transition-colors hover:bg-blue-600 hover:text-white">Book Now</button>
        </li>
      </ul>
    </nav> */}
