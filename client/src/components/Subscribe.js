import React from 'react';
import MailchimpSubscribe from 'react-mailchimp-subscribe';

const url = 'https://gmail.us14.list-manage.com/subscribe?u=88a6112281603e68a84c633ea&id=ca7d1efab0';

// simplest form (only email)
const SimpleForm = ({ onSubmitted }) => (
  <form onSubmit={e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    onSubmitted({ email });
  }}>
    <label htmlFor="email">Email</label>
    <input type="email" id="email" name="email" required />
    <button type="submit">Subscribe</button>
  </form>
);

// use the render prop and your custom form
const Subscribe = () => (
  <MailchimpSubscribe
    url={url}
    render={({ subscribe, status, message }) => (
      <div>
        <SimpleForm onSubmitted={formData => subscribe(formData)} />
        {status === 'sending' && <div style={{ color: 'blue' }}>Sending...</div>}
        {status === 'error' && <div style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: message }} />}
        {status === 'success' && <div style={{ color: 'green' }}>Subscribed!</div>}
      </div>
    )}
  />
);

export default Subscribe;
