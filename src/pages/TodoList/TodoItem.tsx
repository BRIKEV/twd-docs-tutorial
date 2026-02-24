import { useFetcher } from "react-router";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Todo } from "@/api/todos";

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const deleteFetcher = useFetcher();
  const isDeleting = deleteFetcher.state === "submitting" || deleteFetcher.state === "loading";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{todo.title}</CardTitle>
        <CardDescription>{todo.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Date: {todo.date}
        </span>
        <deleteFetcher.Form method="DELETE" action="/todos">
          <input type="hidden" name="id" value={todo.id} />
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            aria-label={`Delete Todo ${todo.title}`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </deleteFetcher.Form>
      </CardFooter>
    </Card>
  );
}

