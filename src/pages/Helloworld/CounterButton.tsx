import { Button } from '@/components/ui/button';


interface CounterButtonProps {
  count: number;
  setCount: (count: number) => void;
}

export default function CounterButton({ count, setCount }: CounterButtonProps) {
  return (
    <Button
      onClick={() => setCount(count + 1)}
      size="lg"
      className="min-w-[200px]"
      data-testid="counter-button"
    >
      Count is {count}
    </Button>
  );
}
