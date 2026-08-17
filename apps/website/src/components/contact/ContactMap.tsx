// Lazy: the request to Google is not made until it scrolls into view.
const ContactMap = () => {
  const src =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d253682.46311127685!2d3.1191468754490415!3d6.54836936389679!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0xdc9e87a367c3d9cb!2sLagos!5e0!3m2!1sen!2sng!4v1762278540113!5m2!1sen!2sng";

  return (
    <section className="bg-background pb-20 md:pb-28">
      <div className="container">
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            title="GridCore's office in Lagos, on a map"
            src={src}
            className="h-96 w-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
