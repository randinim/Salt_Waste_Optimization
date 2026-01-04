import { ArrowRightIcon, ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ExpolreButton({ link }: { link: string }) {
    return (
        <div className="flex flex-wrap items-center gap-2 md:flex-row">
            <Button variant="outline" asChild>
                <Link href={link}>Explore<ArrowRightIcon /></Link>
            </Button>
        </div>
    )
}