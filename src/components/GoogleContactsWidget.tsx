import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Search, RefreshCw, Heart, AlertTriangle, UserPlus, CheckCircle2 } from 'lucide-react';
import { GoogleContact, GoogleContactsService } from '../services/GoogleContactsService';

interface GoogleContactsWidgetProps {
  accessToken: string | null;
  onSignInRequired: () => void;
  onSelectEmergencyContact?: (contactName: string, phone: string) => void;
  onSimulateCall?: (contactName: string, role: string) => void;
  onImportToMemoryVault?: (contact: GoogleContact) => void;
}

export const GoogleContactsWidget: React.FC<GoogleContactsWidgetProps> = ({
  accessToken,
  onSignInRequired,
  onSelectEmergencyContact,
  onSimulateCall,
  onImportToMemoryVault,
}) => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<GoogleContact | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadContacts = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedContacts = await GoogleContactsService.fetchContacts(accessToken);
      setContacts(fetchedContacts);
    } catch (err: any) {
      console.error('Failed to load Google Contacts:', err);
      setError(err.message || 'Could not fetch Google Contacts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadContacts();
    }
  }, [accessToken]);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phoneNumber.includes(searchQuery) ||
    c.relation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSetEmergency = (c: GoogleContact) => {
    if (onSelectEmergencyContact) {
      onSelectEmergencyContact(c.name, c.phoneNumber || 'N/A');
      setSuccessMessage(`Set ${c.name} as Primary Emergency Contact!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleImportToVault = (c: GoogleContact) => {
    if (onImportToMemoryVault) {
      onImportToMemoryVault(c);
      setSuccessMessage(`Imported ${c.name} to Family Memory Vault!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  if (!accessToken) {
    return (
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs text-center">
        <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900 mb-1">Google Contacts Integration</h3>
        <p className="text-xs text-stone-600 mb-4 max-w-md mx-auto">
          Sync your family members and doctor contact numbers from Google Contacts for quick voice check-ins and emergency alerts.
        </p>
        <button
          onClick={onSignInRequired}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-xs"
        >
          Connect Google Contacts
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm sm:text-base">Google Family Contacts</h3>
            <p className="text-[11px] text-stone-500">Synced via Google People API</p>
          </div>
        </div>

        <button
          onClick={loadContacts}
          disabled={isLoading}
          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all"
          title="Refresh contacts"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, or relation..."
          className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Contacts List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-stone-500 flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading contacts from Google...</span>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="py-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <p className="text-xs text-stone-500">
            {searchQuery ? 'No Google Contacts matching search.' : 'No contacts found in your Google account.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {filteredContacts.map((contact, idx) => (
            <div
              key={contact.resourceName || idx}
              className="p-3.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-200 rounded-xl transition-all flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                {contact.photoUrl ? (
                  <img
                    src={contact.photoUrl}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                    {contact.name[0]}
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">{contact.name}</h4>
                  <div className="flex items-center space-x-3 text-[11px] text-stone-500">
                    {contact.phoneNumber && (
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{contact.phoneNumber}</span>
                      </span>
                    )}
                    {contact.email && (
                      <span className="flex items-center space-x-1 truncate max-w-[140px]">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{contact.email}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1.5">
                {onSimulateCall && (
                  <button
                    onClick={() => onSimulateCall(contact.name, 'Caregiver')}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                    title="Simulate Voice Check-in Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleSetEmergency(contact)}
                  className="p-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all"
                  title="Set as Emergency Contact"
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleImportToVault(contact)}
                  className="p-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all"
                  title="Import to Memory Vault"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
