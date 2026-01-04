export default function PageHeader({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">
                {description}
            </p>
        </div>
    );
}