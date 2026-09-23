export interface OrderConfirmationFacts {
  assistantSpoken: string;
  storeSpoken: string;
  productSpoken: string;
  destinationSpoken: string;
  deliverySpoken: string;
  quantitySpoken?: string;
  discloseAutomation?: boolean;
}

function cleanSpoken(value: string, field: string): string {
  const clean = value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) throw new Error(`${field} is required`);
  if (clean.length > 120) throw new Error(`${field} is too long`);
  return clean;
}

export function buildOrderConfirmationScript(facts: OrderConfirmationFacts): string {
  const assistant = cleanSpoken(facts.assistantSpoken, 'assistantSpoken');
  const store = cleanSpoken(facts.storeSpoken, 'storeSpoken');
  const product = cleanSpoken(facts.productSpoken, 'productSpoken');
  const destination = cleanSpoken(facts.destinationSpoken, 'destinationSpoken');
  const delivery = cleanSpoken(facts.deliverySpoken, 'deliverySpoken');
  const quantity = facts.quantitySpoken ? `${cleanSpoken(facts.quantitySpoken, 'quantitySpoken')} ` : '';
  const role = facts.discloseAutomation === false ? '' : '، المساعدة الآلية';

  return `سلام، معاك ${assistant}${role} تاع ${store}. نعيطلك باش نأكد معاك لاكوموند برك. طلبت ${quantity}${product}، والليفريزون ${delivery} في ${destination}. نأكدوهالك؟`;
}

