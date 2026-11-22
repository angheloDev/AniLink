import React from 'react';
import { BuyerHome } from '../../components/home/BuyerHome';
import { FarmerHome } from '../../components/home/FarmerHome';
import { useAuth } from '../../store/auth';

export default function Home() {
  const role = useAuth((s) => s.user?.role);
  return role === 'farmer' ? <FarmerHome /> : <BuyerHome />;
}
