import { Button } from "@/components/ui/button";

const EmptyState = ({ title, description, actionText, actionHref }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mx-auto max-w-md px-4">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {actionText && actionHref && (
          <Button className="mt-4" asChild>
            <a href={actionHref}>{actionText}</a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
