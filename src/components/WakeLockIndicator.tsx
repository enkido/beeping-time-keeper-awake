
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WakeLockIndicatorProps {
  isSupported: boolean;
  isActive: boolean;
}

const WakeLockIndicator: React.FC<WakeLockIndicatorProps> = ({ isSupported, isActive }) => {
  if (!isSupported) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        Bildschirmsperre nicht unterstützt
      </Badge>
    );
  }

  return isActive ? (
    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
      Bildschirmsperre aktiv
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
      Bildschirmsperre inaktiv
    </Badge>
  );
};

export default WakeLockIndicator;
