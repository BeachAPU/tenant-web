import { Badge } from 'src/components/ui/badge';
import ContactLines from './ContactLines';
import type { ResidentContactCard } from 'src/types/resident';

const ContactCardTile = ({ card }: { card: ResidentContactCard }) => (
  <div className="rounded-xl border border-border p-4 flex flex-col gap-2 min-w-0">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-base font-semibold light-text-navy">{card.name}</span>
      {card.label && <Badge variant="gray">{card.label.name}</Badge>}
    </div>
    {(card.company_contact || card.other_contact) && (
      <p className="text-sm light-muted">
        {[card.company_contact, card.other_contact].filter(Boolean).join(' · ')}
      </p>
    )}
    <ContactLines phone={card.phone} email={card.email} />
    {card.message && <p className="text-sm light-muted whitespace-pre-wrap">{card.message}</p>}
  </div>
);

export default ContactCardTile;
