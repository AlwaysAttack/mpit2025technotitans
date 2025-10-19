// hooks/useOfferSync.ts
import { useState, useEffect } from 'react';

const SERVER_URL = 'http://192.168.0.11:3000/offers'; // локальный сервер

export interface Offer {
  id: string;
  orderId: string;
  passengerId: string;
  driverId?: string;
  price: number;
  status: 'waiting' | 'accepted' | 'rejected';
  createdAt: string;
}

export function useOfferSync() {
  const [offers, setOffers] = useState<Offer[]>([]);

  const fetchOffers = async () => {
    try {
      const res = await fetch(SERVER_URL);
      const data: Offer[] = await res.json();
      setOffers(data);
      console.log('🌍 Offers fetched:', data.length);
    } catch (err) {
      console.error('Error fetching offers:', err);
    }
  };

  useEffect(() => {
    fetchOffers();
    const interval = setInterval(fetchOffers, 2000); // автоматическое обновление
    return () => clearInterval(interval);
  }, []);

  const addOffer = async (offer: Offer) => {
    try {
      await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer),
      });
      console.log('💌 Added offer:', offer.id);
      fetchOffers();
    } catch (err) {
      console.error('Error adding offer:', err);
    }
  };

  const updateOffer = async (offerId: string, update: Partial<Offer>) => {
    try {
      const res = await fetch(`${SERVER_URL}/${offerId}`);
      const offer: Offer = await res.json();
      const updatedOffer = { ...offer, ...update };
      await fetch(`${SERVER_URL}/${offerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOffer),
      });
      console.log('✅ Updated offer:', offerId, update);
      fetchOffers();
    } catch (err) {
      console.error('Error updating offer:', err);
    }
  };

  const removeOffer = async (offerId: string) => {
    try {
      await fetch(`${SERVER_URL}/${offerId}`, { method: 'DELETE' });
      console.log('🗑 Removed offer:', offerId);
      fetchOffers();
    } catch (err) {
      console.error('Error removing offer:', err);
    }
  };

  return { offers, addOffer, updateOffer, removeOffer };
}
