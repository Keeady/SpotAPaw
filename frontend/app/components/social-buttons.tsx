import Button from "../components/button";

type SocialButtonsProps = {
  onGoogle?: () => void;
  onApple?: () => void;
};

/** Placeholder for the real brand logo; replace with official assets. */
function LogoPlaceholder({ label }: { label: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 items-center justify-center rounded bg-neutral-200 text-[10px] font-bold text-neutral-500"
    >
      {label}
    </span>
  );
}

export default function SocialButtons({ onGoogle, onApple }: SocialButtonsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Button
        variant="outline"
        onClick={onGoogle}
        leftIcon={<LogoPlaceholder label="G" />}
      >
        Continue with Google
      </Button>
      <Button
        variant="outline"
        onClick={onApple}
        leftIcon={<LogoPlaceholder label="A" />}
      >
        Continue with Apple
      </Button>
    </div>
  );
}