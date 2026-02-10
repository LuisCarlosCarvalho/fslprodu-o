
export interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  country: 'BR' | 'PT';
  error?: string;
}

// Format ZIP/CEP based on country
export function formatZipCode(value: string, country: 'BR' | 'PT'): string {
  const digits = value.replace(/\D/g, '');
  
  if (country === 'BR') {
    // 00000-000
    return digits
      .slice(0, 8)
      .replace(/^(\d{5})(\d)/, '$1-$2');
  } else {
    // 0000-000
    return digits
      .slice(0, 7)
      .replace(/^(\d{4})(\d)/, '$1-$2');
  }
}

// Format Phone based on country
export function formatPhone(value: string, country: 'BR' | 'PT'): string {
  const digits = value.replace(/\D/g, '');

  if (country === 'BR') {
    // (00) 00000-0000 or (00) 0000-0000
    if (digits.length <= 10) {
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return digits
        .slice(0, 11)
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  } else {
    // PT Mobile: 9 digits usually, no specific separator standard but often space
    // 000 000 000
    return digits
      .slice(0, 9)
      .replace(/^(\d{3})(\d)/, '$1 $2')
      .replace(/(\d{3})(\d)/, '$1 $2');
  }
}

// Fetch address from ViaCEP (Brazil)
export async function fetchAddressBR(cep: string): Promise<AddressData | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) return { street: '', neighborhood: '', city: '', state: '', country: 'BR', error: 'CEP não encontrado' };

    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      country: 'BR'
    };
  } catch (error) {
    console.error('Error fetching BR address:', error);
    return null;
  }
}

// Fetch address from Zippopotam (Portugal)
export async function fetchAddressPT(zip: string): Promise<AddressData | null> {
  const cleanZip = zip.replace(/\D/g, '');
  if (cleanZip.length !== 7) return null;
  
  // Zippopotam format for PT: 0000-000
  const formattedZip = `${cleanZip.substring(0, 4)}-${cleanZip.substring(4, 7)}`;

  try {
    const response = await fetch(`https://api.zippopotam.us/pt/${formattedZip}`);
    if (!response.ok) return { street: '', neighborhood: '', city: '', state: '', country: 'PT', error: 'Código Postal não encontrado' };

    const data = await response.json();
    const place = data.places[0];

    return {
      street: '', // Zippopotam often only gives city/region for PT
      neighborhood: '',
      city: place['place name'],
      state: place.state,
      country: 'PT'
    };
  } catch (error) {
    console.error('Error fetching PT address:', error);
    return null;
  }
}
