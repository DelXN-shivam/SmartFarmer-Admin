'use client';

import { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '@/context/AuthContext';

export default function SuperAdminHome() {
  const { accessToken } = useContext(AuthContext);
  const [secretData, setSecretData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    const fetchSecretData = async () => {
      try {
        const res = await axios.get( 'https://smart-farmer-backend.vercel.app/api/super-admin/super-secret', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });
        setSecretData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    };

    fetchSecretData();
  }, [accessToken]);

  return (
    <div>
      <h1>This is the home page of Super Admin</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {secretData && <pre>{JSON.stringify(secretData, null, 2)}</pre>}
    </div>
  );
}
