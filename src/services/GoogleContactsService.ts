export interface GoogleContact {
  resourceName: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  photoUrl?: string;
  relation?: string;
}

export class GoogleContactsService {
  private static BASE_URL = 'https://people.googleapis.com/v1';

  static async fetchContacts(accessToken: string): Promise<GoogleContact[]> {
    const url = `${this.BASE_URL}/people/me/connections?pageSize=50&personFields=names,phoneNumbers,photos,emailAddresses,relations`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Contacts API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const connections = data.connections || [];

    return connections.map((person: any) => {
      const primaryName = person.names?.[0]?.displayName || 'Unnamed Contact';
      const primaryPhone = person.phoneNumbers?.[0]?.value || '';
      const primaryEmail = person.emailAddresses?.[0]?.value || '';
      const photoUrl = person.photos?.[0]?.url || '';
      const relation = person.relations?.[0]?.type || 'Family / Contact';

      return {
        resourceName: person.resourceName,
        name: primaryName,
        phoneNumber: primaryPhone,
        email: primaryEmail,
        photoUrl: photoUrl,
        relation: relation,
      };
    });
  }
}
