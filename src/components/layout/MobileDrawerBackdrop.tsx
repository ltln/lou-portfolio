export function MobileDrawerBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="absolute inset-0 bg-background/72 backdrop-blur-md supports-[not(backdrop-filter:blur(1px))]:bg-background/86"
      aria-label="Close menu"
      onClick={onClose}
    />
  );
}
