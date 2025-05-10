import React from 'react';
import VitalSignCard, { VitalSign } from './VitalSignCard';

type VitalSignsGridProps = {
  vitalSigns: VitalSign[];
  onAddRecord: (id: string) => void;
};

const VitalSignsGrid: React.FC<VitalSignsGridProps> = ({ vitalSigns, onAddRecord }) => {
  return (
    <div className="col-span-9 grid grid-cols-2 gap-4"> {/* 調整 gap 為 4 */}
      {vitalSigns.map((vitalSign, index) => (
        <VitalSignCard
          key={vitalSign.id}
          vitalSign={vitalSign}
          isWide={index === vitalSigns.length - 1} // 最後一張卡片設為寬卡片
          onAddRecord={onAddRecord}
        />
      ))}
    </div>
  );
};

export default VitalSignsGrid;