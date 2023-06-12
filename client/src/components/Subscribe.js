import { useFormFields, useMailChimpForm } from "use-mailchimp-form";

// The useFormFields is not necessary. You can use your own form component.  

export default function App() {
  const url = "YOUR_SUBSCRIBE_URL";
  // The url looks like the url below:
  // https://aaaaaaaaa.us20.list-manage.com/subscribe/post?u=xxxxxxxxxxxxxxxxxx&amp;id=yyyyyyyyyy
  const {
      loading,
      error,
      success,
      message,
      handleSubmit
    } = useMailChimpForm(url);
  const { fields, handleFieldChange } = useFormFields({
    EMAIL: "",
  });
  return (
    <div  className="height-20  text-center bg-slate-300">
      <form
        onSubmit={event => {
          event.preventDefault();
          handleSubmit(fields);
        }}
      >
        <input
          id="EMAIL"
          autoFocus
          type="email"
          value={fields.EMAIL}
          onChange={handleFieldChange}
        />
        <button className="bg-blue-700 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded">submit</button>
      </form>
      {loading && "submitting"}
      {error && message}
      {success && message}
    </div>
  );
}