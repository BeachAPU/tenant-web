import { EnvelopeIcon } from 'src/icons';

// Phone / email rows shared by representative and contact-card tiles -
// real tel:/mailto: links so a tap on a phone dials or opens mail.
const ContactLines = ({ phone, email }: { phone?: string | null; email?: string | null }) => (
  <div className="flex flex-col gap-1 text-sm min-w-0">
    {phone && (
      <a href={`tel:${phone.replace(/\s+/g, '')}`} className="light-link-action truncate">
        {phone}
      </a>
    )}
    {email && (
      <a
        href={`mailto:${email}`}
        className="light-link-action inline-flex items-center gap-2 min-w-0"
      >
        <EnvelopeIcon className="size-4 shrink-0 fill-current" />
        <span className="truncate">{email}</span>
      </a>
    )}
  </div>
);

export default ContactLines;
