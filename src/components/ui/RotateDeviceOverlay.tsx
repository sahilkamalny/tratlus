import { RotateCw } from 'lucide-react';

export const RotateDeviceOverlay = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        textAlign: 'center',
        padding: '20px',
      }}
    >
      <RotateCw className="size-16 mb-4 animate-spin" />
      <h2 className="text-2xl font-bold mb-2">Please Rotate Your Device</h2>
      <p>This application is best viewed in portrait mode.</p>
    </div>
  );
};
